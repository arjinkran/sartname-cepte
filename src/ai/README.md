# AI Mevzuat Tavsiye Motoru v1 (Sprint 7)

Bu klasör, Şartname Cepte'nin **kural tabanlı** (rule-based) belge öneri
motorunu içerir. `src/data/library/repository.ts`'nin `search()` /
`searchKeywords()` fonksiyonlarının yerini ALMAZ — onların yanında,
"kullanıcı ne soruyor?" sorusuna daha zengin bir cevap üretmek için
inşa edilmiştir.

## ⚠️ Bu motor NE DEĞİLDİR

- **LLM DEĞİLDİR.** OpenAI, Claude, Gemini vb. hiçbir dil modeli
  çağrılmaz.
- **RAG (Retrieval-Augmented Generation) DEĞİLDİR.** Embedding/vektör
  benzerlik araması yoktur; tamamen anahtar kelime + kural tabanlıdır.
- **İnternet bağlantısı KULLANMAZ.** Her şey cihaz üzerinde, statik
  kütüphane verisiyle çalışır.
- **"Neden önerildi?" gerekçeleri gerçek bir muhakeme DEĞİLDİR** —
  hangi alanların/kuralların eşleştiğinin okunabilir bir dökümüdür
  (bkz. `scoring.ts` `reasons`).

## Mimari

```
src/ai/
├── types.ts      — Intent, SynonymMatch, DocumentRecommendation, RecommendationResult
├── synonyms.ts    — eşanlamlı terim sözlüğü + findSynonymMatches()
├── intent.ts      — niyet tanımları + detectIntents() + intentToCategoryHints()
├── matcher.ts      — ters indeks (inverted index) + aday belge seçimi (performans katmanı)
├── scoring.ts       — çok alanlı ağırlıklı puanlama + IDF ağırlıklandırma + confidence
├── engine.ts         — recommendDocuments() / recommendRelated() (tek genel API)
├── examples.ts        — 50+ gerçek saha sorusu (AI ekranı + testler bunu kullanır)
└── README.md            — bu dosya
```

Akış (bkz. `engine.ts` `recommendDocuments()`):

```
soru
  │
  ├─▶ detectIntents(soru)         → Intent[]           (intent.ts)
  ├─▶ findSynonymMatches(soru)    → SynonymMatch[]      (synonyms.ts)
  ├─▶ terim listesi oluştur       → string[]            (tokenize + synonym kanonik terimleri)
  │
  ├─▶ getCandidateIds(terimler)   → Set<docId>          (matcher.ts, ters indeksten — TÜM
  │                                                       kütüphane TARANMAZ)
  ├─▶ niyet↔kategori ipuçlarından da aday ekle
  │
  ├─▶ 1. skorlama geçişi (crossReference bonusu YOK)     (scoring.ts)
  ├─▶ en iyi 5 adayın relatedDocuments/crossReferences'ı
  │   toplanır → crossReferencedIds
  ├─▶ 2. (son) skorlama geçişi (crossReference bonusu AKTİF)
  │
  └─▶ RecommendationResult { documents, matchedKeywords, matchedIntents, matchedSynonyms }
```

## Niyet (Intent) sistemi

`intent.ts`, sorguyu 25 önceden tanımlı niyet kategorisinden hangileriyle
örtüştüğünü tespit eder (`branşman`, `trafo`, `kablo`, `og`, `ag`, `ring`,
`havai-hat`, `yeraltı-kablosu`, `topraklama`, `parafudr`, `kesici`,
`ayırıcı`, `koruma`, `sayaç`, `kompanzasyon`, `ölçü-trafosu`, `direk`,
`travers`, `izolatör`, `hizmet-kalitesi`, `bağlantı`, `proje`, `kabul`,
`işletme`, `bakım`, `arıza`). **Bir soru birden fazla niyet içerebilir**
— `detectIntents()` ilk eşleşmede durmaz, tüm eşleşen niyetleri döner.

Her niyetin (varsa) bir `categoryHints` listesi vardır — bu, niyetin
kütüphanedeki hangi `Document.category` değerleriyle örtüştüğünü
tanımlar ve puanlamada "niyet ↔ kategori örtüşmesi" bonusunu tetikler.

## Eşanlamlı (Synonym) sistemi

`synonyms.ts`, saha personelinin farklı isimlendirmelerini (ör. "OG",
"Orta Gerilim", "34,5 kV" hepsi `canonical: 'og'`e karşılık gelir) tek
bir kanonik terime indirger. `findSynonymMatches()` sorguda geçen HER
grubun İLK eşleşen terimini raporlar; bu kanonik terim hem puanlamada
ayrı bir bonus kazanır hem de arama terim listesine eklenir (böylece
"dokunma gerilimi" sorgusu `topraklama` kategorisindeki belgeleri de
yakalayabilir).

