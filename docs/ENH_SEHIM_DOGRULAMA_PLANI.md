# ENH Sehim Hesabı — Doğrulama Planı (Sprint 5B)

**Bu dosya yalnızca dokümantasyondur. Bu sprintte formül değiştirilmedi,
UI hesap mantığı eklenmedi, yeni paket eklenmedi.** Amaç,
[`SagEngine`](../src/calculations/engines/enhMechanical/sag) motorunun
gerçek Excel/kitap doğrulamasına hazır hale gelmesi için gereken
altyapıyı ve planı belgelemektir — bkz.
[`sag/README.md`](../src/calculations/engines/enhMechanical/sag/README.md)
"Doğrulama Durumu" bölümü.

## ⚠️ Kaynak erişimi hakkında not

Bu plan, Excel dosyasının veya "Enerji Nakil Hatları Cilt 1/2"
kitaplarının **doğrudan içeriğine erişimim olmadan** hazırlandı. Aşağıdaki
"örnek senaryolar" bölümleri bu yüzden **doldurulacak şablonlardır** —
gerçek kaynak satırları elime geçtiğinde bu belge somut değerlerle
güncellenmelidir. Hiçbir yerde uydurma bir sayı/sonuç yazılmadı.

---

## 1. Doğrulanacak girdiler

`SagEngine.calculate()` beş girdi alır; her biri Excel/kitap
kaynağındaki karşılığıyla tek tek doğrulanmalıdır:

| Girdi | Açıklama | Doğrulanacak nokta |
| --- | --- | --- |
| `conductorType` | İletken tipi (merkezi ACSR kataloğu) | Excel'de kullanılan iletken kimliklerinin katalogdaki `ACSRConductor` kayıtlarıyla birebir eşleştiği. |
| `spanLengthM` | Açıklık (m) | Excel'in açıklığı aynı birimde (metre) mi aldığı, yoksa farklı bir birim mi kullandığı. |
| `iceRegion` | Buz bölgesi | `IceLoadEngine`'in `iceRegion` tanımının (1-5) Excel/kitaptaki bölge tanımıyla aynı olup olmadığı — bkz. `iceLoad/README.md`. |
| `tensionKg` | Çekme kuvveti (kg) | Excel'in çekme kuvvetini sabit bir girdi mi kabul ettiği, yoksa kendi içinde ayrıca mı hesapladığı (bu motor sabit kabul ediyor). |
| `loadCase` | Yük hali (`noIce`/`oneIce`/`doubleIce`) | Excel'in aynı üç yük halini mi ayırt ettiği, yoksa ek yük halleri (rüzgar+buz kombinasyonu vb.) olup olmadığı. |

Ayrıca **çıktı tarafında** doğrulanacaklar:

| Çıktı | Doğrulanacak nokta |
| --- | --- |
| `conductorWeightKgPerM`, `iceLoadKgPerM`, `totalLoadKgPerM` | `IceLoadEngine`'den miras — bkz. `iceLoad` doğrulama ihtiyaçları (henüz ayrı bir plan dosyası yok, `iceLoad/README.md`'deki "Gerçek veriye geçiş için gerekenler" listesine bakılmalı). |
| `sagM`, `sagCm`, `sagPercentOfSpan` | Bu planın asıl konusu — parabolik formülün Excel/kitap sonucuna ne kadar yakın düştüğü. |

## 2. Kullanılacak kaynaklar

