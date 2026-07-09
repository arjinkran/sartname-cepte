// Offline okuma ve indirme yöneticisi tipleri (Sprint 8, madde 10-11).
//
// ⚠️ Bu dosyadaki HİÇBİR tip şu an gerçek bir dosya sistemi/ağ işlemine
// bağlı DEĞİLDİR — yalnızca gelecekteki gerçek indirme özelliği için
// mimari iskelettir (bkz. docs/PDF_ARCHITECTURE.md "Download hazırlığı",
// "Offline hazırlığı").

export type DownloadState = 'idle' | 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';

export interface DownloadProgress {
  documentId: string;
  bytesDownloaded: number;
  totalBytes: number;
  /** 0-100 arası tamamlanma yüzdesi. */
  percent: number;
}

export interface DownloadQueueItem {
  documentId: string;
  state: DownloadState;
  progress: DownloadProgress | null;
  /** ISO tarih — kuyruğa ekleme zamanı. */
  queuedAt: string;
  error?: string;
}

/** Gelecekte gerçekten indirilmiş bir PDF'in yerel kaydı. */
export interface OfflineDocumentRecord {
  documentId: string;
  /** Cihazdaki dosya URI'si (ör. `file://...`). */
  localUri: string;
  /** ISO tarih — indirme tamamlanma zamanı. */
  downloadedAt: string;
  checksum?: string;
  sizeBytes?: number;
}
