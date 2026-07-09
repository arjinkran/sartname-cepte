// AI Mevzuat Tavsiye Motoru v1 (Sprint 7).
//
// ⚠️ Bu bir LLM/RAG/API entegrasyonu DEĞİLDİR — internet bağlantısı
// kullanmaz, OpenAI vb. çağırmaz. Tamamen `src/data/library` Repository'si
// üzerinde çalışan, intent tespiti + eşanlamlı terim normalizasyonu +
// çok alanlı ağırlıklı skorlamadan oluşan kural tabanlı bir sistemdir
// (bkz. README.md ve docs/AI_ENGINE.md "Gelecekte OpenAI/RAG").
import { getAllDocuments, normallestir } from '../data/library/repository.ts';
import type { Document } from '../data/library/types.ts';
import { getCandidateIds, getIdsByCategory, getIndex } from './matcher.ts';
import { detectIntents, intentToCategoryHints } from './intent.ts';
import { findSynonymMatches } from './synonyms.ts';
import { scoreDocument, scoreToConfidence } from './scoring.ts';
import type { DocumentRecommendation, Intent, RecommendationResult, SynonymMatch } from './types.ts';

const DEFAULT_LIMIT = 10;
/** İlk geçişte en iyi kaç adayın relatedDocuments/crossReferences'ı çapraz referans kümesine dahil edilir. */
const CROSS_REFERENCE_SEED_COUNT = 5;

function tokenizeQuery(query: string): string[] {
  return normallestir(query)
    .split(/[^a-z0-9çğıöşü]+/)
    .filter((t) => t.length >= 2);
}

function buildTermList(query: string, synonyms: readonly SynonymMatch[]): string[] {
  const terms = new Set(tokenizeQuery(query));
  // Eşanlamlı grubun KANONİK teriminin kelimelerini de arama terimlerine
  // ekle — böylece "dokunma gerilimi" sorgusu "topraklama" kategorisindeki
  // belgeleri de (kanonik terim üzerinden) yakalayabilir.
  for (const syn of synonyms) {
    for (const t of tokenizeQuery(syn.canonical)) terms.add(t);
  }
  return Array.from(terms);
}

function gatherCrossReferenced(docs: readonly Document[]): Set<string> {
  const ids = new Set<string>();
  for (const d of docs) {
    for (const id of d.relatedDocuments) ids.add(id);
    for (const id of d.crossReferences) ids.add(id);
  }
  return ids;
}

function scoreCandidates(
  candidateIds: ReadonlySet<string>,
  terms: readonly string[],
  intents: readonly Intent[],
  synonyms: readonly SynonymMatch[],
  crossReferencedIds: ReadonlySet<string>
): DocumentRecommendation[] {
  const index = getIndex();
  const results: DocumentRecommendation[] = [];

  for (const id of candidateIds) {
    const doc = index.byId.get(id);
    if (!doc) continue;

    const breakdown = scoreDocument(doc, { terms, intents, synonyms, crossReferencedIds });
    if (breakdown.score <= 0) continue;

    results.push({
      document: doc,
      score: breakdown.score,
      confidence: scoreToConfidence(breakdown.score),
      reasons: breakdown.reasons,
      matchedKeywords: breakdown.matchedKeywords,
      matchedIntents: breakdown.matchedIntents,
      matchedSynonyms: breakdown.matchedSynonyms,
    });
  }

  return results.sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, 'tr'));
}

/**
 * Sprint 7'nin tek genel-amaçlı giriş noktası: bir kullanıcı sorusundan
 * ilgili belge önerileri üretir.
 *
 * Akış:
 * 1. Niyet tespiti (`detectIntents`) + eşanlamlı terim eşleştirme (`findSynonymMatches`).
 * 2. Ters indeksten (`getCandidateIds`) aday belgeler toplanır — TÜM
 *    kütüphane taranmaz (bkz. matcher.ts "Performans").
 * 3. Niyetle örtüşen kategorilerdeki belgeler de adaylara eklenir.
 * 4. İLK skorlama geçişi (henüz crossReference bonusu YOK).
 * 5. En iyi `CROSS_REFERENCE_SEED_COUNT` adayın relatedDocuments/
 *    crossReferences birleşimi çıkarılır, bu id'ler de adaylara eklenir.
 * 6. İKİNCİ (son) skorlama geçişi — artık crossReference bonusu aktif.
 */
export function recommendDocuments(question: string, limit: number = DEFAULT_LIMIT): RecommendationResult {
  const intents = detectIntents(question);
  const synonyms = findSynonymMatches(question);
  const terms = buildTermList(question, synonyms);

  const queryMatchedKeywords = Array.from(new Set(terms));
  const queryMatchedSynonyms = synonyms.map((s) => s.canonical);

  if (terms.length === 0) {
    return { documents: [], matchedKeywords: [], matchedIntents: intents, matchedSynonyms: queryMatchedSynonyms };
  }

  const candidateIds = getCandidateIds(terms);
  for (const intent of intents) {
    for (const hint of intentToCategoryHints(intent)) {
      for (const id of getIdsByCategory(hint)) candidateIds.add(id);
    }
  }

  if (candidateIds.size === 0) {
    return { documents: [], matchedKeywords: queryMatchedKeywords, matchedIntents: intents, matchedSynonyms: queryMatchedSynonyms };
  }

  const firstPass = scoreCandidates(candidateIds, terms, intents, synonyms, new Set());

  const seedDocs = firstPass.slice(0, CROSS_REFERENCE_SEED_COUNT).map((r) => r.document);
  const crossReferencedIds = gatherCrossReferenced(seedDocs);
  for (const id of crossReferencedIds) candidateIds.add(id);

  const finalResults = scoreCandidates(candidateIds, terms, intents, synonyms, crossReferencedIds);

  return {
    documents: finalResults.slice(0, limit),
    matchedKeywords: queryMatchedKeywords,
    matchedIntents: intents,
    matchedSynonyms: queryMatchedSynonyms,
  };
}

/**
 * Çapraz öneriler (Sprint 7, madde 9): bir belge açıldığında, o belgenin
 * kendi başlık/kategori/anahtar kelimelerinden sentetik bir sorgu türetip
 * motoru tekrar çalıştırır. Sonuç, yalnızca o belgenin ELLE yazılmış
 * `relatedDocuments`/`crossReferences` alanlarıyla SINIRLI kalmaz — AI
 * motorunun kendi puanlamasıyla bulduğu başka ilişkili belgeleri de
 * yüzeye çıkarabilir (ör. bir trafo belgesi açıldığında ölçü trafosu, OG
 * hücre, parafudr gibi konu-yakın belgeler de önerilebilir).
 */
export function recommendRelated(documentId: string, limit = 6): RecommendationResult {
  const doc = getAllDocuments().find((d) => d.id === documentId);
  if (!doc) {
    return { documents: [], matchedKeywords: [], matchedIntents: [], matchedSynonyms: [] };
  }

  const syntheticQuery = [doc.title, doc.category, ...doc.keywords.slice(0, 6)].join(' ');
  const result = recommendDocuments(syntheticQuery, limit + 1);

  return {
    ...result,
    documents: result.documents.filter((r) => r.document.id !== documentId).slice(0, limit),
  };
}
