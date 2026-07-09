# Ulusal Elektrik Mevzuat Kütüphanesi — Mimari (Sprint 5, içerik Sprint 6'da genişletildi)

Bu belge, Şartname Cepte'nin **ölçeklenebilir mevzuat kütüphanesi**
altyapısını anlatır: yüzlerce şartname/yönetmelik/standardın rahatça
eklenebileceği veri mimarisi. Önceki tek-dosyalı model
(`src/data/documents/documents.ts`, bkz. Sprint 4) Sprint 5'te
**kurum-bazlı klasör yapısına** geçirildi; mimari o zamandan beri
DEĞİŞMEDİ. Sprint 6, bu mimariyi hiç değiştirmeden yalnızca **içeriği**
büyüttü (14 → 121 belge) — bu, mimarinin "büyüyen kütüphane" hedefinin
kanıtı: yeni belgeler yalnızca ilgili `<kurum>/documents.ts` dosyasına
eklendi, `repository.ts` da dahil hiçbir mimari dosya değişmedi. Güncel
içerik dökümü için bkz. [`CONTENT_COVERAGE.md`](./CONTENT_COVERAGE.md).

## 1. Klasör yapısı

```
src/data/library/
├── types.ts                — Document, Institution (11), DocumentType (8),
│                              DocumentStatus, InstitutionMeta, STATUS_LABELS
├── categoryPresentation.ts — kategori ikon/açıklama zenginleştirmesi (sunum amaçlı)
├── repository.ts           — 15 erişim fonksiyonu (bkz. §3), 10 klasörü birleştirir
├── index.ts                — barrel (ham documents.ts'ler dışa aktarılmaz)
├── tedas/
│   ├── documents.ts        — bu kurumun Document[] dizisi
│   ├── metadata.ts         — { institution, ad, aciklama }
│   ├── index.ts            — documents.ts + metadata.ts'i dışa aktarır
│   └── README.md           — kurum notu + yeni belge ekleme adımları
├── teias/           (aynı yapı, 8 belge)
├── epdk/            (aynı yapı, 15 belge)
├── enerjiBakanligi/ (aynı yapı, 5 belge)
├── resmiGazete/     (aynı yapı, 15 belge)
├── tse/             (aynı yapı, 20 belge — TS ve TS EN belgelerinin ikisi de burada yaşar)
├── iec/             (aynı yapı, 15 belge)
├── cenelec/         (aynı yapı, 8 belge)
├── ieee/            (aynı yapı, 5 belge)
├── referenceEntry.ts — TSE/IEC/CENELEC/IEEE'nin ortak `referansGirdisi()`
│                        fabrika fonksiyonu (metadata-yalnızca girdiler için
│                        tekrarlayan alanları tek yerden doldurur)
└── other/           (aynı yapı, boş — yukarıdaki 9 kuruma girmeyen kaynaklar için)
```

**Mevcut belge sayısı: 121** (Sprint 6 sonrası; Sprint 5'te 14'tü). Tek boş
klasör `other/` — mock/uydurma belge hâlâ **eklenmedi**; bkz.
[`CONTENT_COVERAGE.md`](./CONTENT_COVERAGE.md) kurum bazlı tam döküm ve
`sourceVerified: false` işaretli belgelerin listesi için.

## 2. Kurum sistemi

`Institution` tipi (`types.ts`) 11 değerlik kapalı bir küme: TEDAŞ, TEİAŞ,
EPDK, Enerji Bakanlığı, Resmî Gazete, TSE, IEC, CENELEC, TS EN, IEEE,
Diğer. Bunlardan **10'u kendi klasörüne sahiptir** — `TS EN`, TSE'nin
Avrupa standartlarını uyumlaştırdığı seri olduğu için ayrı bir klasörü
yoktur, `tse/` klasöründe yaşar (bkz. `tse/README.md`).

