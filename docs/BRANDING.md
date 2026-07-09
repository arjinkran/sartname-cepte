# Marka Kimliği — Şartname Cepte (Sprint 6.5)

Bu belge, Şartname Cepte'nin resmî logosunu ve kullanım kurallarını
tanımlar. Sprint 6.5'te logo tamamen değiştirildi — eski "SC" (belge
ikonlu) logo ve tüm türevleri kod tabanından **tamamen kaldırıldı**.
Amaç: yeni logonun uygulama genelinde **tek, tutarlı ve bozulmamış**
şekilde görünmesini garanti altına almak.

## 1. Resmî logo

**Kaynak marka**: kullanıcı tarafından sağlanan "S/C" monogram logosu
(lacivert gövde + mavi üçgen aksan + beyaz nokta). Tüm boyut/renk
varyantları `assets/branding/` klasöründe, tek bir temiz (gerçek alfa
şeffaflığına sahip) ana görselden üretildi:

| Dosya | Boyut | Renk | Kullanım |
| --- | --- | --- | --- |
| `app-icon.png` | 1024×1024 | Koyu (orijinal) | `expo.icon` (iOS + genel) |
| `adaptive-icon.png` | 1024×1024 | **Beyaz** (ters) | `expo.android.adaptiveIcon.foregroundImage` |
| `favicon.png` | 256×256 | Koyu (orijinal) | `expo.web.favicon` |
| `logo-navbar.png` | ~243×256 | **Beyaz** (ters) | `Logo variant="navbar"` |
| `logo-splash.png` | ~451×480 | **Beyaz** (ters) | `Logo variant="splash"` |
| `logo-small.png` | ~301×320 | Koyu (orijinal) | `Logo variant="small"` |
| `logo-small-reverse.png` | ~301×320 | **Beyaz** (ters) | `Logo variant="smallReverse"` |

Uygulama içinde logo **yalnızca** `src/components/ui/Logo.tsx` bileşeni
üzerinden render edilir:

```tsx
import { Logo } from '@/components/ui';

<Logo size={31} variant="navbar" />
```

**Hiçbir ekran veya bileşen bu PNG dosyalarını `Logo` bileşeni dışında
doğrudan `require()` ETMEMELİDİR** — tek giriş noktası tutarlılığı
garanti eder (boyut, `resizeMode`, erişilebilirlik etiketi hep aynı
kalır).

## 2. Zemine göre logo seçimi — KRİTİK KURAL

Logonun kendi koyu rengi (`#081D3A`) uygulamanın lacivert marka rengiyle
(`colors.primary`, `#0B1F3A`) **neredeyse özdeştir** (yalnızca birkaç
birim RGB farkı). Bu yüzden orijinal (koyu) logo, lacivert bir zemin
üzerine yerleştirilirse **görünmez** hâle gelir — yalnızca mavi üçgen
aksan ve beyaz nokta seçilir kalır, ana "S/C" gövdesi kaybolur.

Bunu çözmek için logonun tüm opak piksellerini beyaza çeviren bir
**ters (reverse/mono) varyant** üretildi — bu, marka kılavuzlarında
standart bir uygulamadır (bir "dark on light" ve bir "light on dark"
versiyonu bulundurmak), efekt/gölge/gradient sayılmaz ve logonun
kendi biçimini/oranını hiçbir şekilde bozmaz.

**Karar tablosu** — `Logo` kullanılacak her yerde önce zemin rengine
bakılır:

| Zemin | Kullanılacak varyant |
| --- | --- |
| Açık zemin (`colors.background`, `colors.secondaryBackground`, beyaz kart) | `variant="small"` (veya `navbar`/`splash` DEĞİL — bunlar her zaman beyaz) |
| Lacivert zemin (`colors.primary`) — AppBar, Splash | `variant="navbar"` / `variant="splash"` (zaten beyaz, başka seçim gerekmez) |
| Lacivert zeminli KÜÇÜK kart/rozet (ör. AI kartı ikonu, Profil Pro kartı) | `variant="smallReverse"` |

