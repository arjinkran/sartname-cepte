# iceLoad — Buz Yükü Hesabı (Sprint 4C, ÖN HESAP)

`enhMechanical` modülünün ortak buz yükü altyapısı. Bu motor, ileride
**Direk Kuvveti** ([`../poleForce`](../poleForce)), **Sehim**
(`sehimSerbest`/`sehimOzel`), **DHD** (`degisikHallerDenklemi`) ve
**Direk Seçimi** (`betonDirekSecimi` ve gelecekteki
`SteelPoleSelectionEngine`) tarafından ortak olarak kullanılmak üzere
tasarlanmıştır (bkz.
[`docs/ENH_DIREK_SECIMI_ANALIZ.md`](../../../../../docs/ENH_DIREK_SECIMI_ANALIZ.md)
bölüm 5 — "Buz yükü etkisi").

## ⚠️⚠️ KAYNAK DOĞRULAMASI GEREKLİ ⚠️⚠️

Bu motorun bölge katsayıları (`k`, [`data.ts`](./data.ts) →
`ICE_LOAD_COEFFICIENTS`) **gerçek bir kaynaktan alınmamıştır.** Kullanıcı
Excel'i veya "Enerji Nakil Hatları Cilt 1/2" bu k değerlerini
**henüz** sağlamadı. Şu anki değerler (0,01 – 0,05, bölge 1'den 5'e
kasıtlı olarak yuvarlak/artan) yalnızca `pb = k√d` formül **yapısının**
altyapıda uçtan uca çalıştığını göstermek için seçilmiştir.

**Bu değerler gerçek mühendislik verisi GİBİ SUNULMAMALI ve gerçek bir
proje kararı için KULLANILMAMALIDIR.** Hem `IceLoadEngine.metadata`/
`references` hem de UI ekranı bu durumu kullanıcıya açıkça bildirir.

## Formül

Kitapta görülen `pb = k√d` yapısına göre:

```
iceLoadKgPerM                  = k(iceRegion) × √(conductorDiameterMm)
totalWeightWithIceKgPerM       = conductorWeightKgPerM + iceLoadKgPerM
doubleIceLoadKgPerM            = 2 × iceLoadKgPerM
totalWeightWithDoubleIceKgPerM = conductorWeightKgPerM + doubleIceLoadKgPerM
```

- `d` = iletken çapı (mm) — merkezi katalogdan (`nominalDiameterMm`).
- `k` = buz bölgesine (1-5) göre katsayı — **kaynak doğrulaması gerekli**.
- "İki buz yükü" (`doubleIceLoadKgPerM`), bazı hesap senaryolarında
  (ör. asimetrik/kritik yük durumları) kullanılan basit bir 2× çarpanıdır;
  bu da kaynak doğrulaması gerektirir (gerçek "iki kat buz" durumunun
  fiziksel/normatif tanımı netleştirilecek).

## İletken verisi — merkezi katalog

Bu motor kendi iletken verisini TUTMAZ; `data.ts`'teki
`iletkenVerisiGetir()`, doğrudan
[`src/catalogs/conductors`](../../../../catalogs/conductors)'a bağlanır
(bkz. o klasörün README.md'si — "Bu katalog uygulamanın tek iletken veri
kaynağıdır"). `conductorDiameterMm` ve `conductorWeightKgPerM` çıktıları
katalogdan gelir, burada elle girilmez.

## Gerçek veriye geçiş için gerekenler

1. Gerçek buz yükü bölgesi (1-5) katsayı tablosu (Cilt 1/2 veya Excel).
2. `pb = k√d` formülünün kitaptaki tam hali — birim/katsayı ölçeği
   (`k`'nin birimi, `d`'nin cm mi mm mi olduğu) teyit edilmeli.
3. "İki buz yükü" kavramının kitaptaki/Excel'deki tam tanımı — şu an
   basit bir 2× çarpanı varsayılıyor, bu doğru olmayabilir.
4. Excel'in kendi hesapladığı en az 5-10 gerçek girdi/çıktı satırı
   (bkz. `modules/calculations/README.md` "Test yazma kuralları").

Bu dört madde tamamlanmadan `isDemo` alanı `false` yapılmamalı ve
UI'daki "ön hesap" uyarısı kaldırılmamalıdır.

## UI

[`app/hesaplayicilar/buz-yuku.tsx`](../../../../../app/hesaplayicilar/buz-yuku.tsx)
ekranı bu motoru kullanır. `enh-mekanik.tsx` ekranındaki "Buz Yükü
Hesabı" kartı bu ekrana yönlendirir.

## Dokunulmayan

Bu sprintte `BetonDirekEngine`'e ve `PoleForceEngine`'e hiçbir değişiklik
yapılmadı — `IceLoadEngine` tamamen bağımsız, ayrı bir motordur. İleride
bu motorlar `IceLoadEngine`'in çıktısını (kaynak doğrulandıktan sonra)
kullanacak şekilde genişletilecektir.
