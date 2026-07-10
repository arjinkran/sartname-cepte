# Gerçek Resmî Kaynak Arama, Aday Doğrulama ve Güvenli PDF Bulucu (Sprint 12)

Bu doküman, `src/sourceResolver/network/` katmanının mimarisini,
güvenlik kurallarını ve sınırlarını açıklar. Sprint 11'in senkron
`src/sourceResolver/resolver.ts` çözümleyicisinin **üzerine eklenen**
bir katmandır — Sprint 11'in hiçbir dosyası değiştirilmedi/silinmedi.

## Neden bu sprint gerekliydi

Sprint 11, "bu belgenin resmî kaynağı hangi kurum/domain, telifli mi"
sorusunu **kural tabanlı** olarak cevaplayabiliyordu, ama gerçekten bir
PDF/sayfa **bulup bulamayacağını bilmiyordu** — "PDF Bulmayı Dene"
butonu yalnızca bir yer tutucu mesaj gösteriyordu. Bu sprint, o butonu
**gerçek** (ama sıkı sınırlı, güvenli) bir ağ aramasıyla aktif hale
getirdi.

## Tetikleme

Ağ araması **yalnızca** kullanıcı Doküman Detay ekranında "PDF Bulmayı
Dene" butonuna bastığında başlar. Uygulama açılışında, ekran
yüklenirken veya arka planda **hiçbir otomatik ağ isteği yapılmaz**.

## Bağımlılık yönü (tek yönlü)

```
UI (DocumentDetailScreen)
  → Source Resolver Service (resolver.ts)
    → Search Coordinator (network/searchCoordinator.ts)
      → Provider Adapter (network/adapters/*.ts)
        → Safe HTTP Client (network/httpClient.ts)
```

- `network/*` yalnızca Sprint 11'in `registry.ts`/`validators.ts`/
  `types.ts` dosyalarını ve `Document` tipini import eder —
  **`resolver.ts`'i asla import etmez** (döngüsel bağımlılık olmasın diye).
- `resolver.ts`, `network/searchCoordinator.ts`'i tek yönlü import eder
  ve `findOfficialSourceCandidates`/`cancelSourceSearch`/
  `clearSourceSearchState`/`isCandidateUrlSafeToOpen` fonksiyonlarını
  UI'a re-export eder.
- Adaptörler repository'yi import etmez; repository network resolver'ı
  import etmez; UI adaptörleri veya `searchCoordinator.ts`'i doğrudan
  import etmez — yalnızca `resolver.ts` üzerinden erişir.

## Güvenlik kuralları

### URL/domain güvenliği (`validators.ts` → `isSafeRequestUrl`)

Her gerçek ağ isteğinden ÖNCE zorunlu kontrol:

1. Yalnızca `https://` kabul edilir — `http://`, `file://` reddedilir.
2. `localhost`, `127.x`, `0.0.0.0`, `10.x`, `192.168.x`, `169.254.x`,
   `172.16-31.x`, `::1` gibi özel/ayrılmış ağ aralıkları reddedilir.
3. Ham IPv4/IPv6 adresleri (domain adı olmayan) reddedilir.
4. Geri kalan kontrol `isOfficialDomain()`'e devredilir — bu, sağlayıcı
   registry'sindeki `officialBaseUrl`/`alternateDomains` dışındaki HER
   domaini reddeder. Alt-domain eşleşmesi katıdır: `tedas.gov.tr.evil.
   com`, `epdk-org.example` gibi görünüşte benzer ("lookalike") domainler
   bu katı `endsWith('.' + domain)` mantığı sayesinde otomatik olarak
   reddedilir.
5. Redirect sonrası GERÇEK URL (`response.url`) de **tekrar** aynı
   kontrolden geçirilir (`extractPdfCandidates` içinde `finalUrl`
   doğrulaması) — bir istek başlangıçta resmî bir URL'e gitse bile,
   sunucu farklı bir domaine yönlendirirse aday reddedilir.

### İstek sınırları (`httpClient.ts`)

- Varsayılan zaman aşımı: **8 saniye**, üst sınır: **15 saniye**.
- `AbortController` ile gerçek iptal — zaman aşımında hem `fetch`
  isteği hem de bekleyen `Promise.race` temizlenir (`finally` ile
  `setTimeout` sızıntısı önlenir).
