# Marka Kimliği — Şartname Cepte (Sprint 4.1)

Bu belge, Şartname Cepte'nin resmî logosunu ve kullanım kurallarını
tanımlar. Amaç: logonun uygulama genelinde **tek, tutarlı ve bozulmamış**
şekilde görünmesini garanti altına almak.

## 1. Resmî logo

**Tek kaynak dosya:** [`assets/branding/logo.png`](../assets/branding/logo.png)
(1254×1254px, kayıpsız PNG). Yoğunluk varyantları aynı klasörde:
`logo@2x.png`, `logo@3x.png` — bunlar **aynı görselin** farklı piksel
yoğunluklarındaki kopyalarıdır (React Native/Metro'nun otomatik
`@2x`/`@3x` çözümlemesi için), farklı bir logo DEĞİLDİR.

Uygulama içinde logo yalnızca `src/components/ui/Logo.tsx` bileşeni
üzerinden render edilir:

```tsx
import { Logo } from '@/components/ui';

<Logo size={28} />
```

**Hiçbir ekran veya bileşen `assets/branding/logo.png`'yi `Logo`
bileşeni dışında doğrudan `require()` ETMEMELİDİR** — tek giriş noktası
tutarlılığı garanti eder (boyut, `resizeMode`, erişilebilirlik etiketi
hep aynı kalır).

## 2. Logo kullanım kuralları

| Kural | Açıklama |
| --- | --- |
| Tek logo | Bu, uygulamanın **tek** resmî logosudur. Alternatif ikon, yeniden çizilmiş SVG, farklı renk varyasyonu üretilmedi ve üretilmemelidir. |
| Emoji yasak | Marka temsili gereken hiçbir yerde (splash, navbar, App Icon, Hakkında) logonun yerine emoji kullanılmaz. (Uygulamanın geri kalanındaki fonksiyonel emoji ikonlar — doküman kartları, kategori ikonları, bottom nav — bu kuralın kapsamı DIŞINDADIR; onlar marka logosu değil, işlevsel UI ikonlarıdır.) |
| Oran korunur | Logo her zaman `resizeMode="contain"` ile, en-boy oranı bozulmadan render edilir. Stretch/crop yapılmaz. |
| Efekt yasak | `borderRadius`/clip, `shadow`, `tint`, gradient overlay gibi hiçbir efekt logonun üzerine eklenmez. Logo zaten kendi köşeleri ve arka planıyla birlikte tek parça, bitmiş bir görseldir. |
| Döndürme yasak | Logo hiçbir yerde döndürülmez. |
| Transparanlık | Logonun kendi opaklığı değiştirilmez (kaynak dosyada alfa kanalı yoktur — tamamen opak). |
| Renk değişimi yasak | `tintColor` veya benzeri bir renklendirme uygulanmaz. |

## 3. Minimum boşluk ve ölçekleme

- Logo her zaman **kare** (1:1) alan içinde render edilir; `size` prop'u
  hem genişlik hem yükseklik olarak kullanılır.
- Metinle (başlık, uygulama adı) yan yana kullanıldığında logo ile metin
  arasında **en az 12px** boşluk bırakılır (bkz. `AppBar.tsx`
  `styles.logo.marginRight`).
- Splash ekranında logo ile alt metin arasında **20px** dikey boşluk
  vardır (bkz. `AppSplash.tsx`).
- Küçültme sınırı: pratikte 24px altına inilmemesi önerilir (kaynak
  görseldeki ince detaylar — belge çizgileri, "SC" harfleri — bu
  boyutun altında okunaksızlaşabilir).

## 4. Kullanım alanları ve boyutlar

| Yer | Boyut | Bileşen |
| --- | --- | --- |
| Splash ekranı | 100px | `AppSplash.tsx` (90–110px aralığında) |
| Navbar (AppBar) | 28px | `AppBar logo` prop'u — Ana Sayfa, Arama, AI Asistanı, Profil, Veri Kaynakları, Favoriler, Offline Kütüphane, Doküman Detay |
| Boş durumlar (Empty State) | 40px | `EmptyState logo` prop'u — yalnızca "kütüphanede içerik yok" türü tüm-ekran boş durumlarında (Favoriler, Offline Kütüphane); "sonuç bulunamadı" arama durumlarında KULLANILMAZ (gereksiz tekrar olmasın diye, bkz. `EmptyState.tsx` üst yorumu) |
| Hakkında ekranı | 110px | `HakkindaScreen.tsx` — büyük, ortalanmış |
| App Icon / Adaptive Icon | 1024×1024 | `assets/icon.png`, `assets/adaptive-icon.png` |
| Favicon | 48×48 | `assets/favicon.png` |

