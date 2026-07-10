// Network Source Resolver — ortak tip tanımları (Sprint 12, madde 2).
// Bu katman Sprint 11'in senkron `resolver.ts`'inin ÜZERİNE eklenir —
// onu DEĞİŞTİRMEZ. Yalnızca kullanıcı "PDF Bulmayı Dene" dediğinde
// tetiklenen GERÇEK (ama sıkı sınırlı) ağ isteklerini yönetir.
import type { Document } from '../../data/library/types.ts';
import type { SourceAccessType, SourceProvider } from '../types.ts';

/** Bir arama işleminin yaşam döngüsü durumu. */
export type NetworkSearchStatus =
  | 'idle'
  | 'searching'
  | 'success'
  | 'noResult'
  | 'timeout'
  | 'networkError'
  | 'blocked'
  | 'restricted'
  | 'cancelled';

/** Bir aramanın/isteğin BAŞARISIZ olma nedeni (varsa). */
export type SearchFailureReason =
  | 'timeout'
  | 'invalidDomain'
  | 'httpError'
  | 'parseError'
  | 'noCandidate'
  | 'restrictedProvider'
  | 'cancelled'
  | 'rateLimited';

export interface HttpRequestOptions {
  /** Varsayılan 8000ms, en fazla 15000ms'e kadar sınırlanır. */
  timeoutMs?: number;
  signal?: AbortSignal;
  method?: 'GET' | 'HEAD';
  headers?: Record<string, string>;
}

export interface HttpResponseMetadata {
  ok: boolean;
  status: number;
  /** Redirect sonrası GERÇEK URL — domain doğrulaması bu alan üzerinden TEKRARLANIR. */
  finalUrl: string;
  contentType?: string;
  contentLength?: number;
}

export interface HttpFetchResult {
  metadata: HttpResponseMetadata;
  /** `HEAD` isteklerinde veya boyut limiti aşıldığında tanımsız/kırpılmış olabilir. */
  body?: string;
}

export interface NetworkSearchRequest {
  documentId: string;
  providerId: string;
  url: string;
  method: 'GET' | 'HEAD';
  /** Bu isteğin NEDEN yapıldığını açıklayan kısa etiket (log/debug amaçlı). */
  reason: string;
}

export interface NetworkCandidate {
  documentId: string;
  providerId: string;
  provider: SourceProvider;
  url: string;
  title?: string;
  accessType: SourceAccessType;
  /** 0-100 — bkz. candidateParser.ts puanlama formülü. */
  score: number;
  matchReasons: readonly string[];
  verifiedDomain: boolean;
  isPdf: boolean;
  requiresManualReview: boolean;
}

export interface NetworkSearchResponse {
  documentId: string;
  status: NetworkSearchStatus;
  /** Skora göre azalan sırada, en fazla 5 aday. */
  candidates: readonly NetworkCandidate[];
  failureReason?: SearchFailureReason;
  /** Kullanıcıya gösterilebilir Türkçe durum mesajı. */
  message: string;
  /** ISO tarih-saat. */
  searchedAt: string;
}

/**
 * Her kaynak sağlayıcının kendi arama mantığını uyguladığı arayüz
 * (Sprint 12, madde 7). `buildSearchRequests()` boş dizi dönerse
 * (ör. telifli standart kuruluşları) HİÇBİR ağ isteği yapılmaz —
 * `parseCandidates()` doğrudan sentetik bir "restricted" aday üretebilir.
 */
export interface ProviderSearchAdapter {
  providerId: string;
  canSearch(document: Document): boolean;
  buildSearchRequests(document: Document): readonly NetworkSearchRequest[];
  parseCandidates(response: HttpFetchResult, document: Document): readonly NetworkCandidate[];
  validateCandidate(candidate: NetworkCandidate, document: Document): boolean;
}

export interface SearchCacheEntry {
  key: string;
  response: NetworkSearchResponse;
  /** epoch ms */
  cachedAt: number;
  /** epoch ms */
  expiresAt: number;
}
