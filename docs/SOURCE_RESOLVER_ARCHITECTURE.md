# Resmî Kaynak Bulucu Mimarisi (Sprint 11)

Bu belge, `src/sourceResolver/` altındaki kural tabanlı resmî kaynak
çözümleyicisinin mimarisini, desteklenen kaynakları, domain doğrulama
mantığını ve gelecekteki genişleme planını (gerçek arama/indirme, RAG)
belgeler. Kod-seviyesi ayrıntılar için bkz.
[`src/sourceResolver/README.md`](../src/sourceResolver/README.md).

## Source Resolver nedir?

Şartname Cepte'nin temel vaadi: **kullanıcı PDF aramaz — uygulama
ilgili şartname/yönetmeliği resmî kaynağından bulur, doğrular ve
sunar.** Sprint 11, bu vaadin **mimari iskeletini** kurar: her belge
için "kaynağı ne, güvenilir mi, PDF'e uygun mu, telifli mi" sorularına
kural tabanlı, **ağdan bağımsız** bir cevap üreten bir katman.

Bu, gerçek bir arama motoru DEĞİLDİR — `resolveOfficialSource()` ve
kardeşleri, yalnızca kütüphanede ZATEN duran alanlara (`institution`,
`sourceUrl`, `pdfAvailable`) bakarak bir sınıflandırma yapar. Gerçek
"internet'te ara, bul, indir" akışı gelecekteki bir sprint'in konusudur
(bkz. §"Gelecekte otomatik PDF indirme akışı").

## Desteklenen Kaynaklar

| Sağlayıcı | Domain | Tür | PDF desteği |
| --- | --- | --- | --- |
| TEDAŞ | tedas.gov.tr | Kamu kurumu | ✅ |
| EPDK | epdk.gov.tr | Kamu kurumu | ✅ |
| Resmî Gazete | mevzuat.gov.tr (+ resmigazete.gov.tr) | Kamu kurumu | ✅ |
| Mevzuat.gov.tr | mevzuat.gov.tr | Genel devlet portalı | ✅ |
| TEİAŞ | teias.gov.tr | Kamu kurumu | ✅ |
| TSE | tse.org.tr | Standart kuruluşu | ❌ (telifli) |
| IEC | iec.ch | Standart kuruluşu | ❌ (telifli) |
| CENELEC | cenelec.eu | Standart kuruluşu | ❌ (telifli) |
| IEEE | ieee.org (+ standards.ieee.org) | Standart kuruluşu | ❌ (telifli) |

## Kamu PDF Kaynakları

TEDAŞ, EPDK, Resmî Gazete, Mevzuat.gov.tr ve TEİAŞ **kamuya açık**
kurumlardır — yönetmelik/şartname/tebliğ metinleri prensipte herkese
açık, ücretsiz erişilebilir belgelerdir. Bu sprintte bu 5 sağlayıcı
için `accessType: 'officialPage'` (varsayılan) tanımlandı;
`resolveOfficialSource()`, bir belgenin `sourceUrl`'i bu sağlayıcıların
resmî domainiyle eşleştiğinde `verified: true` ile `officialPage`
veya (URL doğrudan `.pdf` uzantılıysa) `publicPdf` döner.

## Telifli Standart Kaynakları

