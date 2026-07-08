# poleForce — Direk Kuvvet Hesabı (Sprint 4A, ÖN HESAP)

`enhMechanical` modülünün direk seçimi için gerekli ilk **kuvvet hesabı**
altyapısıdır. Genel modül mimarisi için [`../README.md`](../README.md) ve
[`modules/calculations/README.md`](../../../../../modules/calculations/README.md)'e
bakın. Direk seçimi modülünün genel yol haritası için
[`docs/ENH_DIREK_SECIMI_ANALIZ.md`](../../../../../docs/ENH_DIREK_SECIMI_ANALIZ.md)
(bölüm 5 ve 8, `PoleForceEngine`) belgesine bakın.

## ⚠️ Bu bir ÖN HESAPTIR — gerçek mühendislik hesabı değildir

Bu motor, direk seçimi için gerçekten ihtiyaç duyulan **moment/mukavemet**
hesabını yapmaz. Yalnızca basitleştirilmiş, kasıtlı olarak yaklaşık bir
düşey/yatay kuvvet tahmini üretir — amaç, ileride gerçek formüller
eklendiğinde üzerine inşa edilecek **çalışan bir altyapı** kurmaktır.
Hem `engine.ts` içindeki `PoleForceEngine.metadata.description` hem de
UI ekranı bu uyarıyı kullanıcıya gösterir:

> "Bu hesap ön mühendislik hesabıdır. Nihai direk seçimi için resmi
> katalog, moment hesabı ve proje kriterleri esas alınmalıdır."

## Kullanılan basitleştirilmiş formüller

```
ortalamaAcikilkM       = (spanLeftM + spanRightM) / 2
verticalForceKg        = iletken.nominalWeightKgPerM × ortalamaAcikilkM + equipmentWeightKg
tahminiCekmeKuvveti    = iletken.breakingLoadKg × POLE_FORCE_TENSION_RATIO (0,20 — bkz. data.ts)
angleForceKg           = 2 × tahminiCekmeKuvveti × sin(deviationAngleDeg / 2)
horizontalWindForceKg  = (iletken.nominalDiameterMm / 1000) × ortalamaAcikilkM × rüzgarKatsayısı (bkz. WIND_REGION_COEFFICIENTS)
totalHorizontalForceKg = horizontalWindForceKg + angleForceKg
resultantForceKg       = √(verticalForceKg² + totalHorizontalForceKg²)
designForceKg          = resultantForceKg × safetyFactor
```

`iceRegion` ve `poleFunction` şu an **sayısal hesaba dahil değildir** —
yalnızca doğrulanır ve (poleFunction için) mantıksal tutarlılık
uyarıları üretir (ör. "köşe" görevli bir direkte sapma açısı 0° ise
uyarı verir). Bu, `enhMechanical` ve `betonDirek` motorlarında daha önce
kurulan "topla ama henüz hesaba katma" desenini izler.

## ⚠️ Yer tutucu sabitler (data.ts) — gerçek değil

| Sabit | Değer | Not |
| --- | --- | --- |
| `POLE_FORCE_TENSION_RATIO` | 0,20 | Gerçek işletme gerilmesi (EDS) yerine geçen kaba bir tahmin. |
| `WIND_REGION_COEFFICIENTS` | {1:40, 2:60, 3:80, 4:100} | Gerçek rüzgar basıncı/hız tablosu yerine geçen kaba bir tahmin. |

## İletken verisi — mevcut katalogla bağlantı

`data.ts`, kendi iletken verisini KOPYALAMAZ; doğrudan
[`../../ampacityOG/data.ts`](../../ampacityOG/data.ts) içindeki
`AMPACITY_CONDUCTORS`'a bağlanır (`iletkenVerisiGetir()`). Bu motorun
`conductorType` alanı (`'3-awg'`, `'1-0-awg'`, ... — `betonDirek` ile
aynı AWG/MCM kimlik şeması) ile `ampacityOG`'un kuş adı kimlikleri
(`'swallow'`, `'raven'`, ...) arasındaki eşleme `data.ts` içindeki
`CONDUCTOR_TYPE_TO_AMPACITY_ID` sabitinde tutulur.

## Gerçek veriye geçiş için gerekenler

1. Gerçek rüzgar bölgesi basınç/hız tablosu (Cilt 1/2).
2. Gerçek buz yükü bölgesi tablosu ve bunun düşey/yatay yüke nasıl
   dahil edileceği (şu an `iceRegion` hesaba hiç girmiyor).
3. Gerçek işletme gerilmesi (EDS) yöntemi — `POLE_FORCE_TENSION_RATIO`
   yerine geçecek.
4. `poleFunction`'ın gerçek kuvvet hesabına nasıl dahil olacağı (şu an
   yalnızca tutarlılık uyarısı üretiyor, sayısal hesaba girmiyor).
5. Excel'in kendi hesapladığı en az 5-10 gerçek girdi/çıktı satırı
   (bkz. `modules/calculations/README.md` "Test yazma kuralları").

Bu beş madde tamamlanmadan `isDemo` alanı `false` yapılmamalı ve
UI'daki "ön hesap" uyarısı kaldırılmamalıdır.

## UI

[`app/hesaplayicilar/direk-kuvvet.tsx`](../../../../../app/hesaplayicilar/direk-kuvvet.tsx)
ekranı bu motoru kullanır. `enh-mekanik.tsx` ekranındaki "Direk Kuvvet
Hesabı" kartı bu ekrana yönlendirir.

## Dokunulmayan

Bu sprintte **`BetonDirekEngine`'e hiçbir değişiklik yapılmadı** —
`PoleForceEngine` tamamen bağımsız, ayrı bir motordur. İleride
`ConcretePoleSelectionEngine`/`CornerPoleCheckEngine` gibi motorlar bu
motorun çıktısına (gerçek formüller eklendikten sonra) bağımlı olacaktır
(bkz. docs/ENH_DIREK_SECIMI_ANALIZ.md bölüm 8).
