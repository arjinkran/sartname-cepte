# AI Mevzuat Tavsiye Motoru (Sprint 7)

Bu belge, `src/ai/` klasöründeki kural tabanlı öneri motorunun mimarisini,
puanlama formülünü, niyet/eşanlamlı sistemlerini, performans
karakteristiğini ve gelecekteki genişleme planlarını (RAG, OpenAI/LLM)
belgeler. Kod-seviyesi ayrıntılar için bkz. [`src/ai/README.md`](../src/ai/README.md).

## Neden bu sprint var?

Sprint 5-6'ya kadar AI ekranı, `repository.searchKeywords()` — yani
düz bir anahtar kelime alt-dize taramasıydı. Sprint 7, aynı **hiçbir
LLM/RAG/API/internet kullanmama** ilkesini koruyarak, sorgudan **niyet**
çıkaran, saha jargonunu **eşanlamlı** terimlerle normalize eden ve
belgeleri **çok alanlı ağırlıklı** bir formülle puanlayan daha güçlü bir
kural motoruna geçişi kapsar.

## Mimari

```
kullanıcı sorusu
       │
       ▼
┌─────────────────┐     ┌──────────────────┐
│  intent.ts       │     │  synonyms.ts      │
│  detectIntents() │     │  findSynonymMatches│
└────────┬─────────┘     └─────────┬────────┘
         │  Intent[]                │  SynonymMatch[]
         └──────────────┬───────────┘
                         ▼
                 terim listesi (tokenize + synonym kanonikleri)
                         │
                         ▼
              ┌──────────────────────┐
              │  matcher.ts           │  ← ters indeks (bir kez kurulur)
              │  getCandidateIds()    │
              └──────────┬───────────┘
                         │  Set<docId> (aday belgeler)
                         ▼
              ┌──────────────────────┐
              │  scoring.ts            │
              │  scoreDocument() × 2   │  ← 1. geçiş (crossRef yok)
              │  (IDF ağırlıklı)       │     2. geçiş (crossRef bonus)
              └──────────┬───────────┘
                         ▼
              engine.ts recommendDocuments()
                         │
                         ▼
        RecommendationResult { documents, matchedKeywords,
                                matchedIntents, matchedSynonyms }
```

Tüm veri kaynağı `src/data/library/repository.ts`'nin `getAllDocuments()`
fonksiyonudur — Sprint 7 kütüphaneye hiçbir yeni belge eklemez, yalnızca
üzerinde çalışan bir **erişim/sıralama** katmanı kurar.

## Niyet (Intent) sistemi

`intent.ts`, 25 önceden tanımlı niyet kategorisinden (branşman, trafo,
kablo, og, ag, ring, havai-hat, yeraltı-kablosu, topraklama, parafudr,
kesici, ayırıcı, koruma, sayaç, kompanzasyon, ölçü-trafosu, direk,
travers, izolatör, hizmet-kalitesi, bağlantı, proje, kabul, işletme,
bakım, arıza) sorguyla örtüşenleri **tetikleyici ifade** eşleşmesiyle
tespit eder. Bir soru birden fazla niyet içerebilir (`detectIntents()`
ilk eşleşmede durmaz). Her niyetin (varsa) bir `categoryHints` listesi
vardır — bu, `Document.category` alanıyla örtüştüğünde puanlamada
"niyet ↔ kategori" bonusunu tetikler.

## Eşanlamlı (Synonym) sistemi

`synonyms.ts`, saha personelinin farklı isimlendirmelerini (ör. "OG",
"Orta Gerilim", "34,5 kV" → kanonik `og`) tek bir terime indirger.
`findSynonymMatches()`, sorguda geçen her grubun İLK eşleşen terimini
raporlar. Kanonik terim hem ayrı bir puan bonusu kazanır hem de arama
terim listesine eklenir.

## Puanlama

Tam formül ve kod için bkz. [`src/ai/scoring.ts`](../src/ai/scoring.ts).

