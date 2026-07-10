// Gerçek PDF indirme yöneticisi (Sprint 13, madde 4).
//
// ⚠️ Bu dosya `data/library/repository.ts`'i İMPORT ETMEZ (madde 19) —
// indirme için gereken tüm belge bilgisi (`institution`, `title`) doğrudan
// `DownloadRequest` içinde TAŞINIR; çağıran ekran bunu Doküman
// nesnesinden kendisi doldurur.
//
// ⚠️ `expo-file-system` bu dosyanın ÜSTÜNDE statik olarak import EDİLMEZ
// — native modül olduğundan `node --test` altında güvenilir yüklenemez.
// Gerçek dosya işlemleri `realDownloadFileOps` içinde, yalnızca
// ÇAĞRILDIĞINDA dinamik `import()` ile yapılır; testler kendi bellek-içi
// `DownloadFileOps` sahtesini enjekte eder ve bu import HİÇ tetiklenmez.
import { isRestrictedStandardProvider, isSafeRequestUrl } from '../sourceResolver/validators.ts';
import { fetchHead } from '../sourceResolver/network/httpClient.ts';
import { getDocumentFilePath, getInstitutionDirectory, sanitizeFileName } from './filePaths.ts';
import { calculateChecksum, type ChecksumFileReader } from './checksum.ts';
import { addRuntimeManifestItem, removeRuntimeManifestItem } from './runtimePdfManifest.ts';
import {
  clearInvalidRecords,
  getDownloadRecord,
  removeDownloadRecord,
  saveDownloadRecord,
  type KeyValueStorage,
} from './downloadRepository.ts';
import type { DownloadFailureReason, DownloadProgress, DownloadRecord, DownloadRequest, DownloadResult } from './downloadTypes.ts';

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 60_000;
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB (madde 6)
const PDF_SIGNATURE = '%PDF-';

// ── Dosya işlemleri arayüzü (test edilebilirlik için enjekte edilebilir) ──

export interface DownloadHandle {
  promise: Promise<{ status: number; contentType?: string; bytesWritten: number }>;
  cancel: () => Promise<void>;
}

export interface DownloadFileOps {
  ensureDirectory(relativeDir: string): Promise<void>;
  resolveAbsolutePath(relativePath: string): Promise<string>;
  getInfo(absolutePath: string): Promise<{ exists: boolean; size?: number }>;
  deleteFile(absolutePath: string): Promise<void>;
  downloadToFile(
    url: string,
    absolutePath: string,
    options: { onProgress?: (progress: DownloadProgress) => void }
  ): DownloadHandle;
  /** Dosyanın ilk `byteLength` baytını metin (utf8-uyumlu) olarak okur — imza kontrolü için. */
  readHeadBytes(absolutePath: string, byteLength: number): Promise<string>;
  /** Boş cihaz alanı (bayt) — ölçülemiyorsa `undefined` (madde 4, "yapabiliyorsan yap"). */
  getFreeDiskSpace?(): Promise<number | undefined>;
}

async function realDownloadFileOps(): Promise<DownloadFileOps> {
  const FS = await import('expo-file-system/legacy');
  const { ensureDirectoryExists, resolveAbsolutePath } = await import('./filePaths.ts');

  return {
    async ensureDirectory(relativeDir: string) {
      await ensureDirectoryExists(relativeDir);
    },
    resolveAbsolutePath,
    async getInfo(absolutePath: string) {
      const info = await FS.getInfoAsync(absolutePath);
      return { exists: info.exists, size: info.exists && !info.isDirectory ? info.size : undefined };
    },
    async deleteFile(absolutePath: string) {
      await FS.deleteAsync(absolutePath, { idempotent: true });
    },
    downloadToFile(url, absolutePath, options) {
      const resumable = FS.createDownloadResumable(url, absolutePath, {}, (event) => {
        options.onProgress?.({
          documentId: '',
          bytesDownloaded: event.totalBytesWritten,
          totalBytes: event.totalBytesExpectedToWrite,
          percent: event.totalBytesExpectedToWrite > 0 ? Math.round((event.totalBytesWritten / event.totalBytesExpectedToWrite) * 100) : 0,
        });
      });
      const promise = resumable.downloadAsync().then((result) => ({
        status: result?.status ?? 0,
        contentType: result?.headers?.['Content-Type'] ?? result?.headers?.['content-type'],
        bytesWritten: result?.headers?.['Content-Length'] ? Number(result.headers['Content-Length']) : 0,
      }));
      return {
        promise,
        cancel: async () => {
          await resumable.pauseAsync();
        },
      };
    },
    async readHeadBytes(absolutePath: string, byteLength: number) {
      // ⚠️ `position`/`length` yalnızca `encoding: 'base64'` ile ÇALIŞIR
      // (legacy API dokümantasyonu) — 'utf8' ile bu alanlar SESSİZCE
      // yok sayılır ve dosyanın TAMAMI okunurdu. Bu yüzden base64 ile
      // okunup ASCII imza kontrolü için çözülür.
      const base64Head = await FS.readAsStringAsync(absolutePath, { encoding: 'base64', position: 0, length: byteLength });
      const atobFn = (globalThis as { atob?: (s: string) => string }).atob;
      return atobFn ? atobFn(base64Head) : '';
    },
    async getFreeDiskSpace() {
      try {
        return await FS.getFreeDiskStorageAsync();
      } catch {
        return undefined;
      }
    },
  };
}