Kurum **listesi elle yazılmaz**: her klasörün kendi `metadata.ts`'i
(`{ institution, ad, aciklama }`) vardır; `repository.getInstitutions()`
bu 10 metadata'yı toplayıp her birine gerçek belge sayısını (`count`)
ekler. Belgesi olmayan kurumlar da (count: 0) listede kalır — Veri
Kaynakları ekranı bunları "Doküman kütüphanesi yakında eklenecek" olarak
gösterir.

## 3. Kategori sistemi

Önceki sürümde (Sprint 4) 23 kategorilik elle yazılmış sabit bir liste
vardı (birçoğu 0 belgeyle). Sprint 5'te bu değişti:

- `Document.category` artık **serbest metin** alanı (kapalı bir enum değil).
- `repository.getCategories()`, gerçek 14 belgeyi tarayarak hangi
  kategorilerin kaç belgesi olduğunu **otomatik hesaplar** — yalnızca en
  az 1 belgesi olan kategoriler listeye girer (şu an ~9 kategori).
- `categoryPresentation.ts`, yalnızca **sunum** için (ikon + kısa
  açıklama) bir zenginleştirme tablosudur — bu dosya kategori LİSTESİNİN
  kaynağı DEĞİLDİR. Tabloda tanımsız bir kategori ortaya çıkarsa (yeni
  bir belge yeni bir kategori adı kullanırsa), `getCategories()` yine de
  onu listeye ekler; ekran genel bir 📁 ikonuyla gösterir.

Aynı prensip `documentType` için de geçerlidir: `getDocumentTypes()`
yalnızca gerçekten kullanılan tipleri (`Şartname`, `Yönetmelik`, ...) döner;
`types.ts`'teki 9 değerlik tam küme (Sprint 6'da `'Kanun'` eklendi — ör.
Elektrik Piyasası Kanunu, İSG Kanunu), gelecekte kullanılabilecek GEÇERLİ
değerleri tanımlar (derleme zamanı kısıtı), runtime listesi değildir.

## 4. Repository mantığı

`repository.ts`, madde 6 gereği 10 klasörü **otomatik birleştirir**:

```
TEDAŞ + TEİAŞ + EPDK + Enerji Bakanlığı + Resmî Gazete + TSE + IEC
  + CENELEC + IEEE + Diğer
    ↓
  Tek Document[] (DOCUMENTS, modül-özel, dışa aktarılmaz)
```

Hiçbir ekran `<kurum>/documents.ts`'e veya bu dosyaya doğrudan erişmez —
yalnızca aşağıdaki 15 fonksiyon üzerinden:

| Fonksiyon | Açıklama |
| --- | --- |
| `getAllDocuments()` | Kütüphanenin tamamı (10 kurum birleşik) |
| `getFeaturedDocuments()` | `featured: true`, `updatedAt` azalan sırada |
| `getRecentDocuments(limit)` | `updatedAt`'e göre en yeni `limit` belge |
| `getDocumentById(id)` | Tekil belge (yoksa `undefined`) |
| `getDocumentsByInstitution(kurum)` | Kurum filtresi |
| `getDocumentsByCategory(kategoriAdı)` | Kategori filtresi |
| `getDocumentsByType(tip)` | Doküman tipi filtresi |
| `search(sorgu, within?)` | Genel arama: title/aliases(×5), keywords(×3), tags(×2), gövde(×1) — `searchWeight` ile çarpılır |
| `searchKeywords(sorgu, within?)` | Dar arama: yalnızca keywords/tags/aliases (title/summary hariç) — AI Asistanı bunu kullanır |
| `getRelatedDocuments(id)` | `relatedDocuments` id listesini gerçek belgelere çözer |
| `getCategories()` | Otomatik türetilmiş kategori + sayım listesi |
| `getInstitutions()` | 10 kurumun metadata + sayım listesi |
| `getDocumentTypes()` | Otomatik türetilmiş tip + sayım listesi |
| `getStatistics()` | Hepsinin özeti: toplam, featured, deprecated, kurum/kategori/tip kırılımları |

