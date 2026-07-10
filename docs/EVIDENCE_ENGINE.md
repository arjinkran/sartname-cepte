# Evidence Engine v1 (Sprint 14)

Bu doküman, `src/evidence/` katmanının mimarisini, puanlama/güven
mantığını ve gelecekteki genişleme noktalarını açıklar. Kısa mimari
özeti için ayrıca bkz. [`src/evidence/README.md`](../src/evidence/README.md).

## Neden bu sprint gerekliydi

Sprint 7'nin AI Mevzuat Tavsiye Motoru, bir soruya "en ilgili belgeler"
listesi döndürüyordu — ama bu listenin GERÇEKTEN bir cevaba dönüşmesi
için (ör. gelecekte bir LLM ile) hangi belgelerin **doğrulanmış,
izlenebilir, kaynaklı** olduğu ayrı ayrı bilinmiyordu. Evidence Engine,
AI önerilerini Document Repository ve Source Resolver ile birleştirerek
her adayı **kanıt** düzeyine yükseltir: kim yayınlamış, resmî kaynağı
doğrulanmış mı, PDF'i var mı, hangi başka belgelerle ilişkili.

## Evidence Engine

Ana giriş noktası `collectEvidence(query, limit?)` — `src/evidence/engine.ts`.
Akış, hâlihazırda var olan üç katmanı SIRAYLA çağırır (hiçbirini
değiştirmeden):

1. **Intent Engine** (`src/ai/intent.ts`) — sorudan niyet(ler) tespit eder.
2. **AI Recommendation** (`src/ai/engine.ts`) — kural tabanlı belge önerileri üretir.
3. **Document Repository** (`src/data/library/repository.ts`) — belge meta verisi.
4. **Source Resolver** (`src/sourceResolver/resolver.ts`) — resmî kaynak durumu.
5. **Cross References** (`src/evidence/crossReference.ts`) — ilişkili belge zinciri.
6. **Evidence Ranking** (`src/evidence/ranking.ts`) — 0-100 puan.
7. **Evidence Result** — `EvidenceResult` sözleşmesi.

## Ranking

`ranking.ts`'teki `rankEvidence()`, 9 bileşenli, tamamen açıklanabilir
bir puanlama uygular (ayrıntılı ağırlık tablosu için bkz.
`src/evidence/README.md` "Puanlama"). Hiçbir bileşen olasılıksal/
istatistiksel bir model DEĞİLDİR — hepsi sabit kurallardır, bu yüzden
her puanın NEDEN o değeri aldığı `EvidenceScore.breakdown` alanından
tam olarak izlenebilir.

## Confidence

`confidence.ts`'teki `scoreToEvidenceConfidence()`, 0-100 puanı
🟢 Yüksek (≥70) / 🟡 Orta (≥40) / 🔴 Düşük (<40) bandına indirger.
`aggregateEvidenceConfidence()`, bir koleksiyonun TAMAMI için en
yüksek skorlu kanıdın confidence'ını "toplu" güven olarak kullanır —
tekil bir kanıt bile güçlüyse, kullanıcıya "bu soru için güçlü bir
kanıt var" sinyali doğru verilir.

## Cross References

`crossReference.ts`, mevcut `Document.crossReferences`/
`relatedDocuments` alanlarını BFS (genişlik-öncelikli) ile tarar:

- **Duplicate önleme**: `visited: Set<string>` tohum id'leri de
  içerir; bir belge id'si BİR KEZ ziyaret edilir, ikinci kez asla
  sonuca girmez.
- **Depth limiti**: sabit `MAX_CROSS_REFERENCE_DEPTH = 3`. `while`
  döngüsü yalnızca `frontier` (bir sonraki seviyede keşfedilecek yeni
  id'ler) BOŞ olduğunda veya derinlik sınırına ulaşıldığında durur —
  özyinelemeli (recursive) bir çağrı YOKTUR, bu yüzden döngüsel
  referanslar (A→B→A) sonsuz döngü OLUŞTURAMAZ.

## Evidence Group

`engine.ts`'teki `groupEvidences()`, her kanıtı `documentType` alanına
göre 6 sabit gruptan birine (Yönetmelikler/Şartnameler/Standartlar/
Tebliğler/Rehberler/Diğer) yerleştirir. Bu, tamamen mevcut alan
verisinden türetilir — elle bakım gerektiren ayrı bir sınıflandırma
listesi YOKTUR.

## Future PDF Parser

`EvidenceSection` tipi (bkz. `src/evidence/types.ts`) `available`,
`pageHint`, `excerpt` alanlarını ŞİMDİDEN tanımlar — bu sprintte
`available` her zaman `false`, diğer ikisi her zaman tanımsızdır
(madde 5: "Henüz PDF parse edilmeyecek... ama mimari PDF parser
eklenmesine hazır olacak"). Gerçek bir PDF metin çıkarıcı eklendiğinde:

1. `collector.ts`'teki `buildEvidenceSection()` İÇİ değiştirilir —
   gerçek sayfa/paragraf verisi doldurulur.
2. `EvidenceSection` TİPİ DEĞİŞMEZ — `EvidenceCandidate`/`Evidence`
   sözleşmeleri, dolayısıyla UI, hiçbir değişiklik gerektirmez.

## Future RAG

`EvidenceResult.collection.evidences` (skora göre sıralı, kaynaklı
kanıt listesi) doğrudan bir embedding tabanlı retrieval katmanının
GİRDİSİ olabilir — belge başlığı/özeti yerine artık **doğrulanmış,
kaynaklı** bir aday kümesi üzerinden semantik arama yapılabilir. Bu,
`src/ai/README.md`'nin "İleride: RAG entegrasyonu" bölümüyle AYNI
vizyonun bir adım ilerisidir: RAG katmanı eklendiğinde `collectEvidence()`
İÇİ değiştirilebilir, dışa açılan `EvidenceResult` sözleşmesi sabit kalır.

## Future LLM

`EvidenceResult`, gelecekte bir LLM'e "yalnızca bu kanıtlara dayanarak
cevap üret, kaynak göster" şeklinde bir bağlam (context) olarak
verilebilir — yani bu motor, ileride kurulacak bir cevap üretme
katmanının **retrieval + grounding** adımını ŞİMDİDEN karşılar. Şu an
için LLM çağrısı YOKTUR; `Evidence.explanation` her zaman
`explanations.ts`'ten gelen, template tabanlı, tamamen açıklanabilir
bir cümledir (bkz. kök dizindeki
[`PROJECT_CONSTITUTION.md`](../PROJECT_CONSTITUTION.md) madde 1-4).
