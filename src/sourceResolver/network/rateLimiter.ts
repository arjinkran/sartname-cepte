// In-memory hız sınırlayıcı (Sprint 12, madde 5). Kalıcı DEĞİL, yeni paket
// eklenmedi — yalnızca modül-seviyesi sayaçlar.
//
// ⚠️ Deadlock güvenliği: `acquireProviderSlot()` HİÇBİR ZAMAN süresiz
// beklemez — yalnızca sabit `MIN_INTERVAL_MS` kadar (en fazla) bekler,
// ardından ya slot verir ya da `false` döner (kuyruğa ALINMAZ). Çağıran
// taraf (searchCoordinator), `false` durumunda o sağlayıcıyı o arama
// turunda ATLAR — asla sonsuz beklemez.

const MAX_CONCURRENT_PER_PROVIDER = 1;
const MAX_CONCURRENT_TOTAL = 3;
const MIN_INTERVAL_MS = 750;

interface ProviderState {
  activeCount: number;
  lastRequestAt: number;
}

const providerStates = new Map<string, ProviderState>();
let totalActive = 0;
const activeSearchDocumentIds = new Set<string>();

function getProviderState(providerId: string): ProviderState {
  let state = providerStates.get(providerId);
  if (!state) {
    state = { activeCount: 0, lastRequestAt: 0 };
    providerStates.set(providerId, state);
  }
  return state;
}

/**
 * Bir sağlayıcı için istek slotu almaya çalışır. Eşzamanlılık limiti
 * (sağlayıcı başına 1, toplamda 3) aşılmışsa HEMEN `false` döner —
 * beklemez. Limit uygunsa, sağlayıcının son isteğinden bu yana
 * `MIN_INTERVAL_MS` geçmediyse KISA (en fazla 750ms) bir bekleme yapılır,
 * ardından slot verilir.
 */
export async function acquireProviderSlot(providerId: string): Promise<boolean> {
  const state = getProviderState(providerId);
  if (state.activeCount >= MAX_CONCURRENT_PER_PROVIDER) return false;
  if (totalActive >= MAX_CONCURRENT_TOTAL) return false;

  const elapsed = Date.now() - state.lastRequestAt;
  if (state.lastRequestAt > 0 && elapsed < MIN_INTERVAL_MS) {
    await new Promise<void>((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }

  state.activeCount += 1;
  state.lastRequestAt = Date.now();
  totalActive += 1;
  return true;
}

/** Alınan slotu serbest bırakır — HER ZAMAN `finally` içinde çağrılmalı. */
export function releaseProviderSlot(providerId: string): void {
  const state = providerStates.get(providerId);
  if (state && state.activeCount > 0) state.activeCount -= 1;
  if (totalActive > 0) totalActive -= 1;
}

/** Bu belge için ZATEN aktif bir arama var mı — varsa yeni arama BAŞLATILMAMALI. */
export function canStartSearch(documentId: string): boolean {
  return !activeSearchDocumentIds.has(documentId);
}

export function markSearchStarted(documentId: string): void {
  activeSearchDocumentIds.add(documentId);
}

/** HER ZAMAN `finally` içinde çağrılmalı — aramanın sonucu ne olursa olsun. */
export function markSearchFinished(documentId: string): void {
  activeSearchDocumentIds.delete(documentId);
}

/** Test/tanılama amaçlı: tüm sayaçları sıfırlar. Üretim kodunda kullanılmaz. */
export function resetRateLimiterForTests(): void {
  providerStates.clear();
  totalActive = 0;
  activeSearchDocumentIds.clear();
}
