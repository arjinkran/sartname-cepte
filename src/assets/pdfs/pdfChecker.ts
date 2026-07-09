// PDF Manifest doğrulama ve kapsam araçları (Sprint 9, madde 4).
//
// Bu dosya, `manifest.ts`'i `src/data/library/repository.ts`'teki gerçek
// belge kayıtlarıyla ÇAPRAZ KONTROL eder. Tek yönlü bağımlılık: bu dosya
// repository.ts'i import eder, repository.ts BU DOSYAYI import ETMEZ
// (döngüsel import olmasın diye — repository.ts, manifest.ts'i
// doğrudan, pdfChecker.ts üzerinden DEĞİL kullanır, bkz. repository.ts
// "PDF (Sprint 8-9)" bölümü).
//
// "Orphan" tanımı: gerçek bir dosya sistemi taraması React Native
// çalışma zamanında (Metro bundle'ı içinden) mümkün olmadığından,
// "orphan" burada "documentId'si repository'de KARŞILIĞI OLMAYAN bir
// manifest kaydı" anlamına gelir — yani bozuk/eskimiş bir referans
// (ör. bir belge kütüphaneden kaldırıldı ama manifest kaydı silinmedi).
// Gerçek dosya sistemi taraması (diskte olup manifest'te olmayan
// dosyalar) yalnızca bir derleme zamanı betiğiyle mümkündür — bkz.
// docs/PDF_CONTENT_WORKFLOW.md "Eksik PDF kontrolü".
import { getAllDocuments, getMissingPdfDocuments as repoGetMissingPdfDocuments } from '../../data/library/repository.ts';
import type { Document } from '../../data/library/types.ts';
import { PDF_MANIFEST } from './manifest.ts';
import type { PDFManifestItem } from './types.ts';

/** Manifest'in tamamını döner (boş olabilir — bkz. manifest.ts). */
export function getPdfManifest(): readonly PDFManifestItem[] {
  return PDF_MANIFEST;
}

/** Bir belge id'sine karşılık gelen manifest kaydını döner (yoksa `undefined`). */
export function findPdfByDocumentId(documentId: string): PDFManifestItem | undefined {
  return PDF_MANIFEST.find((m) => m.documentId === documentId);
}

/**
 * PDF'i olmayan belgeleri döner — `repository.getMissingPdfDocuments()`
 * ile AYNI listedir (repository'nin `hasPdf()`'i de manifest'e bakar,
 * bkz. repository.ts), burada yalnızca pdfChecker.ts'in kendi
 * arayüzünden erişilebilir olması için yeniden dışa açılır.
 */
export function getPdfMissingDocuments(): readonly Document[] {
  return repoGetMissingPdfDocuments();
}

/**
 * documentId'si repository'de bulunamayan (bozuk referanslı) manifest
 * kayıtları. `manifest`/`documents` parametreleri normal kullanımda
 * VERİLMEZ (gerçek veriler varsayılan olarak kullanılır) — yalnızca
 * `tests/pdfManifest.test.ts`'in senaryo izole edebilmesi için opsiyonel
 * olarak açıktır.
 */
export function getPdfOrphanFiles(
  manifest: readonly PDFManifestItem[] = PDF_MANIFEST,
  documents: readonly Document[] = getAllDocuments()
): readonly PDFManifestItem[] {
  const docIds = new Set(documents.map((d) => d.id));
  return manifest.filter((m) => !docIds.has(m.documentId));
}

export interface PdfCoverageByInstitution {
  institution: Document['institution'];
  total: number;
  withPdf: number;
}

/** Kurum bazlı PDF kapsamı — manifest + `document.pdfAvailable` birleşimi. */
export function getPdfCoverageByInstitution(): readonly PdfCoverageByInstitution[] {
  const manifestIds = new Set(PDF_MANIFEST.map((m) => m.documentId));
  const totals = new Map<Document['institution'], { total: number; withPdf: number }>();

  for (const d of getAllDocuments()) {
    const v = totals.get(d.institution) ?? { total: 0, withPdf: 0 };
    v.total += 1;
    if (d.pdfAvailable === true || manifestIds.has(d.id)) v.withPdf += 1;
    totals.set(d.institution, v);
  }

  return Array.from(totals.entries())
    .map(([institution, v]) => ({ institution, ...v }))
    .sort((a, b) => b.withPdf - a.withPdf || a.institution.localeCompare(b.institution, 'tr'));
}

export interface PdfCoverageByCategory {
  category: string;
  total: number;
  withPdf: number;
}

/** Kategori bazlı PDF kapsamı — manifest + `document.pdfAvailable` birleşimi. */
export function getPdfCoverageByCategory(): readonly PdfCoverageByCategory[] {
  const manifestIds = new Set(PDF_MANIFEST.map((m) => m.documentId));
  const totals = new Map<string, { total: number; withPdf: number }>();

  for (const d of getAllDocuments()) {
    const v = totals.get(d.category) ?? { total: 0, withPdf: 0 };
    v.total += 1;
    if (d.pdfAvailable === true || manifestIds.has(d.id)) v.withPdf += 1;
    totals.set(d.category, v);
  }

  return Array.from(totals.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.withPdf - a.withPdf || a.category.localeCompare(b.category, 'tr'));
}

export interface PdfManifestValidation {
  /** Veri bütünlüğü ihlalleri — bunlar varsa manifest'in "geçersiz" sayılması gerekir (bkz. tests/pdfManifest.test.ts). */
  errors: readonly string[];
  /** Bilgilendirici uyumsuzluklar — geçersiz kılmaz ama gözden geçirilmeli. */
  warnings: readonly string[];
}

/**
 * Manifest'in bütünlüğünü doğrular (madde 3-4):
 * - Her kaydın documentId'si repository'de var mı (yoksa ERROR — orphan).
 * - Her kaydın institution/fileName/relativePath alanları dolu mu (yoksa ERROR).
 * - `pdfAvailable: true` işaretli ama manifest kaydı OLMAYAN belgeler var mı (WARNING).
 *
 * `manifest`/`documents` parametreleri normal kullanımda VERİLMEZ (gerçek
 * veriler varsayılan olarak kullanılır) — yalnızca testlerin senaryo
 * izole edebilmesi için opsiyonel olarak açıktır.
 */
export function validatePdfManifest(
  manifest: readonly PDFManifestItem[] = PDF_MANIFEST,
  documents: readonly Document[] = getAllDocuments()
): PdfManifestValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const docIds = new Set(documents.map((d) => d.id));

  for (const entry of manifest) {
    if (!docIds.has(entry.documentId)) {
      errors.push(`Manifest kaydı '${entry.documentId}': repository'de bu id'ye sahip bir belge yok (orphan kayıt).`);
    }
    if (!entry.institution) errors.push(`Manifest kaydı '${entry.documentId}': institution alanı eksik.`);
    if (!entry.fileName) errors.push(`Manifest kaydı '${entry.documentId}': fileName alanı eksik.`);
    if (!entry.relativePath) errors.push(`Manifest kaydı '${entry.documentId}': relativePath alanı eksik.`);
  }

  const manifestIds = new Set(manifest.map((m) => m.documentId));
  for (const doc of documents) {
    if (doc.pdfAvailable === true && !manifestIds.has(doc.id)) {
      warnings.push(`Belge '${doc.id}': pdfAvailable=true ama manifest kaydı yok.`);
    }
  }

  return { errors, warnings };
}
