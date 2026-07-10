# PDF İçerik Ekleme Süreci (Sprint 9)

Bu belge, kütüphaneye **gerçek, doğrulanmış** bir PDF eklerken izlenmesi
gereken adımları tanımlar. Şu an kütüphanedeki 121 belgenin hiçbirinde
gerçek bir PDF yoktur (bkz. `docs/PDF_ARCHITECTURE.md` §1) — bu belge,
o durum değiştiğinde izlenecek standart süreçtir.

## Altın kural

> **Sahte dosya adı, checksum, sayfa sayısı, kaynak URL'i veya dosya
> boyutu YAZILMAZ.** Bir alan bilinmiyorsa TANIMSIZ (`undefined`)
> bırakılır — asla tahmini/uydurma bir değerle doldurulmaz.

## 1. PDF nasıl eklenir — adım adım

1. **Kaynağı doğrulayın.** PDF, ilgili kurumun (TEDAŞ, EPDK, Resmî
   Gazete vb.) resmî yayın kanalından geldiğinden emin olun.
2. **Dosyayı doğru klasöre koyun** — bkz. §3 "Kurum klasörü seçimi".
3. **Dosyayı standarda uygun adlandırın** — bkz. §2 "Dosya Adı
   Standardı".
4. **`src/assets/pdfs/manifest.ts`'e bir `PDFManifestItem` kaydı
   ekleyin** — bkz. §4 "documentId eşleştirme".
5. **(Opsiyonel ama önerilir)** `src/data/library/<kurum>/documents.ts`'teki
   ilgili belge kaydında `pdfAvailable: true` ve varsa `localAsset`/
   `pdfUrl` alanlarını doldurun — manifest kaydı TEK BAŞINA da
   `hasPdf()`'i `true` yapmaya yeter (bkz. `repository.ts`), ama
   `Document` kaydını da güncellemek belge modelini kendi başına
   tutarlı tutar.
6. **`npm test` çalıştırın** — `tests/pdfManifest.test.ts` yeni
   kaydınızın bütünlüğünü (documentId gerçek mi, zorunlu alanlar dolu
   mu) otomatik doğrular.

## 2. Dosya Adı Standardı

```
<kurum>_<documentId>_<versiyon>.pdf
```

- `<kurum>`: kurum klasörü adıyla aynı (`tedas`, `epdk`, `resmi-gazete`,
  `teias`, `enerjiBakanligi`, `tse`, `iec`, `cenelec`, `ieee`, `other`).
- `<documentId>`: `src/data/library/<kurum>/documents.ts`'teki belgenin
  GERÇEK `id` alanı — uydurulmaz, kütüphanedeki kayıtla BİREBİR aynı
  olmalıdır.
- `<versiyon>`: serbest biçim ama kısa ve anlamlı (`rev5`, `2023`,
  `yonetmelik`, `v1` gibi).

**Örnekler** (Sprint 9 spesifikasyonundan):

```
tedas_ag-guc-kablolari_rev5.pdf
epdk_hizmet-kalitesi_yonetmelik.pdf
resmi-gazete_elektrik-kuvvetli-akim.pdf
```

## 3. Kurum klasörü seçimi

Dosya, `src/assets/pdfs/<kurum>/` altına, `src/data/library/`'deki
kurum klasörüyle BİREBİR eşleşecek şekilde konur:

| `document.institution` | `src/assets/pdfs/` klasörü |
| --- | --- |
| `TEDAŞ` | `tedas/` |
| `TEİAŞ` | `teias/` |
| `EPDK` | `epdk/` |
| `Enerji Bakanlığı` | `enerjiBakanligi/` |
| `Resmî Gazete` | `resmiGazete/` |
| `TSE`, `TS EN` | `tse/` (ikisi de aynı klasörde yaşar, bkz. `tse/README.md`) |
| `IEC` | `iec/` |
| `CENELEC` | `cenelec/` |
| `IEEE` | `ieee/` |
| `Diğer` | `other/` |

## 4. documentId Eşleştirme

`PDFManifestItem.documentId`, `src/data/library/<kurum>/documents.ts`'te
GERÇEKTEN var olan bir `Document.id` OLMAK ZORUNDADIR. Bu kural iki
şekilde uygulanır:

