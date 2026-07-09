// PDF Manifest — uygulamadaki gerçek PDF varlığının TEK kayıt defteri
// (Sprint 9). Her belge kaydının kendi `documents.ts`'inde yaşadığı
// gibi, her PDF'in varlığı da yalnızca BURADA kayıtlıdır — `document.
// pdfAvailable` alanı hâlâ geçerlidir (bkz. repository.ts `hasPdf()`,
// artık HER İKİ kaynağa da bakar) ama manifest, "hangi dosya nereden
// geldi, ne zaman eklendi, doğrulandı mı" gibi PDF-özel meta veriyi
// belge modelini şişirmeden taşır.
//
// ⚠️ Şu an BOŞ — kütüphanedeki 121 belgenin hiçbirinde gerçek, doğrulanmış
// bir PDF dosyası yok (bkz. docs/PDF_ARCHITECTURE.md, docs/PDF_CONTENT_
// WORKFLOW.md). Bu KABUL EDİLEBİLİR bir durumdur (Sprint 9, madde 12) —
// sistemin tamamı (pdfChecker.ts, repository.ts, PDF Kapsam ekranı,
// testler) boş manifest ile sorunsuz çalışacak şekilde tasarlandı.
//
// Yeni bir PDF eklerken bkz. docs/PDF_CONTENT_WORKFLOW.md — sahte dosya
// adı, checksum, sayfa sayısı veya kaynak YAZILMAZ.
import type { PDFManifestItem } from './types.ts';

export const PDF_MANIFEST: readonly PDFManifestItem[] = [];