## Puanlama (Scoring)

Ayrıntılı formül için bkz. [`scoring.ts`](./scoring.ts) başındaki yorum
ve [`docs/AI_ENGINE.md`](../../docs/AI_ENGINE.md) "Puanlama" bölümü.
Özet:

| Bileşen | Ağırlık | Not |
| --- | --- | --- |
| title/shortTitle veya aliases eşleşmesi | 10 × IDF | En güçlü sinyal |
| keywords eşleşmesi | 6 × IDF | |
| tags eşleşmesi | 3 × IDF | |
| niyet ↔ kategori örtüşmesi | 8 | Konu bazında doğru şemsiye |
| kurum adı sorguda geçiyor | 4 | |
| eşanlamlı (synonym) grup eşleşmesi | 5 | |
| crossReference/relatedDocuments bonusu | 4 | İkinci skorlama geçişinde |
| öncelik (priority) ayracı | (11-priority) × 0.2 | İnce ayar |

**IDF (inverse document frequency) ağırlıklandırma**: "og" gibi
onlarca belgede geçen kısa/yaygın terimlerin, "branşman" gibi yalnızca
1-2 belgede geçen özgül terimleri sırf tekrar sayısıyla gölgelemesini
önlemek için klasik bir bilgi erişimi tekniği kullanılır — nadir terim
eşleşmesi orantısız yüksek puan kazanır (bkz. `scoring.ts` `idfWeight`).

Son puan, belgenin kendi `searchWeight` alanıyla çarpılır (mevcut
`repository.search()` ile aynı sözleşme).

## Güven Skoru (Confidence)

Ham puan, doygunlaşan (saturating) bir üstel eğriyle 0-100 aralığına
sıkıştırılır (`scoreToConfidence`). Bantlar (Sprint 7 madde 6):

| Skor | Anlam |
| --- | --- |
| 95+ | Çok güçlü |
| 80+ | Güçlü |
| 60+ | Uygun |
| 40+ | Zayıf |
| 20+ | Belirsiz |
| <20 | Önerilmemeli (genelde gösterilmez) |

## Çapraz Öneriler

`recommendRelated(documentId)`, bir belgenin kendi başlık/kategori/
anahtar kelimelerinden sentetik bir sorgu türetip motoru tekrar
çalıştırır. Bu, Doküman Detay ekranındaki önerilerin yalnızca ELLE
yazılmış `relatedDocuments`/`crossReferences` alanlarıyla SINIRLI
kalmamasını sağlar — AI motoru kendi puanlamasıyla konu-yakın başka
belgeleri de yüzeye çıkarabilir.

## Performans

Bkz. `matcher.ts` başındaki yorum. Özet: `getAllDocuments()` yalnızca
BİR KEZ okunur, ters indeks ilk çağrıda kurulur ve modül ömrü boyunca
önbellekte tutulur. Her `recommendDocuments()` çağrısı, TÜM belgeleri
DEĞİL, yalnızca ters indeksten dönen aday id kümesini skorlar. Bu
tasarım 100/500/1000 belgeli kütüphanelerde de doğrusala yakın
ölçeklenir (bkz. `docs/AI_ENGINE.md` "Performans" için ölçüm notları).

## İleride: RAG entegrasyonu

`RecommendationResult { documents, matchedKeywords, matchedIntents,
matchedSynonyms }` imzası, gelecekte bir vektör benzerlik aramasıyla
(embedding tabanlı retrieval) değiştirilmeye hazır tasarlandı — ekranlar
yalnızca bu tip sözleşmesine bağımlıdır, `recommendDocuments()`'ın İÇİ
değiştirilebilir. `keywords`/`tags`/`aliases`/`summary` alanları zaten
embedding üretimi için hazır bir girdi kümesidir (bkz.
`docs/LIBRARY_ARCHITECTURE.md` §10).

## İleride: OpenAI/LLM entegrasyonu

Bu motorun ürettiği `DocumentRecommendation[]` listesi, ileride bir
LLM'e "bu belgeleri bul, sonra bunlardan bir özet/cevap üret" şeklinde
bir bağlam (context) olarak verilebilir — yani bu motor, ileride
kurulacak bir RAG/LLM katmanının **retrieval** adımını zaten karşılar.
Şu an için LLM çağrısı YOKTUR; "Neden önerildi?" metinleri her zaman
`reasons` dizisinden gelen, tamamen açıklanabilir kural tabanlı
ifadelerdir.
