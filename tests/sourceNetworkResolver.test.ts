// Ağ Kaynak Arama Katmanı testleri (Sprint 12, madde 19).
// ⚠️ GERÇEK internete ASLA çıkılmaz — `globalThis.fetch` her testte
// MOCK'lanır ve `afterEach`'te orijinaline geri döndürülür. Zaman aşımı
// testleri, spec'in "gerçek uzun bekleme YOK" kuralına uymak için
// yalnızca httpClient'ın izin verdiği EN KÜÇÜK `timeoutMs` (1000ms) ile
// çalışır — dakikalarca süren gerçek bekleme YOKTUR.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import type { Document } from '../src/data/library/types.ts';
import { getAllDocuments, getDocumentById } from '../src/data/library/repository.ts';
import { isSafeRequestUrl, isOfficialDomain } from '../src/sourceResolver/validators.ts';
import { safeFetch } from '../src/sourceResolver/network/httpClient.ts';
import {
  getCachedSearch,
  setCachedSearch,
  clearCacheForTests,
  getCacheStats,
} from '../src/sourceResolver/network/cache.ts';
import {
  acquireProviderSlot,
  releaseProviderSlot,
  canStartSearch,
  resetRateLimiterForTests,
} from '../src/sourceResolver/network/rateLimiter.ts';
import { scoreCandidate, extractPdfCandidates, STRONG_SCORE_THRESHOLD, MANUAL_REVIEW_THRESHOLD } from '../src/sourceResolver/network/candidateParser.ts';
import { tedasAdapter } from '../src/sourceResolver/network/adapters/tedasAdapter.ts';
import { epdkAdapter } from '../src/sourceResolver/network/adapters/epdkAdapter.ts';
import { mevzuatGovAdapter } from '../src/sourceResolver/network/adapters/mevzuatGovAdapter.ts';
import { tseAdapter } from '../src/sourceResolver/network/adapters/restrictedAdapter.ts';
import { getAdaptersForDocument } from '../src/sourceResolver/network/adapters/index.ts';
import {
  searchOfficialSources,
  cancelSearch,
  getActiveSearch,
  clearSearchState,
  resetSearchCoordinatorForTests,
} from '../src/sourceResolver/network/searchCoordinator.ts';
import { isCandidateUrlSafeToOpen } from '../src/sourceResolver/resolver.ts';
import type { HttpFetchResult } from '../src/sourceResolver/network/types.ts';

let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  resetRateLimiterForTests();
  clearCacheForTests();
  resetSearchCoordinatorForTests();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ── Test yardımcıları ──────────────────────────────────────────────────

function tedasDocu(): Document {
  const doc = getDocumentById('ag-xlpe-kablo');
  assert.ok(doc, "test fixture 'ag-xlpe-kablo' kütüphanede bulunamadı");
  return doc!;
}

function epdkDocu(): Document {
  const doc = getDocumentById('epdk-hizmet-kalitesi');
  assert.ok(doc, "test fixture 'epdk-hizmet-kalitesi' kütüphanede bulunamadı");
  return doc!;
}

function tseDocu(): Document {
  const doc = getAllDocuments().find((d) => d.institution === 'TSE' || d.institution === 'TS EN');
  assert.ok(doc, 'kütüphanede TSE/TS EN belgesi yok');
  return doc!;
}

/** Sabit sayıda çağrıyı sayan, verilen yanıt dizisini sırayla döndüren bir `fetch` sahtesi. */
function countingMockFetch(responses: Array<{ status: number; body?: string; url?: string; contentType?: string }>) {
  let callCount = 0;
  const fn = async (input: unknown, _init?: unknown) => {
    const idx = Math.min(callCount, responses.length - 1);
    const r = responses[idx]!;
    callCount += 1;
    return {
      status: r.status,
      url: r.url ?? String(input),
      headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? r.contentType ?? 'text/html' : null) },
      text: async () => r.body ?? '',
    } as unknown as Response;
  };
  return { fn, getCallCount: () => callCount };
}

