// PDF Pilot testleri (Sprint 10, madde 9).
//
// Bu sprintte gerçek PDF dosyası bulunamadığından (bkz.
// docs/PDF_PILOT_TODO.md), manifest hâlâ boştur — bu testler bilerek
// hem "manifest boş" hem "manifest dolu" durumlarını KABUL EDECEK
// şekilde yazıldı (Sprint 10 madde 9: "Eğer projede gerçek PDF dosyası
// bulunamadıysa: testler manifest boş durumunu kabul etmeli"). Manifest
// gelecekte gerçek PDF'lerle doldurulduğunda BU DOSYA DEĞİŞMEDEN aynı
// testler anlamlı bir şekilde geçmeye devam edecektir.
import { test } from 'node:test';
import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getAllDocuments,
  getAvailablePdfDocuments,
  getMissingPdfDocuments,
  getPdfStatistics,
  hasPdf,
} from '../src/data/library/repository.ts';
import { getPdfCoverageByInstitution, getPdfManifest } from '../src/assets/pdfs/pdfChecker.ts';

const PILOT_DOCUMENT_IDS = [
  'kuvvetli-akim',
  'ic-tesisler',
  'topraklama-yonetmelik',
  'ag-xlpe-kablo',
  'epdk-hizmet-kalitesi',
] as const;

const tumDokumanlar = getAllDocuments();
const manifest = getPdfManifest();

test('manifest boş değilse tüm manifest documentId\'leri repository\'de mevcut', () => {
  if (manifest.length === 0) return; // fallback durumu kabul edilir
  const idler = new Set(tumDokumanlar.map((d) => d.id));
  for (const kayit of manifest) {
    assert.ok(idler.has(kayit.documentId), `Manifest kaydı '${kayit.documentId}' repository'de yok`);
  }
});

test('pilot PDF\'lerden manifest\'e eklenmiş olanların hasPdf() sonucu true', () => {
  const manifestIds = new Set(manifest.map((m) => m.documentId));
  const eklenenler = PILOT_DOCUMENT_IDS.filter((id) => manifestIds.has(id));
  if (eklenenler.length === 0) return; // henüz hiçbiri eklenmedi — fallback durumu kabul edilir
  for (const id of eklenenler) {
    const doc = tumDokumanlar.find((d) => d.id === id);
    assert.ok(doc, `${id}: repository'de bulunamadı`);
    assert.strictEqual(hasPdf(doc!), true, `${id}: manifest'te var ama hasPdf() false döndü`);
  }
});

test('getAvailablePdfDocuments() manifest\'e eklenen pilot belgeleri döndürüyor', () => {
  const manifestIds = new Set(manifest.map((m) => m.documentId));
  const eklenenler = PILOT_DOCUMENT_IDS.filter((id) => manifestIds.has(id));
  if (eklenenler.length === 0) return;
  const mevcutIdler = new Set(getAvailablePdfDocuments().map((d) => d.id));
  for (const id of eklenenler) {
    assert.ok(mevcutIdler.has(id), `${id}: getAvailablePdfDocuments() listesinde yok`);
  }
});

test('getMissingPdfDocuments() PDF olmayan belgeleri döndürür', () => {
  const eksikler = getMissingPdfDocuments();
  const eksikIdler = new Set(eksikler.map((d) => d.id));
  for (const d of tumDokumanlar) {
    if (!hasPdf(d)) {
      assert.ok(eksikIdler.has(d.id), `${d.id}: PDF'i yok ama getMissingPdfDocuments()'te değil`);
    } else {
      assert.ok(!eksikIdler.has(d.id), `${d.id}: PDF'i var ama getMissingPdfDocuments()'te de var`);
    }
  }
});

test('getPdfStatistics().withPdf > 0 (pilot başarılıysa) VEYA manifest boş + TODO belgesi mevcut (fallback)', () => {
  const istatistik = getPdfStatistics();
  if (istatistik.withPdf > 0) {
    assert.ok(true);
    return;
  }
  // Fallback: hiçbir gerçek PDF eklenemedi — bu kabul edilebilir, ancak
  // bu durumun docs/PDF_PILOT_TODO.md ile KAYDEDİLMİŞ olması gerekir.
  assert.strictEqual(istatistik.withPdf, 0);
  const todoYolu = join(process.cwd(), 'docs', 'PDF_PILOT_TODO.md');
  assert.ok(existsSync(todoYolu), 'PDF eklenemedi ama docs/PDF_PILOT_TODO.md da yok');
});

test('PDF olan belgelerde pdfAvailable=true veya manifest kaydı mevcut', () => {
  for (const d of tumDokumanlar) {
    if (hasPdf(d)) {
      const manifestteVar = manifest.some((m) => m.documentId === d.id);
      assert.ok(
        d.pdfAvailable === true || manifestteVar,
        `${d.id}: hasPdf() true ama ne pdfAvailable ne manifest kaydı doğruluyor`
      );
    }
  }
});

test('PDF olmayan belgelerde pdfAvailable=false veya undefined', () => {
  for (const d of tumDokumanlar) {
    if (!hasPdf(d)) {
      assert.ok(
        d.pdfAvailable === false || d.pdfAvailable === undefined,
        `${d.id}: hasPdf() false ama pdfAvailable=${d.pdfAvailable}`
      );
    }
  }
});

test('PDF coverage institution bazında doğru hesaplanıyor', () => {
  const kapsam = getPdfCoverageByInstitution();
  assert.strictEqual(kapsam.length, 10, '10 kurum klasörü kadar kırılım olmalı');
  const toplam = kapsam.reduce((t, k) => t + k.total, 0);
  assert.strictEqual(toplam, tumDokumanlar.length);
  for (const k of kapsam) {
    const gercekToplam = tumDokumanlar.filter((d) => d.institution === k.institution).length;
    const gercekPdfli = tumDokumanlar.filter((d) => d.institution === k.institution && hasPdf(d)).length;
    assert.strictEqual(k.total, gercekToplam, `${k.institution}: total yanlış hesaplandı`);
    assert.strictEqual(k.withPdf, gercekPdfli, `${k.institution}: withPdf yanlış hesaplandı`);
  }
});

test('PDF manifest checksum alanı varsa boş string değil', () => {
  for (const kayit of manifest) {
    if (kayit.checksum !== undefined) {
      assert.ok(kayit.checksum.length > 0, `${kayit.documentId}: checksum boş string olmamalı (ya dolu ya undefined olmalı)`);
    }
  }
});

test('fallback: gerçek PDF bulunamadığında docs/PDF_PILOT_TODO.md oluşturulmuş olmalı', () => {
  if (manifest.length > 0) return; // pilot başarılıysa bu test uygulanmaz
  const todoYolu = join(process.cwd(), 'docs', 'PDF_PILOT_TODO.md');
  assert.ok(existsSync(todoYolu), 'manifest boş ama docs/PDF_PILOT_TODO.md bulunamadı');
});

test('fallback: PDF_PILOT_TODO.md içinde 5 öncelikli pilot belge id\'si geçiyor', () => {
  if (manifest.length > 0) return;
  const todoYolu = join(process.cwd(), 'docs', 'PDF_PILOT_TODO.md');
  if (!existsSync(todoYolu)) return; // önceki test zaten bunu raporlar
  const icerik = readFileSync(todoYolu, 'utf-8');
  for (const id of PILOT_DOCUMENT_IDS) {
    assert.ok(icerik.includes(id), `PDF_PILOT_TODO.md içinde '${id}' geçmiyor`);
  }
});
