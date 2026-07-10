// Download Manager testleri (Sprint 13, madde 21).
// ⚠️ Gerçek internete, gerçek dosya sistemine, gerçek AsyncStorage'a HİÇ
// dokunulmaz — `globalThis.fetch` mock'lanır, `DownloadFileOps`/
// `KeyValueStorage`/`ChecksumFileReader` bellek-içi sahtelerle enjekte edilir.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  downloadOfficialPdf,
  deleteDownloadedPdf,
  pruneInvalidDownloadRecords,
  isDownloadActive,
  resetDownloadManagerForTests,
  type DownloadFileOps,
  type DownloadHandle,
} from '../src/offline/downloadManager.ts';
import { clearCacheForTests } from '../src/sourceResolver/network/cache.ts';
import { resetRateLimiterForTests } from '../src/sourceResolver/network/rateLimiter.ts';
import { getDownloadRecord, saveDownloadRecord, type KeyValueStorage } from '../src/offline/downloadRepository.ts';
import { findRuntimePdfByDocumentId, clearRuntimeManifestForTests } from '../src/offline/runtimePdfManifest.ts';
import type { DownloadRequest, DownloadProgress } from '../src/offline/downloadTypes.ts';
import type { ChecksumFileReader } from '../src/offline/checksum.ts';

let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  resetDownloadManagerForTests();
  clearRuntimeManifestForTests();
  clearCacheForTests();
  resetRateLimiterForTests();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ── Yardımcılar ──────────────────────────────────────────────────────────

function fakeStorage(): KeyValueStorage {
  const store = new Map<string, string>();
  return {
    async getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    async setItem(key: string, value: string) {
      store.set(key, value);
    },
    async removeItem(key: string) {
      store.delete(key);
    },
  };
}

interface FakeFileOpsConfig {
  downloadStatus?: number;
  writtenSize?: number;
  signatureBytes?: string;
  freeDiskSpace?: number;
  downloadThrows?: boolean;
  downloadNeverResolves?: boolean;
}

function createFakeFileOps(config: FakeFileOpsConfig = {}) {
  let exists = false;
  let size = 0;
  const deleted: string[] = [];

  const fileOps: DownloadFileOps = {
    async ensureDirectory() {},
    async resolveAbsolutePath(relativePath: string) {
      return `file:///fake/${relativePath}`;
    },
    async getInfo(_absolutePath: string) {
      return exists ? { exists: true, size } : { exists: false };
    },
    async deleteFile(absolutePath: string) {
      deleted.push(absolutePath);
      exists = false;
      size = 0;
    },
    downloadToFile(_url: string, _absolutePath: string, options: { onProgress?: (p: DownloadProgress) => void }): DownloadHandle {
      let cancelled = false;
      const promise = (async () => {
        if (config.downloadNeverResolves) return new Promise<never>(() => {});
        if (config.downloadThrows) throw new Error('ağ hatası');
        options.onProgress?.({ documentId: '', bytesDownloaded: 10, totalBytes: 100, percent: 10 });
        if (cancelled) return { status: 0, contentType: undefined, bytesWritten: 0 };
        exists = true;
        size = config.writtenSize ?? 1000;
        return { status: config.downloadStatus ?? 200, contentType: 'application/pdf', bytesWritten: size };
      })();
      return { promise, cancel: async () => { cancelled = true; } };
    },
    async readHeadBytes(_absolutePath: string, _byteLength: number) {
      return config.signatureBytes ?? '%PDF-';
    },
    async getFreeDiskSpace() {
      return config.freeDiskSpace;
    },
  };

  return { fileOps, getDeleted: () => deleted, getExists: () => exists };
}

/** Sprint 12'nin `fetchHead()`'ini kullanan HEAD ön kontrolü için mock `fetch`. */
function mockHeadFetch(config: { status?: number; contentType?: string; contentLength?: number; url?: string } = {}) {
  return (async (input: unknown) => ({
    status: config.status ?? 200,
    url: config.url ?? String(input),
    headers: {
      get: (name: string) => {
        const n = name.toLowerCase();
        if (n === 'content-type') return config.contentType ?? 'application/pdf';
        if (n === 'content-length') return config.contentLength !== undefined ? String(config.contentLength) : null;
        return null;
      },
    },
    text: async () => '',
  })) as unknown as typeof fetch;
}

