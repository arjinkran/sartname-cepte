// PDF Manifest testleri (Sprint 9, madde 11).
import { test } from 'node:test';
import assert from 'node:assert';
import { getAllDocuments } from '../src/data/library/repository.ts';
import {
  findPdfByDocumentId,
  getPdfCoverageByCategory,
  getPdfCoverageByInstitution,
  getPdfManifest,
  getPdfMissingDocuments,
  getPdfOrphanFiles,
  validatePdfManifest,
} from '../src/assets/pdfs/pdfChecker.ts';
import type { PDFManifestItem } from '../src/assets/pdfs/types.ts';

const tumDokumanlar = getAllDocuments();
const gercekManifest = getPdfManifest();

function ornekManifestKaydi(overrides: Partial<PDFManifestItem> = {}): PDFManifestItem {
  return {
    documentId: tumDokumanlar[0]!.id,
    institution: tumDokumanlar[0]!.institution,
    fileName: 'ornek.pdf',
    relativePath: 'tedas/ornek.pdf',
    addedAt: '2026-07-10',
    verified: 'pending',
    ...overrides,
  };
}

test('manifest içindeki tüm documentId\'ler repository\'de mevcut', () => {
  const idler = new Set(tumDokumanlar.map((d) => d.id));
  for (const kayit of gercekManifest) {
    assert.ok(idler.has(kayit.documentId), `Manifest kaydı '${kayit.documentId}' repository'de yok`);
  }
});

test('repository\'de olmayan bir manifest kaydı validatePdfManifest\'te hataya düşer', () => {
  const bozukKayit = ornekManifestKaydi({ documentId: 'olmayan-bir-belge-id' });
  const sonuc = validatePdfManifest([bozukKayit], tumDokumanlar);
  assert.ok(sonuc.errors.length > 0, 'orphan kayıt için error üretilmeli');
  assert.ok(sonuc.errors.some((e) => e.includes('olmayan-bir-belge-id')));
});

test('repository\'de olmayan bir manifest kaydı getPdfOrphanFiles tarafından yakalanır', () => {
  const bozukKayit = ornekManifestKaydi({ documentId: 'olmayan-bir-belge-id-2' });
  const gecerliKayit = ornekManifestKaydi({ documentId: tumDokumanlar[1]!.id });
  const orphanlar = getPdfOrphanFiles([bozukKayit, gecerliKayit], tumDokumanlar);
  assert.strictEqual(orphanlar.length, 1);
  assert.strictEqual(orphanlar[0]!.documentId, 'olmayan-bir-belge-id-2');
});

test('her gerçek manifest kaydında institution alanı dolu', () => {
  for (const kayit of gercekManifest) {
    assert.ok(kayit.institution, `${kayit.documentId}: institution eksik`);
  }
});

test('her gerçek manifest kaydında fileName alanı dolu', () => {
  for (const kayit of gercekManifest) {
    assert.ok(kayit.fileName && kayit.fileName.length > 0, `${kayit.documentId}: fileName eksik`);
  }
});

test('her gerçek manifest kaydında relativePath alanı dolu', () => {
  for (const kayit of gercekManifest) {
    assert.ok(kayit.relativePath && kayit.relativePath.length > 0, `${kayit.documentId}: relativePath eksik`);
  }
});

test('eksik zorunlu alanlar validatePdfManifest\'te hataya düşer', () => {
  const eksikKayit = ornekManifestKaydi({ institution: undefined as never, fileName: '', relativePath: '' });
  const sonuc = validatePdfManifest([eksikKayit], tumDokumanlar);
  assert.ok(sonuc.errors.length >= 3, 'institution/fileName/relativePath eksikliği ayrı ayrı raporlanmalı');
});

test('PDF coverage (kurum bazlı): withPdf hiçbir zaman total\'ı aşamaz', () => {
  const kapsam = getPdfCoverageByInstitution();
  for (const k of kapsam) {
    assert.ok(k.withPdf <= k.total, `${k.institution}: withPdf(${k.withPdf}) > total(${k.total})`);
  }
});

test('PDF coverage (kategori bazlı): withPdf hiçbir zaman total\'ı aşamaz', () => {
  const kapsam = getPdfCoverageByCategory();
  for (const k of kapsam) {
    assert.ok(k.withPdf <= k.total, `${k.category}: withPdf(${k.withPdf}) > total(${k.total})`);
  }
});

test('PDF coverage: kurum bazlı toplam, kütüphanenin toplam belge sayısını aşamaz', () => {
  const kapsam = getPdfCoverageByInstitution();
  const toplam = kapsam.reduce((t, k) => t + k.total, 0);
  assert.strictEqual(toplam, tumDokumanlar.length);
});

test('getPdfMissingDocuments çalışır ve gerçek belge nesneleri döner', () => {
  const eksikler = getPdfMissingDocuments();
  assert.ok(Array.isArray(eksikler));
  for (const d of eksikler) {
    assert.ok(typeof d.id === 'string' && d.id.length > 0);
  }
});

test('getPdfCoverageByInstitution çalışır', () => {
  const kapsam = getPdfCoverageByInstitution();
  assert.ok(kapsam.length === 10, '10 kurum klasörü kadar kırılım olmalı');
});

test('getPdfCoverageByCategory çalışır', () => {
  const kapsam = getPdfCoverageByCategory();
  assert.ok(kapsam.length > 0);
});

test('pdfAvailable=true olup manifestte olmayan belge warning üretir', () => {
  const sahteBelge = { ...tumDokumanlar[0]!, pdfAvailable: true };
  const sonuc = validatePdfManifest([], [sahteBelge]);
  assert.strictEqual(sonuc.errors.length, 0);
  assert.ok(sonuc.warnings.length > 0);
  assert.ok(sonuc.warnings.some((w) => w.includes(sahteBelge.id)));
});

test('pdfAvailable=true olup manifest kaydı DA olan belge warning üretmez', () => {
  const sahteBelge = { ...tumDokumanlar[0]!, pdfAvailable: true };
  const kayit = ornekManifestKaydi({ documentId: sahteBelge.id });
  const sonuc = validatePdfManifest([kayit], [sahteBelge]);
  assert.strictEqual(sonuc.warnings.length, 0);
});

test('findPdfByDocumentId: manifestte olmayan bir id için undefined döner', () => {
  assert.strictEqual(findPdfByDocumentId('kesinlikle-olmayan-id'), undefined);
});

test('manifest boş olsa bile sistem çökmez — tüm fonksiyonlar güvenle çalışır', () => {
  assert.doesNotThrow(() => {
    getPdfManifest();
    findPdfByDocumentId('herhangi-bir-id');
    getPdfMissingDocuments();
    getPdfOrphanFiles();
    getPdfCoverageByInstitution();
    getPdfCoverageByCategory();
    validatePdfManifest();
  });
});

test('gerçek manifest (şu an boş) için validatePdfManifest hatasız/uyarısız döner', () => {
  const sonuc = validatePdfManifest();
  assert.deepStrictEqual(sonuc.errors, []);
  // Şu an hiçbir belgede pdfAvailable:true olmadığından warnings de boş olmalı.
  assert.deepStrictEqual(sonuc.warnings, []);
});
