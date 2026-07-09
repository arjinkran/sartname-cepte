# EPDK PDF'leri

Bu klasör, EPDK belgelerinin gerçek PDF dosyaları için ayrılmıştır.

**Şu an boş.** Kütüphanedeki hiçbir EPDK belgesinde henüz gerçek bir
PDF yok — bkz. [`docs/PDF_ARCHITECTURE.md`](../../../docs/PDF_ARCHITECTURE.md).

## Yeni bir PDF eklerken

1. Gerçek, doğrulanmış PDF dosyasını bu klasöre koyun.
2. `src/data/library/epdk/documents.ts`'te ilgili belgenin şu alanlarını doldurun:
   - `localAsset: 'epdk/<dosya-adi>.pdf'`
   - `pdfAvailable: true`
   - Biliniyorsa `pdfUrl`, `pageCount`, `fileSize`, `checksum`
3. Uydurma dosya adı veya sahte PDF EKLEMEYİN — yalnızca gerçek kaynaktan
   doğrulanmış dosyalar buraya konur.
