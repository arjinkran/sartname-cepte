# Doküman Mimarisi — Mevzuat Kütüphanesi Altyapısı (Sprint 4)

Bu belge, Şartname Cepte'nin **tek doküman veri modelini** ve **Repository**
katmanını anlatır. Amaç: uygulamadaki her ekranın (Arama, AI Asistanı,
Doküman Detay, Veri Kaynakları, Favoriler, Ana Sayfa) aynı, tutarlı veri
kaynağından beslenmesi ve gelecekte gerçek bir backend/RAG sistemine
geçişin bu katmanı değiştirmeden mümkün olması.

## 1. Veri modeli

Tek tip Doküman modeli `src/data/documents/types.ts`'te tanımlıdır:

```ts
interface Document {
  id: string;
  title: string;
  shortTitle: string;        // dar alanlarda (AppBar, liste) kullanılır
  category: string;          // CATEGORIES'teki `ad` ile birebir eşleşir
  institution: Institution;  // 11 değerlik kapalı küme
  documentType: DocumentType; // 8 değerlik kapalı küme
  revision: string;
  publishDate: string;
  effectiveDate: string;
  status: 'active' | 'deprecated' | 'draft';
  keywords: readonly string[];
  summary: string;
  relatedDocuments: readonly string[]; // başka Document.id'leri, boş olamaz
  pdfPath: string;
  coverImage?: string;       // gerçek görsel eklenene kadar tanımsız
  favorite: boolean;         // seed veride her zaman false (bkz. §6)
  featured: boolean;
  updatedAt: string;         // YYYY-MM-DD
}
```

Bu model **2026-07 itibarıyla mevcut 14 dokümanın** (önceki
`modules/mevzuat/data/sartnameler.ts`) birebir taşınmış hâlidir — hiçbir
içerik kaybedilmedi. Eklenen alanlar (`shortTitle`, `documentType`,
`favorite`, `featured`, `updatedAt`) mevcut başlık/etiket bilgisinden
çıkarım yapılarak dolduruldu; uydurma (mock) içerik eklenmedi.
`pdfUrl` alanı `pdfPath` olarak yeniden adlandırıldı (değer aynı — hâlâ
uzak bir URL, yerel/offline PDF ingestion henüz yok). Eski `tags` alanı
kaldırıldı; rolü artık `documentType` (resmî sınıflandırma) ve `keywords`
(arama) arasında paylaşılıyor.

## 2. Kurum yapısı (`institutions.ts`)

11 değerlik kapalı küme: `TEDAŞ, TEİAŞ, EPDK, Enerji Bakanlığı, Resmî
Gazete, TSE, IEC, CENELEC, TS EN, IEEE, Diğer`.

Şu an yalnızca **TEDAŞ, EPDK, Resmî Gazete** kurumlarının gerçek dokümanı
var (14 doküman). Diğer 8 kurum bilinçli olarak listede tutuluyor —
Veri Kaynakları ekranı bunların doküman sayısını **canlı hesaplar**
(`getByInstitution(x).length`) ve 0 ise "Doküman kütüphanesi yakında
eklenecek" gösterir. Hiçbir sahte doküman üretilmedi.

## 3. Kategori yapısı (`categories.ts`)

