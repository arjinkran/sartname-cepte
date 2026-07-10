// İndirme kuyruğu (Sprint 13, madde 18-19).
// Aynı anda en fazla 2 PDF indirilebilir; her iş yalnızca bir kez
// completed/failed/cancelled olur; bir işin hata vermesi diğerlerini
// DURDURMAZ.
import { cancelActiveDownload, downloadOfficialPdf } from './downloadManager.ts';
import type { DownloadOfficialPdfOptions } from './downloadManager.ts';
import type { DownloadProgress, DownloadRequest, DownloadResult } from './downloadTypes.ts';

const MAX_CONCURRENT = 2;

export type QueueItemStatus = 'queued' | 'downloading' | 'completed' | 'failed' | 'cancelled';

export interface QueueItem {
  request: DownloadRequest;
  status: QueueItemStatus;
  result?: DownloadResult;
  queuedAt: string;
  onProgress?: (progress: DownloadProgress) => void;
}

export interface QueueState {
  items: readonly QueueItem[];
  activeCount: number;
}

type QueueSubscriber = (state: QueueState) => void;
type DownloadFn = typeof downloadOfficialPdf;

const queue: QueueItem[] = [];
let activeCount = 0;
const subscribers = new Set<QueueSubscriber>();
let downloadFnOverride: DownloadFn | undefined;

function activeDownloadFn(): DownloadFn {
  return downloadFnOverride ?? downloadOfficialPdf;
}

function snapshot(): QueueState {
  return { items: [...queue], activeCount };
}

function notify(): void {
  for (const sub of subscribers) sub(snapshot());
}

/** Kuyruk durumundaki değişiklikleri dinler. Döner: unsubscribe fonksiyonu. */
export function subscribeToQueue(subscriber: QueueSubscriber): () => void {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function getQueueState(): QueueState {
  return snapshot();
}

/**
 * Bir indirmeyi kuyruğa ekler. Aynı `documentId` zaten kuyrukta/aktifse
 * (duplicate) `false` döner ve HİÇBİR ŞEY yapmaz (madde 18).
 */
export function enqueueDownload(request: DownloadRequest, options?: { onProgress?: (progress: DownloadProgress) => void }): boolean {
  const duplicate = queue.some(
    (item) => item.request.documentId === request.documentId && (item.status === 'queued' || item.status === 'downloading')
  );
  if (duplicate) return false;

  queue.push({ request, status: 'queued', queuedAt: new Date().toISOString(), onProgress: options?.onProgress });
  notify();
  void processQueue();
  return true;
}

/**
 * Bekleyen (henüz başlamamış) bir işi kuyruktan çıkarır; iş zaten
 * indiriliyorsa gerçek indirmeyi (`downloadManager`) iptal eder.
 */
export function cancelQueuedDownload(documentId: string): boolean {
  const item = queue.find((i) => i.request.documentId === documentId && (i.status === 'queued' || i.status === 'downloading'));
  if (!item) return false;

  if (item.status === 'queued') {
    item.status = 'cancelled';
    notify();
    return true;
  }

  cancelActiveDownload(documentId);
  return true;
}

/**
 * Açık slot varken bekleyen işleri başlatır. Kendi kendini yalnızca bir
 * iş TAMAMLANDIĞINDA, kontrollü bir şekilde tekrar çağırır (madde 19) —
 * her çağrı sabit sayıda (en fazla `MAX_CONCURRENT - activeCount`) iş
 * başlatıp SENKRON olarak döner; sonsuz döngü YAPISAL OLARAK imkânsızdır
 * (çağrı zinciri yalnızca gerçek bir indirmenin `finally` bloğundan,
 * yani bir önceki işin tamamlanmasından SONRA ilerler).
 */
export async function processQueue(): Promise<void> {
  while (activeCount < MAX_CONCURRENT) {
    const next = queue.find((item) => item.status === 'queued');
    if (!next) break;

    next.status = 'downloading';
    activeCount += 1;
    notify();

    void runQueueItem(next);
  }
}

async function runQueueItem(item: QueueItem): Promise<void> {
  const options: DownloadOfficialPdfOptions = { confirmed: true, onProgress: item.onProgress };
  try {
    const result = await activeDownloadFn()(item.request, options);
    item.result = result;
    item.status = result.status === 'completed' ? 'completed' : result.status === 'cancelled' ? 'cancelled' : 'failed';
  } catch {
    // Bir işin hata vermesi kuyruğu DURDURMAZ (madde 18) — yalnızca bu öğe failed işaretlenir.
    item.status = 'failed';
  } finally {
    activeCount = Math.max(0, activeCount - 1); // hiçbir hata yolunda negatif olmaz (madde 19)
    notify();
    void processQueue(); // bir iş bitince kuyruk BİR KEZ, kontrollü olarak tekrar değerlendirilir
  }
}

/** Test amaçlı: gerçek `downloadOfficialPdf` yerine sahte bir fonksiyon enjekte eder. */
export function setDownloadFnForTests(fn: DownloadFn | undefined): void {
  downloadFnOverride = fn;
}

/** Test/tanılama amaçlı: kuyruğu tamamen sıfırlar. Üretim kodunda kullanılmaz. */
export function resetQueueForTests(): void {
  queue.length = 0;
  activeCount = 0;
  subscribers.clear();
  downloadFnOverride = undefined;
}
