# TSE / TS EN PDF'leri

Bu klasör, TSE / TS EN belgelerinin gerçek PDF dosyaları için ayrılmıştır.

**Şu an boş.** Kütüphanedeki hiçbir TSE / TS EN belgesinde henüz gerçek bir
PDF yok — bkz. [`docs/PDF_ARCHITECTURE.md`](../../../docs/PDF_ARCHITECTURE.md).

## Yeni bir PDF eklerken

1. Gerçek, doğrulanmış PDF dosyasını bu klasöre koyun.
2. `src/data/library/tse/documents.ts`'te ilgili belgenin şu alanlarını doldurun:
   - `localAsset: 'tse/<dosya-adi>.pdf'`
   - `pdfAvailable: true`
   - Biliniyorsa `pdfUrl`, `pageCount`, `fileSize`, `checksum`
3. Uydurma dosya adı veya sahte PDF EKLEMEYİN — yalnızca gerçek kaynaktan
   doğrulanmış dosyalar buraya konur.
