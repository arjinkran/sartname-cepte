# TEİAŞ PDF'leri

Bu klasör, TEİAŞ belgelerinin gerçek PDF dosyaları için ayrılmıştır.

**Şu an boş.** Kütüphanedeki hiçbir TEİAŞ belgesinde henüz gerçek bir
PDF yok — bkz. [`docs/PDF_ARCHITECTURE.md`](../../../docs/PDF_ARCHITECTURE.md).

## Yeni bir PDF eklerken

1. Gerçek, doğrulanmış PDF dosyasını bu klasöre koyun.
2. `src/data/library/teias/documents.ts`'te ilgili belgenin şu alanlarını doldurun:
   - `localAsset: 'teias/<dosya-adi>.pdf'`
   - `pdfAvailable: true`
   - Biliniyorsa `pdfUrl`, `pageCount`, `fileSize`, `checksum`
3. Uydurma dosya adı veya sahte PDF EKLEMEYİN — yalnızca gerçek kaynaktan
   doğrulanmış dosyalar buraya konur.