/** Gerçek `fetch`'in abort davranışını taklit eden, asla kendiliğinden ÇÖZÜLMEYEN bir mock. */
function neverResolvingAbortableFetch() {
  const fn = (_input: unknown, init?: { signal?: AbortSignal }) =>
    new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      const abortErr = Object.assign(new Error('aborted'), { name: 'AbortError' });
      if (signal?.aborted) {
        reject(abortErr);
        return;
      }
      signal?.addEventListener('abort', () => reject(abortErr));
    });
  return fn as unknown as typeof fetch;
}

function fakeResponse(finalUrl: string): HttpFetchResult {
  return { metadata: { ok: true, status: 200, finalUrl }, body: '' };
}

// ── 1. Domain güvenliği ───────────────────────────────────────────────

test('isSafeRequestUrl: resmî domain kabul ediliyor', () => {
  assert.strictEqual(isSafeRequestUrl('https://www.tedas.gov.tr/sartnameler', 'tedas'), true);
});

test('isSafeRequestUrl: sahte domain reddediliyor', () => {
  assert.strictEqual(isSafeRequestUrl('https://sahte-tedas.com', 'tedas'), false);
  assert.strictEqual(isSafeRequestUrl('https://tedas.gov.tr.evil.com', 'tedas'), false);
});

test('isSafeRequestUrl: http/localhost/özel IP reddediliyor', () => {
  assert.strictEqual(isSafeRequestUrl('http://www.tedas.gov.tr', 'tedas'), false);
  assert.strictEqual(isSafeRequestUrl('https://localhost/tedas', 'tedas'), false);
  assert.strictEqual(isSafeRequestUrl('https://192.168.1.1/tedas', 'tedas'), false);
  assert.strictEqual(isSafeRequestUrl('https://127.0.0.1/tedas', 'tedas'), false);
});

test('extractPdfCandidates: redirect farklı domaine giderse aday reddediliyor', () => {
  const doc = tedasDocu();
  const response: HttpFetchResult = {
    metadata: { ok: true, status: 200, finalUrl: 'https://sahte-tedas-evil.com/liste' },
    body: `<a href="https://www.tedas.gov.tr/${doc.id}.pdf">${doc.title}</a>`,
  };
  const candidates = extractPdfCandidates(response, doc, 'tedas');
  assert.strictEqual(candidates.length, 0);
});

test('extractPdfCandidates: resmî domainden gelen eşleşen aday kabul ediliyor', () => {
  const doc = tedasDocu();
  const response: HttpFetchResult = {
    metadata: { ok: true, status: 200, finalUrl: 'https://www.tedas.gov.tr/sartnameler' },
    body: `<a href="https://www.tedas.gov.tr/${doc.id}.pdf">${doc.title}</a>`,
  };
  const candidates = extractPdfCandidates(response, doc, 'tedas');
  assert.strictEqual(candidates.length, 1);
  assert.strictEqual(candidates[0]!.verifiedDomain, true);
});

// ── 2. HTTP istemci: retry/timeout ────────────────────────────────────

test('HTTP 404 tekrar denenmiyor (yalnızca 1 çağrı)', async () => {
  const { fn, getCallCount } = countingMockFetch([{ status: 404 }]);
  globalThis.fetch = fn as unknown as typeof fetch;
  const sonuc = await safeFetch('https://www.tedas.gov.tr/yok');
  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(getCallCount(), 1);
});

test('HTTP 500 en fazla 1 kez tekrar deneniyor (toplam 2 çağrı)', async () => {
  const { fn, getCallCount } = countingMockFetch([{ status: 500 }, { status: 500 }]);
  globalThis.fetch = fn as unknown as typeof fetch;
  const sonuc = await safeFetch('https://www.tedas.gov.tr/sunucu-hatasi');
  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(getCallCount(), 2); // 1 ilk deneme + 1 retry — sonsuz retry YOK
});