function baseRequest(overrides: Partial<DownloadRequest> = {}): DownloadRequest {
  return {
    documentId: 'ag-xlpe-kablo',
    institution: 'TEDAŞ',
    title: 'TEDAŞ AG Güç Kabloları Teknik Şartnamesi',
    url: 'https://www.tedas.gov.tr/ag-xlpe-kablo.pdf',
    providerId: 'tedas',
    suggestedFileName: 'ag-xlpe-kablo.pdf',
    ...overrides,
  };
}

// ── Testler ──────────────────────────────────────────────────────────────

test('resmî PDF URL başarıyla indirilir', async () => {
  globalThis.fetch = mockHeadFetch({ url: 'https://www.tedas.gov.tr/ag-xlpe-kablo.pdf' });
  const { fileOps } = createFakeFileOps();
  const storage = fakeStorage();

  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage });

  assert.strictEqual(sonuc.status, 'completed');
  assert.ok(sonuc.localUri);
});

test('sahte domain reddedilir', async () => {
  const { fileOps } = createFakeFileOps();
  const sonuc = await downloadOfficialPdf(
    baseRequest({ url: 'https://sahte-tedas.com/dosya.pdf' }),
    { confirmed: true, fileOps, storage: fakeStorage() }
  );
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'unverifiedDomain');
});

test('restricted sağlayıcı (TSE/IEC/CENELEC/IEEE) tam metin ASLA indirilmez', async () => {
  const { fileOps } = createFakeFileOps();
  const sonuc = await downloadOfficialPdf(
    baseRequest({ institution: 'TSE', providerId: 'tse', url: 'https://www.tse.org.tr/dosya.pdf' }),
    { confirmed: true, fileOps, storage: fakeStorage() }
  );
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'restrictedSource');
});

test('kullanıcı onayı yoksa indirme başlamaz', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps, getExists } = createFakeFileOps();
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: false, fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(getExists(), false, 'onay olmadan hiçbir dosya yazılmamalı');
});

test('aynı documentId için ikinci indirme eşzamanlı başlatılamaz', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps({ downloadNeverResolves: true });
  const ilkPromise = downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage(), timeoutMs: 100 });
  await new Promise((r) => setImmediate(r));
  assert.strictEqual(isDownloadActive('ag-xlpe-kablo'), true);
  const ikinciSonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.strictEqual(ikinciSonuc.status, 'failed');
  assert.strictEqual(ikinciSonuc.failureReason, 'duplicate');
  resetDownloadManagerForTests(); // asılı kalan ilkPromise'i temizle (test izolasyonu)
  void ilkPromise.catch(() => {});
});

test('zaman aşımında yarım dosya silinir', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps, getDeleted, getExists } = createFakeFileOps({ downloadNeverResolves: true });
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage(), timeoutMs: 50 });
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'timeout');
  assert.strictEqual(getExists(), false);
  assert.ok(getDeleted().length > 0, 'yarım dosya silinmiş olmalı');
});

test('dosya boyutu 0 ise reddedilir', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps({ writtenSize: 0 });
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'writeError');
});

test('100 MB üstü dosya reddedilir (HEAD Content-Length üzerinden)', async () => {
  globalThis.fetch = mockHeadFetch({ contentLength: 200 * 1024 * 1024 });
  const { fileOps } = createFakeFileOps();
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'fileTooLarge');
});

test('100 MB üstü dosya, HEAD boyutu bildirmese bile GERÇEK yazılan boyuttan reddedilir', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps({ writtenSize: 200 * 1024 * 1024 });
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'fileTooLarge');
});

test('Content-Type HTML ise (HEAD ön kontrolünde) reddedilir', async () => {
  globalThis.fetch = mockHeadFetch({ contentType: 'text/html; charset=utf-8' });
  const { fileOps } = createFakeFileOps();
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'invalidContentType');
});

test('%PDF- imzası olmayan dosya reddedilir (Content-Type doğru dese bile)', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps, getDeleted } = createFakeFileOps({ signatureBytes: '<html>' });
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc.status, 'failed');
  assert.strictEqual(sonuc.failureReason, 'invalidContentType');
  assert.ok(getDeleted().length > 0, 'sahte içerikli dosya silinmeli');
});