// ── Zaman aşımı sarmalayıcı (madde: her async işlem timeout içersin) ─────

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout: () => void): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    timer = setTimeout(() => {
      onTimeout();
      reject(new Error('timeout'));
    }, timeoutMs);
  });
  promise.catch(() => {}); // kaybeden tarafın nihai reddi sessizce tüketilir (Sprint 12 deseniyle AYNI)
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

// ── Aynı belge için tek aktif indirme kilidi (madde 5, 18) ───────────────

const activeDownloads = new Set<string>();
const activeHandles = new Map<string, DownloadHandle>();

export function isDownloadActive(documentId: string): boolean {
  return activeDownloads.has(documentId);
}

// ── Ana fonksiyon ──────────────────────────────────────────────────────

export interface DownloadOfficialPdfOptions {
  /** Kullanıcının onay modalında AÇIKÇA "İndir" dediğini doğrular (madde 10 — savunma amaçlı ikinci kapı). */
  confirmed: boolean;
  onProgress?: (progress: DownloadProgress) => void;
  timeoutMs?: number;
  fileOps?: DownloadFileOps;
  checksumReader?: ChecksumFileReader;
  storage?: KeyValueStorage;
  now?: () => string;
}

function buildResult(documentId: string, status: DownloadResult['status'], message: string, extra: Partial<DownloadResult> = {}): DownloadResult {
  return { documentId, status, message, ...extra };
}

const FAILURE_MESSAGES: Record<DownloadFailureReason, string> = {
  invalidUrl: 'Geçersiz bağlantı.',
  unverifiedDomain: 'Bu bağlantı doğrulanmış resmî bir kaynağa ait değil.',
  restrictedSource: 'Bu kaynak telifli veya erişimi kısıtlıdır.',
  timeout: 'Bağlantı zaman aşımına uğradı.',
  networkError: 'Ağ bağlantısı kurulamadı.',
  httpError: 'Sunucu hatası oluştu.',
  invalidContentType: 'Dosya PDF formatında doğrulanamadı.',
  fileTooLarge: 'Dosya boyutu izin verilen sınırı aşıyor.',
  writeError: 'Dosya cihaza yazılamadı.',
  checksumError: 'Dosya bütünlüğü doğrulanamadı.',
  cancelled: 'İndirme iptal edildi.',
  duplicate: 'Bu doküman zaten indirilmiş veya indiriliyor.',
  insufficientStorage: 'Cihazda yeterli depolama alanı yok.',
};

function fail(documentId: string, reason: DownloadFailureReason): DownloadResult {
  return buildResult(documentId, 'failed', FAILURE_MESSAGES[reason], { failureReason: reason });
}

/**
 * Kullanıcı onaylı, güvenli, sıkı sınırlı bir resmî PDF indirme akışı
 * (madde 4, 18 adım). Aynı `documentId` için asla iki eşzamanlı indirme
 * çalışmaz; her hata durumunda yarım dosya silinir; kilit her koşulda
 * `finally` içinde kaldırılır.
 */
