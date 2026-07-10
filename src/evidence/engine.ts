// Kanıt Toplama Motoru — ana giriş noktası (Sprint 14, madde 3, 11).
//
// ⚠️ Bu motor GERÇEK bir cevap ÜRETMEZ — yalnızca ilgili mevzuatı bulur,
// puanlar, gruplar ve makine tarafından okunabilir bir özet çıkarır.
// LLM/RAG/OpenAI/embedding/vector DB YOKTUR (bkz. PROJECT_CONSTITUTION.md).
//
// Akış (madde 3): kullanıcı sorusu → Intent Engine → AI Recommendation
// → Document Repository → Source Resolver → Cross References →
// Evidence Ranking → Evidence Result.
import { matchEvidence } from './matcher.ts';
import { getEvidenceSignals, buildEvidenceReference, buildEvidenceSection } from './collector.ts';
import { collectCrossReferences } from './crossReference.ts';
import { rankEvidence, type RankingContext } from './ranking.ts';
import { scoreToEvidenceConfidence, aggregateEvidenceConfidence } from './confidence.ts';
import { buildExplanation } from './explanations.ts';
import type { Document, DocumentType } from '../data/library/types.ts';
import type { Intent } from '../ai/types.ts';
import type {
  Evidence,
  EvidenceCandidate,
  EvidenceCollection,
  EvidenceGroup,
  EvidenceGroupName,
  EvidenceReason,
  EvidenceResult,
} from './types.ts';

const DEFAULT_LIMIT = 10;
/** AI Recommendation'ın en iyi kaç adayının cross-reference'ı genişletilsin (Sprint 7'nin CROSS_REFERENCE_SEED_COUNT'uyla AYNI ilke). */
const CROSS_REFERENCE_SEED_COUNT = 5;

function buildReasons(score: ReturnType<typeof rankEvidence>['breakdown'], intents: readonly Intent[], crossReferenceDepth: number): EvidenceReason[] {
  const reasons: EvidenceReason[] = [];
  if (score.intentMatch > 0) reasons.push({ code: 'intent-match', label: `Soru niyeti tespit edildi (${intents.join(', ')}).` });
  if (score.aiRecommendation > 0) reasons.push({ code: 'ai-recommendation', label: 'AI Tavsiye Motoru bu belgeyi önerdi.' });
  if (score.categoryMatch > 0) reasons.push({ code: 'category-match', label: 'Belge kategorisi niyetle örtüşüyor.' });
  if (score.crossReference > 0) reasons.push({ code: 'cross-reference', label: `Çapraz referans zinciriyle bulundu (derinlik ${crossReferenceDepth}).` });
  if (score.pdfAvailable > 0) reasons.push({ code: 'pdf-available', label: 'Bu belgenin PDF\'i mevcut.' });
  if (score.officialSource > 0) reasons.push({ code: 'official-source', label: 'Belge doğrulanmış resmî bir kaynağa sahip.' });
  if (score.revision > 0) reasons.push({ code: 'revision', label: 'Belge güncel bir revizyona sahip.' });
  if (score.institutionPriority >= 8) reasons.push({ code: 'institution-priority', label: 'Kurum, uygulama açısından öncelikli kabul edilir.' });
  return reasons;
}

function buildCandidate(document: Document, intents: readonly Intent[], aiConfidence: number, crossReferenceDepth: number): EvidenceCandidate {
  const signals = getEvidenceSignals(document);
  const context: RankingContext = { intents, aiConfidence, crossReferenceDepth };
  const score = rankEvidence(document, context, signals.pdfAvailable, signals.officialSourceStatus);
  const confidence = scoreToEvidenceConfidence(score.total);
  const explanation = buildExplanation(document, intents, crossReferenceDepth);
  const reference = buildEvidenceReference(document, signals, confidence.score, explanation);
  const section = buildEvidenceSection(document);
  const reasons = buildReasons(score.breakdown, intents, crossReferenceDepth);

  return { document, reference, section, score, confidence, reasons, explanation, crossReferenceDepth };
}

function toEvidence(candidate: EvidenceCandidate): Evidence {
  return {
    reference: candidate.reference,
    confidence: candidate.confidence,
    explanation: candidate.explanation,
    crossReferenceDepth: candidate.crossReferenceDepth,
  };
}

const GROUP_BY_DOCUMENT_TYPE: Record<DocumentType, EvidenceGroupName> = {
  'Yönetmelik': 'Yönetmelikler',
  'Şartname': 'Şartnameler',
  'Standart': 'Standartlar',
  'Tebliğ': 'Tebliğler',
  'Rehber': 'Rehberler',
  'Kanun': 'Diğer',
  'Genelge': 'Diğer',
  'Kılavuz': 'Diğer',
  'Teknik Doküman': 'Diğer',
};

