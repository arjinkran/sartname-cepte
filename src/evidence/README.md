# Kanıt Toplama Motoru — Evidence Engine v1 (Sprint 14)

Bu klasör, Şartname Cepte AI'sının çalışma mantığını kökten değiştiren
bir katmandır: AI artık **doğrudan cevap üretmez** — önce ilgili
mevzuatı bulur, ilgili maddeleri (şimdilik belge düzeyinde) toplar,
sonra bir **cevap üretme katmanına** (bu sprintte henüz yok) veri
hazırlar.

## ⚠️ Bu motor NE DEĞİLDİR

- **LLM/OpenAI/Claude entegrasyonu DEĞİLDİR.** Hiçbir dil modeli
  çağrılmaz.
- **RAG DEĞİLDİR.** Embedding/vektör benzerlik araması, vector DB
  YOKTUR.
- **OCR DEĞİLDİR.** PDF içeriği henüz parse edilmez.
- Bkz. kök dizindeki [`PROJECT_CONSTITUTION.md`](../../PROJECT_CONSTITUTION.md)
  — bu motor o anayasanın 10. maddesinin ("Evidence Engine, gelecekteki
  tüm LLM entegrasyonlarının tek veri kaynağıdır") ilk uygulamasıdır.

## Mimari

```
src/evidence/
├── types.ts          — 10 çekirdek tip (Evidence, EvidenceReference, EvidenceScore, ...)
├── matcher.ts          — Intent Engine (src/ai/intent.ts) + AI Recommendation (src/ai/engine.ts) sarmalayıcısı
├── collector.ts          — Document Repository + Source Resolver'dan EvidenceReference/EvidenceSection üretir
├── crossReference.ts       — crossReferences/relatedDocuments zincirini BFS ile genişletir (max derinlik 3)
├── ranking.ts                 — 9 bileşenli, 0-100 kural tabanlı puanlama
├── confidence.ts                 — puanı yeşil/sarı/kırmızı bandına sınıflandırır
├── explanations.ts                  — template tabanlı, LLM'siz açıklama üretimi
├── engine.ts                           — collectEvidence() — TEK genel giriş noktası
├── examples.ts                           — src/ai/examples.ts'ten seçilmiş örnek sorular
└── README.md                               — bu dosya
```

## Akış (`collectEvidence()`)

```
kullanıcı sorusu
  │
  ├─▶ Intent Engine (src/ai/intent.ts detectIntents)         → Intent[]
  ├─▶ AI Recommendation (src/ai/engine.ts recommendDocuments)  → DocumentRecommendation[]
  │
  ├─▶ Document Repository + Source Resolver (collector.ts)      → her aday için EvidenceReference/EvidenceSection
  │
  ├─▶ Cross References (crossReference.ts)                        → en iyi 5 adayın zinciri, max derinlik 3
  │
  ├─▶ Evidence Ranking (ranking.ts)                                  → 0-100 EvidenceScore
  ├─▶ Confidence (confidence.ts)                                       → yeşil/sarı/kırmızı
  ├─▶ Explanations (explanations.ts)                                     → template tabanlı kısa açıklama
  │
  └─▶ EvidenceResult { collection, bestDocuments, relatedDocuments,
                        crossReferenceDocuments, confidence, summary }
```

Bu dosyaların HİÇBİRİ `src/ai/`i veya `src/data/library/repository.ts`'i
**değiştirmez** — yalnızca mevcut, test edilmiş fonksiyonlarını çağırır
(Sprint 14 kuralı: "AI engine'i bozma", "Repository mimarisini bozma").

## Puanlama (Ranking)

9 bileşen, her biri sabit bir üst sınıra sahip (bkz. `ranking.ts`
başındaki `W_*` sabitleri), toplamı 0-100'e sıkıştırılır:

| Bileşen | Üst sınır | Mantık |
| --- | --- | --- |
| Intent eşleşmesi | 15 | Sorguda en az bir niyet tespit edildiyse |
| AI öneri puanı | 25 | AI Recommendation'ın kendi 0-100 confidence'ının %25'i |
| Belge önceliği | 10 | `document.priority` (düşük = öncelikli) |
| Kurum önceliği | 10 | Sabit kurum önceliği haritası (TEDAŞ/EPDK en yüksek) |
| Kategori eşleşmesi | 15 | Niyetin `categoryHints`i belge kategorisiyle eşleşiyorsa |
| Cross reference | 8 | Yalnızca zincirle bulunan belgeler, derinlikle azalan |
| PDF bulunması | 5 | `hasPdf(document)` |
| Official source | 10 | Doğrulanmış (10) / kısıtlı-telifli (6) / manuel (0) |
| Revision | 5 | Güncel + dolu revizyon bilgisi |

## Güven (Confidence)

`confidence.ts`: 0-100 puan → 3 bant.

| Bant | Eşik | Etiket |
| --- | --- | --- |
| 🟢 green | ≥ 70 | Yüksek Güven |
| 🟡 yellow | ≥ 40 | Orta Güven |
| 🔴 red | < 40 | Düşük Güven |

## Cross Reference

`crossReference.ts`, mevcut `crossReferences`/`relatedDocuments`
alanlarını **BFS** (genişlik-öncelikli) ile genişletir:

- `visited` kümesi sayesinde aynı belge **ikinci kez asla gelmez**.
- Maksimum derinlik **sabit 3**'tür — döngüsel referanslar (A→B→A)
  bile sonsuz döngü OLUŞTURMAZ (özyinelemeli çağrı yoktur, `while`
  döngüsü derinlik sınırında durur).

## Gruplama

`engine.ts`'teki `groupEvidences()`, her kanıtı `documentType` alanına
göre 6 sabit gruptan birine yerleştirir: Yönetmelikler, Şartnameler,
Standartlar, Tebliğler, Rehberler, Diğer (Kanun/Genelge/Kılavuz/Teknik
Doküman `documentType`leri "Diğer"e düşer). Boş gruplar sonuca dahil
edilmez.

## Gelecekte: PDF Parser

`EvidenceSection.available` bu sprintte HER ZAMAN `false`'tur —
`pageHint`/`excerpt` alanları tanımsızdır. Gerçek bir PDF metin
çıkarıcı eklendiğinde, `collector.ts`'teki `buildEvidenceSection()`
İÇİ değiştirilecek, `EvidenceSection` TİPİ değişmeyecektir.

## Gelecekte: RAG ve LLM

`EvidenceResult`, gelecekte kurulacak bir RAG/LLM katmanının **tek**
girdisi olacak şekilde tasarlandı (bkz.
[`docs/EVIDENCE_ENGINE.md`](../../docs/EVIDENCE_ENGINE.md) "Future
RAG"/"Future LLM"). O sprint geldiğinde bu motorun API yüzeyi
DEĞİŞMEYECEK — yalnızca `EvidenceResult`'ı tüketen yeni bir katman
eklenecektir.