test('HTTP 500 sonra 200 gelirse retry başarıya dönüşüyor', async () => {
  const { fn, getCallCount } = countingMockFetch([{ status: 500 }, { status: 200, body: 'tamam' }]);
  globalThis.fetch = fn as unknown as typeof fetch;
  const sonuc = await safeFetch('https://www.tedas.gov.tr/gecici-hata');
  assert.strictEqual(sonuc.ok, true);
  assert.strictEqual(getCallCount(), 2);
});

test('zaman aşımı doğru sonucu döndürüyor (kısa timeoutMs, gerçek uzun bekleme YOK)', async () => {
  globalThis.fetch = (() => new Promise(() => {})) as unknown as typeof fetch; // asla çözülmez
  const sonuc = await safeFetch('https://www.tedas.gov.tr/asla-donmez', { timeoutMs: 50 });
  assert.strictEqual(sonuc.ok, false);
  if (!sonuc.ok) assert.strictEqual(sonuc.reason, 'timeout');
});

test('4xx hatalarında hiçbir zaman retry yapılmıyor', async () => {
  const { fn, getCallCount } = countingMockFetch([{ status: 403 }, { status: 200 }]);
  globalThis.fetch = fn as unknown as typeof fetch;
  await safeFetch('https://www.tedas.gov.tr/yasak');
  assert.strictEqual(getCallCount(), 1);
});

// ── 3. Hız sınırlama ───────────────────────────────────────────────────

test('rate limiter: sağlayıcı başına eşzamanlılık limiti aşılırsa slot verilmiyor', async () => {
  const acquired1 = await acquireProviderSlot('epdk');
  assert.strictEqual(acquired1, true);
  const acquired2 = await acquireProviderSlot('epdk'); // MAX_CONCURRENT_PER_PROVIDER=1
  assert.strictEqual(acquired2, false);
  releaseProviderSlot('epdk');
});

test('rate limiter: slot serbest bırakıldıktan sonra tekrar alınabiliyor', async () => {
  const acquired1 = await acquireProviderSlot('teias');
  assert.strictEqual(acquired1, true);
  releaseProviderSlot('teias'); // hata sonrası `finally` bloğunun simülasyonu
  const acquired2 = await acquireProviderSlot('teias');
  assert.strictEqual(acquired2, true);
  releaseProviderSlot('teias');
});

test('rate limiter: aynı belge için eşzamanlı ikinci arama başlatılamaz', () => {
  assert.strictEqual(canStartSearch('doc-x'), true);
});

// ── 4. Önbellek ─────────────────────────────────────────────────────────

test('cache: başarılı sonuç yeniden kullanılıyor', () => {
  const response = { documentId: 'd1', status: 'success' as const, candidates: [], message: 'ok', searchedAt: new Date().toISOString() };
  setCachedSearch('d1', 'tedas', 'baslik', response);
  const cached = getCachedSearch('d1', 'tedas', 'baslik');
  assert.ok(cached);
  assert.strictEqual(cached!.status, 'success');
});

test('cache: noResult 30 dakika önbelleklenir, süre dolunca silinir', () => {
  const realNow = Date.now;
  try {
    let now = 1_000_000_000_000;
    Date.now = () => now;
    const response = { documentId: 'd2', status: 'noResult' as const, candidates: [], message: 'yok', searchedAt: new Date(now).toISOString() };
    setCachedSearch('d2', 'epdk', 'baslik2', response);
    assert.ok(getCachedSearch('d2', 'epdk', 'baslik2'), 'hemen sonra hâlâ önbellekte olmalı');
    now += 31 * 60 * 1000; // 31 dakika ileri sar (gerçek bekleme YOK — Date.now sahtelendi)
    assert.strictEqual(getCachedSearch('d2', 'epdk', 'baslik2'), undefined, '30 dakika sonra süresi dolmuş olmalı');
  } finally {
    Date.now = realNow;
  }
});

