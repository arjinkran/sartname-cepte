# ENH Direk Seçimi / Direk Hesabı Modülü — Kaynak Analizi (Sprint 3B)

**Bu dosya yalnızca dokümantasyondur. Bu sprintte kod yazılmadı, UI
değiştirilmedi, yeni paket eklenmedi.**

## ⚠️ Kaynak erişimi hakkında önemli not — lütfen önce bunu okuyun

Bu analiz, "Enerji Nakil Hatları Cilt 1" ve "Cilt 2" adlı kaynak
kitapların **doğrudan içeriğine erişimim olmadan** hazırlanmıştır. Bana bu
sprintte kitapların dosyaları/sayfaları verilmedi ve önceki sprintlerde de
paylaşılmamıştı.

Bu belgedeki bilgiler iki kaynaktan geliyor:

1. **Genel ENH (havai hat) mühendisliği pratiği** — direk sınıfları, kuvvet
   türleri, girdi kategorileri gibi konular Türkiye'de ve uluslararası
   literatürde (TEDAŞ şartnameleri, IEC/CIGRE havai hat tasarım pratiği)
   yaygın olarak kullanılan **standart terminoloji ve kavramlardır**; bir
   kitaba özgü değildir. Bunları "genel pratik" olarak işaretledim.
2. **Bu projenin mevcut kod tabanı** — özellikle
   [`src/calculations/engines/enhMechanical/README.md`](../src/calculations/engines/enhMechanical/README.md)
   ve
   [`src/calculations/engines/enhMechanical/betonDirek/README.md`](../src/calculations/engines/enhMechanical/betonDirek/README.md)
   dosyalarında zaten belgelenmiş olan Excel sekmesi/VBA fonksiyon
   analizi ve mevcut `BetonDirekEngine` tasarımı.

**Hiçbir yerde "Cilt 1, Bölüm X, Sayfa Y" gibi somut bir alıntı
yapmadım** çünkü bunu doğrulayamam — böyle bir referans verirsem
uydurma (halüsinasyon) olur. Bunun yerine her bölümde bir
**"📖 Kaynak durumu"** notu var: bilginin nereden geldiğini ve kitaplarla
karşılaştırılıp doğrulanması gerektiğini açıkça belirtiyor. Kitapların
gerçek içeriği elime geçtiğinde bu belge bölüm/sayfa referanslarıyla
güncellenmelidir.

**Bu belgede hiçbir sayısal katsayı, formül veya "tahmini" mühendislik
hesabı yoktur** (görevde açıkça yasaklandığı için). Eksik olan her tablo
veya değer **"netleştirilecek"** olarak işaretlenmiştir.

---

## 1. Direk sınıfları (fonksiyonel/görev bazlı)

📖 **Kaynak durumu:** Genel ENH pratiği (TEDAŞ ve uluslararası havai hat
terminolojisiyle örtüşür). Cilt 1/2'deki tam adlandırma, sınıflandırma
kriterleri ve olası ek alt sınıflar **netleştirilecek**.

| Direk sınıfı | Görevi | Tipik yük durumu |
| --- | --- | --- |
| **Taşıyıcı direk** | Düz hat kesiminde iletkeni asılı olarak taşır; iki komşu açıklık arasında gerilim farkı normalde küçüktür. | Ağırlıklı olarak düşey yük (iletken + donanım ağırlığı, rüzgar/buz eklenmiş). Yatay yük görece küçük. |
| **Köşe taşıyıcı direk** | Hat küçük bir sapma açısı yaptığında, hâlâ taşıyıcı (asma) tipte kalarak bu açıdan doğan bileşke yatay kuvveti de karşılar. | Düşey yük + açıdan doğan ek yatay bileşke kuvvet. |
| **Durdurucu direk** (gerilme/germe direği) | Hat gerilimini (mekanik çekme kuvvetini) tam olarak keser/durdurur; germe (strain) izolatörleriyle bağlanır. | İki taraflı tam çekme kuvveti (dengeli) veya bakım/arıza senaryosunda tek taraflı tam çekme. |
| **Köşe durdurucu direk** | Aynı anda hem sapma açısı hem de gerilim kesme görevi taşır — en ağır yüklenen direk sınıflarından biridir. | Açıdan doğan bileşke + tam çekme kuvveti birleşimi. |
| **Nihayet direği** | Hattın başlangıç/bitiş noktasında bulunur; yalnızca tek taraftan iletken çekme kuvveti alır (asimetrik). | Tam tek taraflı çekme kuvveti — genellikle en kritik yük durumu. |
| **Branşman direği** | Ana hattan bir kolun (branşmanın) ayrıldığı noktadadır; ana hat + branşman yönlerinden gelen asimetrik kuvvetleri taşır. | Çok yönlü/asimetrik bileşke kuvvet; branşman açısına ve iletken tipine bağlı. |