```
score = Σ_{eşleşen terim t} (alan_katsayısı(t) × idf(t))
      + Σ_{eşleşen niyet}    8
      + (kurum adı eşleşti)  4     (yalnızca bir kez)
      + Σ_{eşleşen synonym}  5
      + (crossReference)     4     (yalnızca bir kez, 2. skorlama geçişinde)
      + (11 - priority) × 0.2
score *= document.searchWeight
```

| Alan | Katsayı |
| --- | --- |
| title/shortTitle veya aliases | 10 |
| keywords | 6 |
| tags | 3 |

### IDF ağırlıklandırma — neden gerekli?

İlk sürümde, "OG" gibi kütüphanede 18 belgede geçen kısa/yaygın bir
terim, "branşman" gibi yalnızca 2 belgede geçen özgül bir terimi
puanca eziyordu — "2 km uzaktaki OG hattan branşman alınacak" sorgusu,
branşmanla doğrudan ilgili EPDK bağlantı belgesi yerine, sırf "OG"
geçen çok sayıda TEDAŞ ekipman şartnamesini üste çıkarıyordu.

Çözüm, klasik bilgi erişiminden ödünç alınan **IDF (inverse document
frequency)** ağırlıklandırmasıdır:

```
idf(terim) = ln((toplam_belge + 1) / (terimi_iceren_belge + 1)) + 1
```

Nadir terimler (düşük `terimi_iceren_belge`) yüksek `idf` alır, yaygın
terimler düşük `idf` alır — ama hiçbir zaman sıfıra inmez (yaygın bir
terim eşleşmesi hâlâ bir sinyal, sadece daha az belirleyici). Bu
sayede tek başına "branşman" veya "hat ayrımı" sorgusu doğru EPDK
belgesini ilk sırada bulur (bkz. `tests/aiRecommendation.test.ts`).

Bu sprint'te elle ölçülen bazı IDF değerleri (121 belgelik kütüphanede):

| Terim | Belge sayısı | idf |
| --- | --- | --- |
| `og` | 18 | ≈ 2.76 |
| `bransman` | 2 | ≈ 4.71 |

## Güven Skoru (Confidence)

Ham puan, doygunlaşan bir üstel eğriyle 0-100'e sıkıştırılır:

```
confidence = round(100 × (1 - e^(-score / 18)))
```

| Skor aralığı (yaklaşık) | Confidence | Anlam |
| --- | --- | --- |
| 45+ | 95+ | Çok güçlü |
| 29+ | 80+ | Güçlü |
| 16+ | 60+ | Uygun |
| 8+ | 40+ | Zayıf |
| 4+ | 20+ | Belirsiz |

Sabit (K=18), gerçek kütüphane verisiyle test edilerek ayarlandı (bkz.
`src/ai/scoring.ts` `scoreToConfidence`).

## Çapraz Öneriler

`recommendRelated(documentId)`, bir belgenin kendi başlık/kategori/ilk
6 anahtar kelimesinden sentetik bir sorgu türetip motoru tekrar
çalıştırır, kendisini sonuçtan çıkarır. Doküman Detay ekranındaki "AI
Önerileri" kartı bunu kullanır — `relatedDocuments`/`crossReferences`
alanlarıyla SINIRLI kalmadan konu-yakın belgeleri de yüzeye çıkarır
(ör. bir dağıtım trafosu belgesi açıldığında ölçü trafosu, OG hücre,
trafo merkezi bağlantı kılavuzu gibi belgeler de önerilir).

## Örnekler

`src/ai/examples.ts`, 68 gerçek saha sorusu içerir (hedef: en az 50).
Bunların ilk 8'i AI ekranındaki "Örnek Sorular" kartında gösterilir;
tamamı `tests/aiRecommendation.test.ts`'in temelini oluşturan konu
kümesini temsil eder.

## Performans

Bkz. `src/ai/matcher.ts` "İndeksleme". Tasarım ilkeleri:

1. `getAllDocuments()` yalnızca **bir kez** okunur (modül-seviyesi
   önbellek, `cachedIndex`).
2. Ters indeks (`invertedIndex: token → Set<docId>`), her belgenin
   title/keywords/aliases/tags/category/institution/summary alanlarını
   TEK SEFERDE tokenize ederek kurulur — O(N) bir kerelik maliyet.