23 kategorilik ayrıntılı taksonomi (AG Şebeke, OG Şebeke, YG, Kablolar,
Trafo, Dağıtım Panoları, Hücreler, Topraklama, Koruma, Sayaç, Ölçü,
Direkler, İletkenler, İSG, Hizmet Kalitesi, Enerji Piyasası, SCADA,
Aydınlatma, Parafudr, Kesiciler, Ayırıcılar, Kompanzasyon, Genel) —
önceki 6 kategorilik dar sistemin (`AG Şebeke ve Kablolar`, `OG / Trafo
ve Hücreler` gibi birleşik kategoriler) yerine geçti. Örneğin eski "OG /
Trafo ve Hücreler" kategorisi artık ayrı **Trafo** ve **Hücreler**
kategorilerine bölündü — bu, arama/filtreleme kesinliğini artırır (bkz.
`tests/documentRepository.test.ts` "getByCategory: Hücreler kategorisinde
yalnızca..." testi).

Her `Category` nesnesi `{ id, ad, ikon, aciklama }` şeklindedir.
`Document.category` alanı, id değil **`ad` (görünen isim)** ile eşleşir —
bu, önceki sürümle aynı konvansiyondur ve ekran render kodunda ek bir
id→etiket çözümleme katmanı gerektirmez.

## 4. Doküman tipleri (`documentTypes.ts`)

8 değerlik kapalı küme: `Şartname, Yönetmelik, Standart, Tebliğ, Genelge,
Kılavuz, Teknik Doküman, Rehber`. Mevcut 14 dokümanın tümü başlıklarından
çıkarımla ya **Şartname** ya **Yönetmelik** olarak sınıflandırıldı;
kalan 6 tip gelecekteki içerik için hazır bekliyor.

## 5. Repository (`repository.ts`)

Tüm ekranlar mevzuat verisine **yalnızca** bu dosyadaki fonksiyonlar
üzerinden erişir — hiçbir ekran `documents.ts`'i doğrudan import etmez
(barrel `index.ts` bilerek `DOCUMENTS`'ı dışa aktarmaz).

| Fonksiyon | Açıklama |
| --- | --- |
| `getAllDocuments()` | Kütüphanenin tamamı |
| `getFeaturedDocuments()` | `featured: true` olanlar, `updatedAt` azalan sırada — Ana Sayfa "Son Şartnameler" bunu kullanır |
| `getDocumentById(id)` | Tekil doküman (bulunamazsa `undefined`) |
| `getByInstitution(kurum)` | Kurum filtresi |
| `getByCategory(kategoriAdı)` | Kategori filtresi |
| `getByType(tip)` | Doküman tipi filtresi |
| `search(sorgu, within?)` | Türkçe aksan-katlamalı anahtar kelime araması (title×5, keywords×3, gövde×1 puanlama); `within` verilmezse tüm kütüphanede arar |
| `getRelatedDocuments(id)` | `relatedDocuments` id listesini gerçek `Document[]`'e çözer |
| `getRecentDocuments(limit)` | `updatedAt`'e göre en yeni `limit` doküman (featured filtresi yok) |

**Kombine filtreleme** (kurum + kategori + tip birlikte, ör. Arama
ekranında) bilerek repository'de tek bir fonksiyon olarak sunulmuyor;
ekran `getAllDocuments()`'ı okuyup üç boyutu kendi içinde `.filter()`
ile birleştirir. Bu, repository yüzeyini 9 fonksiyonla sınırlı ve sade
tutar; veri kaynağına hâlâ yalnızca Repository üzerinden erişilir.

## 6. `favorite` alanı — model şeması vs. gerçek durum

`Document.favorite` seed veride **her zaman `false`**. Gerçek zamanlı
favori durumu hâlâ `src/lib/favoriler.tsx`'teki `FavorilerProvider`
(React context, kalıcı saklama yok — "şimdilik local state yeterli"
kuralına uygun) üzerinden okunur/yazılır. İki ayrı favori kaynağının
çakışmasını önlemek için ekranlar `document.favorite`'i OKUMAZ, her
zaman `useFavoriler().favoriMi(id)` kullanır. Alan yalnızca modelin
şema tamlığı için (ve ileride gerçek bir backend'e taşınırsa hazır
olması için) mevcuttur.

## 7. AI Asistanı bu modeli nasıl kullanıyor

`modules/ai/screens/AiDestekScreen.tsx`, kullanıcının yazdığı serbest
metni doğrudan `search()`'e verir. Puanlama sırası:

1. `title` içinde geçen terim → 5 puan
2. `keywords` içinde geçen terim → 3 puan
3. `summary` + `institution` + `category` (gövde) içinde geçen terim → 1 puan
4. Sorgudaki TÜM terimler eşleşirse ekstra bonus (`20 × terim sayısı`)

Bu, **gerçek bir LLM/embedding tabanlı arama değildir** — anahtar kelime
eşleşmesidir. "Neden önerildi?" satırı ham skor değerini gösterir, sahte
bir gerekçelendirme üretmez. `keywords` alanının zenginliği bu yüzden
kritik: bir doküman ne kadar iyi etiketlenirse AI önerileri o kadar
isabetli olur (bkz. §1, madde 6'daki zenginleştirme).

## 8. İleride RAG entegrasyonu

Bu Repository katmanı, gelecekte gerçek bir RAG (Retrieval-Augmented
Generation) sistemine geçişin **temel taşı** olacak şekilde tasarlandı:

- `Document.keywords` + `summary`, embedding üretimi için hazır girdi
  kümesidir — bugünkü anahtar-kelime `search()`'ü, yarın bir vektör
  benzerlik aramasıyla (aynı `SearchResult { document, score }`
  imzasını koruyarak) **değiştirilebilir**, ekranlar hiçbir değişiklik
  gerektirmez.
- `pdfPath`, gerçek PDF içerikleri eklendiğinde (Offline Kütüphane
  özelliğiyle birlikte) metin çıkarma/chunking için giriş noktası
  olacaktır.
- `relatedDocuments`, statik bir graf olarak bugün de mevcut; RAG
  sonrası bu graf otomatik/embedding-tabanlı ilişkilendirmeyle
  zenginleştirilebilir (bugünkü elle kurulmuş ilişkiler korunarak).
- Repository'nin dar, 9 fonksiyonluk arayüzü sayesinde RAG entegrasyonu
  yalnızca `repository.ts`'in İÇİNİ değiştirecek — ekranlar
  (`SartnameAramaScreen`, `AiDestekScreen`, vb.) hiçbir import/API
  değişikliği görmeyecek.

## 9. Dosya haritası

```
src/data/documents/
├── types.ts          ← Document, Institution, DocumentType, DocumentStatus, Category, STATUS_LABELS
├── institutions.ts    ← INSTITUTIONS (11)
├── documentTypes.ts   ← DOCUMENT_TYPES (8)
├── categories.ts       ← CATEGORIES (23)
├── documents.ts        ← DOCUMENTS (14, ham veri — yalnızca repository.ts import eder)
├── repository.ts       ← 9 erişim fonksiyonu + search/normallestir
└── index.ts             ← barrel (documents.ts BİLEREK dışa aktarılmaz)
```

## 10. Kaynak doğrulaması

Bu belgedeki `updatedAt` değerleri **gerçek revizyon geçmişi değildir** —
Sprint 4 taşıması sırasında atanmış yer tutucu tarihlerdir. `publishDate`/
`effectiveDate` alanlarındaki "Doğrulanacak" işaretleri (önceki
sürümlerden miras) aynen korunmuştur — yayın öncesi tüm doküman
numaraları, tarihleri ve kaynak bağlantıları resmî kaynaktan (TEDAŞ
şartname listesi, mevzuat.gov.tr, EPDK) doğrulanmalıdır.