**Kod tabanı bağlantısı:** Mevcut `BetonDirekEngine`
([`src/calculations/engines/enhMechanical/betonDirek/`](../src/calculations/engines/enhMechanical/betonDirek))
bu sınıflandırmayı henüz **hiç modellemiyor** — yalnızca `kategori`
(devre/direk konfigürasyon tipi) ve açıklık/gerilim filtresi var. Bkz.
bölüm 4 ve 7.

---

## 2. Malzemeye göre direkler

📖 **Kaynak durumu:** Genel ENH pratiği. Cilt 1/2'deki malzeme sınıfları,
alt tipler (ör. demir direk için kafes/monoblok ayrımı) ve varsa güncel
kullanım kısıtları (ör. ağaç direğin artık yeni tesislerde kullanılıp
kullanılmadığı) **netleştirilecek**.

| Malzeme | Durum bu projede | Not |
| --- | --- | --- |
| **Beton direk** | Kısmen uygulandı (mock veri, `isDemo: true`) — bkz. `betonDirek/` | En yaygın modern OG/YG uygulaması. |
| **Demir direk** | Hiç uygulanmadı | Genellikle daha yüksek gerilim, daha uzun açıklık, kafes kule (lattice tower) veya çelik monoblok direk formunda. Katalog yapısı beton direkten farklı olabilir (bacak açıklığı, galvaniz sınıfı gibi ek alanlar gerekebilir — **netleştirilecek**). |
| **Ağaç direk** | Hiç uygulanmadı | Genellikle düşük gerilim/kısa açıklık, eski/geleneksel tesisler. Bu projenin kapsamında (OG/YG ENH) gerçekten gerekli mi, yoksa yalnızca tarihsel referans için mi isteniyor — **netleştirilecek**. |

---

## 3. Devre sayısına göre direkler

📖 **Kaynak durumu:** Genel ENH pratiği + mevcut kod tabanı
(`enhMechanical/types.ts` → `PoleType`).

| Tip | Mevcut kod karşılığı |
| --- | --- |
| Tek devre | `'tek-devre'` |
| Çift devre | `'cift-devre-cam'`, `'cift-devre-fici'` (bu ikisi aslında **devre sayısı değil, direk ailesi/malzeme alt tipi** ayrımı gibi görünüyor — bkz. aşağıdaki uyarı) |
| Çok devre | `'dort-devre'` (yalnızca 4 devre modellenmiş; "çok devre" genel bir üst kategori olarak eksik) |