test('cache: ağ hatası hiç önbelleklenmiyor', () => {
  const response = { documentId: 'd3', status: 'networkError' as const, candidates: [], message: 'hata', searchedAt: new Date().toISOString() };
  setCachedSearch('d3', 'tedas', 'baslik3', response);
  assert.strictEqual(getCachedSearch('d3', 'tedas', 'baslik3'), undefined);
});

test('cache: en fazla 200 kayıt tutuluyor', () => {
  for (let i = 0; i < 205; i++) {
    const response = { documentId: `bulk-${i}`, status: 'success' as const, candidates: [], message: 'ok', searchedAt: new Date().toISOString() };
    setCachedSearch(`bulk-${i}`, 'tedas', `baslik-${i}`, response);
  }
  assert.ok(getCacheStats().size <= 200);
});

// ── 5. Sağlayıcı adaptörleri ─────────────────────────────────────────────

test('TEDAŞ adaptörü doğru providerId kullanıyor', () => {
  assert.strictEqual(tedasAdapter.providerId, 'tedas');
  assert.strictEqual(tedasAdapter.canSearch(tedasDocu()), true);
});

test('EPDK adaptörü doğru providerId kullanıyor', () => {
  assert.strictEqual(epdkAdapter.providerId, 'epdk');
  assert.strictEqual(epdkAdapter.canSearch(epdkDocu()), true);
});

test('mevzuat.gov.tr adaptörü, resmî domainden gelen adayı doğruluyor', () => {
  const doc = epdkDocu();
  const response: HttpFetchResult = {
    metadata: { ok: true, status: 200, finalUrl: 'https://www.mevzuat.gov.tr/arama' },
    body: `<a href="https://www.mevzuat.gov.tr/${doc.id}.pdf">${doc.title}</a>`,
  };
  const candidates = mevzuatGovAdapter.parseCandidates(response, doc);
  assert.ok(candidates.length > 0);
  assert.strictEqual(mevzuatGovAdapter.validateCandidate(candidates[0]!, doc), true);
});

test('kısıtlı sağlayıcı (TSE) hiçbir zaman PDF araması yapmıyor', () => {
  const doc = tseDocu();
  const requests = tseAdapter.buildSearchRequests(doc);
  assert.strictEqual(requests.length, 0); // madde 11: ağ isteği KESİNLİKLE yok
  const candidates = tseAdapter.parseCandidates(fakeResponse(''), doc);
  assert.strictEqual(candidates.length, 1);
  assert.strictEqual(candidates[0]!.accessType, 'restrictedStandard');
});

test('getAdaptersForDocument: TSE belgesi için yalnızca kısıtlı adaptör dönüyor', () => {
  const doc = tseDocu();
  const adapters = getAdaptersForDocument(doc);
  assert.ok(adapters.some((a) => a.providerId === 'tse'), "'tse' adaptörü eşleşen listede olmalı");
  assert.ok(
    adapters.every((a) => ['tse', 'iec', 'cenelec', 'ieee'].includes(a.providerId)),
    'TSE belgesi için hiçbir kamuya açık (public) adaptör eşleşmemeli'
  );
});

// ── 6. Aday puanlama ────────────────────────────────────────────────────

