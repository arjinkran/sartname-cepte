// Arama koordinatörü — ağ arama katmanının TEK giriş noktası (Sprint 12,
// madde 10). Bağımlılık yönü: resolver.ts → searchCoordinator.ts →
// adapters/* → httpClient.ts (bkz. madde 20, tek yönlü akış). Bu dosya
// KENDİSİ asla `resolver.ts`'i import ETMEZ.
import type { Document } from '../../data/library/types.ts';
import { isRestrictedStandardProvider, isSafeRequestUrl } from '../validators.ts';
import { getAdaptersForDocument } from './adapters/index.ts';
import { acquireProviderSlot, canStartSearch, markSearchFinished, markSearchStarted, releaseProviderSlot } from './rateLimiter.ts';
import { getCachedSearch, setCachedSearch } from './cache.ts';
import { fetchText } from './httpClient.ts';
import type { NetworkCandidate, NetworkSearchResponse, NetworkSearchStatus, ProviderSearchAdapter } from './types.ts';

const MAX_CANDIDATES = 5;
const MAX_REQUESTS_PER_PROVIDER_PER_SEARCH = 3;
const MAX_HISTORY = 20;

export interface SearchOfficialSourcesOptions {
  signal?: AbortSignal;
}

const activeControllers = new Map<string, AbortController>();

interface SearchHistoryRecord {
  documentId: string;
  searchedAt: string;
  status: NetworkSearchStatus;
  candidateCount: number;
}

const searchHistory: SearchHistoryRecord[] = [];
const providerRequestCounts = new Map<string, number>();

function pushHistory(record: SearchHistoryRecord): void {
  searchHistory.push(record);
  if (searchHistory.length > MAX_HISTORY) searchHistory.shift();
}

function statusMessage(status: NetworkSearchStatus): string {
  switch (status) {
    case 'searching':
      return 'Resmî kaynaklarda aranıyor…';
    case 'success':
      return 'Doğrulanmış kaynak bulundu.';
    case 'noResult':
      return 'Resmî kaynaklarda uygun PDF bulunamadı.';
    case 'timeout':
      return 'Arama zaman aşımına uğradı.';
    case 'networkError':
      return 'Ağ bağlantısı kurulamadı.';
    case 'restricted':
      return 'Bu kaynak telifli veya erişimi kısıtlıdır.';
    case 'blocked':
      return 'Bu belge için zaten bir arama devam ediyor.';
    case 'cancelled':
      return 'Arama iptal edildi.';
    default:
      return '';
  }
}

function buildResponse(documentId: string, status: NetworkSearchStatus, candidates: readonly NetworkCandidate[], failureReason?: NetworkSearchResponse['failureReason']): NetworkSearchResponse {
  return {
    documentId,
    status,
    candidates,
    failureReason,
    message: statusMessage(status),
    searchedAt: new Date().toISOString(),
  };
}

interface AdapterRunResult {
  candidates: NetworkCandidate[];
  failures: Array<'timeout' | 'httpError' | 'networkError'>;
}

async function runAdapter(adapter: ProviderSearchAdapter, document: Document, requestedUrls: Set<string>, controller: AbortController): Promise<AdapterRunResult> {
  // Telifli standart kuruluşları: madde 11 — HİÇBİR ağ isteği yapılmadan
  // sentetik `restrictedStandard` adayı üretilir.
  if (isRestrictedStandardProvider(adapter.providerId)) {
    return { candidates: [...adapter.parseCandidates({ metadata: { ok: true, status: 0, finalUrl: '' } }, document)], failures: [] };
  }

  const requests = adapter.buildSearchRequests(document).slice(0, MAX_REQUESTS_PER_PROVIDER_PER_SEARCH);
  const collected: NetworkCandidate[] = [];
  const failures: Array<'timeout' | 'httpError' | 'networkError'> = [];

  for (const request of requests) {
    if (requestedUrls.has(request.url)) continue; // madde 3: aynı URL'e tekrar istek YOK
    if (!isSafeRequestUrl(request.url, adapter.providerId)) continue; // madde 4 güvenlik kapısı
    requestedUrls.add(request.url);

    providerRequestCounts.set(adapter.providerId, (providerRequestCounts.get(adapter.providerId) ?? 0) + 1);

    const result = await fetchText(request.url, { signal: controller.signal });
    if (!result.ok) {
      failures.push(result.reason);
      continue;
    }

    const candidates = adapter.parseCandidates(result.data, document);
    for (const candidate of candidates) {
      if (adapter.validateCandidate(candidate, document)) collected.push(candidate);
    }
  }

  return { candidates: collected, failures };
}