- Yanıt gövdesi metin olarak **~2 MB** ile sınırlanır (limit aşılırsa
  kırpılır, hata VERİLMEZ — yalnızca kırpılmış içerik üzerinde ayrıştırma
  yapılır).
- PDF kontrolü için önce `HEAD` denenir; sunucu `HEAD`'i desteklemiyorsa
  (405/501) sınırlı bir `GET`'e düşülür.
- En fazla **1 ilk deneme + 1 kontrollü retry** — retry YALNIZCA zaman
  aşımı veya geçici 5xx hatasında yapılır; 4xx hatalarında ve genel ağ
  hatalarında retry YAPILMAZ.
- Bir arama turu içinde aynı URL'e **asla** ikinci kez istek atılmaz
  (`searchCoordinator.ts`'teki `requestedUrls` Set).
- Hiçbir exception UI'a sızmaz — `safeFetch` her zaman tipli bir
  `SafeFetchResult` döner (`ok: true | false`).

### Hız sınırlama (`rateLimiter.ts`)

- Sağlayıcı başına en fazla **1 eşzamanlı istek**, toplamda en fazla
  **3 eşzamanlı istek**.
- Aynı sağlayıcıya art arda isteklerde en az **750ms** bekleme.
- Bir belge için zaten aktif bir arama varsa, **ikinci bir arama
  başlatılmaz** (`canStartSearch`/`markSearchStarted`/
  `markSearchFinished`).
- `acquireProviderSlot()` limit aşıldığında **HİÇBİR ZAMAN** kuyruğa
  girmez veya süresiz beklemez — hemen `false` döner, o sağlayıcı o
  arama turunda atlanır. Bu, deadlock'u yapısal olarak imkânsız kılar.
- Her slot **`finally`** içinde serbest bırakılır.

### Önbellek (`cache.ts`)

- Bellek-içi, kalıcı DEĞİL (yeni bir persistence paketi eklenmedi).
- Anahtar: `documentId + providerId + normalize(title)`.
- TTL: başarı **24 saat**, sonuç yok **30 dakika**, kısıtlı standart
  **24 saat**. Ağ hatası/zaman aşımı **hiç önbelleklenmez**.
- En fazla **200 kayıt** — limit aşılırsa en eski kayıt(lar) atılır.

## Arama stratejisi (genel arama motoru YOK)

Her sağlayıcı adaptörü şu sıra ile davranır:

1. Belgenin kendi `sourceUrl`'i zaten resmî domainden doğrulanmışsa
   (`isOfficialDomain`), doğrudan o URL kontrol edilir.
2. Aksi hâlde sağlayıcının bilinen resmî ana sayfası (`officialBaseUrl`)
   taranır.
3. Sayfadaki `<a href="...">` bağlantıları (yalnızca basit regex ile —
   tam bir HTML parser paketi eklenmedi, `<script>`/`<style>` içerikleri
   hiç yorumlanmaz) çıkarılır, `.pdf` uzantılı ve resmî domainden olanlar
   aday olarak değerlendirilir.
4. Hiçbir şey bulunamazsa `noResult` döner — **asla** bir URL
   uydurulmaz veya tahmin edilen bir dosya yolu denenmez.

Google/Bing gibi genel arama motorları **hiçbir zaman** taranmaz.

## Aday puanlama (`candidateParser.ts` → `scoreCandidate`)

0-100 arası puan; bileşenler: domain doğrulaması (yoksa puan HER ZAMAN
0), tam/kısa başlık eşleşmesi, alternatif ad eşleşmesi, revizyon
eşleşmesi, kurum adı eşleşmesi, `.pdf` uzantısı, `Content-Type:
application/pdf`, kategori eşleşmesi, tarih (yıl) eşleşmesi.

- **70+** → güçlü aday (`requiresManualReview: false`).
- **45-69** → manuel inceleme önerilir (`requiresManualReview: true`).
- **<45** → **hiçbir zaman** sonuçlara dahil edilmez — tek aday olsa
  bile gösterilmez.

En fazla **5 aday** döner, skora göre azalan sırada, aynı URL bir kez.

## Kısıtlı standart kuruluşları (TSE, IEC, CENELEC, IEEE)

Bu 4 sağlayıcı için `buildSearchRequests()` **her zaman boş dizi**
döner — hiçbir PDF/link araması, hiçbir ağ isteği yapılmaz.
`parseCandidates()` doğrudan, ağ yanıtına bakmadan, sağlayıcının resmî
ürün/erişim sayfasına işaret eden TEK bir `restrictedStandard` aday
üretir. UI'da gösterilen metin tam olarak şudur:

> "Bu standart telifli veya erişimi kısıtlıdır. Tam metin yalnızca
> yetkili resmî kaynaktan edinilebilir."

## Kullanıcı onayı ve UI akışı

1. Kullanıcı "PDF Bulmayı Dene"ye basar → buton devre dışı kalır,
   yükleme göstergesi + "Resmî kaynaklarda aranıyor…" mesajı görünür.
2. Arama biter → duruma göre mesaj: "Doğrulanmış kaynak bulundu.",
   "Resmî kaynaklarda uygun PDF bulunamadı.", "Arama zaman aşımına
   uğradı.", "Ağ bağlantısı kurulamadı." veya "Bu kaynak telifli veya
   erişimi kısıtlıdır."
3. Aday varsa "Resmî Kaynak Adayları" adlı bir modal (yalnızca React
   Native'in yerleşik `Modal` bileşeni — yeni paket eklenmedi) açılır;
   her aday başlık, sağlayıcı, domain, PDF/Resmî Sayfa etiketi, güven
   skoru ve eşleşme nedenlerini gösterir.
4. Kullanıcı "Kaynağı Aç"a basarsa, URL `Linking.openURL`'den ÖNCE
   **tekrar** doğrulanır (`isCandidateUrlSafeToOpen`); doğrulama
   başarısız olursa "Bu bağlantı doğrulanmış resmî bir kaynağa ait
   değil." mesajı gösterilir.
5. Kullanıcı sayfadan ayrılırsa (`useEffect` temizleme fonksiyonu),
   devam eden arama iptal edilir (`clearSourceSearchState` →
   `AbortController.abort()`).

## Bu sprintte YAPILMAYANLAR (bilinçli sınırlar)

- **Hiçbir otomatik indirme yok.** Kullanıcı yalnızca resmî sayfayı/
  PDF bağlantısını tarayıcıda açabilir.
- **Manifest/Document kaydı güncellenmiyor.** Bulunan bir aday,
  `PDF_MANIFEST`'e veya `Document.pdfAvailable`'a otomatik yazılmaz —
  bu, gelecekteki bir sprintin kapsamıdır.
- **OCR, metin çıkarma veya RAG yok.**
- **Genel arama motoru taraması yok.**
- **TSE/IEC/CENELEC/IEEE için tam metin araması yok** (bilinçli, telif
  nedeniyle kalıcı bir kısıtlama).

## Performans ve döngü güvenliği garantileri

- Hiçbir yerde özyinelemeli (recursive) ağ çağrısı yoktur; adaptörler
  kendilerini asla çağırmaz.
- Resolver → Coordinator → Adapter → HTTP Client akışı **tek yönlüdür**.
- Sabit üst sınırlar: en fazla 3 istek/sağlayıcı/arama, en fazla 5 aday,
  en fazla ~2MB yanıt gövdesi, en fazla 200 önbellek kaydı, en fazla 20
  arama geçmişi kaydı.
- Her `finally` bloğu rate-limit slotlarını, arama kilidini ve
  `AbortController`/zamanlayıcı kaynaklarını temizler — hata veya iptal
  durumunda bile sızıntı olmaz.

## Debug/istatistik fonksiyonları (UI'da GÖSTERİLMEZ)

```ts
import { getSearchSessionStats, getProviderRequestCounts, getCacheStats } from '@/sourceResolver/resolver';
```

- `getSearchSessionStats()` — son 20 arama (documentId/searchedAt/
  status/candidateCount).
- `getProviderRequestCounts()` — sağlayıcı başına yapılan toplam istek
  sayısı.
- `getCacheStats()` — mevcut önbellek boyutu/üst sınırı.