## 5. Yasak kullanımlar (özet)

Logo hiçbir yerde:

- Stretch/crop edilmez.
- Döndürülmez.
- Transparanlığı değiştirilmez.
- Üzerine efekt (gölge, glow, gradient) eklenmez.
- Outline/border eklenmez.
- Rengi değiştirilmez.
- Farklı bir versiyonu/varyasyonu üretilmez (ör. yalnızca "SC" harfleri,
  yalnızca belge ikonu gibi kırpılmış alt-versiyonlar oluşturulmadı).
- AI Kartı (Ana Sayfa) ve doküman kartlarında (DocumentRow) **kullanılmaz**
  — bu alanlar kendi işlevsel ikonlarını (✨, 📄) korur; logo tekrarı
  görsel gürültü yaratır.
- Bottom Navigation'da **kullanılmaz** — sekmeler kendi ikonlarını korur.

## 6. Renk paleti (bağlam için)

Logo, uygulamanın mevcut kurumsal paletiyle zaten uyumludur (bkz.
`src/theme/colors.ts`):

| Token | Hex | Kullanım |
| --- | --- | --- |
| `colors.primary` | `#0B1F3A` | Logonun arka plan rengi; splash zemini; App Icon/Adaptive Icon arka planı |
| `colors.accent` | `#2563EB` | Vurgu — logoda kullanılmaz, UI aksanlarında kullanılır |
| `colors.background` | `#FFFFFF` | Logo işaretinin (belge/"SC") rengi |

## 7. Uygulama İkonu (App Icon)

- `assets/icon.png` (iOS + genel) ve `assets/adaptive-icon.png`
  (Android adaptive icon foreground) **aynı kaynak logodan** 1024×1024
  olarak üretildi (`Resize-Square`, .NET `System.Drawing`
  `HighQualityBicubic` — kayıpsız yeniden örnekleme, yeni bir paket
  eklenmedi).
- `android.adaptiveIcon.backgroundColor` → `#0B1F3A`. Kaynak logo zaten
  kendi opak arka planını (lacivert yuvarlatılmış kare, beyaz kenarlıklı
  kanvas) içerdiğinden, Android'in adaptive icon "safe zone" davranışı
  logonun kendi köşe yuvarlaklığıyla örtüşür; ekstra bir maskeleme veya
  yeniden kırpma **yapılmadı** ("logo kırpılmamalı" kuralı gereği).
- `web.favicon` → 48×48, yalnızca Expo config şeması bunu istediği için
  var; bu proje web hedeflemiyor (bkz. KURULUM.md).

## 8. Splash kullanımı

İki ayrı splash katmanı vardır:

1. **Native/statik splash** (`app.json` → `expo.splash`): `image` alanı
   artık `assets/branding/logo.png`'ye işaret eder, `backgroundColor:
   #0B1F3A`, `resizeMode: contain`. JS yüklenmeden önceki çok kısa an
   için gösterilir.
2. **JS splash** (`src/components/AppSplash.tsx`): 3 saniye sabit
   lacivert zemin + 100px logo + 20px boşluk + beyaz "Şartname Cepte"
   yazısı, ardından mevcut 350ms fade-out → fade-in animasyonuyla ana
   içeriğe geçer (animasyon davranışı DEĞİŞMEDİ, yalnızca logo eklendi).

## 9. Navbar kullanımı

`src/components/ui/AppBar.tsx`, opsiyonel `logo` prop'u alır:

```tsx
<AppBar title="Şartname Ara" logo onBack={...} />
```

Sıralama (soldan sağa): geri oku (varsa) → logo (varsa, 28px, sağında
12px boşluk) → başlık. Doküman Detay ekranında da aynı sıralama
kullanılır (geri oku → küçük logo → başlık).
