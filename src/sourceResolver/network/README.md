# Network Search Layer (Sprint 12)

Bu klasör, `src/sourceResolver/`'ün (Sprint 11) senkron, ağ-erişimsiz
resolver'ının **ÜZERİNE** eklenen, kullanıcı "PDF Bulmayı Dene" dediğinde
tetiklenen **gerçek ama sıkı sınırlı** ağ arama katmanıdır. Sprint 11'in
dosyaları (`resolver.ts`, `registry.ts`, `validators.ts`, `sources/*.ts`)
**değiştirilmedi/silinmedi** — bu klasör tamamen ek bir katmandır.

## Neden bu katman gerekli?

Sprint 11, bir belgenin resmî kaynağının **ne olduğunu** (hangi kurum,
hangi domain, telifli mi) senkron kurallarla belirleyebiliyordu, ama
gerçek bir PDF/sayfa bulup bulamayacağını **bilmiyordu**. Bu katman, o
kaynağı **gerçekten arayıp** doğrulanmış adaylar döndürür — kullanıcı
onay vermeden hiçbir şey indirilmez veya kaydedilmez.

## Bağımlılık yönü (tek yönlü — asla tersine değil)

```
UI (DocumentDetailScreen)
  → Source Resolver Service (resolver.ts — findOfficialSourceCandidates)
    → Search Coordinator (searchCoordinator.ts)
      → Provider Adapter (adapters/*.ts)
        → Safe HTTP Client (httpClient.ts)
```

- `network/*` yalnızca Sprint 11'in `registry.ts`/`validators.ts`/`types.ts`
  dosyalarını ve `Document` tipini import eder — **`resolver.ts`'i asla
  import etmez.**
- `resolver.ts`, `network/searchCoordinator.ts`'i tek yönlü import eder.
- Adaptörler repository'yi import etmez; repository network resolver'ı
  import etmez; UI adaptörleri doğrudan çağırmaz (yalnızca `resolver.ts`
  üzerinden).

## Dosyalar

| Dosya | Sorumluluk |
|---|---|
| `types.ts` | Tüm ağ katmanı tipleri (`NetworkSearchRequest/Response`, `ProviderSearchAdapter`, ...) |
| `httpClient.ts` | `safeFetch`/`fetchText`/`fetchHead` — zaman aşımı, tek retry, boyut sınırı |
| `rateLimiter.ts` | Eşzamanlılık ve istek sıklığı sınırları (kalıcı değil, bellek-içi) |
| `cache.ts` | Arama sonucu önbelleği (kalıcı değil, en fazla 200 kayıt) |
| `candidateParser.ts` | HTML'den link çıkarımı + 0-100 aday puanlama |
| `adapters/*.ts` | Sağlayıcı başına arama stratejisi (9 sağlayıcı) |
| `searchCoordinator.ts` | Tüm katmanı orkestre eden tek giriş noktası |

## Güvenlik kuralları (özet — ayrıntı için `docs/OFFICIAL_SOURCE_NETWORK_SEARCH.md`)

- Yalnızca `https://` — `http://`/`file://` reddedilir.
- `localhost`, ham IP adresleri, özel/ayrılmış ağ aralıkları reddedilir.
- İstek öncesi VE redirect sonrası domain **iki kez** doğrulanır
  (`isSafeRequestUrl`/`isOfficialDomain`).
- TSE/IEC/CENELEC/IEEE için **hiçbir zaman** ağ isteği yapılmaz.
- Genel arama motoru (Google/Bing) taraması yapılmaz — yalnızca belgenin
  kendi `sourceUrl`'i veya sağlayıcının bilinen resmî ana sayfası taranır.
- Hiçbir sahte/tahmini URL üretilmez — bulunamazsa `noResult` döner.

## Sağlayıcı desteği

| Sağlayıcı | Gerçek ağ araması | Not |
|---|---|---|
| TEDAŞ, EPDK, Resmî Gazete/mevzuat.gov.tr, TEİAŞ | ✅ | `sourceUrl` doğrulanmışsa onu, değilse kurum ana sayfasını tarar |
| mevzuat.gov.tr (genel) | ✅ | Enerji Bakanlığı/Diğer/Kanun türü belgeler için ikincil kaynak |
| TSE, IEC, CENELEC, IEEE | ❌ (bilinçli) | `restrictedStandard` — yalnızca resmî ürün sayfasına yönlendirir, PDF aranmaz |
