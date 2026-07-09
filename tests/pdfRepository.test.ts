// PDF Repository ve offline/download iskeleti testleri (Sprint 8).
import { test } from 'node:test';
import assert from 'node:assert';
import {
  getAllDocuments,
  getAvailablePdfDocuments,
  getMissingPdfDocuments,
  getPdfPath,
  getPdfStatistics,
  getStatistics,
  hasPdf,
} from '../src/data/library/repository.ts';
import {
  cancelDownload,
  enqueueDownload,
  getDownloadQueue,
  getDownloadState,
  resetQueueForTests,
} from '../src/offline/offlineManager.ts';
import {
  getOfflineDocumentRecord,
  getOfflineDocuments,
  isAvailableOffline,
} from '../src/offline/offlineRepository.ts';

const tumDokumanlar = getAllDocuments();

test('hasPdf: tanımsız pdfAvailable alanı false kabul edilir', () => {
  for (const d of tumDokumanlar) {
    assert.strictEqual(hasPdf(d), false, `${d.id}: şu an gerçek PDF olmamalı`);
  }
});

test('hasPdf: pdfAvailable=true olan bir belge doğru tespit edilir', () => {
  const sahteVeriDegil = { ...tumDokumanlar[0]!, pdfAvailable: true };
  assert.strictEqual(hasPdf(sahteVeriDegil), true);
});

test('getAvailablePdfDocuments: şu an boş (hiçbir belgede gerçek PDF yok)', () => {
  assert.deepStrictEqual(getAvailablePdfDocuments(), []);
});

test('getMissingPdfDocuments: kütüphanenin tamamını içerir', () => {
  const eksikler = getMissingPdfDocuments();
  assert.strictEqual(eksikler.length, tumDokumanlar.length);
});

test('getPdfPath: PDF olmayan bir belge için undefined döner', () => {
  assert.strictEqual(getPdfPath(tumDokumanlar[0]!.id), undefined);
});

test('getPdfPath: olmayan id için undefined döner', () => {
  assert.strictEqual(getPdfPath('olmayan-id'), undefined);
});

test('getPdfStatistics: toplam sayılar getStatistics() ile tutarlı', () => {
  const pdfIstatistik = getPdfStatistics();
  const genelIstatistik = getStatistics();
  assert.strictEqual(pdfIstatistik.totalDocuments, genelIstatistik.totalDocuments);
  assert.strictEqual(pdfIstatistik.withPdf, 0);
  assert.strictEqual(pdfIstatistik.withoutPdf, pdfIstatistik.totalDocuments);
});

test('getPdfStatistics: kurum bazlı toplamlar genel belge sayısına eşit', () => {
  const pdfIstatistik = getPdfStatistics();
  const toplam = pdfIstatistik.byInstitution.reduce((t, k) => t + k.total, 0);
  assert.strictEqual(toplam, pdfIstatistik.totalDocuments);
  for (const k of pdfIstatistik.byInstitution) {
    assert.ok(k.withPdf <= k.total, `${k.institution}: withPdf total'dan büyük olamaz`);
  }
});

test('getPdfStatistics: kategori bazlı toplamlar genel belge sayısına eşit', () => {
  const pdfIstatistik = getPdfStatistics();
  const toplam = pdfIstatistik.byCategory.reduce((t, k) => t + k.total, 0);
  assert.strictEqual(toplam, pdfIstatistik.totalDocuments);
});

test('getPdfStatistics: totalKnownPageCount negatif olmayan bir sayı', () => {
  const pdfIstatistik = getPdfStatistics();
  assert.ok(typeof pdfIstatistik.totalKnownPageCount === 'number');
  assert.ok(pdfIstatistik.totalKnownPageCount >= 0);
});

// ── offline/download iskeleti ────────────────────────────────────────────

test('offlineRepository: getOfflineDocuments boş dizi döner', () => {
  assert.deepStrictEqual(getOfflineDocuments(), []);
});

test('offlineRepository: isAvailableOffline her zaman false döner', () => {
  assert.strictEqual(isAvailableOffline(tumDokumanlar[0]!.id), false);
  assert.strictEqual(isAvailableOffline('olmayan-id'), false);
});

test('offlineRepository: getOfflineDocumentRecord her zaman undefined döner', () => {
  assert.strictEqual(getOfflineDocumentRecord(tumDokumanlar[0]!.id), undefined);
});

test('offlineManager: enqueueDownload kuyruğa ekler, gerçek indirme başlatmaz', () => {
  resetQueueForTests();
  const belgeId = tumDokumanlar[0]!.id;
  const item = enqueueDownload(belgeId);
  assert.strictEqual(item.documentId, belgeId);
  assert.strictEqual(item.state, 'queued');
  assert.strictEqual(item.progress, null);
  assert.strictEqual(getDownloadState(belgeId), 'queued');
  resetQueueForTests();
});

test('offlineManager: cancelDownload kuyruktan kaldırır', () => {
  resetQueueForTests();
  const belgeId = tumDokumanlar[0]!.id;
  enqueueDownload(belgeId);
  cancelDownload(belgeId);
  assert.strictEqual(getDownloadState(belgeId), 'idle');
  resetQueueForTests();
});

test('offlineManager: getDownloadState kuyrukta olmayan belge için idle döner', () => {
  resetQueueForTests();
  assert.strictEqual(getDownloadState('kuyrukta-olmayan-id'), 'idle');
});

test('offlineManager: getDownloadQueue tüm kuyruk öğelerini döner', () => {
  resetQueueForTests();
  enqueueDownload(tumDokumanlar[0]!.id);
  enqueueDownload(tumDokumanlar[1]!.id);
  assert.strictEqual(getDownloadQueue().length, 2);
  resetQueueForTests();
  assert.strictEqual(getDownloadQueue().length, 0);
});
