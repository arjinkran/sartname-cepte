# tedas — TEDAŞ belgeleri

Türkiye Elektrik Dağıtım A.Ş.'nin yayınladığı teknik şartnameler.

**Mevcut belge sayısı:** 7 (bkz. `documents.ts`) — hepsi `documentType:
'Şartname'`.

## Yeni belge ekleme

1. `documents.ts`'teki `DOCUMENTS` dizisine, `../types.ts`'teki `Document`
   arayüzüne uyan yeni bir nesne ekleyin (ortak model — bu klasöre özel bir
   tip TANIMLAMAYIN, bkz. Sprint 5 madde 4).
2. `sourceVerified: false` ile başlayın; resmî kaynaktan doğrulama
   yapıldıktan sonra `true`'ya çevirin (bkz.
   `../../../docs/LIBRARY_ARCHITECTURE.md` "Doğrulama süreci").
3. `relatedDocuments` alanını boş bırakmayın — en az bir ilişkili belge id'si
   girin (varsa).
4. Repository (`../repository.ts`) bu klasörü otomatik tarar; başka hiçbir
   yeri güncellemenize gerek yoktur.

## Kaynak

📖 **Kaynak durumu:** Bu klasördeki içerikler uygulama geliştirme için
hazırlanmış TASLAK örneklerdir; yayın öncesi TEDAŞ'ın resmî şartname
listesinden doğrulanmalıdır.
