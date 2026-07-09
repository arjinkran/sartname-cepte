# PDF Kütüphanesi ve Doküman Okuyucu Mimarisi (Sprint 8)

Bu belge, Şartname Cepte'nin gerçek PDF görüntüleme altyapısını —
belge modeli genişletmesi, asset organizasyonu, viewer mimarisi, offline/
download hazırlığı ve repository entegrasyonu — belgeler. Sprint 8
yalnızca ALTYAPI kurar; kütüphanedeki 121 belgenin **hiçbirinde şu an
gerçek bir PDF yoktur** (bkz. §1 "Neden hiçbir belgede PDF yok").

## 1. PDF Belge Modeli

`Document` (bkz. [`src/data/library/types.ts`](../src/data/library/types.ts))
Sprint 8'de 6 yeni **opsiyonel** alan kazandı:

| Alan | Tip | Amaç |
| --- | --- | --- |
| `pdfFile` | `string?` | `src/assets/pdfs/<kurum>/` altındaki görünen/hedef dosya adı (organizasyonel) |
| `pdfUrl` | `string?` | Gerçek, doğrulanmış uzak PDF bağlantısı — bilinmiyorsa TANIMSIZ |
| `pdfAvailable` | `boolean?` | **Tek doğruluk kaynağı**: bu belge ŞU AN gerçekten görüntülenebilir mi |
| `localAsset` | `string?` | `src/assets/pdfs/` içinde GERÇEKTEN bulunan, bundle'lanabilir dosyaya göreli yol |
| `remoteVersion` | `string?` | Uzak PDF'in hangi revizyonuna karşılık geldiği (indirme yöneticisi için) |
| `checksum` | `string?` | İndirilen dosyanın bütünlük doğrulaması (SHA-256 vb.) |

### Neden hiçbir belgede PDF yok?

Sprint 8'in kuralı açıktı: *"Sahte URL üretme. Gerçek URL bilinmiyorsa
undefined bırak."* Elimizde hiçbir kurumdan doğrulanmış, gerçek bir PDF
dosyası veya bağlantısı olmadığından, kütüphanedeki **121 belgenin
tamamında** bu 6 alan tanımsız kaldı. Bu bir eksiklik değil, "Belge
uydurma" ilkesinin (bkz. `docs/CONTENT_COVERAGE.md`) doğal bir uzantısı.

### Neden alanlar OPSİYONEL (zorunlu değil)?

`pdfAvailable`i (ve diğer 5 alanı) ZORUNLU yapmak, kütüphanedeki 121
belge kaydının TAMAMINA `pdfAvailable: false` eklemeyi gerektirirdi —
9 dosyada, sıfır işlevsel fayda karşılığında büyük ve hataya açık bir
diff. Bunun yerine tüm alanlar opsiyonel bırakıldı; `hasPdf()` (bkz.
§6) `pdfAvailable === true` DEĞİLSE (yani hem `false` hem `undefined`
için) belgeyi "PDF yok" sayar — "belirtilmemiş" ile "yok" arasında UI
açısından hiçbir fark yoktur.

### `pdfPath` ile karışıklık YOK

Sprint 4'ten kalan `pdfPath: string` alanı HÂLÂ mevcut ve HER belgede
doludur — ama bu alan gerçek bir PDF'i değil, kurumun genel ana
sayfasını (ör. `https://www.tedas.gov.tr`) işaret eden bir yer
tutucudur. Sprint 8'in TÜM yeni fonksiyon ve UI mantığı `pdfPath`e
ASLA bakmaz — yalnızca `pdfAvailable`/`hasPdf()` gerçek kaynağı temsil
eder. Bu, Sprint 6'daki "kaynak doğrulaması gerekli" ilkesinin PDF
alanına genişletilmiş hâlidir.

## 2. Asset Organizasyonu

```
src/assets/pdfs/
├── tedas/README.md
├── epdk/README.md
├── resmiGazete/README.md
├── teias/README.md
├── enerjiBakanligi/README.md
├── tse/README.md
├── iec/README.md
├── cenelec/README.md
├── ieee/README.md
└── other/README.md
```

