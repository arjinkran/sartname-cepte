// Gerçek PDF indirme sistemi — ortak tip tanımları (Sprint 13, madde 2).
//
// Bu dosya, Sprint 8'in inert `offlineTypes.ts`'inin YERİNE değil,
// YANINA eklenir (o dosya hâlâ mevcut, bu sprintte silinmedi — bkz.
// src/offline/README.md). `offlineTypes.ts`'teki `DownloadState`/
// `DownloadQueueItem`/`OfflineDocumentRecord` Sprint 8'in "gelecekte
// indirme" iskeleti için tasarlanmıştı; bu sprint artık GERÇEK indirmeyi
// uyguladığından, indirme mantığının tamamı BURADAKİ yeni tiplerle çalışır.
import type { Institution } from '../data/library/types.ts';

export type DownloadStatus =
  | 'idle'
  | 'awaitingConfirmation'
  | 'downloading'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type DownloadFailureReason =
  | 'invalidUrl'
  | 'unverifiedDomain'
  | 'restrictedSource'
  | 'timeout'
  | 'networkError'
  | 'httpError'
  | 'invalidContentType'
  | 'fileTooLarge'
  | 'writeError'
  | 'checksumError'
  | 'cancelled'
  | 'duplicate'
  | 'insufficientStorage';

/** Kullanıcının "Cihaza İndir" ile onayladığı indirme isteği. */
export interface DownloadRequest {
  documentId: string;
  institution: Institution;
  title: string;
  /** Aday kaynağın URL'i — Doküman Detay'daki aday modalından gelir. */
  url: string;
  /** Adayın hangi sağlayıcıya ait olduğu (yeniden domain doğrulaması için). */
  providerId: string;
  /** Kullanıcının modalda gördüğü tahmini dosya boyutu (varsa) — yalnızca bilgi amaçlı, doğrulama bu alana GÜVENMEZ. */
  suggestedFileName?: string;
}

export interface DownloadProgress {
  documentId: string;
  bytesDownloaded: number;
  /** Sunucu Content-Length vermediyse 0 — UI bu durumda belirsiz (indeterminate) gösterge kullanmalı. */
  totalBytes: number;
  /** 0-100 arası — totalBytes bilinmiyorsa 0. */
  percent: number;
}

export interface DownloadResult {
  documentId: string;
  status: DownloadStatus;
  failureReason?: DownloadFailureReason;
  /** Kullanıcıya gösterilebilir Türkçe mesaj. */
  message: string;
  /** Başarılıysa: cihazdaki mutlak dosya URI'si. */
  localUri?: string;
  fileSize?: number;
  checksum?: string;
  checksumStatus?: 'available' | 'unavailable';
}

/** Cihazda GERÇEKTEN duran, indirilmiş bir dosyanın tanımı. */
export interface StoredDocumentFile {
  documentId: string;
  institution: Institution;
  fileName: string;
  /** Mutlak cihaz URI'si (ör. `file://...`). */
  localUri: string;
  fileSize: number;
}

/** `downloadRepository.ts`'in AsyncStorage'da tuttuğu kalıcı kayıt (madde 8). */
export interface DownloadRecord {
  documentId: string;
  institution: Institution;
  fileName: string;
  localUri: string;
  sourceUrl: string;
  downloadedAt: string;
  lastOpenedAt?: string;
  fileSize: number;
  pageCount?: number;
  checksum?: string;
  checksumStatus: 'available' | 'unavailable';
  verifiedDomain: boolean;
  version?: string;
  status: 'completed';
}