Kurum + kategori + tip'in **birlikte** filtrelenmesi (ör. Arama ekranı)
bilerek repository'de ayrı bir fonksiyon değildir — ekran
`getAllDocuments()`'ı okuyup üç boyutu kendi içinde `.filter()` ile
birleştirir. Bu, repository yüzeyini 15 fonksiyonla sınırlı tutar; veri
kaynağına hâlâ yalnızca Repository üzerinden erişilir.

## 5. Genişletilmiş Document modeli

Sprint 4'teki modele Sprint 5'te 15 alan eklendi:

| Alan | Amaç | Mevcut 14 belgede değer |
| --- | --- | --- |
| `sourceVerified` | Kaynak doğrulaması yapıldı mı | `true` (hepsi) |
| `sourceUrl` | Resmî kaynak bağlantısı | `pdfPath` ile aynı (henüz ayrı bir kaynak yok) |
| `version` | Sürüm/revizyon no | `"1.0"` (yer tutucu) |
| `language` | Dil | `"TR"` (hepsi) |
| `fileSize` | Dosya boyutu | tanımsız (gerçek dosya yok) |
| `pageCount` | Sayfa sayısı | tanımsız (gerçek dosya yok) |
| `lastChecked` | Son gözden geçirme tarihi | taşıma tarihi (`2026-07-09`) |
| `tags` | keywords'ten bağımsız sınıflandırma | önceki sürümden geri getirildi |
| `aliases` | Alternatif arama adları (ör. "EKAT") | yalnızca gerçekten bilinen kısaltmalarda dolu |
| `searchWeight` | Arama puan çarpanı | `1` (nötr) |
| `priority` | Ana sayfa gösterim önceliği | featured'lar 1-5, diğerleri 10 (UI'da henüz kullanılmıyor) |
| `deprecated` | `status==='deprecated'` ile senkron bayrak | yalnızca `epdk-musteri-mulga` `true` |
| `replacementDocumentId` | Yerine geçen belge | `epdk-musteri-mulga` → `epdk-tuketici` |
| `crossReferences` | İlişkili standart/mevzuatların Document **id**'leri | bkz. aşağıdaki "Sprint 6: crossReferences artık gerçek id" |
| `legalHierarchy` | Kanun/Yönetmelik/Şartname/Standart/Tebliğ/Genelge | `documentType` ile 1:1 (şu an) |

### `favorite` alanı — model şeması vs. gerçek durum

`Document.favorite` seed veride **her zaman `false`**. Gerçek zamanlı
favori durumu hâlâ `src/lib/favoriler.tsx`'teki `FavorilerProvider`
(React context, kalıcı saklama yok) üzerinden okunur/yazılır — ekranlar
`document.favorite`'i hiç okumaz, her zaman `useFavoriler().favoriMi(id)`
kullanır. Bu, iki ayrı favori kaynağının çakışmasını önler.

### `crossReferences` — statik listenin yerini aldı

Sprint 4'te Doküman Detay ekranındaki "İlgili Yönetmelikler ve
Standartlar" bölümü **tüm belgelerde aynı** statik bir örnek listeydi
(`ILGILI_MEVZUAT_ORNEK`). Sprint 5'te bu kaldırıldı; bölüm artık her
belgenin kendi `crossReferences` alanından besleniyor — gerçek,
doküman-özel içerik.

### Sprint 6: `crossReferences` artık gerçek id

