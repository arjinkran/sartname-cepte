# betonDirek — Beton Direk Seçimi (Sprint 3A)

`enhMechanical` modülünün ilk **gerçek** hesabı. Genel modül mimarisi için
[`../README.md`](../README.md) ve
[`modules/calculations/README.md`](../../../../../modules/calculations/README.md)'e bakın.

## Ne yapıyor

Kullanıcının girdiği **hat gerilimi, direk tipi (kategori), rüzgar bölgesi,
buz bölgesi, açıklık, iletken tipi ve emniyet katsayısına** göre
[`data.ts`](./data.ts) içindeki direk kataloğunu filtreler ve
uygun / kritik / uygunsuz olarak sınıflandırır:

1. **Temel filtre** — `kategori === poleType`, `maxAcikinlikM >= spanLengthM`,
   `suitableVoltageLevels` içinde `voltageLevelKv` var mı?
2. **Sınıflandırma** — `guvenlikOrani = maxAcikinlikM / (spanLengthM × safetyFactor)`:
   - `>= 1.15` (bkz. `BETON_DIREK_UYGUN_ESIK_ORANI`) → **uygun**
   - `1.0 – 1.15` → **kritik**
   - `< 1.0` → **uygunsuz**
3. **Sonuç** — uygun adaylar arasından en küçük (en ekonomik, nominal
   momenti en düşük) direk **Önerilen Direk**; kalan uygun adaylar
   **Alternatif Direkler**; kritik + uygunsuz adaylar **Kritik Uyarılar**.
4. Hiçbir aday temel filtreyi geçemezse: `onerilenDirek: null`, boş
   diziler, `ok: true` ve `NO_SUITABLE_POLE` uyarısı (bu bir hata değil,
   geçerli bir "sonuç yok" durumudur).

## ⚠️ Henüz yapılmayan

- **Gerçek eğilme momenti hesabı yok.** Rüzgar bölgesi (`windZone`) ve buz
  bölgesi (`iceRegion`) şu an yalnızca doğrulanıp `kullanilanParametreler`
  içinde geri döndürülüyor; iletken üzerindeki gerçek rüzgar/buz yükünü ve
  bundan doğan devrilme momentini **hesaplamıyor**.
- `iletkenTipi` de aynı şekilde henüz yük hesabına dahil edilmiyor.
- Direk kataloğu (`BETON_DIREK_KATALOG`) **mock veridir** — gerçek TEDAŞ/
  Enerji Nakil Hatları Cilt 1 kataloğu ve kullanıcının sağlayacağı Excel
  tablosuyla birebir değiştirilecektir.
- `suitableVoltageLevels` alanı, 9 alanlık temel katalog şemasına (id, kod,
  yükseklik, nominalMoment, tepeKuvveti, ağırlık, gömülmeDerinliği,
  maxAçıklık, kategori) ek olarak, gerilim filtresinin çalışabilmesi için
  eklenmiş pratik bir alandır.

## Dosyalar

- `types.ts` — `BetonDirek` (katalog satırı), `BetonDirekInput`,
  `BetonDirekOutput`, `BetonDirekAday`, sınıflandırma tipi.
- `data.ts` — katalog (`BETON_DIREK_KATALOG`), doğrulama listeleri
  (gerilim/rüzgar/buz/iletken/kategori) ve `BETON_DIREK_UYGUN_ESIK_ORANI`
  eşiği. **Tüm sabit değerler burada.**
- `engine.ts` — `hesapla()` + `BetonDirekEngine` (`CalculationEngine`).
- `examples.ts` — 3 örnek senaryo (uygun, kritik uyarılı, boş sonuç);
  `tests/calculations/betonDirek.test.ts` bunların motorla senkron
  kaldığını doğrular.

## UI

[`app/hesaplayicilar/beton-direk.tsx`](../../../../../app/hesaplayicilar/beton-direk.tsx)
ekranı bu motoru kullanır. `enh-mekanik.tsx` ekranındaki "Beton Direk
Seçimi" kartı artık bu ekrana yönlendirir; diğer 5 alt hesap kartı hâlâ
[`../engine.ts`](../engine.ts)'teki genel `notImplemented` davranışını
kullanır (pasif kalmaya devam eder).