export async function downloadOfficialPdf(request: DownloadRequest, options: DownloadOfficialPdfOptions): Promise<DownloadResult> {
  // 1. Temel istek doğrulaması (repository'ye bağımlı değil — madde 19).
  if (!request.documentId || !request.url || !request.institution) {
    return fail(request.documentId ?? 'bilinmeyen', 'invalidUrl');
  }

  // 2. Domain yeniden doğrulanır — UI'dan gelen URL'ye KÖRÜ KÖRÜNE güvenilmez.
  if (!isSafeRequestUrl(request.url, request.providerId)) {
    return fail(request.documentId, 'unverifiedDomain');
  }

  // 3. Restricted sağlayıcı — TSE/IEC/CENELEC/IEEE tam metin ASLA indirilmez.
  if (isRestrictedStandardProvider(request.providerId)) {
    return fail(request.documentId, 'restrictedSource');
  }

  // 4. Kullanıcı onayı (savunma amaçlı ikinci kapı — asıl kapı UI'dadır).
  if (!options.confirmed) {
    return fail(request.documentId, 'invalidUrl');
  }

  // 5. Aynı belge için aktif indirme var mı.
  if (activeDownloads.has(request.documentId)) {
    return fail(request.documentId, 'duplicate');
  }

  const timeoutMs = Math.min(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS);
  const fileOps = options.fileOps ?? (await realDownloadFileOps());
  const now = options.now ?? (() => new Date().toISOString());

  activeDownloads.add(request.documentId);

  const fileName = sanitizeFileName(request.suggestedFileName ?? `${request.documentId}.pdf`);
  const relativeDir = getInstitutionDirectory(request.institution);
  const relativePath = getDocumentFilePath(request.documentId, fileName, request.institution);
  let absolutePath = '';
  let downloadStarted = false;
  let handle: DownloadHandle | undefined;

  try {
    absolutePath = await fileOps.resolveAbsolutePath(relativePath);

    // 6. Yerel dosya zaten var mı.
    const existing = await fileOps.getInfo(absolutePath);
    if (existing.exists) {
      return fail(request.documentId, 'duplicate');
    }

    // 7. Disk alanı kontrolü (yapılabiliyorsa).
    const freeSpace = await fileOps.getFreeDiskSpace?.();
    if (typeof freeSpace === 'number' && freeSpace < MAX_FILE_SIZE_BYTES * 0.1) {
      return fail(request.documentId, 'insufficientStorage');
    }

    // Ön kontrol: HEAD isteğiyle Content-Type/boyut/domain (redirect dahil) — Sprint 12 altyapısı yeniden kullanılır.
    const headCheck = await fetchHead(request.url, { timeoutMs: Math.min(timeoutMs, 15_000) });
    if (!headCheck.ok) {
      return fail(request.documentId, headCheck.reason === 'timeout' ? 'timeout' : 'networkError');
    }
    if (!isSafeRequestUrl(headCheck.data.metadata.finalUrl, request.providerId)) {
      return fail(request.documentId, 'unverifiedDomain'); // redirect sonrası domain tekrar doğrulanır
    }
    const headContentLength = headCheck.data.metadata.contentLength;
    if (typeof headContentLength === 'number' && headContentLength > MAX_FILE_SIZE_BYTES) {
      return fail(request.documentId, 'fileTooLarge');
    }
    const headContentType = headCheck.data.metadata.contentType ?? '';
    if (headContentType && !headContentType.toLowerCase().includes('pdf') && !headContentType.toLowerCase().includes('octet-stream')) {
      return fail(request.documentId, 'invalidContentType');
    }

    // 8. Dizin hazırlığı.
    await fileOps.ensureDirectory(relativeDir);

    // 9-10. Timeout'lu indirme + progress.
    downloadStarted = true;
    handle = fileOps.downloadToFile(request.url, absolutePath, {
      onProgress: (progress) => options.onProgress?.({ ...progress, documentId: request.documentId }),
    });
    activeHandles.set(request.documentId, handle);

    let timedOut = false;
    const downloadResult = await withTimeout(handle.promise, timeoutMs, () => {
      timedOut = true;
      handle?.cancel().catch(() => {});
    });

    // status===0: gerçek HTTP yanıtı hiç alınmadı — iptal edildi (kullanıcı
    // veya zaman aşımı) demektir, sunucu hatası DEĞİL.
    if (downloadResult.status === 0) {
      await fileOps.deleteFile(absolutePath).catch(() => {});
      return fail(request.documentId, timedOut ? 'timeout' : 'cancelled');
    }
    if (downloadResult.status < 200 || downloadResult.status >= 400) {
      await fileOps.deleteFile(absolutePath).catch(() => {});
      return fail(request.documentId, 'httpError');
    }

    // 11. Boyut kontrolü (gerçek yazılan dosya üzerinden).
    const written = await fileOps.getInfo(absolutePath);
    if (!written.exists || !written.size || written.size <= 0) {
      await fileOps.deleteFile(absolutePath).catch(() => {});
      return fail(request.documentId, 'writeError');
    }
    if (written.size > MAX_FILE_SIZE_BYTES) {
      await fileOps.deleteFile(absolutePath).catch(() => {});
      return fail(request.documentId, 'fileTooLarge');
    }

    // 12. PDF imza kontrolü — Content-Type ne derse desin, gerçek dosya içeriği kontrol edilir.
    const head = await fileOps.readHeadBytes(absolutePath, 5).catch(() => '');
    if (!head.startsWith(PDF_SIGNATURE)) {
      await fileOps.deleteFile(absolutePath).catch(() => {});
      return fail(request.documentId, 'invalidContentType');
    }

    // 13. Checksum (ortam desteklemiyorsa dürüstçe 'unavailable').
    const checksumResult = await calculateChecksum(absolutePath, options.checksumReader);

    // 14. Kalıcı kayıt.
    const record: DownloadRecord = {
      documentId: request.documentId,
      institution: request.institution,
      fileName,
      localUri: absolutePath,
      sourceUrl: request.url,
      downloadedAt: now(),
      fileSize: written.size,
      checksum: checksumResult.checksum,
      checksumStatus: checksumResult.status,
      verifiedDomain: true,
      status: 'completed',
    };
    await saveDownloadRecord(record, options.storage);

    // 15. Runtime manifest kaydı.
    addRuntimeManifestItem({
      documentId: request.documentId,
      institution: request.institution,
      fileName,
      localUri: absolutePath,
      fileSize: written.size,
      checksum: checksumResult.checksum,
      addedAt: record.downloadedAt,
    });

    // 16. Viewer'ın açabileceği yerel URI.
    return buildResult(request.documentId, 'completed', 'PDF başarıyla indirildi.', {
      localUri: absolutePath,
      fileSize: written.size,
      checksum: checksumResult.checksum,
      checksumStatus: checksumResult.status,
    });
  } catch (err) {
    // 17. Hata durumunda yarım dosyayı sil.
    if (downloadStarted && absolutePath) {
      await fileOps.deleteFile(absolutePath).catch(() => {});
    }
    const isTimeout = err instanceof Error && err.message === 'timeout';
    return fail(request.documentId, isTimeout ? 'timeout' : 'networkError');
  } finally {
    // 18. Kilit ve handle referansı her koşulda kaldırılır.
    activeDownloads.delete(request.documentId);
    activeHandles.delete(request.documentId);
  }
}

