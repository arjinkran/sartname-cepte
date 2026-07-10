# Resmî Kaynak Bulucu (Sprint 11)

Bu klasör, Şartname Cepte'nin **kural tabanlı** (rule-based) resmî
kaynak çözümleyicisini içerir. Amaç: her belge için "bu belgenin resmî
kaynağı nedir, güvenilir mi, PDF'e uygun mu, telifli mi" sorularına
**gerçek bir ağ isteği yapmadan** cevap vermek — kütüphanedeki mevcut
alanlara (institution, sourceUrl, pdfAvailable) bakarak.

## ⚠️ Bu modül NE DEĞİLDİR

- **Gerçek bir arama motoru DEĞİLDİR.** İnternete çıkmaz, hiçbir API
  çağırmaz.
- **Bir indirme mekanizması DEĞİLDİR.** PDF indirmez, yalnızca
  var olan/olmayan bilgisini sınıflandırır.
- **TSE/IEC/CENELEC/IEEE için tam metin erişimi SAĞLAMAZ.** Bu
  kuruluşlar her zaman `restrictedStandard` olarak işaretlenir —
  yalnızca resmî satış/erişim sayfasına yönlendirme yapılabilir.

## Mimari

```
src/sourceResolver/
├── types.ts       — SourceProvider, SourceResolverResult, SourceAccessType, vb.
├── sources/        — her kaynak için TEK bir SourceProvider sabiti
│   ├── tedas.ts
│   ├── epdk.ts
│   ├── resmiGazete.ts
│   ├── mevzuatGov.ts
│   ├── teias.ts
│   ├── tse.ts
│   ├── iec.ts
│   ├── cenelec.ts
│   └── ieee.ts
├── registry.ts      — 9 sağlayıcıyı tek listede toplar
├── validators.ts      — saf domain/URL doğrulama fonksiyonları
├── resolver.ts          — asıl çözümleme mantığı (4 fonksiyon)
└── README.md               — bu dosya
```

Bağımlılık yönü tek yönlüdür: `resolver.ts` → `validators.ts` +
`registry.ts` → `sources/*.ts` → `types.ts`. Hiçbiri
`src/data/library/repository.ts`'i import ETMEZ — yalnızca `Document`/
`Institution` TİPLERİNİ (çalışma zamanı bağımlılığı değil) kullanır. Bu
sayede `repository.ts`'in bu modülü import etmesi (Sprint 11, madde 8)
döngüsel bağımlılık YARATMAZ.

## Kaynak Sağlayıcılar (Provider)

| id | Kurum | Domain | accessType |
| --- | --- | --- | --- |
| `tedas` | TEDAŞ | tedas.gov.tr | officialPage |
| `epdk` | EPDK | epdk.gov.tr | officialPage |
| `resmi-gazete` | Resmî Gazete | mevzuat.gov.tr (+ resmigazete.gov.tr) | officialPage |
| `mevzuat-gov` | Mevzuat.gov.tr | mevzuat.gov.tr | officialPage |
| `teias` | TEİAŞ | teias.gov.tr | officialPage |
| `tse` | TSE | tse.org.tr | restrictedStandard |
| `iec` | IEC | iec.ch | restrictedStandard |
| `cenelec` | CENELEC | cenelec.eu | restrictedStandard |
| `ieee` | IEEE | ieee.org (+ standards.ieee.org) | restrictedStandard |

**Not — Resmî Gazete ↔ mevzuat.gov.tr**: bu kütüphanedeki "Resmî
Gazete" kurumlu belgelerin GERÇEK `sourceUrl` alanı mevzuat.gov.tr'yi
işaret eder (Sprint 5'ten beri), Resmî Gazete'nin kendi arşiv sitesi
resmigazete.gov.tr olsa da. `resmi-gazete` sağlayıcısının
`officialBaseUrl`'i bu GERÇEK veriyle tutarlı tutuldu; `resmigazete.
gov.tr` ise `alternateDomains` içinde geçerli bir alternatif olarak
durur (bkz. `sources/resmiGazete.ts`).

**Not — Enerji Bakanlığı/Diğer için sağlayıcı YOK**: Sprint 11'in kendi
kapsamı yalnızca 9 sağlayıcıyı listeler; bu iki kurum için kasıtlı
olarak kayıtlı bir `SourceProvider` yoktur — belgeleri her zaman
`manualRequired` döner (bkz. `resolver.ts` `INSTITUTION_PROVIDER_ID`).

## Ana Fonksiyonlar

```ts
import { resolveOfficialSource, getSourceStatus, resolveByInstitution, resolveByTitle } from '@/sourceResolver/resolver';

resolveOfficialSource(document); // Tam karar ağacı: pdfAvailable → restrictedStandard → sourceUrl domain kontrolü
getSourceStatus(document);       // resolveOfficialSource() ile AYNI — UI-dostu takma ad
resolveByInstitution(document);  // Yalnızca kurum bilgisine bakar, sourceUrl'i değerlendirmez
resolveByTitle('bir başlık');    // Başlıktan zayıf bir sağlayıcı tahmini (gerçek arama DEĞİL)
```

Karar ağacı (`resolveOfficialSource`, Sprint 11 madde 6):

1. `pdfAvailable: true` → **publicPdf**, doğrulanmış.
2. Kurum TSE/IEC/CENELEC/IEEE → **restrictedStandard**, telifli.
3. `sourceUrl` yok → **manualRequired**.
4. `sourceUrl` var ve sağlayıcının resmî domainiyle eşleşiyor →
   doğrulanmış **publicPdf** (uzantı `.pdf` ise) veya **officialPage**.
5. `sourceUrl` var ama doğrulanamıyor → **manualRequired**.

## Domain Doğrulama

`validators.ts`'teki `isOfficialDomain(url, providerId)`, bir URL'in
sağlayıcının `officialBaseUrl`'i (veya `alternateDomains`'inden biri)
ile eşleşip eşleşmediğini kontrol eder — alt alan adları kabul edilir
(`e-mevzuat.mevzuat.gov.tr` gibi), tamamen farklı bir domain
REDDEDİLİR. Bu, sahte/uydurma kaynak bağlantılarının "doğrulanmış"
görünmesini engelleyen tek mekanizmadır.

## İleride: Gerçek Arama ve İndirme

Bkz. [`docs/SOURCE_RESOLVER_ARCHITECTURE.md`](../../docs/SOURCE_RESOLVER_ARCHITECTURE.md)
"Gelecekte otomatik PDF indirme akışı" — bu modülün API yüzeyi
(`SourceResolverResult` sözleşmesi), gerçek bir arama/indirme motoru
eklendiğinde ekranlarda hiçbir değişiklik gerektirmeyecek şekilde
tasarlandı.