test('checksum hesaplanabiliyorsa kaydedilir', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps();
  const reader: ChecksumFileReader = { async readAsBase64() { return Buffer.from('%PDF-1.4 test').toString('base64'); } };
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage(), checksumReader: reader });
  assert.strictEqual(sonuc.status, 'completed');
  assert.strictEqual(sonuc.checksumStatus, 'available');
  assert.ok(sonuc.checksum && sonuc.checksum.length === 64, 'SHA-256 hex 64 karakter olmalı');
});

test('ortam SHA-256 desteklemiyorsa checksum "unavailable" olarak dürüstçe işaretlenir', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps();
  // `calculateChecksum()`, `globalThis.atob` yokluğunu da "ortam desteklemiyor"
  // sinyali olarak kullanır (bkz. checksum.ts `isSha256Available()`) — bu,
  // Node'un kendi `crypto` global'ini (non-configurable olabilir, dokunmak
  // riskli) bozmadan "SHA-256 yok" durumunu güvenle simüle etmenin yoludur.
  const originalAtob = (globalThis as { atob?: unknown }).atob;
  (globalThis as { atob?: unknown }).atob = undefined;
  try {
    const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
    assert.strictEqual(sonuc.status, 'completed');
    assert.strictEqual(sonuc.checksumStatus, 'unavailable');
    assert.strictEqual(sonuc.checksum, undefined, 'uydurma checksum ÜRETİLMEMELİ');
  } finally {
    (globalThis as { atob?: unknown }).atob = originalAtob;
  }
});

test('başarılı indirme download repository\'ye yazılır', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps();
  const storage = fakeStorage();
  await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage });
  const kayit = await getDownloadRecord('ag-xlpe-kablo', storage);
  assert.ok(kayit);
  assert.strictEqual(kayit!.status, 'completed');
});

test('başarılı indirme runtime manifest\'e eklenir', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps();
  await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.ok(findRuntimePdfByDocumentId('ag-xlpe-kablo'));
});

test('deleteDownloadedPdf: dosya + runtime manifest + kalıcı kayıt birlikte temizlenir', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps, getExists } = createFakeFileOps();
  const storage = fakeStorage();
  await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage });
  assert.ok(findRuntimePdfByDocumentId('ag-xlpe-kablo'));

  await deleteDownloadedPdf('ag-xlpe-kablo', { fileOps, storage });

  assert.strictEqual(findRuntimePdfByDocumentId('ag-xlpe-kablo'), undefined);
  assert.strictEqual(await getDownloadRecord('ag-xlpe-kablo', storage), undefined);
  assert.strictEqual(getExists(), false);
});

test('deleteDownloadedPdf: kayıt zaten yoksa idempotent olarak true döner', async () => {
  const { fileOps } = createFakeFileOps();
  const sonuc = await deleteDownloadedPdf('olmayan-id', { fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc, true);
});

test('pruneInvalidDownloadRecords: fiziksel dosyası kaybolmuş kayıtlar temizlenir ve runtime manifest senkron kalır', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps();
  const storage = fakeStorage();
  await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage });

  // Dosya "kayboldu" simülasyonu: getInfo artık exists:false dönsün.
  const bozukFileOps: DownloadFileOps = { ...fileOps, async getInfo() { return { exists: false }; } };

  const removed = await pruneInvalidDownloadRecords({ fileOps: bozukFileOps, storage });
  assert.strictEqual(removed, 1);
  assert.strictEqual(await getDownloadRecord('ag-xlpe-kablo', storage), undefined);
  assert.strictEqual(findRuntimePdfByDocumentId('ag-xlpe-kablo'), undefined, 'runtime manifest de senkron temizlenmeli');
});

test('rate limiter/arama önbelleği ile bağımsız çalışır (Sprint 12 altyapısını bozmaz)', async () => {
  globalThis.fetch = mockHeadFetch();
  const { fileOps } = createFakeFileOps();
  const sonuc = await downloadOfficialPdf(baseRequest(), { confirmed: true, fileOps, storage: fakeStorage() });
  assert.strictEqual(sonuc.status, 'completed');
});
