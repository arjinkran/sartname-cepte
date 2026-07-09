// PDF Manifest sistemi tipleri (Sprint 9).
//
// Bu dosya, `src/data/library/types.ts`'teki `Document` modelinden
// BAĞIMSIZ bir ikinci kayıt sistemi tanımlar: manifest, "hangi PDF
// dosyası hangi belgeye ait" eşleşmesini TEK bir yerde, belge
// kayıtlarını (documents.ts) hiç değiştirmeden takip eder. Bu ayrım
// bilinçlidir — bir PDF eklendiğinde/kaldırıldığında 9 kurum klasöründeki
// documents.ts dosyalarına dokunmaya gerek kalmaz, yalnızca manifest.ts
// güncellenir (bkz. docs/PDF_CONTENT_WORKFLOW.md).
import type { Institution } from '../../data/library/types.ts';

/**
 * Bir manifest kaydının kaynak doğrulama durumu. `verified` (boolean
 * DEĞİL) — bir PDF'in dosyası eklenmiş olabilir ama kaynağı henüz
 * doğrulanmamış (`pending`) veya doğrulanamamış (`unverified`) olabilir;
 * yalnızca `verified` durumundaki kayıtlar "resmî kaynaktan onaylandı"
 * anlamına gelir (bkz. docs/PDF_CONTENT_WORKFLOW.md "Source doğrulama").
 */
export type PDFVerificationStatus = 'verified' | 'unverified' | 'pending';

/**
 * PDF manifest'indeki tek bir kayıt — bir PDF dosyasının hangi belgeye
 * ait olduğunu ve nereden geldiğini tanımlar. `src/assets/pdfs/manifest.ts`
 * bu tipten bir dizi tutar.
 */
export interface PDFManifestItem {
  /** `src/data/library/<kurum>/documents.ts`'teki gerçek belge id'si — bu dizinin başka bir yerinde MUTLAKA kayıtlı olmalı. */
  documentId: string;
  institution: Institution;
  /** Dosya adı (uzantı dahil) — bkz. docs/PDF_CONTENT_WORKFLOW.md "Dosya Adı Standardı". */
  fileName: string;
  /** `src/assets/pdfs/` köküne göre yol, ör. "tedas/tedas_ag-xlpe-kablo_rev1.pdf". */
  relativePath: string;
  /** Bayt cinsinden dosya boyutu — bilinmiyorsa tanımsız (uydurulmaz). */
  fileSize?: number;
  /** Sayfa sayısı — bilinmiyorsa tanımsız. */
  pageCount?: number;
  /** Dosya bütünlük doğrulaması için hash (ör. SHA-256) — bilinmiyorsa tanımsız. */
  checksum?: string;
  /** ISO tarih (YYYY-MM-DD) — kayıt manifest'e ne zaman eklendi. */
  addedAt: string;
  verified: PDFVerificationStatus;
  /** PDF'in nereden geldiği (URL veya kısa açıklama) — bilinmiyorsa tanımsız. */
  source?: string;
}

/** Bir kurumun `src/assets/pdfs/` altındaki klasör karşılığı. */
export interface PDFInstitutionFolder {
  institution: Institution;
  /** `src/assets/pdfs/<folderName>/` — kurum klasörü adları ile birebir aynı (bkz. src/data/library/<kurum>/). */
  folderName: string;
}
