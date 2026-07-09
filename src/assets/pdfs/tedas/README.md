# TEDAŞ PDF'leri

Bu klasör, TEDAŞ şartnamelerinin gerçek PDF dosyaları için ayrılmıştır.

**Şu an boş.** Kütüphanedeki hiçbir TEDAŞ belgesinde henüz gerçek bir
PDF yok — bkz. [`docs/PDF_ARCHITECTURE.md`](../../../docs/PDF_ARCHITECTURE.md).

## Yeni bir PDF eklerken

1. Gerçek, doğrulanmış PDF dosyasını bu klasöre koyun (ör. `ag-xlpe-kablo.pdf`).
2. `src/data/library/tedas/documents.ts`'te ilgili belgenin şu alanlarını doldurun:
   - `localAsset: 'tedas/ag-xlpe-kablo.pdf'`
   - `pdfAvailable: true`
   - Biliniyorsa `pdfUrl`, `pageCount`, `fileSize`, `checksum`
3. Uydurma dosya adı veya sahte PDF EKLEMEYİN — yalnızca gerçek kaynaktan
   doğrulanmış dosyalar buraya konur.
