# Şartname Cepte — Kurulum ve Sorun Giderme

## Ürün Tanımı (V3 — mevzuat odaklı dönüşüm)

**Şartname Cepte**, elektrik dağıtım sektörüne yönelik **Teknik Şartname**,
**Yönetmelik**, **Standart**, **Resmî Gazete** ve **AI Destekli Mevzuat
Asistanı**dır.

**Mühendislik hesapları** (ENH mekanik hesapları, OG hesapları, direk
hesabı, sehim, buz yükü, iletken vb.) bu uygulamanın ürün kapsamından
çıkarılmıştır ve ayrı geliştirilen **Şartname Cepte Engineering**
uygulamasında yer alacaktır. Bu hesapların kodu (`src/calculations/`,
`app/hesaplayicilar/*`, `app/enh-bilgi/*`) **silinmedi** — yalnızca
kullanıcı arayüzünden (Ana Sayfa dahil hiçbir ekrandan) erişilemez hale
getirildi. Bkz. "Klasör yapısı" bölümündeki ilgili not.

---

Bu sürümün hedefi: **Expo Go'da hatasız açılmak.** Bağımlılıklar
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
│   ├── _layout.tsx               ← Kök yerleşim + JS splash (AppSplash) + açılış uyarısı
│   ├── index.tsx                 ← Ana ekran (V3: yalnızca mevzuat modülleri — Şartname/Mevzuat, AI Mevzuat
│   │                                Asistanı, Favoriler, Offline Kütüphane, Son Güncellenenler, Veri Kaynakları)
│   ├── sartname/                 ← İnce rota dosyaları → modules/mevzuat/screens'e re-export
│   │                                (index=Arama, [id]=Detay, ikisi de premium UI kit + gerçek DOCUMENTS)
│   ├── ai.tsx                    ← İnce rota → modules/ai/screens/AiDestekScreen
│   ├── profil.tsx                ← İnce rota → modules/profil/screens/ProfilScreen
│   ├── favoriler.tsx             ← İnce rota → modules/mevzuat/screens/FavorilerScreen
│   ├── veri-kaynaklari.tsx       ← İnce rota → modules/platform/screens/VeriKaynaklariScreen (V3, YENİ)
│   ├── offline-kutuphane.tsx     ← İnce rota → modules/platform/screens/OfflineKutuphaneScreen (V3, YENİ — "yakında")
│   ├── hakkinda.tsx              ← İnce rota → modules/profil/screens/HakkindaScreen (Sprint 4.1, YENİ)
│   │
│   │   ⚠️ Aşağıdaki iki rota grubu V3'te UI'dan (Ana Sayfa dahil hiçbir
│   │   ekrandan) bağlantısı kaldırıldı — dosyalar/kod SİLİNMEDİ, yalnızca
│   │   erişilemez hale getirildi (bkz. üstteki "Ürün Tanımı").
│   ├── enh-bilgi/                ← [UI'dan kaldırıldı] modules/enhBilgi/screens'e re-export
│   └── hesaplayicilar/           ← [UI'dan kaldırıldı]
│       ├── index.tsx             ← Hesaplayıcı listesi
│       ├── gerilim-dusumu.tsx    ← src/calculations/engines/voltageDrop DEMO motoruna bağlı ekran
│       ├── og-akim-tasima.tsx    ← src/calculations/engines/ampacityOG motoruna bağlı ekran
│       ├── enh-mekanik.tsx       ← ENH alt hesap kartları (Beton Direk, Direk Kuvvet, Buz Yükü, Sehim aktif)
│       ├── beton-direk.tsx       ← src/calculations/engines/enhMechanical/betonDirek motoruna bağlı ekran
│       ├── direk-kuvvet.tsx      ← src/calculations/engines/enhMechanical/poleForce (ÖN HESAP) motoruna bağlı ekran
│       ├── buz-yuku.tsx          ← src/calculations/engines/enhMechanical/iceLoad (ÖN HESAP) motoruna bağlı ekran
│       └── sehim.tsx             ← src/calculations/engines/enhMechanical/sag (ÖN HESAP) motoruna bağlı ekran
├── modules/
│   └── mevzuat/                  ← Şartname / Mevzuat modülü (kendi kendine yeten — ürünün çekirdeği)
│       ├── screens/              ← Ekran bileşenleri (app/sartname/*, app/favoriler.tsx buradan re-export eder)
│       │                            SartnameAramaScreen (Arama), DocumentDetailScreen (Detay),
│       │                            FavorilerScreen — hepsi src/data/documents Repository'sini kullanır
│       └── components/           ← DocumentRow.tsx (premium kart: kurum/kategori/revizyon/PDF/favori/ok)
│           (Sprint 4: eski data/sartnameler.ts, services/arama.ts, types/ SİLİNDİ — bkz. src/data/documents/)
│   └── enhBilgi/                 ← [UI'dan kaldırıldı, V3] ENH Bilgi Bankası — statik teknik bilgi, hesap motoru değil
│       ├── screens/              ← Ekran bileşenleri (app/enh-bilgi/* buradan re-export eder)
│       ├── components/           ← IletkenKarti, DirekSinifKarti, BilgiKarti (ortak liste kartı)
│       ├── data/                 ← iletkenler.ts (src/catalogs/conductors'tan türetilir), direkSiniflari.ts,
│       │                            direkMalzemeleri.ts, direkDevreTipleri.ts, izolatorler.ts, basliklar.ts
│       └── types/                ← IletkenBilgi, DirekSinifBilgi tipleri
│   └── ai/                       ← AI Mevzuat Asistanı — gerçek AI motoru YOK, src/data/documents'ın
│       └── screens/                 search()'ünü (değiştirmeden) tüketir; yalnızca mevzuat türü doküman önerir
│   └── profil/                   ← Profil — mock profil kartı, gerçek auth YOK
│       └── screens/
│   └── platform/                 ← Veri Kaynakları + Offline Kütüphane
│       └── screens/                 VeriKaynaklariScreen (kurum/standart listesi, sayılar canlı hesaplanır),
│                                     OfflineKutuphaneScreen ("yakında")
├── src/
│   ├── data/documents/           ← Doküman Repository (Sprint 4, YENİ) — bkz. docs/DOCUMENT_ARCHITECTURE.md
│   │   ├── types.ts              ← Document, Institution (11), DocumentType (8), DocumentStatus, Category
│   │   ├── institutions.ts       ← INSTITUTIONS
│   │   ├── documentTypes.ts      ← DOCUMENT_TYPES
│   │   ├── categories.ts         ← CATEGORIES (23, ayrıntılı taksonomi)
│   │   ├── documents.ts          ← DOCUMENTS (14, ham veri — yalnızca repository.ts import eder)
│   │   ├── repository.ts         ← getAllDocuments/getFeaturedDocuments/getDocumentById/getByInstitution/
│   │   │                            getByCategory/getByType/search/getRelatedDocuments/getRecentDocuments
│   │   └── index.ts              ← barrel (documents.ts BİLEREK dışa aktarılmaz — ekranlar yalnızca
│   │                                repository fonksiyonlarını kullanır, JSON'a doğrudan erişmez)
│   ├── theme/                    ← Premium tema (Sprint UI-1A) — colors/spacing/radius/typography/shadow/
│   │                                animations + index.ts barrel. Eski `src/theme.ts`'in yerine geçti;
│   │                                `colors` sözlüğü eski alan adlarını da içerir (geriye dönük uyumluluk).
│   ├── components/
│   │   ├── ui/                   ← Ortak UI kit: Screen, AppBar (opsiyonel geri oku + logo, Sprint 4.1), Card,
│   │   │                            Button, Chip, SectionTitle, IconButton, ListItem, BottomNavigation,
│   │   │                            PressableScale, EmptyState (opsiyonel logo, Sprint 4.1), Logo (Sprint 4.1, YENİ)
│   │   └── AppSplash.tsx         ← JS splash ekranı (useAppSplash hook + AppSplash bileşeni + logo) — app.json'daki
│   │                                native splash'tan AYRI, yalnızca ilk açılışta bir kez gösterilir
│   ├── navigation/tabs.ts        ← ROOT_TABS + useRootTabBar() — Ana Sayfa/Ara/AI/Profil'in tümünde aynı
│   │                                BottomNavigation'ı ve doğru aktif sekmeyi verir (Sprint UI-1B, YENİ)
│   ├── common/components/UI.tsx  ← Modüller arası ortak bileşenler (StyleSheet) — src/theme üzerinden otomatik
│   │                                yeni paleti kullanır, bu sprintte kod değişikliği yapılmadı
│   ├── catalogs/conductors/      ← Merkezi ACSR iletken kataloğu — TEK iletken veri kaynağı (bkz. README.md)
│   ├── calculations/              ← Hesaplama motoru altyapısı (UI hesap yapmaz)
│   │   ├── core/                 ← types.ts, validation.ts, errors.ts, format.ts (ortak)
│   │   └── engines/
│   │       ├── voltageDrop/      ← DEMO motor: basitleştirilmiş gerilim düşümü formülü
│   │       ├── ampacityOG/       ← OG akım taşıma kapasitesi (lookup motoru; iletken verisi src/catalogs/conductors'tan)
│   │       ├── enhMechanical/    ← 6 alt hesap türü; betonDirek/, poleForce/, iceLoad/, sag/ bağımsız gerçek motorlar (bkz. README.md)
│   │       │   ├── betonDirek/   ← GERÇEK: katalog filtresi + emniyet katsayısı sınıflandırması
│   │       │   ├── poleForce/    ← ÖN HESAP: düşey/yatay kuvvet tahmini (moment hesabı henüz yok)
│   │       │   ├── iceLoad/      ← ÖN HESAP: pb=k√d buz yükü (k katsayıları kaynak doğrulaması gerekli)
│   │       │   └── sag/          ← ÖN HESAP: parabolik sehim (IceLoadEngine'i tüketir, gerçek DHD değil)
│   │       ├── ampacityAG/       ← İskelet (types.ts) — motor henüz yok
│   │       ├── sag/              ← İskelet (types.ts) — enhMechanical/sag/'dan AYRI, kullanılmayan eski iskelet
│   │       └── tension/          ← İskelet (types.ts) — motor henüz yok
│   ├── data/elektrik.ts          ← (legacy) eski gerilim düşümü sabitleri — artık UI'a bağlı değil
│   ├── logic/gerilimDusumu.ts    ← (legacy) eski gerilim düşümü hesap motoru — artık UI'a bağlı değil
│   └── lib/                      ← supabase.ts / revenuecat.ts (geçici stub)
├── tests/
│   ├── calculations/voltageDrop.test.ts  ← DEMO motor testleri
│   ├── documentRepository.test.ts ← src/data/documents/repository.ts testleri (eski arama.test.ts'in yerine geçti)
│   └── gerilimDusumu.test.ts      ← (legacy) src/logic/gerilimDusumu.ts testleri
├── assets/
│   ├── icon.png                  ← App Icon (1024×1024, Sprint 4.1)
│   ├── adaptive-icon.png         ← Android adaptive icon foreground (1024×1024, Sprint 4.1)
│   ├── favicon.png               ← 48×48 (Sprint 4.1 — proje web hedeflemiyor, yalnızca config şeması için)
│   └── branding/                 ← Sprint 4.1, YENİ — TEK resmi logo kaynağı, bkz. docs/BRANDING.md
│       ├── logo.png                 (1254×1254 kayıpsız PNG)
│       ├── logo@2x.png              (128px)
│       └── logo@3x.png              (192px)
├── docs/
│   ├── DOCUMENT_ARCHITECTURE.md  ← Doküman veri modeli, kategori/kurum yapısı, Repository mantığı
│   └── BRANDING.md               ← Resmi logo kullanım kuralları (Sprint 4.1)
└── app.json / package.json / tsconfig.json
```
