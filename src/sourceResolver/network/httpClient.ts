// Güvenli HTTP istemcisi (Sprint 12, madde 3).
//
// ⚠️ Yalnızca React Native/Expo'da yerleşik `fetch`/`AbortController`
// kullanılır — YENİ PAKET YOK. Bu dosya, `isSafeRequestUrl()` (bkz.
// ../validators.ts) tarafından ÖNCEDEN doğrulanmış URL'lere istek atmayı
// VARSAYAR — çağıran taraf (adapters/searchCoordinator) her istekten
// önce bu doğrulamayı yapmakla YÜKÜMLÜDÜR (bkz. §"Bağımlılık yönü",
// docs/OFFICIAL_SOURCE_NETWORK_SEARCH.md).
import type { HttpFetchResult, HttpRequestOptions, HttpResponseMetadata } from './types.ts';

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_TIMEOUT_MS = 15000;
const MIN_TIMEOUT_MS = 1000;
const MAX_BODY_CHARS = 2 * 1024 * 1024; // ~2 MB (metin karakteri olarak sınırlanır)

export type SafeFetchResult =
  | { ok: true; data: HttpFetchResult }
  | { ok: false; reason: 'timeout' | 'httpError' | 'networkError'; message: string; status?: number };

function clampTimeout(ms?: number): number {
  if (!ms || Number.isNaN(ms)) return DEFAULT_TIMEOUT_MS;
  return Math.min(Math.max(ms, MIN_TIMEOUT_MS), MAX_TIMEOUT_MS);
}

/**
 * Bir promise'i verilen sürede sonuçlanmazsa `controller.abort()` çağırıp
 * reddeden bir sarmalayıcı. `finally` ile zamanlayıcı HER ZAMAN temizlenir
 * — sızıntı yapan bir `setTimeout` bırakılmaz.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, controller: AbortController): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('timeout'));
    }, timeoutMs);
  });

  // `promise` zaman aşımından SONRA reddedilirse (abort sonrası fetch'in
  // kendi AbortError'ı), bu reddi burada sessizce tüket — Promise.race
  // kaybeden tarafın nihai reddini görmezden gelir, ama o promise'e
  // hiçbir handler eklenmezse "unhandled rejection" uyarısı üretir. Bu,
  // Promise.race'in DAVRANIŞINI etkilemez, yalnızca gürültüyü keser.
  promise.catch(() => {});

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function attemptFetch(url: string, options: HttpRequestOptions): Promise<SafeFetchResult> {
  const timeoutMs = clampTimeout(options.timeoutMs);
  const controller = new AbortController();
  const externalSignal = options.signal;
  const onExternalAbort = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort);
  }

  try {
    const response = await withTimeout(
      fetch(url, {
        method: options.method ?? 'GET',
        headers: options.headers,
        signal: controller.signal,
        redirect: 'follow',
      }),
      timeoutMs,
      controller
    );

    const finalUrl = response.url || url;
    const status = response.status;
    const contentType = response.headers.get('content-type') ?? undefined;
    const contentLengthHeader = response.headers.get('content-length');
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : undefined;

    if (status < 200 || status >= 400) {
      return { ok: false, reason: 'httpError', message: `HTTP ${status}`, status };
    }

    let body: string | undefined;
    if (options.method !== 'HEAD') {
      const text = await response.text();
      body = text.length > MAX_BODY_CHARS ? text.slice(0, MAX_BODY_CHARS) : text;
    }

    const metadata: HttpResponseMetadata = { ok: true, status, finalUrl, contentType, contentLength };
    return { ok: true, data: { metadata, body } };
  } catch (err) {
    const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message === 'timeout');
    return {
      ok: false,
      reason: isAbort ? 'timeout' : 'networkError',
      message: isAbort ? 'İstek zaman aşımına uğradı.' : 'Ağ hatası oluştu.',
    };
  } finally {
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
  }
}

function shouldRetry(result: Extract<SafeFetchResult, { ok: false }>): boolean {
  if (result.reason === 'timeout') return true;
  if (result.reason === 'httpError' && result.status !== undefined && result.status >= 500 && result.status < 600) return true;
  return false; // 4xx ve networkError'da retry YOK
}

/**
 * Ana güvenli fetch — en fazla 1 ilk deneme + 1 kontrollü retry (yalnızca
 * timeout veya geçici 5xx hatasında). 4xx hatalarında ASLA retry yapılmaz.
 * Hiçbir exception UI'a sızmaz — her zaman tipli bir `SafeFetchResult` döner.
 */
export async function safeFetch(url: string, options: HttpRequestOptions = {}): Promise<SafeFetchResult> {
  const first = await attemptFetch(url, options);
  if (first.ok || !shouldRetry(first)) return first;
  return attemptFetch(url, options);
}

export async function fetchText(url: string, options: HttpRequestOptions = {}): Promise<SafeFetchResult> {
  return safeFetch(url, { ...options, method: 'GET' });
}

/** HEAD dener; sunucu HEAD'i desteklemiyorsa (405/501) sınırlı bir GET'e düşer. */
export async function fetchHead(url: string, options: HttpRequestOptions = {}): Promise<SafeFetchResult> {
  const headResult = await safeFetch(url, { ...options, method: 'HEAD' });
  if (headResult.ok) return headResult;
  if (headResult.reason === 'httpError' && (headResult.status === 405 || headResult.status === 501)) {
    return safeFetch(url, { ...options, method: 'GET' });
  }
  return headResult;
}