TSE, IEC, CENELEC, IEEE **telif hakkıyla korunan** standart
kuruluşlarıdır — standartları satın alınması gereken ürünlerdir. Bu
kütüphane onların tam metnini **asla** içermez/indirmez (bkz.
`docs/CONTENT_COVERAGE.md` "Telifli standartlar hakkında not", bu
prensip Sprint 6'dan beri değişmedi). Sprint 11'de bu 4 sağlayıcı için:

- `accessType: 'restrictedStandard'` (sabit).
- `supportsPdf: false` (sabit).
- `resolveOfficialSource()`, bu kurumlara ait HER belgeyi otomatik
  olarak `restrictedStandard` + `copyrightRestricted: true` +
  `requiresManualVerification: true` olarak sınıflandırır — `sourceUrl`
  alanına bile BAKMAZ (bkz. `resolver.ts` karar ağacı, adım 2).

## Neden TSE/IEC tam metin indirilmiyor?

Çünkü bu standartlar **telif hakkıyla korunur** ve satın alınması
gerekir — bir şartname/yönetmelik uygulaması olarak Şartname Cepte,
telifli içeriği izinsiz dağıtan bir araç OLAMAZ. Bu, uygulamanın en
başından (Sprint 6) beri korunan bir ilkedir. Sprint 11'in katkısı,
bu ilkeyi artık **kod seviyesinde, otomatik olarak** uygulamaktır —
`resolveOfficialSource()`, bu 4 kurumun belgelerini API seviyesinde
`publicPdf` OLAMAYACAK şekilde sabitler; bir geliştirici yanlışlıkla
bu kurumlar için PDF indirme kodu yazsa bile, resolver'ın döndürdüğü
`copyrightRestricted: true` sinyali bu davranışı engelleyecek şekilde
tasarlandı.

## Resmî Domain Doğrulama Mantığı

`validators.ts`'teki `isOfficialDomain(url, providerId)`:

1. Sağlayıcının `officialBaseUrl`'i + `alternateDomains`'i normalize
   edilir (protokol eklenir, küçük harfe çevrilir, `www.` öneki atılır).
2. Verilen URL'in host'u aynı şekilde normalize edilir.
3. Host, sağlayıcının domainlerinden BİRİNE tam eşit VEYA onun bir alt
   alan adıysa (`*.mevzuat.gov.tr` gibi) → **doğrulandı**.
4. Aksi hâlde → **reddedildi** (sahte/uydurma domain).

Bu, "sahte kaynak linki" riskine karşı TEK otomatik savunma
mekanizmasıdır — bir belgenin `sourceUrl`'i gerçekten kayıtlı bir
sağlayıcının domainine ait DEĞİLSE, sistem bunu asla "doğrulandı"
olarak işaretlemez, `manualRequired`'a düşer.

## Belge Modeli Entegrasyonu

`Document` tipine eklenen 6 alan (`officialSourceStatus`,
`officialSourceProvider`, `officialSourceUrl`, `sourceAccessType`,
`requiresManualVerification`, `copyrightRestricted`) TAMAMEN
OPSİYONELDİR ve kütüphanedeki 121 belgenin HİÇBİRİNDE elle
doldurulmadı — bunun yerine `repository.ts`'teki 4 yeni fonksiyon
(`getDocumentsNeedingSourceVerification`, `getDocumentsWithOfficialSources`,
`getRestrictedStandardDocuments`, `getPublicPdfEligibleDocuments`),
her belge için `getSourceStatus(document)`'ı ÇALIŞMA ZAMANINDA çağırır.
Bir belgenin `officialSourceStatus` alanı GELECEKTE elle doldurulursa
(bir küratörün manuel sabitlemesi), bu değer resolver'ın hesapladığı
değerin ÖNÜNE geçer (bkz. `repository.ts` `cozumlenmisDurum()`).

## UI Entegrasyonu

| Ekran | Sprint 11 değişikliği |
| --- | --- |
| Doküman Detay | Yeni "Resmî Kaynak Durumu" kartı: sağlayıcı, erişim tipi, doğrulama durumu, PDF uygunluğu, telif durumu, manuel doğrulama gerekliliği + "Resmî Kaynağı Aç"/"PDF Bulmayı Dene" butonları |
| Veri Kaynakları | Yeni "Kaynak Durumu" özet kartları: resmî kaynaklı/manuel bekleyen/telifli/PDF'ye uygun sayıları |
| PDF Kütüphane Durumu | Yeni "Resmî Kaynak Uygunluğu" bölümü: aynı 3 kategorinin PDF-kapsamı bağlamındaki dökümü |

"Resmî Kaynağı Aç" butonu, `kaynakDurumu.url` doluysa `Linking.openURL()`
ile açmayı dener; boşsa bir bilgilendirme mesajı gösterir. "PDF Bulmayı
Dene" butonu HER ZAMAN şu mesajı gösterir: *"Resmî kaynak arama
altyapısı hazırlandı. Otomatik arama sonraki sürümde aktif
edilecektir."* — gerçek bir arama YAPMAZ (Sprint 11'in kuralı: "Gerçek
network isteği şimdilik opsiyonel/mock olarak tasarlanacak").

## Gelecekte Otomatik PDF İndirme Akışı

Bu resolver katmanı, gelecekte gerçek bir arama/indirme motorunun
üzerine oturacağı temel sözleşmeyi (`SourceResolverResult`) şimdiden
sabitler. Beklenen genişleme sırası:

1. `resolveByTitle()`'ın İÇİ, basit anahtar kelime eşleşmesi yerine
   gerçek bir arama API'sine (ör. kurum web sitelerinin kendi arama
   uç noktaları veya bir web arama servisi) bağlanır — dönüş tipi
   (`SourceResolverResult`) DEĞİŞMEZ, ekranlar hiçbir değişiklik
   görmez.
