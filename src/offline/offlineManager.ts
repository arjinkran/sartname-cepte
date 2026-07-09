// İndirme yöneticisi iskeleti (Sprint 8, madde 10).
//
// ⚠️ HİÇBİR fonksiyon gerçek bir ağ isteği veya dosya sistemi yazımı
// YAPMAZ — yalnızca bellek-içi bir kuyruk simülasyonudur. Gerçek indirme
// (expo-file-system tabanlı) ileride bu API'nin İÇİ değiştirilerek
// eklenecek; dışa açılan fonksiyon imzaları şimdiden sabitlendi ki
// çağıran kod (ileride) değişmesin (bkz. docs/PDF_ARCHITECTURE.md).
import type { DownloadQueueItem, DownloadState } from './offlineTypes.ts';

const queue = new Map<string, DownloadQueueItem>();

/** Bir belgeyi indirme kuyruğuna EKLER — gerçek indirme BAŞLAMAZ. */
export function enqueueDownload(documentId: string): DownloadQueueItem {
  const item: DownloadQueueItem = {
    documentId,
    state: 'queued',
    progress: null,
    queuedAt: new Date().toISOString(),
  };
  queue.set(documentId, item);
  return item;
}

/** Kuyruktaki (varsa) bir indirmeyi iptal eder. */
export function cancelDownload(documentId: string): void {
  queue.delete(documentId);
}

export function getDownloadState(documentId: string): DownloadState {
  return queue.get(documentId)?.state ?? 'idle';
}

export function getDownloadQueue(): readonly DownloadQueueItem[] {
  return Array.from(queue.values());
}

/** Test/tanılama amaçlı: kuyruğu sıfırlar. Üretim kodunda kullanılmaz. */
export function resetQueueForTests(): void {
  queue.clear();
}
