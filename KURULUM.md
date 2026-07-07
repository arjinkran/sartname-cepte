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
npm test            → hesap motoru birim testleri (9/9 geçmeli)
npm run typecheck   → TypeScript tip kontrolü
```

## Klasör yapısı

```
sartname-cepte/
├── app/                          ← Rotalar (Expo Router: dosya = rota)
│   ├── _layout.tsx               ← Kök yerleşim + açılış uyarısı
│   ├── index.tsx                 ← Ana ekran (6 modül kartı)
│   ├── sartname/                 ← İnce rota dosyaları → modules/mevzuat/screens'e re-export
│   └── hesaplayicilar/
│       ├── index.tsx             ← Hesaplayıcı listesi
│       └── gerilim-dusumu.tsx    ← Gerilim düşümü ekranı
├── modules/
│   └── mevzuat/                  ← Şartname / Mevzuat modülü (kendi kendine yeten)
│       ├── screens/              ← Ekran bileşenleri (app/sartname/* buradan re-export eder)
│       ├── components/           ← DokumanSatiri.tsx vb. modüle özel bileşenler
│       ├── services/             ← arama.ts (saf arama/filtre fonksiyonları)
│       ├── data/                 ← sartnameler.ts (mock veri)
│       └── types/                ← Dokuman, Kategori, Kurum tipleri
├── src/
│   ├── theme.ts                  ← Renkler ve ölçüler
│   ├── common/components/UI.tsx  ← Modüller arası ortak bileşenler (StyleSheet)
│   ├── calculations/              ← Gelecekteki paylaşılan hesap motoru için ayrılmış (henüz boş)
│   ├── data/elektrik.ts          ← Kesit serisi, iletkenlik, limitler
│   ├── logic/gerilimDusumu.ts    ← Gerilim düşümü hesap motoru (saf fonksiyonlar)
│   └── lib/                      ← supabase.ts / revenuecat.ts (geçici stub)
├── tests/                        ← Birim testleri (npm test)
└── app.json / package.json / tsconfig.json
```