- `tests/pdfManifest.test.ts`, manifest'teki her `documentId`'nin
  repository'de bulunduğunu doğrular — eşleşmeyen bir kayıt varsa test
  **BAŞARISIZ OLUR** (bkz. Sprint 9 madde 3: "Eğer manifest var ama
  documentId yoksa test fail versin").
- `validatePdfManifest()` (bkz. `src/assets/pdfs/pdfChecker.ts`), aynı
  kontrolü çalışma zamanında da yapar ve bu tür kayıtları "orphan"
  (`getPdfOrphanFiles()`) olarak raporlar.

Belgenin gerçek id'sini bulmak için `src/data/library/<kurum>/
documents.ts`'i açıp ilgili kaydın `id:` alanını kopyalayın — asla
tahmin etmeyin veya dosya adından türetmeyin (dosya adı VE documentId
AYNI görünse bile, kaynak her zaman `documents.ts`'teki gerçek kayıttır).

## 5. Checksum Mantığı

`checksum` alanı, indirilen/eklenen dosyanın bütünlüğünü doğrulamak
içindir (ör. gelecekte bir indirme yöneticisi "dosya bozulmuş mu"
kontrolü yapabilsin diye). Hesaplama:

```
sha256sum dosya.pdf
```

(veya işletim sisteminizin eşdeğer aracı). Çıkan hex-string `checksum`
alanına yazılır. **Dosya elinizde yoksa veya hash'i hesaplamadıysanız
bu alanı BOŞ (`undefined`) bırakın** — asla rastgele bir string
uydurmayın.

## 6. pageCount Nasıl Girilir

PDF'i bir görüntüleyicide (Adobe Reader, tarayıcı vb.) açıp gerçek
sayfa sayısını okuyun ve `pageCount` alanına GERÇEK sayıyı yazın.
Emin değilseniz alanı tanımsız bırakın — `docs/PDF_ARCHITECTURE.md`'nin
"uydurma" karşıtı ilkesi burada da geçerlidir.

## 7. Source Doğrulama Süreci

`source` alanı, PDF'in NEREDEN geldiğini belgeler (ör. tam URL veya
"TEDAŞ resmî web sitesi, Teknik Şartnameler bölümü, Temmuz 2026").
`verified` alanı (`PDFVerificationStatus`) bu doğrulamanın durumunu
taşır:

- `'pending'`: dosya eklendi ama kaynağı henüz teyit edilmedi.
- `'unverified'`: kaynağı teyit ETMEYE ÇALIŞILDI ama doğrulanamadı
  (ör. orijinal sayfa artık erişilemiyor).
- `'verified'`: kaynak resmî kanaldan doğrudan teyit edildi.

**Yalnızca `'verified'` durumundaki kayıtlar** kullanıcıya "resmî
kaynaktan onaylı" olarak sunulmalıdır — `'pending'`/`'unverified'`
kayıtlar sistemde bulunabilir (PDF yine de açılabilir) ama UI'da bu
durumun görünür kalması önerilir (ör. ileride bir "doğrulanıyor"
rozeti).

## 8. Eksik PDF Kontrolü

Kütüphanenin PDF kapsamını görmek için:

- **Uygulama içi**: Profil → "PDF Kütüphane Durumu" (`/pdf-kapsam`) —
  toplam/bulunan/bekleyen sayılar, kurum ve kategori bazlı kırılım,
  eksik belge listesi.
- **Kod içi**: `src/assets/pdfs/pdfChecker.ts`:
  - `getPdfMissingDocuments()` — PDF'i olmayan belgeler.
  - `getPdfOrphanFiles()` — bozuk referanslı manifest kayıtları (bkz. §4).
  - `getPdfCoverageByInstitution()` / `getPdfCoverageByCategory()` —
    kırılımlar.
  - `validatePdfManifest()` — tam bütünlük raporu (`errors`/`warnings`).

**Not — gerçek dosya sistemi taraması**: `getPdfOrphanFiles()`,
`src/assets/pdfs/<kurum>/` klasörlerinde FİİLEN duran ama manifest'te
kaydı OLMAYAN dosyaları TESPİT ETMEZ (React Native çalışma zamanında
Metro bundle'ı içinden keyfi dizin taraması yapılamaz). Bu tür bir
kontrol yalnızca bir derleme zamanı (Node.js) betiğiyle mümkündür ve
bu sprint kapsamı dışındadır — manuel olarak, PDF eklerken her dosya
için mutlaka bir manifest kaydı da eklendiğinden emin olun.

## 9. Yayın Öncesi Checklist

Bir PDF'i kütüphaneye eklemeden/yayınlamadan önce:

- [ ] Dosya adı standarda uyuyor mu (§2)?
- [ ] Dosya doğru kurum klasöründe mi (§3)?
- [ ] `documentId`, `documents.ts`'teki GERÇEK bir kayıtla eşleşiyor mu (§4)?
- [ ] `institution`, `fileName`, `relativePath` dolu mu (zorunlu alanlar)?
- [ ] `checksum`/`pageCount`/`fileSize` ya gerçek ya da tanımsız mı (uydurma YOK)?
- [ ] `source` dolduruldu mu, `verified` durumu doğru mu (§7)?
- [ ] `npm test` (özellikle `tests/pdfManifest.test.ts`) geçiyor mu?
- [ ] `npm run typecheck` temiz mi?
- [ ] Profil → PDF Kütüphane Durumu ekranında yeni kayıt doğru sayılıyor mu?
- [ ] Doküman Detay ekranında "PDF'yi Aç" butonu görünüyor ve `/pdf/:id` açılıyor mu?

## 10. Sprint 13: Kullanıcı İndirmeleri vs. Küratörlü Manifest

Bu dokümandaki iş akışı (manuel PDF ekleme + `manifest.ts` küratörlüğü)
hâlâ geçerlidir ve DEĞİŞMEDİ. Sprint 13, BUNUN YANINA, kullanıcının
kendi cihazına indirdiği dosyalar için AYRI bir katman ekledi
(`src/offline/runtimePdfManifest.ts` + `downloadRepository.ts`) — bu
katman `manifest.ts`'i hiç değiştirmez, yalnızca çalışma anında
`repository.ts`'in `hasPdf()`/`getPdfPath()` sonucuna dahil edilir.
Ayrıntılar için bkz. [`docs/OFFICIAL_PDF_DOWNLOAD.md`](./OFFICIAL_PDF_DOWNLOAD.md).