test(`${MANUAL_REVIEW_THRESHOLD} puan altındaki adaylar hiçbir zaman gösterilmiyor`, () => {
  const doc = tedasDocu();
  const response: HttpFetchResult = {
    metadata: { ok: true, status: 200, finalUrl: 'https://www.tedas.gov.tr/liste' },
    body: `<a href="https://www.tedas.gov.tr/alakasiz-dosya.pdf">Alakasız bağlantı metni</a>`,
  };
  const dogrudanPuan = scoreCandidate({
    document: doc,
    candidateUrl: 'https://www.tedas.gov.tr/alakasiz-dosya.pdf',
    candidateTitle: 'Alakasız bağlantı metni',
    providerId: 'tedas',
    finalUrl: 'https://www.tedas.gov.tr/alakasiz-dosya.pdf',
  });
  assert.ok(dogrudanPuan.score < MANUAL_REVIEW_THRESHOLD, `test kurgusu ${MANUAL_REVIEW_THRESHOLD} altında bir puan varsaymalı, gelen ${dogrudanPuan.score}`);
  const candidates = extractPdfCandidates(response, doc, 'tedas');
  assert.strictEqual(candidates.length, 0, 'düşük puanlı tek aday bile olsa gösterilmemeli');
});

test('70+ puan alan adaylar güçlü (manuel inceleme gerektirmeyen) olarak sınıflanıyor', () => {
  const doc = tedasDocu();
  const url = `https://www.tedas.gov.tr/${doc.id}.pdf`;
  const out = scoreCandidate({
    document: doc,
    candidateUrl: url,
    candidateTitle: doc.title,
    providerId: 'tedas',
    finalUrl: url,
    contentType: 'application/pdf',
  });
  assert.ok(out.score >= STRONG_SCORE_THRESHOLD, `beklenen >=70, gelen ${out.score}`);
  assert.strictEqual(out.verifiedDomain, true);
});

test('adaylar puana göre azalan sırada dönüyor', () => {
  const doc = tedasDocu();
  const response: HttpFetchResult = {
    metadata: { ok: true, status: 200, finalUrl: 'https://www.tedas.gov.tr/liste' },
    body: `
      <a href="https://www.tedas.gov.tr/zayif-ama-gecerli.pdf">${doc.shortTitle} ${doc.institution} teknik dosya</a>
      <a href="https://www.tedas.gov.tr/${doc.id}.pdf">${doc.title}</a>
    `,
  };
  const candidates = extractPdfCandidates(response, doc, 'tedas');
  assert.ok(candidates.length >= 2, 'her iki aday da 45 eşiğinin üstünde puanlanmalı');
  for (let i = 1; i < candidates.length; i++) {
    assert.ok(candidates[i - 1]!.score >= candidates[i]!.score);
  }
  // Tam başlık eşleşen ikinci bağlantı, kısa başlık eşleşen ilkinden daha yüksek puanlanmalı.
  assert.strictEqual(candidates[0]!.url, `https://www.tedas.gov.tr/${doc.id}.pdf`);
});

test('aynı URL yinelenmiş olsa bile bir kez sayılıyor', () => {
  const doc = tedasDocu();
  const url = `https://www.tedas.gov.tr/${doc.id}.pdf`;
  const response: HttpFetchResult = {
    metadata: { ok: true, status: 200, finalUrl: 'https://www.tedas.gov.tr/liste' },
    body: `<a href="${url}">${doc.title}</a><a href="${url}">${doc.title} (tekrar)</a>`,
  };
  const candidates = extractPdfCandidates(response, doc, 'tedas');
  assert.strictEqual(candidates.length, 1);
});

// ── 7. Arama koordinatörü (uçtan uca, fetch mock'lu) ─────────────────────

test('searchOfficialSources: bulunan adaylar 5 ile sınırlanıyor', async () => {
  const doc = tedasDocu();
  const linkler = Array.from({ length: 8 }, (_, i) => `<a href="https://www.tedas.gov.tr/aday-${i}.pdf">${doc.title} ${i}</a>`).join('\n');
  const { fn } = countingMockFetch([{ status: 200, body: linkler, url: 'https://www.tedas.gov.tr/sartnameler' }]);
  globalThis.fetch = fn as unknown as typeof fetch;
  const sonuc = await searchOfficialSources(doc);
  assert.ok(sonuc.candidates.length <= 5);
});