/** Devam eden bir indirmeyi GERÇEKTEN iptal eder (madde 11 — "İndirme iptal" butonu). Aktif değilse no-op. */
export function cancelActiveDownload(documentId: string): void {
  const handle = activeHandles.get(documentId);
  if (handle) handle.cancel().catch(() => {});
  activeDownloads.delete(documentId);
}

/** Test/tanılama amaçlı: aktif indirme kilitlerini sıfırlar. Üretim kodunda kullanılmaz. */
export function resetDownloadManagerForTests(): void {
  activeDownloads.clear();
  activeHandles.clear();
}

export interface DeleteDownloadedPdfOptions {
  fileOps?: DownloadFileOps;
  storage?: KeyValueStorage;
}

/**
 * Cihaza indirilmiş bir PDF'i tamamen kaldırır (madde 14): dosyayı siler,
 * runtime manifest kaydını ve kalıcı download kaydını temizler. Kayıt
 * yoksa (zaten silinmiş) sessizce `true` döner — idempotent.
 */
export async function deleteDownloadedPdf(documentId: string, options: DeleteDownloadedPdfOptions = {}): Promise<boolean> {
  const record = await getDownloadRecord(documentId, options.storage);
  if (!record) {
    removeRuntimeManifestItem(documentId);
    return true;
  }

  const fileOps = options.fileOps ?? (await realDownloadFileOps());
  await fileOps.deleteFile(record.localUri).catch(() => {});
  removeRuntimeManifestItem(documentId);
  await removeDownloadRecord(documentId, options.storage);
  return true;
}

/**
 * Fiziksel dosyası artık cihazda olmayan (ör. kullanıcı dosya yöneticisinden
 * elle sildiyse) kayıtları temizler ve kaç kayıt kaldırıldığını döner
 * (PDF Kütüphane Durumu ekranı "geçersiz/kayıp dosya kaydı" sayısı için).
 * `clearInvalidRecords` yalnızca kalıcı kaydı temizler — bu fonksiyon,
 * silinen her kayıt için runtime manifest'i de senkron tutar (yoksa
 * `hasPdf()` artık var olmayan bir dosyayı hâlâ "mevcut" sayardı).
 */
export async function pruneInvalidDownloadRecords(options: DeleteDownloadedPdfOptions = {}): Promise<number> {
  const fileOps = options.fileOps ?? (await realDownloadFileOps());
  const silinenIdler: string[] = [];

  const removed = await clearInvalidRecords(async (localUri, documentId?: string) => {
    const info = await fileOps.getInfo(localUri);
    if (!info.exists && documentId) silinenIdler.push(documentId);
    return info.exists;
  }, options.storage);

  for (const id of silinenIdler) removeRuntimeManifestItem(id);
  return removed;
}
