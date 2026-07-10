// Download Repository testleri (Sprint 13, madde 21).
// ⚠️ Gerçek AsyncStorage'a HİÇ dokunulmaz — her testte bellek-içi bir
// `KeyValueStorage` sahtesi enjekte edilir.
import { test } from 'node:test';
import assert from 'node:assert';
import {
  saveDownloadRecord,
  getDownloadRecord,
  getAllDownloadRecords,
  removeDownloadRecord,
  isDocumentDownloaded,
  getDownloadedDocumentUri,
  updateLastOpenedAt,
  getDownloadedCountByInstitution,
  clearInvalidRecords,
  type KeyValueStorage,
} from '../src/offline/downloadRepository.ts';
import type { DownloadRecord } from '../src/offline/downloadTypes.ts';

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

function ornekKayit(overrides: Partial<DownloadRecord> = {}): DownloadRecord {
  return {
    documentId: 'ag-xlpe-kablo',
    institution: 'TEDAŞ',
    fileName: 'ag-xlpe-kablo.pdf',
    localUri: 'file:///sartname-cepte-pdfs/tedas/ag-xlpe-kablo.pdf',
    sourceUrl: 'https://www.tedas.gov.tr/ag-xlpe-kablo.pdf',
    downloadedAt: '2026-01-01T00:00:00.000Z',
    fileSize: 12345,
    checksumStatus: 'unavailable',
    verifiedDomain: true,
    status: 'completed',
    ...overrides,
  };
}

test('saveDownloadRecord + getDownloadRecord: kayıt doğru okunuyor', async () => {
  const storage = fakeStorage();
  await saveDownloadRecord(ornekKayit(), storage);
  const kayit = await getDownloadRecord('ag-xlpe-kablo', storage);
  assert.ok(kayit);
  assert.strictEqual(kayit!.institution, 'TEDAŞ');
});

test('getDownloadRecord: kayıtsız belge undefined döner', async () => {
  const storage = fakeStorage();
  assert.strictEqual(await getDownloadRecord('olmayan-id', storage), undefined);
});

test('getAllDownloadRecords: birden fazla kayıt döndürülüyor', async () => {
  const storage = fakeStorage();
  await saveDownloadRecord(ornekKayit({ documentId: 'a' }), storage);
  await saveDownloadRecord(ornekKayit({ documentId: 'b', institution: 'EPDK' }), storage);
  const hepsi = await getAllDownloadRecords(storage);
  assert.strictEqual(hepsi.length, 2);
});

test('removeDownloadRecord: kayıt kaldırılıyor', async () => {
  const storage = fakeStorage();
  await saveDownloadRecord(ornekKayit(), storage);
  await removeDownloadRecord('ag-xlpe-kablo', storage);
  assert.strictEqual(await getDownloadRecord('ag-xlpe-kablo', storage), undefined);
});

test('removeDownloadRecord: olmayan kayıt için hata FIRLATMAZ (idempotent)', async () => {
  const storage = fakeStorage();
  await assert.doesNotReject(removeDownloadRecord('olmayan-id', storage));
});

test('isDocumentDownloaded: doğru boolean dönüyor', async () => {
  const storage = fakeStorage();
  assert.strictEqual(await isDocumentDownloaded('ag-xlpe-kablo', storage), false);
  await saveDownloadRecord(ornekKayit(), storage);
  assert.strictEqual(await isDocumentDownloaded('ag-xlpe-kablo', storage), true);
});

test('getDownloadedDocumentUri: kayıtlıysa URI, değilse undefined', async () => {
  const storage = fakeStorage();
  assert.strictEqual(await getDownloadedDocumentUri('ag-xlpe-kablo', storage), undefined);
  await saveDownloadRecord(ornekKayit(), storage);
  assert.strictEqual(await getDownloadedDocumentUri('ag-xlpe-kablo', storage), ornekKayit().localUri);
});

test('updateLastOpenedAt: yalnızca lastOpenedAt alanı güncelleniyor', async () => {
  const storage = fakeStorage();
  await saveDownloadRecord(ornekKayit(), storage);
  await updateLastOpenedAt('ag-xlpe-kablo', storage, '2026-02-01T00:00:00.000Z');
  const kayit = await getDownloadRecord('ag-xlpe-kablo', storage);
  assert.strictEqual(kayit!.lastOpenedAt, '2026-02-01T00:00:00.000Z');
  assert.strictEqual(kayit!.fileSize, 12345, 'diğer alanlar değişmemeli');
});

test('updateLastOpenedAt: kayıtsız belge için sessizce hiçbir şey yapmaz', async () => {
  const storage = fakeStorage();
  await assert.doesNotReject(updateLastOpenedAt('olmayan-id', storage));
});

test('getDownloadedCountByInstitution: kurum bazlı doğru sayılıyor', async () => {
  const storage = fakeStorage();
  await saveDownloadRecord(ornekKayit({ documentId: 'a', institution: 'TEDAŞ' }), storage);
  await saveDownloadRecord(ornekKayit({ documentId: 'b', institution: 'TEDAŞ' }), storage);
  await saveDownloadRecord(ornekKayit({ documentId: 'c', institution: 'EPDK' }), storage);
  const sayilar = await getDownloadedCountByInstitution(storage);
  assert.strictEqual(sayilar['TEDAŞ'], 2);
  assert.strictEqual(sayilar['EPDK'], 1);
});

test('clearInvalidRecords: fiziksel dosyası olmayan kayıtlar temizleniyor', async () => {
  const storage = fakeStorage();
  await saveDownloadRecord(ornekKayit({ documentId: 'var-olan' }), storage);
  await saveDownloadRecord(ornekKayit({ documentId: 'kayip' }), storage);
  const removed = await clearInvalidRecords(async (_localUri, documentId) => documentId !== 'kayip', storage);
  assert.strictEqual(removed, 1);
  assert.strictEqual(await getDownloadRecord('var-olan', storage) !== undefined, true);
  assert.strictEqual(await getDownloadRecord('kayip', storage), undefined);
});

test('clearInvalidRecords: tüm dosyalar mevcutsa hiçbir şey silinmez', async () => {
  const storage = fakeStorage();
  await saveDownloadRecord(ornekKayit(), storage);
  const removed = await clearInvalidRecords(async () => true, storage);
  assert.strictEqual(removed, 0);
  assert.strictEqual(await isDocumentDownloaded('ag-xlpe-kablo', storage), true);
});

test('bozuk JSON verisi güvenle boş liste olarak ele alınır', async () => {
  const storage = fakeStorage();
  await storage.setItem('sartname-cepte:downloadRecords', 'gecerli-olmayan-json{{{');
  const hepsi = await getAllDownloadRecords(storage);
  assert.deepStrictEqual(hepsi, []);
});