`src/data/library/`'nin 10 kurum klasörüyle BİREBİR eşleşir. Her klasör
şu an boş (yalnızca bir README.md içerir — git boş klasörleri
izlemediğinden, ve gelecekteki katkıcılara "yeni PDF eklerken ne
yapmalı" talimatını taşır). Gerçek bir PDF eklendiğinde:

1. Dosya ilgili kurum klasörüne konur.
2. `src/data/library/<kurum>/documents.ts`'teki ilgili kayıt
   `localAsset`/`pdfAvailable: true` ile güncellenir.
3. Kaynak gerçekten doğrulanmadan `pdfAvailable: true` YAPILMAZ.

## 3. Repository Entegrasyonu

`src/data/library/repository.ts`'e Sprint 8'de eklenen 5 fonksiyon
(mevcut repository desenine birebir uygun — DOCUMENTS üzerinde saf
`.filter()`/`.reduce()`, elle yazılan sayı YOK):

| Fonksiyon | Döner |
| --- | --- |
| `hasPdf(document)` | `boolean` — `pdfAvailable === true` |
| `getAvailablePdfDocuments()` | PDF'i olan belgeler |
| `getMissingPdfDocuments()` | PDF'i olmayan belgeler |
| `getPdfPath(id)` | `localAsset ?? pdfUrl ?? undefined` (PDF yoksa `undefined`) |
| `getPdfStatistics()` | Toplam/kurum/kategori bazlı PDF dökümü + bilinen toplam sayfa sayısı |

Bu fonksiyonlar `src/data/library/index.ts` barrel'ı üzerinden dışa
açılır — ekranlar (`DocumentDetailScreen`, `DocumentRow`,
`AiDestekScreen`, `VeriKaynaklariScreen`) `@/data/library`'den import
eder, hiçbiri `document.pdfAvailable`i doğrudan okumaz (tek giriş
noktası `hasPdf()`).

## 4. Viewer Mimarisi

`modules/mevzuat/screens/DocumentViewerScreen.tsx` (rota: `/pdf/[id]`).

**Paket seçimi**: `react-native-webview` — Expo Go uyumlu, resmî
Expo-desteklenen bir paket. `react-native-pdf` gibi native modül
GEREKTİREN alternatifler (Expo Go'da ÇALIŞMAZ, özel dev client
gerektirir) bilinçli olarak seçilmedi; bu proje boyunca korunan "Expo
Go'da hatasız açılış" hedefiyle tutarlıdır (bkz. `app/_layout.tsx` üst
yorumu).

**Ekran yapısı** (madde 4-5):

```
┌─────────────────────────────────┐
│ ‹  Doküman Adı            [PDF] │  ← üst çubuk (lacivert, AppBar ile aynı dil)
├─────────────────────────────────┤
│  ⇪ Paylaş   ☆ Favori   🔍 Ara   │  ← toolbar
├─────────────────────────────────┤
│                                  │
│      <WebView PDF render>       │  ← gerçek görüntüleyici
│                                  │
├─────────────────────────────────┤
│      ‹   Sayfa 3 / 12   ›       │  ← alt sayfa bilgisi
└─────────────────────────────────┘
```