Sprint 5'te `crossReferences` serbest metin taşıyordu (ör. `"IEC 60502"`)
çünkü TSE/IEC/CENELEC/IEEE'nin henüz kendi kayıtları yoktu. Sprint 6 bu
kurumları da kataloğa eklediğinden, `crossReferences` artık **gerçek
Document id'leri** taşır (ör. `["ts-en-60502", "iec-60502"]`) — serbest
metin DEĞİL. `tests/libraryContent.test.ts` ve
`tests/libraryRepository.test.ts`'teki "veri bütünlüğü" testi, her
`crossReferences` id'sinin kütüphanede gerçekten var olduğunu doğrular.
`DocumentDetailScreen.tsx`, bu id'leri `getDocumentById()` ile başlığa
çözer (bulunamazsa ham id'yi gösterir).

## 6. AI entegrasyonu

`modules/ai/screens/AiDestekScreen.tsx`, kullanıcının serbest metnini
`searchKeywords()`'e verir (yalnızca `keywords`/`tags`/`aliases` taranır,
`search()`'ün aksine `title`/`summary` dahil değildir — "kelime
eşleşmesi" çerçevesiyle tutarlı). Puanlama `searchWeight` ile çarpılır;
bu alan şu an tüm belgelerde `1` (nötr) ama editoryel olarak öne
çıkarılması istenen belgelerde ileride artırılabilir. "Neden önerildi?"
satırı **gerçek bir AI gerekçelendirmesi değildir** — yalnızca ham
eşleşme skorunu gösterir; bu, uygulamanın en başından beri korunan
"sahte AI iddiası yok" ilkesiyle tutarlıdır.

## 7. Yeni belge ekleme adımları

1. Belgenin kurumuna karşılık gelen klasörü bulun (`src/data/library/<kurum>/`).
2. `documents.ts`'teki `DOCUMENTS` dizisine, `../types.ts`'teki `Document`
   arayüzüne uyan yeni bir nesne ekleyin. **Hiçbir kurum kendi tipini
   tanımlamaz** — ortak model kullanılır.
3. `sourceVerified: false` ile başlayın (bkz. §8 "Doğrulama süreci").
4. Mümkünse `relatedDocuments` alanını boş bırakmayın — yalnızca TSE/IEC/
   CENELEC/IEEE gibi tek başına duran metadata-referans girdilerinde (bkz.
   `referenceEntry.ts`) boş kalması kabul edilebilir.
5. `keywords` alanını AI arama motoru için zengin tutun (eş anlamlılar,
   kısaltmalar, yaygın saha terimleri).
6. Yeni bir kurum tamamen eksikse (10 klasörün hiçbirine uymuyorsa),
   `other/` klasörünü kullanın veya gerçekten yeni bir kurum kategorisi
   gerekiyorsa `repository.ts`'e yeni bir klasör + import satırı ekleyin
   (bkz. §4 "Repository mantığı" — tek yapılması gereken budur, başka
   hiçbir dosya değişmez).
7. `npm test` çalıştırıp `tests/libraryRepository.test.ts`'teki "veri
   bütünlüğü" testinin geçtiğini doğrulayın.

## 8. Doğrulama süreci

- `sourceVerified: false` ile eklenen her belge, resmî kaynaktan
  (TEDAŞ/TEİAŞ/EPDK/Resmî Gazete/TSE/IEC/CENELEC/IEEE'nin kendi yayın
  kanalı) doğrulanana kadar bu durumda kalır.
- Doğrulama tamamlandığında: `sourceVerified: true`, `sourceUrl` gerçek
  bağlantıya güncellenir, `lastChecked` doğrulama tarihine çekilir.
- Sprint 5'in 14 belgesi `sourceVerified: true` olarak işaretlendi ANCAK
  içerikleri (özet, madde numaraları, tarihler) hâlâ TASLAK örnektir —
  `sourceVerified`, "bu kayıt kütüphaneye resmî süreçten geçirilerek
  eklendi" anlamına gelir, "her kelimesi resmî metinle karşılaştırıldı"
  anlamına GELMEZ. Yayın öncesi tam metin karşılaştırması hâlâ gereklidir
  (bkz. her kurum klasörünün kendi README.md'si).
- Sprint 6'da eklenen 107 belgenin TAMAMI `sourceVerified: false` ile
  eklendi — bunlar TEDAŞ/EPDK/Resmî Gazete/TEİAŞ/Enerji Bakanlığı'nın
  bilinen kategori/başlık düzeyinde gerçek şartname/yönetmelikleri ile
  TSE/IEC/CENELEC/IEEE'nin bilinen standart numaralarıdır, ANCAK tam
  doküman numarası/tarih/URL doğrulanmadığı için `sourceVerified: false`
  ve `"Doğrulanacak"` olarak işaretlenmiştir. Bu, Sprint 6'nın "belge
  uydurma" yasağının doğrudan uygulanmasıdır: emin olunmayan alan
  boş/"Doğrulanacak" bırakılır, hiçbir tarih veya URL uydurulmaz. Tam
  liste için bkz. [`CONTENT_COVERAGE.md`](./CONTENT_COVERAGE.md).

## 9. Sürümleme mantığı

`Document.version` serbest metin (ör. `"1.0"`, `"2.3"`, `"Rev.5"`) —
kurumların kendi sürümleme konvansiyonlarına uyar, tek bir şema
dayatılmaz. Mevcut 14 belgenin tümü `"1.0"` ile başlatıldı (gerçek
revizyon geçmişi yok, dürüst bir yer tutucu). Bir belge güncellendiğinde:

1. `version` artırılır (kurumun kendi sürümleme biçimine göre).
2. `updatedAt` bugünün tarihine çekilir (Ana Sayfa "Son Şartnameler"
   sıralamasını doğrudan etkiler).
3. `lastChecked` de güncellenir (doğrulama tarihi ayrı bir kavramdır,
   `updatedAt` içerik değişikliğini, `lastChecked` en son ne zaman
   gözden geçirildiğini ifade eder).
4. Eğer eski sürüm artık geçersizse: eski kayıt `status: 'deprecated'`
   + `deprecated: true` yapılır, yeni kayda `replacementDocumentId` ile
   işaret eder (bkz. `epdk-musteri-mulga` → `epdk-tuketici` örneği).

## 10. İleride RAG entegrasyonu

Bu Repository katmanı, gelecekte gerçek bir RAG (Retrieval-Augmented
Generation) sistemine geçişin temel taşı olacak şekilde tasarlandı:

- `keywords` + `tags` + `aliases` + `summary`, embedding üretimi için
  hazır girdi kümesidir — bugünkü `search()`/`searchKeywords()`, yarın
  bir vektör benzerlik aramasıyla (aynı `SearchResult { document, score }`
  imzasını koruyarak) değiştirilebilir; ekranlar hiçbir import/API
  değişikliği görmez.
- `sourceUrl`/`pdfPath`, gerçek PDF içerikleri eklendiğinde metin
  çıkarma/chunking için giriş noktası olacaktır.
- `crossReferences` + `relatedDocuments`, bugün de mevcut statik bir
  graf sağlar; RAG sonrası bu graf embedding-tabanlı ilişkilendirmeyle
  zenginleştirilebilir (elle kurulmuş bağlantılar korunarak).
- `searchWeight`/`priority`, RAG sonrası yeniden sıralama (re-ranking)
  aşamasında editoryel bir sinyal olarak kullanılabilir.
- Repository'nin dar, 15 fonksiyonluk arayüzü sayesinde RAG entegrasyonu
  yalnızca `repository.ts`'in İÇİNİ değiştirecek — ekranlar
  (`SartnameAramaScreen`, `AiDestekScreen`, `VeriKaynaklariScreen` vb.)
  hiçbir değişiklik görmeyecek.

## 11. Kaynak doğrulaması

Bu belgedeki `version`/`lastChecked`/`updatedAt` değerleri **gerçek
revizyon geçmişi değildir** — Sprint 5 taşıması sırasında atanmış yer
tutuculardır. `publishDate`/`effectiveDate` alanlarındaki "Doğrulanacak"
işaretleri (önceki sürümlerden miras) aynen korunmuştur — yayın öncesi
tüm doküman numaraları, tarihleri ve kaynak bağlantıları resmî kaynaktan
doğrulanmalıdır.