/**
 * Ana arama fonksiyonu (madde 10). Bir belge için tüm ilgili sağlayıcı
 * adaptörlerini SIRAYLA çalıştırır, adayları toplar/sıralar/sınırlar.
 * Her zaman rate-limit slotlarını ve arama kilidini `finally` içinde
 * serbest bırakır — hiçbir hata durumu bu temizliği atlayamaz.
 */
export async function searchOfficialSources(document: Document, options: SearchOfficialSourcesOptions = {}): Promise<NetworkSearchResponse> {
  if (!canStartSearch(document.id)) {
    return buildResponse(document.id, 'blocked', [], 'rateLimited');
  }

  const adapters = getAdaptersForDocument(document);
  if (adapters.length === 0) {
    const response = buildResponse(document.id, 'noResult', [], 'noCandidate');
    pushHistory({ documentId: document.id, searchedAt: response.searchedAt, status: response.status, candidateCount: 0 });
    return response;
  }

  const cached = getCachedSearch(document.id, adapters[0]!.providerId, document.title);
  if (cached) return cached;

  const restrictedOnly = adapters.every((a) => isRestrictedStandardProvider(a.providerId));

  markSearchStarted(document.id);
  const controller = new AbortController();
  activeControllers.set(document.id, controller);
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener('abort', () => controller.abort());
  }

  const requestedUrls = new Set<string>();
  const allCandidates: NetworkCandidate[] = [];
  let sawTimeout = false;
  let sawNetworkError = false;

  try {
    for (const adapter of adapters) {
      if (controller.signal.aborted) break;

      if (isRestrictedStandardProvider(adapter.providerId)) {
        const result = await runAdapter(adapter, document, requestedUrls, controller);
        allCandidates.push(...result.candidates);
        continue;
      }

      const acquired = await acquireProviderSlot(adapter.providerId);
      if (!acquired) continue;

      try {
        const result = await runAdapter(adapter, document, requestedUrls, controller);
        allCandidates.push(...result.candidates);
        for (const reason of result.failures) {
          if (reason === 'timeout') sawTimeout = true;
          else sawNetworkError = true;
        }
      } finally {
        releaseProviderSlot(adapter.providerId);
      }
    }
  } finally {
    markSearchFinished(document.id);
    activeControllers.delete(document.id);
  }

  let status: NetworkSearchStatus;
  let failureReason: NetworkSearchResponse['failureReason'];

  if (controller.signal.aborted && allCandidates.length === 0) {
    status = 'cancelled';
    failureReason = 'cancelled';
  } else if (restrictedOnly && allCandidates.length > 0) {
    status = 'restricted';
  } else if (allCandidates.length > 0) {
    status = 'success';
  } else if (sawTimeout) {
    status = 'timeout';
    failureReason = 'timeout';
  } else if (sawNetworkError) {
    status = 'networkError';
    failureReason = 'httpError';
  } else {
    status = 'noResult';
    failureReason = 'noCandidate';
  }

  const deduped = Array.from(new Map(allCandidates.map((c) => [c.url, c])).values())
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES);

  const response = buildResponse(document.id, status, deduped, failureReason);
  setCachedSearch(document.id, adapters[0]!.providerId, document.title, response);
  pushHistory({ documentId: document.id, searchedAt: response.searchedAt, status: response.status, candidateCount: deduped.length });

  return response;
}

/** Devam eden bir aramayı iptal eder (kullanıcı sayfadan ayrılırsa). */
export function cancelSearch(documentId: string): void {
  const controller = activeControllers.get(documentId);
  if (controller) controller.abort();
  markSearchFinished(documentId);
  activeControllers.delete(documentId);
}

export function getActiveSearch(documentId: string): boolean {
  return activeControllers.has(documentId);
}

/** Sayfa terk edilirken çağrılır — aktif arama varsa iptal eder ve durumu temizler. */
export function clearSearchState(documentId: string): void {
  cancelSearch(documentId);
}

// ── Madde 17: debug/test amaçlı istatistik fonksiyonları (UI'da GÖSTERİLMEZ) ──

export function getSearchSessionStats(): readonly SearchHistoryRecord[] {
  return searchHistory;
}

export function getProviderRequestCounts(): Readonly<Record<string, number>> {
  return Object.fromEntries(providerRequestCounts);
}

/** Test/tanılama amaçlı: oturum durumunu sıfırlar. Üretim kodunda kullanılmaz. */
export function resetSearchCoordinatorForTests(): void {
  activeControllers.clear();
  searchHistory.length = 0;
  providerRequestCounts.clear();
}
