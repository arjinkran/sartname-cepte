// Kanıt güven sınıflandırması (Sprint 14, madde 7).
// 0-100 arası ham puanı 3 renkli bant + kullanıcıya gösterilebilir bir
// etikete indirger. Saf/deterministik bir fonksiyondur — LLM YOKTUR.
import type { EvidenceConfidence, EvidenceConfidenceBand } from './types.ts';

export const CONFIDENCE_GREEN_THRESHOLD = 70;
export const CONFIDENCE_YELLOW_THRESHOLD = 40;

const BAND_LABELS: Record<EvidenceConfidenceBand, string> = {
  green: 'Yüksek Güven',
  yellow: 'Orta Güven',
  red: 'Düşük Güven',
};

/** Bir puanı (0-100 aralığının dışında olsa bile) sıkıştırıp 3 banttan birine sınıflandırır. */
export function scoreToEvidenceConfidence(score: number): EvidenceConfidence {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band: EvidenceConfidenceBand =
    clamped >= CONFIDENCE_GREEN_THRESHOLD ? 'green' : clamped >= CONFIDENCE_YELLOW_THRESHOLD ? 'yellow' : 'red';

  return { score: clamped, band, label: BAND_LABELS[band] };
}

/** Birden fazla kanıtın (ör. bir koleksiyonun tamamının) toplu/aggregate güvenini üretir — en yüksek skorlu kanıdın confidence'ıdır. */
export function aggregateEvidenceConfidence(scores: readonly number[]): EvidenceConfidence {
  if (scores.length === 0) return scoreToEvidenceConfidence(0);
  return scoreToEvidenceConfidence(Math.max(...scores));
}