2. Bulunan bir `publicPdf` adayı, `src/offline/offlineManager.ts`'teki
   (Sprint 8) `enqueueDownload()` ile indirme kuyruğuna eklenir.
3. İndirme tamamlandığında dosya `src/assets/pdfs/<kurum>/`'a
   kaydedilir, `src/assets/pdfs/manifest.ts`'e (Sprint 9) gerçek bir
   `PDFManifestItem` kaydı eklenir — bu noktadan sonra belge
   `hasPdf()` tarafından otomatik olarak `true` sayılır.
4. TSE/IEC/CENELEC/IEEE için bu akış ASLA devreye girmez — resolver,
   bu kurumları API seviyesinde `restrictedStandard` olarak sabitlediği
   için bir indirme motoru bu kurumlara asla "PDF indir" komutunu
   otomatik göndermeyecektir; yalnızca "resmî satış sayfasına
   yönlendir" eylemi tetiklenebilir.

## Kullanıcıdan Manuel Belge Ekleme Planı

`getDocumentsNeedingSourceVerification()` listesi (Enerji Bakanlığı
belgeleri + TSE/IEC/CENELEC/IEEE + sourceUrl'i doğrulanamayan
belgeler), gelecekte bir "kullanıcı/küratör bu belgeyi manuel olarak
işaretlesin" akışının veri kaynağı olacaktır:

1. Kullanıcı, bir belge için gerçek bir resmî kaynak bağlantısı bulur.
2. Bağlantı `isOfficialDomain()` ile doğrulanmaya ÇALIŞILIR — eşleşen
   bir sağlayıcı varsa otomatik doğrulama önerilir, yoksa "kayıtlı
   olmayan bir kaynak, yine de eklensin mi?" gibi bir manuel onay adımı
   gerekir (bu akış Sprint 11 kapsamı DIŞINDADIR, yalnızca planlanır).
3. Onaylanan bağlantı, belgenin `officialSourceUrl`/`officialSourceStatus`
   alanlarına (veya doğrudan `sourceUrl`'e) yazılır.

## RAG ile İlişkisi

Bkz. `docs/AI_ENGINE.md` "Gelecekte RAG entegrasyonu" ve
`docs/PDF_ARCHITECTURE.md` "Gelecekte RAG Hazırlığı". Source Resolver,
RAG mimarisinin **retrieval'dan ÖNCEKİ** adımıdır — bir belgenin gerçek
içeriğini (embedding üretimi, metin çıkarma) işlemeden ÖNCE, o içeriğin
GERÇEKTEN nereden geldiğini ve güvenilir olup olmadığını doğrular. Bu
sıralama bilinçlidir: kaynağı doğrulanmamış/telifli bir belgenin
içeriği asla bir embedding indeksine veya AI bağlamına
sızdırılmamalıdır — Source Resolver bu sızıntıyı engelleyen bir
"kapı bekçisi" (gatekeeper) katmanı olarak tasarlandı.