const GROUP_ORDER: readonly EvidenceGroupName[] = ['Yönetmelikler', 'Şartnameler', 'Standartlar', 'Tebliğler', 'Rehberler', 'Diğer'];

/** Kanıtları madde 9'daki 6 sabit gruba ayırır — boş gruplar sonuca DAHİL EDİLMEZ. */
function groupEvidences(evidences: readonly Evidence[]): EvidenceGroup[] {
  const byGroup = new Map<EvidenceGroupName, Evidence[]>();
  for (const evidence of evidences) {
    const groupName = GROUP_BY_DOCUMENT_TYPE[evidence.reference.documentType];
    const list = byGroup.get(groupName) ?? [];
    list.push(evidence);
    byGroup.set(groupName, list);
  }

  return GROUP_ORDER.filter((name) => byGroup.has(name)).map((name) => ({ name, evidences: byGroup.get(name)! }));
}

/** Madde 12: LLM KULLANMADAN, tamamen deterministik bir özet cümlesi üretir. */
function buildSummary(query: string, verifiedCount: number): string {
  if (verifiedCount === 0) {
    return `"${query}" sorusu için doğrulanmış kaynak bulunamadı.`;
  }
  return `Bu soru için ${verifiedCount} doğrulanmış kaynak bulundu.`;
}

/**
 * Sprint 14'ün tek genel-amaçlı giriş noktası. `src/ai/`i ve
 * `src/data/library/repository.ts`'i DEĞİŞTİRMEDEN, onların üzerine
 * kanıt toplama/puanlama/gruplama katmanı kurar.
 */
export function collectEvidence(query: string, limit: number = DEFAULT_LIMIT): EvidenceResult {
  const match = matchEvidence(query, limit);
  const { intents, recommendation } = match;

  // 1. Doğrudan (AI Recommendation'dan gelen) adaylar — crossReferenceDepth: 0.
  const directCandidates = recommendation.documents.map((rec) => buildCandidate(rec.document, intents, rec.confidence, 0));

  // 2. Cross-reference genişlemesi (madde 8) — yalnızca en iyi N adayın zinciri.
  const seedIds = directCandidates.slice(0, CROSS_REFERENCE_SEED_COUNT).map((c) => c.document.id);
  const crossReferenceNodes = collectCrossReferences(seedIds);

  const directIds = new Set(directCandidates.map((c) => c.document.id));
  const crossReferenceCandidates = crossReferenceNodes
    .filter((node) => !directIds.has(node.document.id)) // aynı belge ikinci kez GİRMESİN (madde 8)
    .map((node) => buildCandidate(node.document, intents, 0, node.depth));

  const allCandidates = [...directCandidates, ...crossReferenceCandidates].sort(
    (a, b) => b.score.total - a.score.total || a.document.title.localeCompare(b.document.title, 'tr')
  );

  // Üç ayrı, birbirini büyük ölçüde DIŞLAYAN küme (madde 11): en iyi
  // (genel en yüksek puanlılar) / ilgili (doğrudan eşleşen ama en iyi
  // kesime girmeyen) / cross-reference (yalnızca zincirle bulunan).
  const bestDocuments = allCandidates.slice(0, Math.min(limit, 5));
  const bestIds = new Set(bestDocuments.map((c) => c.document.id));
  const relatedDocuments = directCandidates.filter((c) => !bestIds.has(c.document.id)).slice(0, limit);
  const crossReferenceDocuments = crossReferenceCandidates;

  const evidences = allCandidates.map(toEvidence);
  const crossReferencedEvidences = crossReferenceDocuments.map(toEvidence);
  const groups = groupEvidences(evidences);

  // "Doğrulanmış kaynak": resmî kaynağı verified/officialPage/publicPdf/restrictedStandard
  // olan (yani manualRequired/notFound OLMAYAN) kanıtlar (madde 12).
  const verifiedCount = evidences.filter(
    (e) => e.reference.officialSourceStatus !== 'manualRequired' && e.reference.officialSourceStatus !== 'notFound'
  ).length;
  const summary = buildSummary(query, verifiedCount);

  const confidence = aggregateEvidenceConfidence(allCandidates.map((c) => c.confidence.score));

  const collection: EvidenceCollection = {
    query,
    evidences,
    groups,
    crossReferenced: crossReferencedEvidences,
    summary,
  };

  return { collection, bestDocuments, relatedDocuments, crossReferenceDocuments, confidence, summary };
}