Yeni bir yere logo eklerken **her zaman önce o alanın arka plan rengini
kontrol edin** — yanlış varyant seçimi logoyu görünmez kılar.

## 3. Logo kullanım kuralları

| Kural | Açıklama |
| --- | --- |
| Tek logo | Bu, uygulamanın **tek** resmî logosudur (dört renk/boyut varyantı — hepsi aynı marka görselinin türevidir). Alternatif ikon, yeniden çizilmiş SVG üretilmedi. |
| Emoji yasak | Marka temsili gereken hiçbir yerde (splash, navbar, App Icon, Hakkında) logonun yerine emoji kullanılmaz. (Uygulamanın geri kalanındaki fonksiyonel emoji ikonlar — doküman kartları, kategori ikonları, bottom nav — bu kuralın kapsamı DIŞINDADIR.) |
| Oran korunur | Logo her zaman `resizeMode="contain"` ile, en-boy oranı bozulmadan render edilir. Stretch/crop yapılmaz. |
| Efekt yasak | `borderRadius`/clip, `shadow`, `tint`, gradient overlay gibi hiçbir efekt logonun üzerine eklenmez. |
| Döndürme yasak | Logo hiçbir yerde döndürülmez. |
| Gerçek transparanlık | Tüm PNG'ler gerçek alfa kanalına sahiptir (dış kenar VE harfler arası boşluklar/nokta gerçekten şeffaftır) — hiçbir dosyada beyaz canvas/arka plan YOKTUR. |
| Renk değişimi yasak | İki resmî renk varyantı (koyu/beyaz) dışında `tintColor` veya benzeri bir renklendirme uygulanmaz. |

## 4. Minimum boşluk ve ölçekleme

- Logo her zaman **kare** (1:1) alan içinde render edilir; `size` prop'u
  hem genişlik hem yükseklik olarak kullanılır (kaynak görsel kare
  olmasa da `resizeMode="contain"` en-boy oranını korur).
- Metinle (başlık, uygulama adı) yan yana kullanıldığında logo ile metin
  arasında **en az 12px** boşluk bırakılır (bkz. `AppBar.tsx`
  `styles.logo.marginRight`).
- Splash ekranında logo ile alt metin arasında **24px** dikey boşluk
  vardır (bkz. `AppSplash.tsx`).
- Küçültme sınırı: pratikte 20px altına inilmemesi önerilir (ince
  detaylar — S'nin kıvrımı, C'nin açıklığı — bu boyutun altında
  okunaksızlaşabilir).

## 5. Kullanım alanları ve boyutlar

| Yer | Boyut | Varyant | Bileşen |
| --- | --- | --- | --- |
| Splash ekranı | 116px | `splash` (beyaz) | `AppSplash.tsx` (110–120px aralığında) |
| Navbar (AppBar) | 31px | `navbar` (beyaz) | `AppBar logo` prop'u — tüm ekranlarda |
| Boş durumlar (Empty State) | 40px | `small` (koyu) | `EmptyState logo` prop'u — yalnızca "kütüphanede içerik yok" tüm-ekran boş durumlarında |
| Hakkında ekranı | 110px | `small` (koyu) | `HakkindaScreen.tsx` — açık zeminli hero, büyük ortalanmış |
| Ana Sayfa "Hoş Geldiniz" kartı | 72px, %55 opaklık | `small` (koyu) | Eski belge illüstrasyonunun yerini alır, kurumsal/hafif arka plan motifi gibi |
| Ana Sayfa AI kartı ikonu | 26px | `smallReverse` (beyaz) | Lacivert `aiCard` zemini üzerinde |
| AI Asistanı ekranı üst kısmı | 36px | `small` (koyu) | Yalnızca marka göstergesi, açık zemin |
| Doküman Detay, başlık altı | 22px, %60 opaklık | `small` (koyu) | Açık kart zemini |
| Profil, Pro kartının solu | 32px | `smallReverse` (beyaz) | Lacivert `planKart` zemini üzerinde, avatar DEĞİŞMEDİ |
| App Icon | 1024×1024 | Koyu (orijinal) | `assets/branding/app-icon.png` |
| Adaptive Icon (Android) | 1024×1024, safe-zone içinde ~660px | Beyaz (ters) | `assets/branding/adaptive-icon.png` — `backgroundColor: #0B1F3A` ile eşleşir |
| Favicon | 256×256 | Koyu (orijinal) | `assets/branding/favicon.png` |