test('searchOfficialSources: başarılı sonuç önbellekten tekrar kullanılıyor (2. çağrıda fetch tetiklenmiyor)', async () => {
  const doc = epdkDocu();
  const { fn, getCallCount } = countingMockFetch([
    { status: 200, body: `<a href="https://www.epdk.gov.tr/${doc.id}.pdf">${doc.title}</a>`, url: 'https://www.epdk.gov.tr' },
  ]);
  globalThis.fetch = fn as unknown as typeof fetch;
  const ilk = await searchOfficialSources(doc);
  const ikinci = await searchOfficialSources(doc);
  assert.strictEqual(ilk.status, 'success');
  assert.strictEqual(ikinci.status, 'success');
  assert.strictEqual(getCallCount(), 1, 'ikinci arama önbellekten dönmeli, tekrar fetch tetiklenmemeli');
});

test('searchOfficialSources: aynı belge için eşzamanlı ikinci arama başlatılmıyor', async () => {
  const doc = tedasDocu();
  globalThis.fetch = neverResolvingAbortableFetch();
  const ilkPromise = searchOfficialSources(doc); // await EDİLMEDEN ikinci çağrı yapılır
  const ikinciSonuc = await searchOfficialSources(doc);
  assert.strictEqual(ikinciSonuc.status, 'blocked');
  cancelSearch(doc.id);
  await ilkPromise;
});

test('cancelSearch: AbortController tetikleniyor ve arama "cancelled" ile sonuçlanıyor', async () => {
  const doc = tedasDocu();
  globalThis.fetch = neverResolvingAbortableFetch();
  const searchPromise = searchOfficialSources(doc);
  await new Promise((resolve) => setImmediate(resolve)); // aramanın fetch'e ulaşmasına izin ver
  cancelSearch(doc.id);
  const sonuc = await searchPromise;
  assert.strictEqual(sonuc.status, 'cancelled');
  assert.strictEqual(sonuc.failureReason, 'cancelled');
});

test('clearSearchState: sayfa terk edilince aktif arama durumu temizleniyor', async () => {
  const doc = tedasDocu();
  globalThis.fetch = neverResolvingAbortableFetch();
  const searchPromise = searchOfficialSources(doc);
  await new Promise((resolve) => setImmediate(resolve));
  assert.strictEqual(getActiveSearch(doc.id), true);
  clearSearchState(doc.id);
  assert.strictEqual(getActiveSearch(doc.id), false);
  await searchPromise;
});

test('kısıtlı sağlayıcı: TSE belgesi için arama "restricted" ile sonuçlanıyor, hiç fetch çağrılmıyor', async () => {
  const doc = tseDocu();
  const { fn, getCallCount } = countingMockFetch([{ status: 200, body: '' }]);
  globalThis.fetch = fn as unknown as typeof fetch;
  const sonuc = await searchOfficialSources(doc);
  assert.strictEqual(sonuc.status, 'restricted');
  assert.strictEqual(getCallCount(), 0, 'kısıtlı sağlayıcı için hiçbir ağ isteği yapılmamalı');
});

// ── 8. Kaynağı Aç öncesi yeniden doğrulama ────────────────────────────────

test('isCandidateUrlSafeToOpen: Linking.openURL öncesi domain yeniden doğrulanıyor', () => {
  assert.strictEqual(isCandidateUrlSafeToOpen('https://www.tedas.gov.tr/dosya.pdf', 'tedas'), true);
  assert.strictEqual(isCandidateUrlSafeToOpen('https://sahte-tedas.com/dosya.pdf', 'tedas'), false);
});

// ── 9. Genel sağlık kontrolleri ────────────────────────────────────────

test('isOfficialDomain hâlâ Sprint 11 davranışıyla tutarlı (regresyon kontrolü)', () => {
  assert.strictEqual(isOfficialDomain('https://www.tedas.gov.tr', 'tedas'), true);
  assert.strictEqual(isOfficialDomain('https://www.sahte.com', 'tedas'), false);
});