3. Her `recommendDocuments()` çağrısı, TÜM belgeleri değil, yalnızca
   sorgu terimleriyle eşleşen ADAY belgeleri skorlar. Tek kelimelik
   terimler için bu O(1) bir map bakışıdır.
4. Çok kelimeli terimler (eşanlamlı grup kanonik adları gibi) ters
   indekste tek bir token olarak bulunamayacağından, bu durumda
   kelime dağarcığı (vocabulary, belge sayısından bağımsız, doygunlaşan
   bir küme) üzerinde bir alt-dize taraması yapılır — bu, belge
   listesini DEĞİL, önceden kurulmuş token kümesini tarar.

**Ölçülen performans** (121 belgelik mevcut kütüphane, geliştirme
makinesinde): ilk çağrı (indeks kurulumu dahil) ~180ms; sonraki
çağrılar ortalama ~25ms/sorgu (indeks önbellekte). 200 ardışık çağrı
indeksin YENİDEN kurulmadığını doğrular (bkz.
`tests/aiRecommendation.test.ts` "performans" testleri, `getIndex()`
her çağrıda aynı nesne referansını döner).

**500-1000 belgeye ölçekleme beklentisi**: indeks kurulumu O(N) bir
kerelik maliyettir (N=1000'de bile milisaniyeler mertebesinde kalması
beklenir). Sorgu-başı maliyet ise ADAY belge sayısına (aranan terimle
eşleşen belgeler, TÜM kütüphane değil) ve kelime dağarcığı büyüklüğüne
bağlıdır — kelime dağarcığı, belge sayısından çok daha yavaş büyür
(yeni belgeler çoğunlukla MEVCUT kelimeleri tekrar kullanır, tamamen
yeni token seti getirmez). Bu nedenle sorgu-başı maliyetin 1000
belgede de kullanıcı arayüzü için kabul edilebilir sınırlar (<100ms)
içinde kalması beklenir; kesin doğrulama, kütüphane gerçekten bu
büyüklüğe ulaştığında yeniden ölçülmelidir.

## Gelecekte: RAG entegrasyonu

`RecommendationResult` sözleşmesi (`documents`, `matchedKeywords`,
`matchedIntents`, `matchedSynonyms`), gelecekte bir embedding tabanlı
vektör benzerlik aramasıyla değiştirilmeye hazır tasarlandı. Ekranlar
(`AiDestekScreen`, `DocumentDetailScreen`) yalnızca bu tip sözleşmesine
bağımlıdır — `recommendDocuments()`'ın İÇİ (bugünkü kural tabanlı
skorlama yerine bir vektör veritabanı sorgusu) değiştirilebilir, hiçbir
ekran kodu değişmez. `keywords`/`tags`/`aliases`/`summary` alanları
zaten embedding üretimi için hazır bir girdi kümesidir (bkz.
`docs/LIBRARY_ARCHITECTURE.md` §10 "İleride RAG entegrasyonu").

## Gelecekte: OpenAI/LLM entegrasyonu

Bu motorun ürettiği sıralı `DocumentRecommendation[]` listesi, ileride
bir LLM'e "yalnızca bu belgelerin bağlamında cevap üret" şeklinde bir
retrieval-context olarak verilebilir (klasik RAG mimarisinin retrieval
adımı). Şu an için:

- Hiçbir LLM API çağrısı YOKTUR.
- "Neden önerildi?" metinleri, her zaman `reasons` dizisinden gelen,
  hangi kuralın/alanın eşleştiğinin açıklanabilir bir dökümüdür — bir
  dil modelinin ürettiği serbest metin DEĞİLDİR.
- İleride bir LLM eklenirse, bu motorun rolü "hangi belgeler alakalı"
  sorusuna cevap vermek olarak KALIR; LLM yalnızca bu belgeler
  üzerinden bir doğal dil özeti/cevabı üretir — kütüphane dışı bilgi
  üretmez (bkz. uygulamanın baştan beri korunan "sahte AI iddiası yok"
  ilkesi, `docs/LIBRARY_ARCHITECTURE.md` §6).
