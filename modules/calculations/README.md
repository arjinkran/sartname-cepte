# Calculation Engines — Mimari Rehberi

> Bu doküman, uygulamanın hesaplama motoru altyapısını açıklar. **Kod bu
> dosyanın yanında değil**, [`src/calculations/`](../../src/calculations)
> altında yaşar. Bu README, o mimariyi ve yeni bir motorun (özellikle
> Excel'den birebir taşınan gerçek mühendislik hesaplarının) nasıl
> ekleneceğini belgelemek için `modules/calculations/` altında tutulur.

## Temel ilke

**UI hesap yapmaz.** Ekranlar yalnızca bir motorun `calculate()` fonksiyonunu
çağırır ve dönen `CalculationResult`'ı gösterir. Tüm doğrulama, formül ve
sabitler `src/calculations` içinde, motora özgü `engines/<ad>/` klasöründe
yaşar.

## Engine yapısı

Her motor klasörü (`src/calculations/engines/<ad>/`) şu dosyaları içerir:

```
engines/<ad>/
  index.ts      → barrel export (types + engine + examples)
  types.ts      → <Ad>Input, <Ad>Output (motora özgü girdi/çıktı şekli)
  engine.ts     → hesapla() fonksiyonu + <Ad>Engine nesnesi
  examples.ts   → CalculationExample[] (giriş/çıktı örnekleri)
  tests.md      → insan tarafından okunabilir test senaryoları (opsiyonel ama önerilir)
```

Bir motor nesnesi (`CalculationEngine<TInput, TOutput>`, bkz.
[`src/calculations/core/types.ts`](../../src/calculations/core/types.ts)),
şu alanları destekler:

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `metadata` | `CalculationMetadata` | `id`, `name`, `description`, `version`, `author`, `standard?`, `source?`, `createdAt`, `updatedAt` |
| `category` | `CalculationCategory` | `'electrical' \| 'mechanical' \| 'safety' \| 'other'` |
| `isDemo` | `boolean` | `true` → formül henüz Excel'den doğrulanmadı |
| `inputs` | `CalculationField[]` | Girdi alanlarının UI meta verisi (`key`, `label`, `unit`, `required?`) |
| `outputs` | `CalculationField[]` | Çıktı alanlarının UI meta verisi |
| `constants` | `CalculationConstant[]` | Excel'den birebir taşınacak sabitler (`key`, `label`, `value`, `unit?`) |
| `limits` | `CalculationLimit[]` | Değerlendirme eşikleri (ör. `maxVoltageDrop`, `recommendedVoltageDrop`, `warningVoltageDrop`) |
| `examples?` | `CalculationExample[]` | Giriş/çıktı örnek çiftleri — dokümantasyon + regresyon testi kaynağı |
| `references?` | `CalculationReference[]` | Dayandığı standart/Excel kaynağına referans |
| `calculate` | `(input) => CalculationResult` | Asıl hesap fonksiyonu |

`calculate()` her zaman `CalculationResult` zarfı döner:

```ts
{
  ok: boolean;
  output: TOutput | null;   // ok=false ise null
  warnings: CalculationWarning[]; // hesabı geçersiz kılmaz (ör. limit aşımı)
  errors: CalculationError[];     // ok=false'un nedeni (ör. eksik girdi)
}
```

Doğrulama, `src/calculations/core/validation.ts` içindeki `required`,
`positiveNumber`, `numberRange`, `oneOf` yardımcıları ile `validateFields()`
kullanılarak yapılır. Hata/uyarı nesneleri `core/errors.ts` içindeki
`makeError` / `makeWarning` ile üretilir. Sonuç metinleri `core/format.ts`
içindeki `formatNumber`, `formatPercent`, `formatVoltage`, `formatCurrent`,
`formatPower`, `formatLength` ile biçimlendirilir.

## Şu anki durum

- **`voltageDrop`** — tek çalışan motor. **DEMO**'dur (`isDemo: true`);
  gerçek bir Excel formülü değildir, yalnızca altyapının nasıl çalıştığını
  gösterir. `metadata`, `constants`, `limits`, `examples` alanları
  doldurulmuştur ama hepsi placeholder/örnek niteliğindedir.
- **`ampacityAG`, `ampacityOG`, `sag`, `tension`** — yalnızca iskelet
  (`types.ts` + `index.ts`). Henüz `engine.ts` yok; girdi/çıktı tipleri bile
  Excel analizinden sonra tanımlanacak (`Record<string, never>` placeholder).

## Yeni bir engine nasıl eklenir

1. `src/calculations/engines/<ad>/` klasörünü oluştur (yoksa).
2. `types.ts` içinde `<Ad>Input` ve `<Ad>Output` arayüzlerini tanımla.
   Alan adları ve birimleri Excel'deki karşılıklarıyla birebir eşleşmeli.
3. `engine.ts` içinde:
   - Girdi doğrulamasını `core/validation.ts` yardımcılarıyla yaz.
   - Hesap fonksiyonunu (`hesapla` veya `calculate`) yaz; `CalculationResult<TOutput>` döndür.
   - `<Ad>Engine: CalculationEngine<...>` nesnesini oluştur: `metadata`,
     `category`, `isDemo`, `inputs`, `outputs`, `constants`, `limits` alanlarını doldur.
4. `examples.ts` içinde en az 2-3 gerçek/gerçekçi girdi-çıktı örneği ekle
   (bkz. Test yazma kuralları).
5. `tests.md` içinde senaryoları insan diliyle özetle.
6. `index.ts` içinde `export * from './types.ts'`, `'./engine.ts'`,
   `'./examples.ts'`.
7. `src/calculations/index.ts` barrel dosyasına motoru ekle ve
   `CALCULATION_ENGINES` listesine dahil et.
8. `tests/calculations/<ad>.test.ts` dosyasını yaz (bkz. aşağıdaki kurallar).
9. Yalnızca gerçekten UI'a bağlamak istiyorsan ilgili ekranı güncelle —
   motoru eklemek zorunlu olarak bir ekran değişikliği gerektirmez.

**Tüm importlarda dosya uzantısını (`.ts`) açıkça yaz** (`'../../core/types.ts'`
gibi). Bu proje `node --experimental-strip-types` ile test çalıştırıyor;
uzantısız relative importlar yalnızca `import type` (derleme zamanında
elenen) durumlarda çalışır, gerçek (runtime) importlarda modül bulunamaz
hatası verir. Metro (Expo) bundler'ı her iki biçimi de kabul eder, bu yüzden
uzantı eklemek güvenlidir.

## Excel'den engine'e dönüşüm adımları

Bir motoru gerçek bir Excel dosyasından taşırken:

1. **Excel'i incele** — hangi hücreler girdi, hangileri çıktı, hangileri
   sabit (asla değişmeyen) katsayı? Bunları not al.
2. **`types.ts`'i doldur** — her girdi/çıktı hücresi için bir alan; birim
   ve isim Excel'deki etiketle birebir eşleşsin (çeviri kaybı = hata riski).
3. **`constants`'ı doldur** — Excel'deki sabit hücreleri (iletkenlik,
   standart kesit serisi, katsayı tabloları vb.) `CalculationConstant[]`
   olarak birebir kopyala. Sabitleri asla `engine.ts` içine gömülü sayı
   olarak yazma; `constants` dizisinden oku.
4. **Formülü birebir taşı** — Excel'deki hücre formülünü aynı sırayla,
   aynı yuvarlama davranışıyla TypeScript'e çevir. Ara adımları Excel'deki
   gibi ayrı değişkenlere ata (okunabilirlik + doğrulanabilirlik için).
5. **`limits`'i doldur** — Excel'de "uygun/uygun değil" kararını veren eşik
   hücreleri varsa `CalculationLimit[]` olarak tanımla ve `calculate()`
   içinde bu diziden oku (sabit sayı gömme).
6. **`metadata`'yı gerçek bilgiyle doldur** — `standard` ve `source`
   alanlarına gerçek yönetmelik/Excel dosya adını yaz, `isDemo: false` yap.
7. **Excel'den 5-10 gerçek satırı `examples.ts`'e taşı** — Excel'in
   kendi hesapladığı girdi/çıktı çiftlerini birebir kopyala (elle yeniden
   hesaplama, yuvarlama hatası riski taşır).
8. **`tests/calculations/<ad>.test.ts` yaz** — her örneği motorun
   `calculate()` çıktısıyla karşılaştır (bkz. aşağıdaki kurallar).
9. **`references`'a Excel dosyasının adını/sürümünü ekle.**

## Test yazma kuralları

- Testler `tests/calculations/<ad>.test.ts` altında, Node'un yerleşik
  `node:test` + `node:assert` modülleriyle yazılır (proje genelinde başka
  test kütüphanesi kullanılmaz).
- Relative importlarda dosya uzantısını (`.ts`) açıkça yaz.
- Ondalık karşılaştırmalarda `assert.strictEqual` yerine bir tolerans
  yardımcısı kullan (kayan nokta hassasiyeti nedeniyle):
  ```ts
  const yaklasik = (a: number, b: number, tol = 0.01) =>
    assert.ok(Math.abs(a - b) <= tol, `beklenen ~${b}, bulunan ${a}`);
  ```
- Asgari test kapsamı:
  - En az bir "geçerli girdi → beklenen çıktı" senaryosu her ana girdi
    kombinasyonu için (ör. voltageDrop'ta hem mono hem tri).
  - "Eksik/geçersiz girdi → `ok: false`, `output: null`, `errors` dolu"
    senaryosu.
  - Varsa "limit aşımı → `warnings` dolu" senaryosu.
  - `examples.ts` içindeki her örneğin `calculate()` çıktısıyla senkron
    olduğunu doğrulayan bir döngü testi (örnekler ile gerçek motorun
    zamanla birbirinden sapmasını engeller).
  - Excel'den taşınan motorlarda: Excel'in kendi hesapladığı en az birkaç
    gerçek satırı doğrudan test girdisi/beklenen çıktısı olarak kullan.
- `npm test` tüm `tests/**/*.test.ts` dosyalarını çalıştırır; yeni test
  dosyası eklemek yeterlidir, ayrıca bir kayıt/konfigürasyon gerekmez.
