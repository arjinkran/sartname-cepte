// Kanıt eşleştirme — Intent Engine + AI Recommendation katmanlarını
// ÇAĞIRIR, ikisini de DEĞİŞTİRMEZ (Sprint 14 kuralı: "AI engine'i
// bozma"). Bu dosya, `src/ai/`in üzerine ince bir sarmalayıcıdır.
import { detectIntents } from '../ai/intent.ts';
import { recommendDocuments } from '../ai/engine.ts';
import type { Intent, RecommendationResult } from '../ai/types.ts';

export interface EvidenceMatch {
  query: string;
  intents: readonly Intent[];
  recommendation: RecommendationResult;
}

/**
 * Akışın ilk iki adımı (madde 3): Intent Engine → AI Recommendation.
 * `limit`, AI motorundan istenecek aday sayısıdır — kanıt motoru
 * bunların üzerine cross-reference genişlemesi + yeniden puanlama
 * uygular (bkz. engine.ts).
 */
export function matchEvidence(query: string, limit: number): EvidenceMatch {
  const intents = detectIntents(query);
  const recommendation = recommendDocuments(query, limit);
  return { query, intents, recommendation };
}
