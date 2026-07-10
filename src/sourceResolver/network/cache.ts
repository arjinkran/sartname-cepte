// In-memory arama önbelleği (Sprint 12, madde 6). Kalıcı DEĞİL — yalnızca
// oturum içi bellek; yeni bir persistence paketi EKLENMEDİ (AsyncStorage
// dahil — bu, Sprint 8'in "son sayfa" özelliğinden farklı olarak bilinçli
// bir tercihtir: arama sonuçları oturumlar arası saklanmaya değecek kadar
// kritik değildir, ve gerçek bir kaynak DEĞİŞEBİLİR).
import type { NetworkSearchResponse } from './types.ts';

const MAX_CACHE_SIZE = 200;
const TTL_SUCCESS_MS = 24 * 60 * 60 * 1000;
const TTL_NO_RESULT_MS = 30 * 60 * 1000;
const TTL_RESTRICTED_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  key: string;
  response: NetworkSearchResponse;
  cachedAt: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function normalizeTitle(title: string): string {
  return title.toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, ' ');
}

export function buildCacheKey(documentId: string, providerId: string, title: string): string {
  return `${documentId}::${providerId}::${normalizeTitle(title)}`;
}

/** `null` dönerse bu durum HİÇ cache'lenmez (ör. networkError/timeout). */
function ttlForStatus(response: NetworkSearchResponse): number | null {
  switch (response.status) {
    case 'success':
      return TTL_SUCCESS_MS;
    case 'noResult':
      return TTL_NO_RESULT_MS;
    case 'restricted':
      return TTL_RESTRICTED_MS;
    default:
      return null;
  }
}

export function getCachedSearch(documentId: string, providerId: string, title: string): NetworkSearchResponse | undefined {
  const key = buildCacheKey(documentId, providerId, title);
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.response;
}

export function setCachedSearch(documentId: string, providerId: string, title: string, response: NetworkSearchResponse): void {
  const ttl = ttlForStatus(response);
  if (ttl === null) return; // network hatası/timeout/blocked/cancelled CACHE'LENMEZ
  const key = buildCacheKey(documentId, providerId, title);
  const now = Date.now();
  cache.set(key, { key, response, cachedAt: now, expiresAt: now + ttl });
  enforceMaxSize();
}

function enforceMaxSize(): void {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const entries = Array.from(cache.values()).sort((a, b) => a.cachedAt - b.cachedAt);
  const excess = cache.size - MAX_CACHE_SIZE;
  for (let i = 0; i < excess; i++) cache.delete(entries[i]!.key);
}

export function invalidateSearchCache(documentId: string, providerId?: string): void {
  for (const [key, entry] of cache) {
    if (entry.response.documentId === documentId && (!providerId || key.includes(`::${providerId}::`))) {
      cache.delete(key);
    }
  }
}

export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}

export interface CacheStats {
  size: number;
  maxSize: number;
}

/** Yalnızca debug/test amaçlı (Sprint 12, madde 17) — UI'da gösterilmez. */
export function getCacheStats(): CacheStats {
  return { size: cache.size, maxSize: MAX_CACHE_SIZE };
}

/** Test/tanılama amaçlı: önbelleği tamamen boşaltır. Üretim kodunda kullanılmaz. */
export function clearCacheForTests(): void {
  cache.clear();
}
