// Puanlama motoru (Sprint 7, madde 4) — çok alanlı, ağırlıklı skorlama.
//
// PUANLAMA FORMÜLÜ (bkz. docs/AI_ENGINE.md "Puanlama" için ayrıntılı
// örnekler):
//
//   score = Σ(alan_eşleşmeleri × alan_katsayısı × idf_ağırlığı)
//         + (niyet↔kategori × 8) + (kurum × 4) + (synonym × 5) + (crossRef × 4)
//         + (11 - priority) × 0.2         (öncelik ayracı)
//   score *= document.searchWeight         (mevcut repository.search() ile
//                                            aynı sözleşme — nötr belgelerde
//                                            searchWeight=1, no-op)
//
// Alan katsayıları (WEIGHTS), title/alias/keyword/tag eşleşmeleri için
// `idfWeight(term)` ile ÇARPILIR — bu, "og" gibi onlarca belgede geçen
// kısa/yaygın terimlerin, "branşman" gibi yalnızca 1-2 belgede geçen özgül
// terimleri sırf tekrar sayısıyla gölgelemesini önleyen klasik bir bilgi
// erişimi (IDF) tekniğidir. Nadir terim eşleşmesi orantısız yüksek puan
// kazanır; yaygın terim eşleşmesi hâlâ katkı sağlar ama daha az belirleyici
// olur (bkz. yukarıdaki `idfWeight`).
//
//   title/shortTitle veya aliases eşleşmesi : 10 puan / benzersiz terim × idf
//   keywords eşleşmesi                      :  6 puan / benzersiz terim × idf
//   tags eşleşmesi                          :  3 puan / benzersiz terim × idf
//   niyet ↔ kategori örtüşmesi              :  8 puan / eşleşen niyet
//   kurum adı sorguda geçiyor               :  4 puan (yalnızca bir kez)
//   eşanlamlı (synonym) grup eşleşmesi      :  5 puan / eşleşen grup
//   crossReference/relatedDocuments bonusu  :  4 puan (yalnızca bir kez)
//
// Neden bu sıralama (yüksekten düşüğe)? title/alias en güçlü sinyal
// (kullanıcı doğrudan o ifadeyi kullanmış), niyet↔kategori örtüşmesi
// ikinci en güçlü (konu bazında doğru şemsiye), keywords/synonym orta
// güçte (dolaylı ama anlamlı eşleşme), kurum/tag/crossReference/priority
// ise ince ayar (tie-breaker) niteliğinde küçük katkılar.
import type { Document } from '../data/library/types.ts';
import { normallestir } from '../data/library/repository.ts';
import type { Intent, SynonymMatch } from './types.ts';
import { intentToCategoryHints } from './intent.ts';
import { getDocumentFrequency, getTotalDocumentCount } from './matcher.ts';

/**
 * IDF (inverse document frequency) ağırlığı — "og" gibi onlarca belgede
 * geçen kısa/yaygın terimlerin, "branşman" gibi yalnızca 1-2 belgede geçen
 * özgül terimleri gölgelemesini önler (klasik bilgi erişimi tekniği).
 * Hiçbir zaman sıfıra inmez; nadir terimler orantısız yüksek ağırlık alır.
 */
function idfWeight(term: string): number {
  const total = getTotalDocumentCount();
  const df = getDocumentFrequency(term);
  return Math.log((total + 1) / (df + 1)) + 1;
}

export const WEIGHTS = {
  titleOrAlias: 10,
  keyword: 6,
  tag: 3,
  intentCategory: 8,
  institution: 4,
  synonym: 5,
  crossReference: 4,
  priorityStep: 0.2,
} as const;

interface FieldMatches {
  titleHits: string[];
  aliasHits: string[];
  keywordHits: string[];
  tagHits: string[];
}

function matchFields(doc: Document, terms: readonly string[]): FieldMatches {
  const title = normallestir(`${doc.title} ${doc.shortTitle}`);
  const aliases = doc.aliases.map(normallestir);
  const keywords = doc.keywords.map(normallestir);
  const tags = doc.tags.map(normallestir);

  const titleHits: string[] = [];
  const aliasHits: string[] = [];
  const keywordHits: string[] = [];
  const tagHits: string[] = [];

  for (const rawTerm of terms) {
    const term = normallestir(rawTerm);
    if (term.length < 2) continue;
    if (title.includes(term)) titleHits.push(term);
    if (aliases.some((a) => a.includes(term))) aliasHits.push(term);
    if (keywords.some((k) => k.includes(term))) keywordHits.push(term);
    if (tags.some((t) => t.includes(term))) tagHits.push(term);
  }

  return { titleHits, aliasHits, keywordHits, tagHits };
}

