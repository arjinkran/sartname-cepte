# Şartname Cepte v0.3 — Kurulum ve Sorun Giderme

Bu sürümün tek hedefi: **Expo Go'da hatasız açılmak.** Bağımlılıklar
Expo'nun resmi router şablonu seviyesine indirildi (aşağıda "Neler
değişti" bölümüne bak).

## Temiz kurulum (Windows)

Zip'i çıkart, terminalde proje klasörüne gir ve sırasıyla:

```
rmdir /s /q node_modules
del package-lock.json
npm install
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

(İlk iki komut, eski kurulumdan klasör kaldıysa içindir; yeni çıkartılmış
temiz klasörde hata verirse önemseme, devam et.)

QR kodu telefonla okut. Aynı Wi-Fi şart; olmuyorsa
`npx expo start --tunnel`.

## ÖNEMLİ: Telefondaki Expo Go sürümünü kontrol et

Bu hatayı iki farklı projede de alman, sorunun **telefondaki Expo Go'nun
eski olma ihtimalini** güçlendiriyor. Eski Expo Go'nun içindeki eski
Hermes motoru, SDK 54'ün ürettiği modern JavaScript'i (private class
alanları) tanımaz ve tam olarak şu hatayı verir:
`SyntaxError: private properties are not supported`

Kontrol:

1. iPhone'da **App Store → Expo Go** → "Güncelle" düğmesi varsa güncelle.
2. En temizi: **Expo Go'yu tamamen sil, App Store'dan yeniden yükle.**
3. Expo Go'yu aç; ana ekranda desteklenen SDK yazar — **SDK 54**
   görünmeli. SDK 52/53 yazıyorsa uygulama güncellenememiş demektir.
4. App Store güncelleme göstermiyorsa telefonun iOS sürümü çok eski
   olabilir (SDK 54 için güncel Expo Go, güncel bir iOS ister —
   Ayarlar → Genel → Yazılım Güncelleme'ye bak).

Telefon güncellenemiyorsa söyle; Android cihazla test veya development
build gibi alternatif yollar var, birlikte bakarız.

## Neler değişti (v0.2 → v0.3)

Hata "private class properties" tarzı modern sözdiziminden geldiği için
bunu üretebilecek/taşıyabilecek her paket çıkarıldı:

| Paket | Durum | Not |
|---|---|---|
| nativewind + tailwindcss (+ react-native-css-interop) | **Kaldırıldı** | UI, StyleSheet'e dönüştürüldü — görünüm aynı |
| react-native-reanimated + worklets | **Kaldırıldı** | Yalnızca NativeWind için gerekiyordu |
| @tanstack/react-query | **Kaldırıldı** | v5 çıktısı native `#private` alanlar içerir — baş şüphelilerden |
| @supabase/supabase-js (+ async-storage, url-polyfill) | **Kaldırıldı** | Modern sözdizimi içerir; şu an işlevsel kullanımı yoktu (stub bırakıldı) |
| react-native-purchases (RevenueCat) | **Kaldırıldı** | Native modül, Expo Go'da zaten çalışamaz; `src/lib/revenuecat.ts` tam mock — hiçbir yerde import edilmiyor |
| @react-navigation/* | Projede doğrudan yok | expo-router'ın iç bağımlılığı; Expo Go uyumlu |
| lucide-react-native, react-native-svg | Projede hiç yoktu | — |
| babel.config.js / metro.config.js | **Silindi** | Expo varsayılanları kullanılıyor (SDK 54 uyumlu) |

Kalan bağımlılıklar yalnızca resmi şablon paketleri: expo, expo-router,
expo-constants, expo-linking, expo-status-bar, react, react-native,
react-native-safe-area-context, react-native-screens.

Supabase / RevenueCat / React Query, ilgili faza gelince (içerik
güncelleme, satın alma) development build ile birlikte geri eklenecek —
ekran kodları stub arayüzünü kullandığı için değişiklik gerektirmeyecek.

## Testler

```
npm test            → tüm birim testleri (tests/ altında, alt klasörler dahil)
npm run typecheck   → TypeScript tip kontrolü
```

## Klasör yapısı

```
sartname-cepte/
├── app/                          ← Rotalar (Expo Router: dosya = rota)
│   ├── _layout.tsx               ← Kök yerleşim + açılış uyarısı
│   ├── index.tsx                 ← Ana ekran (7 modül kartı)
│   ├── sartname/                 ← İnce rota dosyaları → modules/mevzuat/screens'e re-export
│   ├── enh-bilgi/                ← İnce rota dosyaları → modules/enhBilgi/screens'e re-export
│   └── hesaplayicilar/
│       ├── index.tsx             ← Hesaplayıcı listesi
│       ├── gerilim-dusumu.tsx    ← src/calculations/engines/voltageDrop DEMO motoruna bağlı ekran
│       ├── og-akim-tasima.tsx    ← src/calculations/engines/ampacityOG motoruna bağlı ekran
│       ├── enh-mekanik.tsx       ← ENH alt hesap kartları (Beton Direk Seçimi + Direk Kuvvet Hesabı aktif)
│       ├── beton-direk.tsx       ← src/calculations/engines/enhMechanical/betonDirek motoruna bağlı ekran
│       └── direk-kuvvet.tsx      ← src/calculations/engines/enhMechanical/poleForce (ÖN HESAP) motoruna bağlı ekran
├── modules/
│   └── mevzuat/                  ← Şartname / Mevzuat modülü (kendi kendine yeten)
│       ├── screens/              ← Ekran bileşenleri (app/sartname/* buradan re-export eder)
│       ├── components/           ← DocumentRow.tsx vb. modüle özel bileşenler
│       ├── services/             ← arama.ts (saf arama/filtre fonksiyonları)
│       ├── data/                 ← sartnameler.ts (mock veri)
│       └── types/                ← Document, Kategori, Institution tipleri
│   └── enhBilgi/                 ← ENH Bilgi Bankası (hesap motoru DEĞİL — statik teknik bilgi)
│       ├── screens/              ← Ekran bileşenleri (app/enh-bilgi/* buradan re-export eder)
│       ├── components/           ← IletkenKarti, DirekSinifKarti, BilgiKarti (ortak liste kartı)
│       ├── data/                 ← iletkenler.ts (src/catalogs/conductors'tan türetilir), direkSiniflari.ts,
│       │                            direkMalzemeleri.ts, direkDevreTipleri.ts, izolatorler.ts, basliklar.ts
│       └── types/                ← IletkenBilgi, DirekSinifBilgi tipleri
├── src/
│   ├── theme.ts                  ← Renkler ve ölçüler
│   ├── common/components/UI.tsx  ← Modüller arası ortak bileşenler (StyleSheet)
│   ├── catalogs/conductors/      ← Merkezi ACSR iletken kataloğu — TEK iletken veri kaynağı (bkz. README.md)
│   ├── calculations/              ← Hesaplama motoru altyapısı (UI hesap yapmaz)
│   │   ├── core/                 ← types.ts, validation.ts, errors.ts, format.ts (ortak)
│   │   └── engines/
│   │       ├── voltageDrop/      ← DEMO motor: basitleştirilmiş gerilim düşümü formülü
│   │       ├── ampacityOG/       ← OG akım taşıma kapasitesi (lookup motoru; iletken verisi src/catalogs/conductors'tan)
│   │       ├── enhMechanical/    ← 6 alt hesap türü; betonDirek/ ve poleForce/ bağımsız gerçek motorlar (bkz. README.md)
│   │       │   ├── betonDirek/   ← GERÇEK: katalog filtresi + emniyet katsayısı sınıflandırması
│   │       │   └── poleForce/    ← ÖN HESAP: düşey/yatay kuvvet tahmini (moment hesabı henüz yok)
│   │       ├── ampacityAG/       ← İskelet (types.ts) — motor henüz yok
│   │       ├── sag/              ← İskelet (types.ts) — motor henüz yok
│   │       └── tension/          ← İskelet (types.ts) — motor henüz yok
│   ├── data/elektrik.ts          ← (legacy) eski gerilim düşümü sabitleri — artık UI'a bağlı değil
│   ├── logic/gerilimDusumu.ts    ← (legacy) eski gerilim düşümü hesap motoru — artık UI'a bağlı değil
│   └── lib/                      ← supabase.ts / revenuecat.ts (geçici stub)
├── tests/
│   ├── calculations/voltageDrop.test.ts  ← DEMO motor testleri
│   ├── arama.test.ts
│   └── gerilimDusumu.test.ts      ← (legacy) src/logic/gerilimDusumu.ts testleri
└── app.json / package.json / tsconfig.json
```