## 6. Yasak kullanımlar (özet)

Logo hiçbir yerde:

- Stretch/crop edilmez.
- Döndürülmez.
- Efekt (gölge, glow, gradient) eklenmez.
- Outline/border eklenmez.
- İki resmî varyant (koyu/beyaz) dışında rengi değiştirilmez.
- Yanlış zemin üzerinde yanlış varyantla kullanılmaz (bkz. §2 — kontrol
  etmeden koyu varyantı lacivert zemine koymak logoyu görünmez kılar).
- Bottom Navigation'da **kullanılmaz** — sekmeler kendi ikonlarını korur.
- Doküman kartlarında (DocumentRow) **kullanılmaz** — kendi kurum
  rozetlerini korur.

## 7. Renk paleti (bağlam için)

| Token | Hex | Kullanım |
| --- | --- | --- |
| `colors.primary` | `#0B1F3A` | Uygulamanın lacivert marka rengi; navbar/splash/AI kartı/Pro kartı zemini |
| Logo koyu tonu | `#081D3A` | Logonun kendi "S/C" gövde rengi (colors.primary'ye neredeyse özdeş — bkz. §2) |
| Logo mavi aksanı | ~`#1E56C8`→`#2E6FE0` (gradyan) | Logonun kendi üçgen aksanı, UI'da AYRICA kullanılmaz |
| `colors.accent` | `#2563EB` | UI aksanları — logodan bağımsız |
| `colors.background` | `#FFFFFF` | Açık zeminler |

## 8. Uygulama İkonu (App Icon)

- `app-icon.png` — 1024×1024, logo kendi oranında canvasın ~%86'sını
  kaplayacak şekilde ortalanmış (OS köşe maskeleme payı için küçük bir
  kenar boşluğu bırakılır), koyu/orijinal renk.
- `adaptive-icon.png` — 1024×1024, logo Android'in "safe zone" kuralına
  uygun şekilde canvasın ~%64'ünü kaplar (ortalanmış), **beyaz/ters**
  renk — çünkü `android.adaptiveIcon.backgroundColor` yine `#0B1F3A`
  olarak ayarlıdır ve koyu logo bu zeminde kaybolurdu (bkz. §2).
- `favicon.png` — 256×256, koyu/orijinal renk (web sekmesi genelde açık
  zeminlidir); bu proje web hedeflemiyor, yalnızca Expo config şeması
  bunu istediği için var (bkz. KURULUM.md).

## 9. Splash kullanımı

İki ayrı splash katmanı vardır:

1. **Native/statik splash** (`app.json` → `expo.splash`): `image` alanı
   `assets/branding/logo-splash.png`'ye işaret eder (beyaz/ters varyant),
   `backgroundColor: #0B1F3A`, `resizeMode: contain`. JS yüklenmeden
   önceki çok kısa an için gösterilir.
2. **JS splash** (`src/components/AppSplash.tsx`): 3 saniye sabit
   lacivert zemin + 116px beyaz logo + 24px boşluk + beyaz "Şartname
   Cepte" yazısı, ardından mevcut 350ms fade-out → fade-in
   animasyonuyla ana içeriğe geçer (animasyon davranışı ve süresi
   DEĞİŞMEDİ, yalnızca logo görseli ve boşluk değerleri güncellendi).

## 10. Navbar kullanımı

`src/components/ui/AppBar.tsx`, opsiyonel `logo` prop'u alır:

```tsx
<AppBar title="Şartname Ara" logo onBack={...} />
```

Sıralama (soldan sağa): geri oku (varsa) → logo (varsa, 31px beyaz,
`variant="navbar"`, sağında 12px boşluk) → başlık. Doküman Detay
ekranında da aynı sıralama kullanılır.