export interface ScoreParams {
  terms: readonly string[];
  intents: readonly Intent[];
  synonyms: readonly SynonymMatch[];
  /** İlk skorlama geçişinde bulunan en iyi adayların relatedDocuments/crossReferences birleşimi. */
  crossReferencedIds: ReadonlySet<string>;
}

export interface ScoreBreakdown {
  score: number;
  reasons: string[];
  matchedKeywords: string[];
  matchedIntents: Intent[];
  matchedSynonyms: string[];
}

export function scoreDocument(doc: Document, params: ScoreParams): ScoreBreakdown {
  let score = 0;
  const reasons: string[] = [];
  const matchedKeywordsSet = new Set<string>();
  const matchedIntents: Intent[] = [];
  const matchedSynonyms: string[] = [];

  const fields = matchFields(doc, params.terms);

  const titleAliasUnique = new Set([...fields.titleHits, ...fields.aliasHits]);
  if (titleAliasUnique.size > 0) {
    for (const t of titleAliasUnique) {
      score += WEIGHTS.titleOrAlias * idfWeight(t);
      matchedKeywordsSet.add(t);
    }
    if (fields.titleHits.length > 0) {
      reasons.push(`Başlıkta '${fields.titleHits[0]}' ifadesi eşleşti.`);
    } else {
      reasons.push(`Alternatif adda/kısaltmada '${fields.aliasHits[0]}' eşleşti.`);
    }
  }

  const keywordUnique = new Set(fields.keywordHits);
  if (keywordUnique.size > 0) {
    for (const t of keywordUnique) {
      score += WEIGHTS.keyword * idfWeight(t);
      matchedKeywordsSet.add(t);
    }
    reasons.push(
      keywordUnique.size === 1
        ? `Anahtar kelimede '${fields.keywordHits[0]}' eşleşti.`
        : `Anahtar kelimelerde ${keywordUnique.size} eşleşme bulundu (ör. '${fields.keywordHits[0]}').`
    );
  }

  const tagUnique = new Set(fields.tagHits);
  if (tagUnique.size > 0) {
    for (const t of tagUnique) {
      score += WEIGHTS.tag * idfWeight(t);
      matchedKeywordsSet.add(t);
    }
  }

  const docCategory = normallestir(doc.category);
  for (const intent of params.intents) {
    const hints = intentToCategoryHints(intent).map(normallestir);
    if (hints.includes(docCategory)) {
      score += WEIGHTS.intentCategory;
      matchedIntents.push(intent);
      reasons.push(`Kategori '${doc.category}', '${intent}' niyetiyle örtüşüyor.`);
    }
  }

  for (const rawTerm of params.terms) {
    const term = normallestir(rawTerm);
    if (term.length >= 2 && normallestir(doc.institution).includes(term)) {
      score += WEIGHTS.institution;
      reasons.push(`${doc.institution} kurumuna ait bir belge.`);
      break;
    }
  }

  const haystack = normallestir([doc.title, ...doc.keywords, ...doc.tags, doc.category].join(' '));
  for (const syn of params.synonyms) {
    if (haystack.includes(normallestir(syn.canonical))) {
      score += WEIGHTS.synonym;
      matchedSynonyms.push(syn.canonical);
      reasons.push(`'${syn.matchedTerm}' ifadesi '${syn.canonical}' ile eşanlamlı kabul edildi.`);
    }
  }

  if (params.crossReferencedIds.has(doc.id)) {
    score += WEIGHTS.crossReference;
    reasons.push('İlgili bulunan başka bir belgeyle çapraz referanslı.');
  }

  score += (11 - doc.priority) * WEIGHTS.priorityStep;
  score *= doc.searchWeight;

  return { score, reasons, matchedKeywords: Array.from(matchedKeywordsSet), matchedIntents, matchedSynonyms };
}

/**
 * Ham puanı 0-100 güven skoruna çevirir (Sprint 7, madde 6). Doygunlaşan
 * (saturating) üstel eğri kullanılır: küçük puanlarda hızlı yükselir,
 * yüksek puanlarda 100'e yaklaşır ama asla üstüne çıkmaz — bu, "en iyi
 * eşleşme her zaman ~%99, geri kalanı rastgele düşük" gibi doğrusal bir
 * ölçeğin üreteceği yapay/aldatıcı kesinlik hissini önler.
 *
 * Sabit (K=18), gerçek kütüphane verisiyle test edilerek güçlü tek-terim
 * eşleşmelerinin (title+keyword, puan ~26) %70-80 bandına, çok alanlı
 * güçlü eşleşmelerin (title+keyword+intent+synonym, puan ~45+) %90+
 * bandına denk gelecek şekilde ayarlandı (bkz. madde 6 bant tanımları).
 */
export function scoreToConfidence(score: number): number {
  const K = 18;
  const raw = 100 * (1 - Math.exp(-Math.max(0, score) / K));
  return Math.round(Math.min(100, Math.max(0, raw)));
}