⚠️ **Model tutarsızlığı tespiti:** Mevcut `PoleType`
([`enhMechanical/types.ts`](../src/calculations/engines/enhMechanical/types.ts))
devre sayısını (tek/çift/4) direk ailesi/malzemesiyle (ÇAM, FIÇI, SEK-D,
DEMIR) aynı enum içinde karıştırıyor — bu, Sprint 2C'de veri girişi
kolaylığı için yapılan bir basitleştirmeydi
([`betonDirek/README.md`](../src/calculations/engines/enhMechanical/betonDirek/README.md)'de
de "'demir' beton değildir" notuyla kısmen fark edilmişti). Direk seçimi
modülü tamamlanırken bu iki boyut (**devre sayısı** ve **direk
ailesi/malzemesi**) ayrı alanlara bölünmelidir (bkz. bölüm 9, "veri
modeli netleştirmesi").

---

## 4. Direk seçimini etkileyen girdiler

📖 **Kaynak durumu:** Görev tanımında verilen liste + mevcut kod tabanı
karşılaştırması.

| Girdi | Bu projede şu an | Not |
| --- | --- | --- |
| Hat gerilimi | ✅ Var (`voltageLevelKv`, 34.5/154 kV) | `betonDirek` içinde kullanılıyor (filtre). |
| İletken tipi | ✅ Var (`conductorType`, 5 tip) | Şu an filtrede kullanılmıyor, sadece doğrulanıp geri döndürülüyor. |
| Açıklık | ✅ Var (`spanLengthM`) | `betonDirek` içinde kullanılıyor (filtre + sınıflandırma). |
| **Sapma açısı** | ❌ Yok | Taşıyıcı / köşe taşıyıcı / köşe durdurucu ayrımı için **zorunlu**. Eşik değerleri (kaç dereceden itibaren "köşe" sayılır) **netleştirilecek**. |
| Buz bölgesi | ✅ Var (`iceRegion`, 1-5) | Şu an gerçek yük hesabına girmiyor, yalnızca doğrulanıp geri döndürülüyor. |
| Rüzgâr bölgesi | ✅ Var (`windZone`, 1-4 — bu proje içinde tanımlanmış, kitaptan doğrulanmadı) | Şu an gerçek yük hesabına girmiyor. Bölge sayısı/sınırları **netleştirilecek**. |
| Devre sayısı | 🟡 Kısmen var | Bkz. bölüm 3 — ayrı bir alana bölünmesi gerekiyor. |
| Direk malzemesi | ❌ Yok (yalnızca beton var) | Demir/ağaç eklendiğinde zorunlu bir seçim girdisi olacak. |
| Hat sonu / köşe / düz hat / branşman durumu | ❌ Yok | Bölüm 1'deki fonksiyonel sınıflandırmayı seçmek için gereken ana girdi. |
| **Up-lift durumu** | ❌ Yok | Çok eşitsiz açıklık/kot farkı olan hatlarda düşey yükün negatife dönmesi (direğin "kalkması") riski — ayrı bir kontrol motoru gerektirir (bkz. bölüm 8, `UpliftCheckEngine`). Tetikleme kriteri **netleştirilecek**. |
| Yol/demiryolu/geçiş durumu | ❌ Yok | Genellikle daha yüksek emniyet katsayısı / minimum yükseklik / özel izin gereksinimi getirir. Kesin kurallar **netleştirilecek**. |

---

## 5. Direğe gelen kuvvetler

📖 **Kaynak durumu:** Genel ENH pratiği (kuvvet **türleri** evrensel
mühendislik bilgisidir). **Kesin formüller, katsayılar ve sayısal
değerler bu belgede kasıtlı olarak verilmemiştir** — bunlar Cilt 1/2'den
veya kullanıcının Excel tablosundan alınmalıdır (görev tanımında
"tahmini mühendislik hesabı üretme" açıkça yasaklanmıştır).

### Düşey kuvvetler
- İletkenin öz ağırlığı (+ buz yükü eklenmiş ağırlığı)
- Direğin öz ağırlığı
- Travers, izolatör, donanım ağırlıkları
- Komşu açıklıklar arası kot/seviye farkından doğan düşey bileşen

### Yatay kuvvetler
- Rüzgârın iletken + direk + izolatör üzerindeki basıncından doğan kuvvet
- Sapma açısından doğan bileşke iletken çekme kuvveti (köşe direklerde)
- Dengesiz açıklık/kesik hat durumunda tek taraflı iletken çekme kuvveti
  (durdurucu/nihayet/branşman direklerde)

### Rüzgâr kuvveti
Rüzgâr bölgesine (basınç/hız), iletken çapına (buz kaplıysa artan
efektif çapa), açıklık uzunluğuna ve direk/izolatör maruz kalan alanına
bağlıdır. **Kesin formül ve rüzgâr bölgesi katsayı tablosu:
netleştirilecek.**

### Buz yükü etkisi
Buz bölgesine bağlı olarak iletken üzerinde birim uzunluk başına ek
ağırlık oluşturur (düşey yükü artırır) ve aynı zamanda efektif çapı
büyüttüğü için rüzgâr kuvvetini de dolaylı olarak artırır. **Kesin
formül ve buz bölgesi katsayı tablosu: netleştirilecek.**

### İletken çekme kuvveti
Direk tipine göre (taşıyıcı: dengeli/küçük fark; durdurucu/nihayet: tam
tek taraflı) direğe aktarılan mekanik gerilme kuvveti. `enhMechanical`
Excel analizinde bu konu `Tn`, `tnmax`, `tnT1`, `tnp1`,
`maxgerilmehali` fonksiyonlarıyla ilişkilendirilmiş görünüyor (bkz.
[`enhMechanical/README.md`](../src/calculations/engines/enhMechanical/README.md)
— fonksiyon anlamları henüz doğrulanmadı).

### Travers / izolatör / donanım ağırlıkları
Devre sayısına, gerilim seviyesine ve izolatör tipine (`liz` — izolatör
boyu, mevcut `insulatorLengthM` girdisiyle eşleşiyor) göre değişen sabit
ağırlık tabloları gerekir. **Tablo: netleştirilecek.**

---

## 6. Direk seçim karar ağacı

📖 **Kaynak durumu:** Bu ağaç, bölüm 1-4'teki sınıflandırmaların mantıksal
birleşimidir; **seçim mantığı** olduğu için (sayısal formül değil)
görev tanımındaki "tahmini hesap üretme" kısıtına girmez. Eşik değerleri
(sapma açısı sınırları, up-lift tetikleme kriteri) yine de
**netleştirilecek** olarak işaretlenmiştir.

```
1) Hat üzerindeki konum nedir?
   ├─ Düz hat, sapma açısı yok
   │    └─ → Taşıyıcı direk adayı
   ├─ Düz hat, küçük sapma açısı (eşik: netleştirilecek)
   │    └─ → Köşe taşıyıcı direk adayı
   ├─ Büyük sapma açısı VEYA gerilimin kesilmesi gerekiyor
   │    ├─ Sapma açısı da varsa → Köşe durdurucu direk adayı
   │    └─ Sapma açısı yoksa   → Durdurucu direk adayı
   ├─ Hattın başlangıcı/bitişi
   │    └─ → Nihayet direği (zorunlu)
   └─ Branşman ayrım noktası
        └─ → Branşman direği (zorunlu)

2) Devre sayısı kaçtır? (tek / çift / çok devre)
   └─ Aday direk ailesini bu boyutta daraltır (bkz. bölüm 3'teki
      model tutarsızlığı notu — devre sayısı ayrı bir girdi olmalı).

3) Hat gerilimi + açıklık + iletken tipine göre katalog filtresi
   └─ Mevcut BetonDirekEngine'deki temel filtre mantığına benzer
      (kategori eşleşmesi + maxAçıklık kontrolü + gerilim uygunluğu).

4) Direk malzemesi tercihi/zorunluluğu var mı?
   (proje şartnamesi, geçiş türü, maliyet)
   └─ Beton / Demir / Ağaç arasında seçimi daraltır.

5) Up-lift riski var mı? (çok eşitsiz açıklık/kot farkı — eşik: netleştirilecek)
   ├─ Evet → UpliftCheckEngine ile ayrı kontrol ZORUNLU;
   │          geçemeyen adaylar elenir veya özel donanım gerekir.
   └─ Hayır → Bu kontrol atlanır.

6) Yol/demiryolu/başka bir hat geçişi var mı?
   ├─ Evet → Daha yüksek emniyet katsayısı / minimum yükseklik
   │          kısıtı devreye girer (kesin değerler: netleştirilecek).
   └─ Hayır → Standart emniyet katsayısı kullanılır.

7) Kalan adaylar arasında emniyet oranına göre sınıflandırma
   └─ uygun / kritik / uygunsuz (mevcut BetonDirekEngine algoritmasının
      genelleştirilmiş hali — bkz. betonDirek/engine.ts).
```

---

## 7. Uygulama modülü tasarımı

📖 **Kaynak durumu:** Mevcut mimari desenlerin (bkz.
[`modules/calculations/README.md`](../modules/calculations/README.md))
bu yeni kapsam üzerine tasarım olarak genişletilmesi — kod yazılmadı,
yalnızca tasarım anlatımı.

- **Direk tipi seçici** — Bölüm 6'daki karar ağacının orkestrasyon
  katmanı. Kullanıcı girdilerini (bölüm 4) alır, önce fonksiyonel sınıfı
  (taşıyıcı/köşe/durdurucu/nihayet/branşman) ve devre sayısını belirler,
  sonra malzemeye özgü motora (beton/demir) devreder.
- **Beton direk seçimi** — mevcut `BetonDirekEngine`; fonksiyonel
  sınıf farkındalığı eklenerek genişletilecek (ör. yalnızca "durdurucu"
  sınıfa uygun direkler filtrelenmeli).
- **Demir direk seçimi** — beton direkle paralel, ama demire özgü katalog
  alanlarıyla (bacak açıklığı, kule tipi, galvaniz sınıfı gibi —
  **netleştirilecek**) yeni bir motor.
- **Köşe/durdurucu kontrolü** — seçilen adayın, sapma açısından/tam
  çekmeden doğan bileşke kuvveti karşılayıp karşılayamadığını kontrol
  eder (gerçek kuvvet hesabı `PoleForceEngine`'den gelir).
- **Up-lift kontrolü** — seçilen adayın düşey yükünün hiçbir açıklıkta
  negatife dönmediğini doğrular; aksi halde aday elenir veya özel
  donanım/işaretleme gerektirir.
- **Açıklık/açı uygunluk kontrolü** — mevcut `betonDirek`'teki açıklık
  filtresinin genelleştirilmiş hali; artık sapma açısını da (direğin
  rated açı kapasitesiyle karşılaştırarak) kapsayacak.

---

## 8. Hesap motorları

📖 **Kaynak durumu:** Görev tanımında adları verilen 7 motorun bu
projenin mevcut `CalculationEngine` mimarisi ([`src/calculations/core/types.ts`](../src/calculations/core/types.ts))
içindeki rolü — kod yazılmadı.

| Motor | Rolü | Bağımlılıkları |
| --- | --- | --- |
| **PoleTypeSelectorEngine** | Üst düzey orkestratör: girdilerden (bölüm 4) fonksiyonel direk sınıfını ve devre sayısını belirler, uygun malzeme motoruna yönlendirir. Mevcut `EnhMechanicalEngine` dispatcher desenine benzer ama direk seçimine özel. | `ConcretePoleSelectionEngine`, `SteelPoleSelectionEngine` |
| **ConcretePoleSelectionEngine** | Mevcut `BetonDirekEngine`'in evrimi; fonksiyonel sınıf + malzeme + emniyet filtresini birlikte uygular. | `PoleForceEngine` (gerçek kuvvet/moment değerleri için), katalog verisi (`data.ts`) |
| **SteelPoleSelectionEngine** | Demir direk için `ConcretePoleSelectionEngine`'in paraleli. İlk sürümde iskelet (notImplemented) olarak başlaması önerilir (bkz. bölüm 10, 11). | `PoleForceEngine`, demir direk katalog verisi |
| **PoleForceEngine** | **Çekirdek fizik motoru** — rüzgar kuvveti, buz yükü, düşey/yatay bileşke kuvvet ve direk tabanındaki momenti gerçekten hesaplar. Şu an **hiçbir yerde yok**; mevcut `BetonDirekEngine`'deki "güvenlik oranı" yalnızca basit bir açıklık oranı vekilidir, gerçek kuvvet/moment değildir. Diğer tüm motorlar gerçek yük değerleri için buna bağımlı olacaktır. | Rüzgar/buz katsayı tabloları, iletken verisi (mevcut `ampacityOG` modülündeki iletken kataloğuyla ilişkilendirilebilir) |
| **CornerPoleCheckEngine** | Sapma açısı + iletken çekme kuvvetinden doğan bileşke yatay kuvvetin, adayın rated kapasitesi içinde olup olmadığını kontrol eder. | `PoleForceEngine` |
| **UpliftCheckEngine** | Açıklık/kot profiline göre düşey yükün negatife dönüp dönmediğini (direğin "kalkma" riski) kontrol eder. | `PoleForceEngine`, açıklık kot/profil verisi (şu an hiç toplanmıyor — **netleştirilecek**) |
| **DeadEndPoleCheckEngine** | Durdurucu/nihayet/branşman direklerindeki tam (asimetrik) tek taraflı çekme kuvvetini kontrol eder — genellikle en kritik yük senaryosu. | `PoleForceEngine` |

---

## 9. Veri tabloları

📖 **Kaynak durumu:** Aşağıdaki tablo, hangi verinin nereden geleceğini
ve şu an ne durumda olduğunu özetler.

| Tablo/veri | Şu an durumu | Kaynağı |
| --- | --- | --- |
| Gerçek beton direk kataloğu | Mock (8 kayıt) | Cilt 1/2 + kullanıcı Excel'i — **netleştirilecek** |
| Demir direk kataloğu | Hiç yok | Cilt 1/2 + kullanıcı Excel'i — **netleştirilecek** |
| Ağaç direk kataloğu | Hiç yok | Kapsam dahi belirsiz — **netleştirilecek** (bkz. bölüm 2) |
| Rüzgâr bölgesi katsayı/basınç tablosu (1-4) | Hiç yok — bölge numaraları bile bu projede tahmini seçildi | Cilt 1/2 — **netleştirilecek** |
| Buz yükü bölgesi katsayı tablosu (1-5) | Hiç yok | Cilt 1/2 — **netleştirilecek** |
| İletken rüzgar yüzey alanı / buz kaplı efektif çap verisi | Kısmen var (iletken çapı `ampacityOG` modülünde mevcut) ama rüzgar/buz hesabına özgü katsayılar yok | Mevcut `ampacityOG` katalog verisiyle ilişkilendirilecek + Cilt 1/2'den ek katsayılar — **netleştirilecek** |
| Sapma açısı eşik tabloları (taşıyıcı/köşe/köşe durdurucu sınırları) | Hiç yok | Cilt 1/2 — **netleştirilecek** |
| Emniyet katsayısı standartları (durum bazlı: normal/geçiş/kesişim) | Yalnızca kullanıcının serbestçe girdiği tek bir sayı var (`safetyFactor`), standart bir tablo yok | Cilt 1/2 veya ilgili yönetmelik — **netleştirilecek** |
| Yol/demiryolu geçiş minimum yükseklik + emniyet gereksinimleri | Hiç yok | Cilt 1/2 veya ilgili yönetmelik — **netleştirilecek** |
| Devre sayısı/gerilime göre travers-izolatör-donanım ağırlık tablosu | Hiç yok | Cilt 1/2 + kullanıcı Excel'i — **netleştirilecek** |
| `suitableVoltageLevels` (direk başına izinli gerilim seviyeleri) | Mock/tahmini (mevcut `betonDirek/data.ts`) | Cilt 1/2 + kullanıcı Excel'i — **netleştirilecek** |

**`data.ts`'e aktarılması gereken minimum tablo seti** (öncelik sırasıyla):
1. Gerçek beton direk kataloğu (mevcut mock'un yerine)
2. Rüzgâr + buz bölgesi katsayı tabloları (PoleForceEngine'in ön koşulu)
3. Sapma açısı eşik tabloları (PoleTypeSelectorEngine'in ön koşulu)
4. Emniyet katsayısı standartları
5. Demir direk kataloğu
6. Travers/izolatör/donanım ağırlık tablosu
7. Yol/demiryolu geçiş gereksinimleri

---

## 10. MVP kapsamı

**Soru:** İlk çalışan sürümde sadece seçim mantığı mı olacak, yoksa
kuvvet/moment hesabı da dahil mi olacak?

**Analiz/öneri (nihai karar değil):**

Mevcut `BetonDirekEngine` zaten bu sorunun cevabını fiilen vermiş
durumda: **yalnızca seçim/filtreleme mantığı**, gerçek kuvvet/moment
hesabı yok (`betonDirek/README.md`'de açıkça "Henüz GERÇEK moment/kuvvet
fizik hesabı yapılmıyor" diye işaretli). Bu tutarlılığın korunması
öneriliyor, çünkü:

- `PoleForceEngine`'in gerçek formülleri Cilt 1/2'den veya Excel'den
  gelmeden yazılırsa, görev tanımında yasaklanan "tahmini mühendislik
  hesabı" ortaya çıkar — bu, sahada yanlış direk seçimine yol açabilecek
  bir risktir.
- Seçim/sınıflandırma mantığı (fonksiyonel sınıf, devre sayısı, malzeme,
  açıklık/gerilim filtresi) kaynak formülüne bağlı değildir — genel
  mühendislik pratiğiyle güvenle tasarlanabilir ve test edilebilir.

Bu nedenle önerilen MVP kapsamı:
- ✅ `PoleTypeSelectorEngine` (fonksiyonel sınıf + devre sayısı seçimi)
- ✅ `ConcretePoleSelectionEngine` (mevcut `BetonDirekEngine`'in
  genişletilmiş hali — hâlâ mock veri + basit oran sınıflandırması)
- ✅ `SteelPoleSelectionEngine` (iskelet, notImplemented — Sprint 2C'deki
  `enhMechanical` deseniyle aynı)
- ❌ `PoleForceEngine`, `CornerPoleCheckEngine`, `UpliftCheckEngine`,
  `DeadEndPoleCheckEngine` — bunlar gerçek kuvvet/moment fiziğine
  bağımlı olduğu için, kaynak veriler netleşmeden **iskelet olarak bile
  eklenmemeli** ya da yalnızca girdi doğrulaması yapan boş iskelet olarak
  eklenip UI'da "aktif değil" gösterilmelidir (mevcut `enh-mekanik.tsx`
  desenine benzer).

Bu bir öneridir; nihai kapsam kararı, Cilt 1/2 ve Excel kaynaklarının ne
zaman/ne ölçüde erişilebilir olacağına göre değişebilir.

---

## 11. Sonraki sprint planı (önerilen 6 alt sprint)

1. **Sprint 3C — Fonksiyonel sınıflandırma altyapısı**
   `sapma açısı`, `hat konumu` (taşıyıcı/köşe/durdurucu/nihayet/branşman),
   `devre sayısı` (ayrı alan olarak) girdi tiplerini ekle;
   `PoleTypeSelectorEngine`'i mevcut `enhMechanical` iskelet deseniyle
   (girdi doğrulama çalışır, sonuç `notImplemented`) oluştur. Kod yazımı
   gerektirir; gerçek eşik değerleri hâlâ netleştirilecek olarak
   işaretli kalır.

2. **Sprint 3D — Demir Direk Seçimi iskeleti**
   `steelPole/` klasörünü (`betonDirek/` ile aynı dosya deseni: types,
   data, engine, examples, README) mock veriyle oluştur;
   `SteelPoleSelectionEngine` başlangıçta yalnızca doğrulama +
   `notImplemented` veya `betonDirek` düzeyinde basit filtre/sınıflandırma
   yapabilir.

3. **Sprint 3E — Kontrol motorları iskeleti**
   `CornerPoleCheckEngine`, `DeadEndPoleCheckEngine`, `UpliftCheckEngine`
   için girdi tipleri ve doğrulama iskeletini kur (hepsi `notImplemented`
   döner). Bu sprintte gerçek kuvvet hesabı yapılmaz.

4. **Sprint 3F — Kaynak veri toplama ve doğrulama**
   Cilt 1/2 ve kullanıcı Excel'i üzerinden bölüm 9'daki tabloların
   (rüzgar/buz katsayıları, sapma açısı eşikleri, emniyet katsayısı
   standartları, gerçek direk katalogları) çıkarılması — bu bir
   **kod sprinti değil, veri/analiz sprintidir** (bu belge gibi).

5. **Sprint 3G — PoleForceEngine ve gerçek fizik**
   Sprint 3F'de toplanan gerçek formül/katsayılarla `PoleForceEngine`
   yazılır; `CornerPoleCheckEngine`, `UpliftCheckEngine`,
   `DeadEndPoleCheckEngine` gerçek hesaba bağlanır. Bu sprint **kesinlikle
   Sprint 3F'nin tamamlanmasına bağlıdır** — kaynak veri olmadan
   başlatılmamalıdır.

6. **Sprint 3H — Gerçek veri geçişi ve UI birleştirme**
   `ConcretePoleSelectionEngine` ve `SteelPoleSelectionEngine`'deki mock
   kataloglar gerçek verilerle değiştirilir, `isDemo` bayrakları
   kapatılır, `examples.ts` dosyaları kaynağın kendi hesapladığı gerçek
   satırlarla güncellenir; `app/hesaplayicilar/` altında tek bir
   "Direk Seçimi" akışı, `PoleTypeSelectorEngine` üzerinden tüm
   malzeme/sınıf kombinasyonlarını kapsayacak şekilde tasarlanır (mevcut
   ayrı `beton-direk.tsx` ekranının yerini alabilir veya onu genişletebilir).

---

## Özet — Netleştirilmesi gereken tüm noktaların listesi

Hızlı referans için, bu belgede "netleştirilecek" olarak işaretlenen tüm
kalemler:

- Direk sınıflarının Cilt 1/2'deki tam adlandırması ve sınıflandırma
  kriterleri
- Demir/ağaç direk alt tipleri ve ağaç direğin bu kapsamda gerekip
  gerekmediği
- Devre sayısı ile direk ailesi/malzemesinin veri modelinde ayrılması
- Sapma açısı eşik değerleri (taşıyıcı/köşe taşıyıcı/köşe durdurucu sınırı)
- Rüzgâr bölgesi sayısı, sınırları ve basınç/katsayı tablosu
- Buz yükü bölgesi katsayı tablosu
- Up-lift durumunun tetikleme kriteri ve gereken açıklık/kot profil verisi
- Yol/demiryolu/geçiş durumunun getirdiği kesin emniyet/yükseklik kuralları
- Rüzgâr kuvveti ve buz yükü formülleri
- İletken çekme kuvveti formülü (muhtemelen `Tn`/`tnmax`/`tnT1`/`tnp1`
  fonksiyonlarıyla ilişkili — anlamları doğrulanacak)
- Travers/izolatör/donanım ağırlık tabloları
- Emniyet katsayısı standartları (durum bazlı) ve mevcut
  `BETON_DIREK_UYGUN_ESIK_ORANI` (1.15) değerinin gerçek bir standartla
  değiştirilip değiştirilmeyeceği
- Gerçek beton direk kataloğu (mevcut 8 kayıtlık mock'un yerine)
- Demir direk kataloğu
- Her direk için gerçek `suitableVoltageLevels`