1. **Excel dosyası** — projenin orijinal ENH mekanik hesap Excel'i
   (hangi sekme/sekmelerin sehim hesabı içerdiği netleştirilecek; bkz.
   `src/calculations/engines/enhMechanical/README.md`'deki Excel sekmesi
   analizi, henüz sehim'e özel bir sekme referansı yok — netleştirilecek).
2. **Enerji Nakil Hatları Cilt 1 / Cilt 2** — DHD ve sehim formüllerinin
   anlatıldığı bölüm(ler). Bölüm/sayfa numaraları netleştirilecek.
3. **Mevcut kod tabanı** — `IceLoadEngine`, `src/catalogs/conductors`
   (referans değerlerin tutarlılığı için).

## 3. Excel'den alınacak örnek senaryolar (şablon)

Aşağıdaki tablo doldurulacak; her satır Excel'in kendi hesapladığı bir
girdi/çıktı çiftidir. En az 5-10 satır hedeflenir (bkz. `sag/README.md`
madde 4).

| # | conductorType | spanLengthM | iceRegion | tensionKg | loadCase | Excel sagM | Excel sagCm | Not |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | *netleştirilecek* | | | | | | | |
| 2 | *netleştirilecek* | | | | | | | |
| … | | | | | | | | |

## 4. Kitaptan alınacak örnek senaryolar (şablon)

Kitapta çözülmüş örnek problemler varsa (ör. "örnek 4.2" gibi), aynı
formatta buraya taşınacak:

| # | Kitap / Bölüm / Sayfa | conductorType | spanLengthM | iceRegion | tensionKg | loadCase | Kitap sagM | Not |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | *netleştirilecek* | | | | | | | |

## 5. Uygulama sonucu ile Excel sonucu nasıl karşılaştırılacak

1. Yukarıdaki tablo (bölüm 3) doldurulduktan sonra, her satır için
   `SagEngine.calculate(input)` çağrılır.
2. `sonuc.output.sagM` / `sagCm` / `sagPercentOfSpan`, Excel'in aynı
   satırdaki değeriyle karşılaştırılır.
3. Karşılaştırma, mevcut test dosyasındaki (`tests/calculations/sag.test.ts`)
   "örnekler gerçek motor çıktısıyla senkron" testine benzer bir
   tolerans-tabanlı yardımcı (`yaklasik(a, b, tol)`) ile otomatikleştirilir
   — Excel satırları bu şekilde ayrı bir test dosyasına
   (`tests/calculations/sag.excelDogrulama.test.ts` gibi, henüz
   oluşturulmadı) eklenebilir.
4. Sapma toleransın üzerindeyse: önce girdi birimleri/varsayımları
   (metre/kg, buz bölgesi tanımı, çekme kuvveti kabulü) kontrol edilir;
   ardından formülün kendisi (parabolik vs. DHD farkı olası bir sebep)
   değerlendirilir.

## 6. Kabul toleransı önerisi

**Bu bir öneridir, kesin kabul kriteri değildir — mühendislik
onayı gerektirir.**

- Sehim (`sagM`/`sagCm`): **±%2 bağıl fark** öneriliyor (parabolik
  yaklaşımın küçük sehim/açıklık oranlarında beklenen sapma payı).
- Büyük açıklık/sehim oranlarında (README'de belirtilen katener
  farkının önemli hale geldiği durumlarda) tolerans dışına çıkan
  satırlar **hata değil, "parabolik yaklaşımın sınırı" olarak
  işaretlenmeli**, ayrı bir listede tutulmalı.
- `conductorWeightKgPerM`/`iceLoadKgPerM` sapmaları `IceLoadEngine`
  doğrulamasının kapsamındadır, bu planın kapsamı dışındadır.

## 7. Eksik bilgiler listesi

- Excel dosyasının hangi sekmesi/sekmeleri sehim hesabı içeriyor —
  **netleştirilecek**.
- Cilt 1/2'de sehim formülünün tam bölüm/sayfa referansı —
  **netleştirilecek**.
- Excel'in çekme kuvvetini (`tensionKg`) sabit bir girdi olarak mı
  aldığı, yoksa kendi içinde template/EDS (Every Day Stress) gibi bir
  yöntemle mi türettiği — **netleştirilecek**.
- Kitabın gerçek bir DHD çözümü içerip içermediği, içeriyorsa hangi
  ek girdileri (sıcaklık, elastisite modülü, ısıl genleşme katsayısı)
  gerektirdiği — **netleştirilecek**.
- Yukarıdaki bölüm 3 ve 4 tabloları için somut sayısal veri —
  **eksik, kaynak paylaşılmadan doldurulamaz**.
