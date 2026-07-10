// Runtime PDF Manifest testleri (Sprint 13, madde 21).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  getRuntimeManifest,
  addRuntimeManifestItem,
  removeRuntimeManifestItem,
  findRuntimePdfByDocumentId,
  mergeStaticAndRuntimeManifest,
  hydrateRuntimeManifestFromRecords,
  clearRuntimeManifestForTests,
  type RuntimeManifestItem,
} from '../src/offline/runtimePdfManifest.ts';
import type { PDFManifestItem } from '../src/assets/pdfs/types.ts';

beforeEach(() => {
  clearRuntimeManifestForTests();
});

function ornekItem(overrides: Partial<RuntimeManifestItem> = {}): RuntimeManifestItem {
  return {
    documentId: 'ag-xlpe-kablo',
    institution: 'TEDAŞ',
    fileName: 'ag-xlpe-kablo.pdf',
    localUri: 'file:///sartname-cepte-pdfs/tedas/ag-xlpe-kablo.pdf',
    fileSize: 12345,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

test('addRuntimeManifestItem: eklenen kayıt getRuntimeManifest() ile görünür', () => {
  addRuntimeManifestItem(ornekItem());
  assert.strictEqual(getRuntimeManifest().length, 1);
});

test('findRuntimePdfByDocumentId: kayıtlı belge doğru dönüyor, kayıtsız undefined', () => {
  addRuntimeManifestItem(ornekItem());
  assert.ok(findRuntimePdfByDocumentId('ag-xlpe-kablo'));
  assert.strictEqual(findRuntimePdfByDocumentId('olmayan-id'), undefined);
});

test('removeRuntimeManifestItem: kayıt kaldırılıyor', () => {
  addRuntimeManifestItem(ornekItem());
  removeRuntimeManifestItem('ag-xlpe-kablo');
  assert.strictEqual(findRuntimePdfByDocumentId('ag-xlpe-kablo'), undefined);
});

test('addRuntimeManifestItem: aynı documentId ikinci kez eklenirse öncekini EZER (tekrar etmez)', () => {
  addRuntimeManifestItem(ornekItem({ fileSize: 100 }));
  addRuntimeManifestItem(ornekItem({ fileSize: 200 }));
  assert.strictEqual(getRuntimeManifest().length, 1);
  assert.strictEqual(findRuntimePdfByDocumentId('ag-xlpe-kablo')?.fileSize, 200);
});

test('mergeStaticAndRuntimeManifest: statik + runtime birleşiyor', () => {
  const statik: PDFManifestItem[] = [
    {
      documentId: 'statik-belge',
      institution: 'EPDK',
      fileName: 'statik.pdf',
      relativePath: 'epdk/statik.pdf',
      addedAt: '2025-01-01',
      verified: 'verified',
    },
  ];
  addRuntimeManifestItem(ornekItem());
  const birlesik = mergeStaticAndRuntimeManifest(statik);
  assert.strictEqual(birlesik.length, 2);
  const runtimeGirdi = birlesik.find((e) => e.documentId === 'ag-xlpe-kablo');
  const statikGirdi = birlesik.find((e) => e.documentId === 'statik-belge');
  assert.ok(runtimeGirdi);
  assert.strictEqual(runtimeGirdi!.isLocal, true);
  assert.strictEqual(runtimeGirdi!.uri, ornekItem().localUri);
  assert.ok(statikGirdi);
  assert.strictEqual(statikGirdi!.isLocal, false);
  assert.strictEqual(statikGirdi!.uri, 'epdk/statik.pdf');
});

test('mergeStaticAndRuntimeManifest: aynı documentId hem statikte hem runtime\'da varsa runtime ÖNCELİKLİDİR', () => {
  const statik: PDFManifestItem[] = [
    {
      documentId: 'ag-xlpe-kablo',
      institution: 'TEDAŞ',
      fileName: 'eski.pdf',
      relativePath: 'tedas/eski-statik-yol.pdf',
      addedAt: '2025-01-01',
      verified: 'verified',
    },
  ];
  addRuntimeManifestItem(ornekItem());
  const birlesik = mergeStaticAndRuntimeManifest(statik);
  const girdi = birlesik.find((e) => e.documentId === 'ag-xlpe-kablo');
  assert.strictEqual(birlesik.length, 1, 'aynı documentId için tek bir birleşik girdi olmalı');
  assert.ok(girdi);
  assert.strictEqual(girdi!.isLocal, true, 'runtime (gerçekten indirilmiş) kayıt statik olanı EZMELİ');
  assert.strictEqual(girdi!.uri, ornekItem().localUri);
});

test('hydrateRuntimeManifestFromRecords: kalıcı kayıtlardan runtime manifest dolduruluyor', () => {
  hydrateRuntimeManifestFromRecords([
    {
      documentId: 'epdk-hizmet-kalitesi',
      institution: 'EPDK',
      fileName: 'epdk-hizmet-kalitesi.pdf',
      localUri: 'file:///sartname-cepte-pdfs/epdk/epdk-hizmet-kalitesi.pdf',
      fileSize: 5000,
      downloadedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);
  const kayit = findRuntimePdfByDocumentId('epdk-hizmet-kalitesi');
  assert.ok(kayit);
  assert.strictEqual(kayit!.addedAt, '2026-01-01T00:00:00.000Z');
});

test('clearRuntimeManifestForTests: manifest tamamen boşalıyor', () => {
  addRuntimeManifestItem(ornekItem());
  clearRuntimeManifestForTests();
  assert.strictEqual(getRuntimeManifest().length, 0);
});
