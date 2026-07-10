// Kanıt puanlama (Sprint 14, madde 6).
//
// Dokuz bileşenden oluşan, tamamen kural tabanlı bir 0-100 puanlama.
// Hiçbir bileşen LLM/embedding kullanmaz — hepsi mevcut Document
// alanlarına, AI Recommendation'ın kendi puanına ve cross-reference
// derinliğine bakan basit, açıklanabilir kurallardır.
import type { Document, Institution } from '../data/library/types.ts';
import type { Intent } from '../ai/types.ts';
import { intentToCategoryHints } from '../ai/intent.ts';
import type { EvidenceScore } from './types.ts';

// ── Ağırlıklar (her bileşenin üst sınırı) ─────────────────────────────
const W_INTENT_MATCH = 15;
const W_AI_RECOMMENDATION = 25;
const W_DOCUMENT_PRIORITY = 10;
const W_INSTITUTION_PRIORITY = 10;
const W_CATEGORY_MATCH = 15;
const W_CROSS_REFERENCE = 8;
const W_PDF_AVAILABLE = 5;
const W_OFFICIAL_SOURCE = 10;
const W_REVISION = 5;

/** Kurumun "pratik cevap" bağlamındaki göreli önceliği (0-10) — TEDAŞ/EPDK/Resmî Gazete gibi doğrudan uygulayıcı kurumlar en yüksek, telifli standart kuruluşları daha düşük. */
const INSTITUTION_PRIORITY: Partial<Record<Institution, number>> = {
  'TEDAŞ': 10,
  'EPDK': 9,
  'Resmî Gazete': 9,
  'TEİAŞ': 8,
  'Enerji Bakanlığı': 7,
  'TSE': 6,
  'TS EN': 6,
  'IEC': 5,
  'CENELEC': 5,
  'IEEE': 4,
  'Diğer': 3,
};

export interface RankingContext {
  intents: readonly Intent[];
  /** AI Recommendation'ın (Sprint 7) bu belge için ürettiği 0-100 güven skoru — belge yalnızca cross-reference ile ulaşıldıysa 0. */
  aiConfidence: number;
  /** 0 = doğrudan AI/Intent eşleşmesi, 1-3 = cross-reference zinciri üzerinden ulaşıldı (bkz. crossReference.ts). */
  crossReferenceDepth: number;
}

function scoreIntentMatch(intents: readonly Intent[]): number {
  return intents.length > 0 ? W_INTENT_MATCH : 0;
}

function scoreAiRecommendation(aiConfidence: number): number {
  const clamped = Math.max(0, Math.min(100, aiConfidence));
  return Math.round((clamped / 100) * W_AI_RECOMMENDATION);
}

/** `document.priority`: düşük sayı = daha öncelikli (bkz. Document tipi yorumu). */
function scoreDocumentPriority(document: Document): number {
  return Math.max(0, Math.min(W_DOCUMENT_PRIORITY, W_DOCUMENT_PRIORITY - document.priority));
}

function scoreInstitutionPriority(document: Document): number {
  return INSTITUTION_PRIORITY[document.institution] ?? 5;
}

function scoreCategoryMatch(document: Document, intents: readonly Intent[]): number {
  for (const intent of intents) {
    if (intentToCategoryHints(intent).includes(document.category)) return W_CATEGORY_MATCH;
  }
  return 0;
}

/** Yalnızca CROSS-REFERENCE ile (doğrudan AI/Intent eşleşmesi OLMADAN) ulaşılan belgelere, derinlikle azalan bir bonus verir. */
function scoreCrossReference(crossReferenceDepth: number): number {
  if (crossReferenceDepth <= 0) return 0;
  if (crossReferenceDepth === 1) return W_CROSS_REFERENCE;
  if (crossReferenceDepth === 2) return Math.round(W_CROSS_REFERENCE * 0.6);
  return Math.round(W_CROSS_REFERENCE * 0.3); // derinlik 3
}

function scorePdfAvailable(pdfAvailable: boolean): number {
  return pdfAvailable ? W_PDF_AVAILABLE : 0;
}

function scoreOfficialSource(officialSourceStatus: string): number {
  if (officialSourceStatus === 'publicPdf' || officialSourceStatus === 'officialPage') return W_OFFICIAL_SOURCE;
  if (officialSourceStatus === 'restrictedStandard') return Math.round(W_OFFICIAL_SOURCE * 0.6); // hâlâ resmî, yalnızca telifli
  return 0; // manualRequired / notFound
}

function scoreRevision(document: Document): number {
  if (document.status === 'deprecated') return 0;
  if (!document.revision) return 0;
  return document.status === 'draft' ? Math.round(W_REVISION * 0.4) : W_REVISION;
}

/**
 * Bir belge için tam puan dökümünü hesaplar (madde 6). `pdfAvailable`/
 * `officialSourceStatus`, çağıran taraf (engine.ts) tarafından zaten
 * `collector.ts`'ten hesaplanmış olarak verilir — bu fonksiyon ikinci
 * kez Source Resolver'ı ÇAĞIRMAZ (gereksiz tekrar olmasın diye).
 */
export function rankEvidence(
  document: Document,
  context: RankingContext,
  pdfAvailable: boolean,
  officialSourceStatus: string
): EvidenceScore {
  const breakdown = {
    intentMatch: scoreIntentMatch(context.intents),
    aiRecommendation: scoreAiRecommendation(context.aiConfidence),
    documentPriority: scoreDocumentPriority(document),
    institutionPriority: scoreInstitutionPriority(document),
    categoryMatch: scoreCategoryMatch(document, context.intents),
    crossReference: scoreCrossReference(context.crossReferenceDepth),
    pdfAvailable: scorePdfAvailable(pdfAvailable),
    officialSource: scoreOfficialSource(officialSourceStatus),
    revision: scoreRevision(document),
  };

  const rawTotal = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  const total = Math.max(0, Math.min(100, Math.round(rawTotal)));

  return { total, breakdown };
}