**Sayfa takibi hakkında dürüst bir not**: `react-native-webview`,
render ettiği PDF üzerinde gerçek bir "şu an hangi sayfadayım" olayı
YAYINLAMAZ (bu, PDF.js gibi bir motorun native tarafa gömülmesini
gerektirir — Expo Go'da mümkün değil). Bu yüzden alt çubuktaki sayfa
numarası **otomatik scroll-senkronize DEĞİL, manuel bir imleçtir**:
kullanıcı ‹/› okları ile "kaldığım sayfa" numarasını kendi işaretler,
bu numara `useSonSayfa()` ile kalıcı olarak saklanır (bkz. §5). Bu,
"kullanıcı kaldığı sayfaya geri dönebilmeli" gereksinimini dürüstçe
karşılar — sahte bir "otomatik senkron" iddiası YOKTUR.

**Lazy load / performans** (madde 17):
- `<WebView>`, yalnızca `pdfKaynagi` (gerçek bir kaynak) varken mount
  edilir.
- Ekran (`route`) yığından çıktığında WebView de unmount olur — React
  Native'in normal yaşam döngüsü, PDF içeriğinin bellekte gereksiz
  tutulmamasını sağlar; ekstra bir önbellekleme/tutma mekanizması
  EKLENMEDİ.
- Yükleme sırasında `ActivityIndicator` gösterilir (`onLoadEnd` ile
  kapatılır) — ilk açılışta gereksiz re-render yapılmaz.

**Arama altyapısı** (madde 7): toolbar'daki "Ara" butonu bir arama
kutusu açar; şu an giriş kabul eder ama **"Bu PDF için metin araması
henüz desteklenmiyor."** mesajını gösterir — gerçek bir OCR/metin
katmanı olmadan arama YAPILAMAZ, sahte sonuç ÜRETİLMEZ.

**PDF yoksa** (madde 9): `DocumentDetailScreen`, `hasPdf(document)`
`false` olduğunda bu ekrana hiç YÖNLENDİRMEZ — "PDF Yakında" bilgi
mesajı gösterir. Ekran yine de doğrudan bir id ile açılırsa (ör. eski
bir bağlantı), aynı kontrolü kendi içinde tekrarlar ve "Bu doküman
için PDF bulunamadı." gösterir — hiçbir zaman boş/kırık bir WebView
render etmez.

## 5. Son Sayfa (Kalıcı Depolama)

`src/lib/sonSayfa.tsx` — `favoriler.tsx` ile AYNI React Context
deseni, ama GERÇEKTEN kalıcı (`@react-native-async-storage/async-storage`
ile). `favoriler.tsx`'in üst yorumundaki "AsyncStorage sonraki sürümde
eklenecek" notunun karşılığı budur — bu paket, Sprint 8'in "PDF
görüntüleme için gerçekten gerekiyorsa yeni paket serbest" kuralının
kapsamına, "kaldığın sayfayı hatırlama" (madde 8) PDF okuma deneyiminin
ayrılmaz bir parçası olduğu için dahil edildi.

`documentId → sayfa numarası` eşlemesi tek bir JSON anahtarı altında
saklanır (`sartname-cepte:son-sayfa`). Bozuk/okunamayan kayıt sessizce
göz ardı edilir (uygulama çökmez). **Yalnızca local** — "Henüz cloud
sync yapılmayacak" kuralı gereği hiçbir sunucuya senkronize edilmez.

## 6. Download Hazırlığı

`src/offline/offlineTypes.ts` — `DownloadState`, `DownloadProgress`,
`DownloadQueueItem` tipleri (madde 10). `src/offline/offlineManager.ts`
— `enqueueDownload()`/`cancelDownload()`/`getDownloadState()` gibi
fonksiyonlar; hepsi yalnızca BELLEK-İÇİ bir `Map`'i günceller, **hiçbir
gerçek ağ isteği veya dosya sistemi yazımı yapmaz**. Bu, ileride
`expo-file-system` tabanlı gerçek indirmenin, dışa açılan fonksiyon
imzalarını DEĞİŞTİRMEDEN eklenebilmesi için bilinçli bir API
sabitleme kararıdır.

## 7. Offline Hazırlığı

`src/offline/offlineRepository.ts` — `getOfflineDocuments()`,
`isAvailableOffline()`, `getOfflineDocumentRecord()`. Gerçek indirme
olmadığından bu fonksiyonlar HER ZAMAN boş/`false` döner — bu bir hata
değil, "Yalnızca mimari kurulacak" kuralının doğrudan uygulanmasıdır.

**Neden Download Manager ve Offline aynı klasörde?** Sprint 8'in 10. ve
11. maddeleri ayrı ayrı numaralandırılsa da, aynı alt sistemin iki
yüzüdür — bir belgeyi "indirmek" onu "offline kullanılabilir" hâle
getirmenin tek yoludur. `src/offline/` altında üç dosyada (types/
manager/repository) toplanmaları, ileride gerçek indirme eklendiğinde
tek bir tutarlı modülün güncellenmesini sağlar.

## 8. UI Entegrasyonu — Nerede ne gösteriliyor

| Ekran | Sprint 8 değişikliği |
| --- | --- |
| `DocumentDetailScreen` | PDF varsa büyük mavi "PDF'yi Aç" (→ `/pdf/:id`), yoksa gri "PDF Yakında" (→ bilgi mesajı) |
| `DocumentRow` (Ana Sayfa/Arama/Favoriler ortak) | PDF rozeti artık `document.pdfPath` (her zaman dolu, yanıltıcıydı) yerine `hasPdf()`e bakar |
| `AiDestekScreen` | Öneri kartlarında PDF'i olan belgeler küçük "PDF" etiketi alır |
| `VeriKaynaklariScreen` | Her kurum kartında "Toplam PDF: N" — `getPdfStatistics()`'ten, elle yazılmaz |

## 9. Gelecekte: OCR Planı

Şu an PDF içeriği tamamen görsel/native render'dır — metin katmanı
programatik olarak erişilebilir DEĞİLDİR (kaynak PDF taranmış bir
görüntü olabilir veya olmayabilir, bilinmiyor). Gerçek metin arama
(madde 7'nin "henüz desteklenmiyor" mesajının çözümü) için:

1. PDF'ler gerçekten eklendiğinde, her biri için metin çıkarma
   (extraction) bir kerelik bir işlem olarak çalıştırılabilir (PDF
   metin katmanı varsa doğrudan, yoksa OCR — ör. bir bulut OCR API'si
   veya cihaz-üstü bir kütüphane).
2. Çıkarılan metin, `Document.summary`/`keywords` gibi başka bir alanda
   DEĞİL, ayrı bir "belge içi arama indeksi" olarak saklanır (belge
   modelini şişirmemek için).
3. Bu indeks, `src/ai/matcher.ts`'teki ters indeks deseniyle TUTARLI
   bir şekilde kurulabilir — mimari zaten bu genişlemeye hazır.

## 10. Gelecekte: RAG Hazırlığı

PDF metin katmanı bir kez çıkarıldığında, bu içerik `src/ai/` motorunun
embedding tabanlı bir retrieval katmanına (bkz. `docs/AI_ENGINE.md`
"Gelecekte RAG entegrasyonu") doğrudan girdi olabilir — belge
başlığı/özeti yerine artık PDF'in GERÇEK içeriği üzerinden semantik
arama yapılabilir. `RecommendationResult` sözleşmesi bu geçişe hazır
tasarlandığından (bkz. `docs/AI_ENGINE.md` §"RAG"), PDF içerik
katmanının eklenmesi yalnızca indeksleme kaynağını genişletir —
ekranlarda hiçbir değişiklik gerekmez.
