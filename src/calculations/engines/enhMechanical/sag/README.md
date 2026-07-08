# sag — Sehim Hesabı (Sprint 5A, ÖN HESAP)

`enhMechanical` modülünün ilk Sehim (Sag) motoru. Bu motor, ileride
**DHD** (`degisikHallerDenklemi`), **Amax** (`amaxHesabi`), **Direk
Seçimi** (`betonDirekSecimi` ve gelecekteki `SteelPoleSelectionEngine`)
ve bir **Proje Asistanı** tarafından ortak olarak kullanılmak üzere
tasarlanmıştır (bkz.
[`docs/ENH_DIREK_SECIMI_ANALIZ.md`](../../../../../docs/ENH_DIREK_SECIMI_ANALIZ.md)).

## ⚠️ Bu bir ÖN HESAPTIR — gerçek DHD çözümü değildir

Bu motor **klasik parabolik yaklaşımı** kullanır: çekme kuvvetinin
açıklık boyunca sabit kaldığını varsayar. Gerçek bir Değişik Haller
Denklemi (DHD) çözümü şunları da hesaba katar ve **bu motorda YOKTUR**:

- Sıcaklık değişiminin iletken uzamasına/geriliminde etkisi.
- İletkenin elastik uzaması (elastisite modülü).
- Gerçek kablo sarkma eğrisi (katener/zincir eğrisi), parabol yalnızca
  küçük sehim/açıklık oranlarında iyi bir yaklaşımdır.

Hem `SagEngine.metadata`/`references` hem de UI ekranı bu durumu
kullanıcıya açıkça bildirir.

## Formül

```
sagM             = (totalLoadKgPerM × spanLengthM²) / (8 × tensionKg)
sagCm            = sagM × 100
sagPercentOfSpan = (sagM / spanLengthM) × 100
```

`totalLoadKgPerM`, seçilen `loadCase`'e göre belirlenir:

| loadCase | totalLoadKgPerM |
| --- | --- |
| `noIce` | çıplak iletken ağırlığı |
| `oneIce` | çıplak ağırlık + bir kat buz yükü |
| `doubleIce` | çıplak ağırlık + iki kat buz yükü |

## Buz yükü — IceLoadEngine üzerinden, yeniden hesaplanmaz

Bu motor buz yükünü **kendi başına hesaplamaz**. `engine.ts`,
[`../iceLoad`](../iceLoad)'daki `IceLoadEngine.calculate({ conductorType,
iceRegion })` çağrısını yapar ve dönen `conductorWeightKgPerM`,
`iceLoadKgPerM`, `doubleIceLoadKgPerM`, `totalWeightWithIceKgPerM`,
`totalWeightWithDoubleIceKgPerM` alanlarını doğrudan kullanır.

**Bu, `IceLoadEngine`'in kendi "KAYNAK DOĞRULAMASI GEREKLİ" uyarısının bu
motora da miras kaldığı anlamına gelir** — bkz.
[`../iceLoad/README.md`](../iceLoad/README.md). `pb = k√d` formülündeki
`k` katsayıları henüz doğrulanmamış yer tutuculardır; bu motorun
`oneIce`/`doubleIce` sonuçları da dolayısıyla ön hesap niteliğindedir.

## İletken verisi — merkezi katalog (dolaylı)

Bu motor kendi iletken kataloğuna erişmez; `IceLoadEngine` üzerinden
dolaylı olarak [`src/catalogs/conductors`](../../../../catalogs/conductors)'a
bağlanır (bkz. o klasörün README.md'si). `conductorWeightKgPerM`
çıktısı, katalogdaki `nominalWeightKgPerM` alanından gelir.

## Doğrulama Durumu (Sprint 5B)

`SagOutput.validationStatus` alanı her zaman `'preliminary'` döner ve
bu sprintte doğrulama altyapısı dışında **hiçbir hesap değiştirilmedi**.
Açıkça:

- Mevcut motor **parabolik ön hesaptır** — yukarıdaki "Bu bir ÖN
  HESAPTIR" bölümünde açıklanan sabit çekme kuvveti varsayımını kullanır.
- **DHD, sıcaklık ve gerilme etkileri henüz dahil değildir.**
- Bu motor, **Excel ve kitap örnekleriyle doğrulanmadan nihai
  mühendislik hesabı değildir.**

Doğrulama planı, karşılaştırılacak Excel/kitap senaryoları ve kabul
toleransı önerisi için bkz.
[`docs/ENH_SEHIM_DOGRULAMA_PLANI.md`](../../../../../docs/ENH_SEHIM_DOGRULAMA_PLANI.md).
Doğrulama tamamlanıp bu alan gerçek bir sonuca (ör. `'verified'`)
geçirilmeden `isDemo` `false` yapılmamalı ve UI'daki "Doğrulanmamış ön
hesap" etiketi kaldırılmamalıdır.

## Gerçek veriye geçiş için gerekenler

1. `IceLoadEngine`'in kendi "Gerçek veriye geçiş için gerekenler"
   listesinin tamamlanması (bkz. `../iceLoad/README.md`).
2. Gerçek DHD formülü (sıcaklık, elastik uzama, gerilme kontrolleri).
3. Parabolik yaklaşımın hangi açıklık/sehim aralığında yeterli
   doğrulukta olduğunun teyidi (büyük açıklıklarda katener farkı
   önemli hale gelebilir).
4. Excel'in kendi hesapladığı en az 5-10 gerçek girdi/çıktı satırı.

Bu dört madde tamamlanmadan `isDemo` alanı `false` yapılmamalı ve
UI'daki "ön hesap" uyarısı kaldırılmamalıdır.

## UI

[`app/hesaplayicilar/sehim.tsx`](../../../../../app/hesaplayicilar/sehim.tsx)
ekranı bu motoru kullanır. `enh-mekanik.tsx` ekranındaki "Sehim Hesabı"
kartı bu ekrana yönlendirir.

## Dokunulmayan

Bu sprintte `BetonDirekEngine`, `PoleForceEngine` ve `IceLoadEngine`'e
hiçbir değişiklik yapılmadı — `SagEngine`, `IceLoadEngine`'i yalnızca
**tüketir** (import edip çağırır), onu değiştirmez.
