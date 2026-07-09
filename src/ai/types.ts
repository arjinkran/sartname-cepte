// AI Mevzuat Tavsiye Motoru — ortak tip tanımları (Sprint 7).
// Bu motor bir LLM/RAG/API DEĞİLDİR — bkz. README.md.
import type { Document } from '../data/library/types.ts';

/**
 * Kullanıcı sorusundan çıkarılabilecek "niyet" kategorileri — Sprint 7
 * madde 2'deki listeyle birebir. Yeni bir niyet eklerken hem bu union'a
 * hem de `intent.ts`'teki `INTENT_DEFINITIONS`e eklenmelidir.
 */
export type Intent =
  | 'branşman'
  | 'trafo'
  | 'kablo'
  | 'og'
  | 'ag'
  | 'ring'
  | 'havai-hat'
  | 'yeraltı-kablosu'
  | 'topraklama'
  | 'parafudr'
  | 'kesici'
  | 'ayırıcı'
  | 'koruma'
  | 'sayaç'
  | 'kompanzasyon'
  | 'ölçü-trafosu'
  | 'direk'
  | 'travers'
  | 'izolatör'
  | 'hizmet-kalitesi'
  | 'bağlantı'
  | 'proje'
  | 'kabul'
  | 'işletme'
  | 'bakım'
  | 'arıza';

/** Bir eşanlamlı grubun sorguda hangi terimle eşleştiğini taşır. */
export interface SynonymMatch {
  /** Grubun kanonik (normalleştirilmiş) adı, ör. "topraklama". */
  canonical: string;
  /** Sorguda GEÇEN gerçek terim, ör. "dokunma gerilimi". */
  matchedTerm: string;
}

/** Tek bir belge için üretilen öneri — puan, gerekçe ve eşleşme detayları. */
export interface DocumentRecommendation {
  document: Document;
  /** Ham ağırlıklı puan (üst sınırı yok, sıralama için kullanılır). */
  score: number;
  /** 0-100 aralığına normalize edilmiş güven skoru (bkz. scoring.ts). */
  confidence: number;
  /** Bu belgenin neden önerildiğini açıklayan, kullanıcıya gösterilebilir cümleler. */
  reasons: readonly string[];
  /** Bu belgede eşleşen ham sorgu terimleri (title/keywords/aliases). */
  matchedKeywords: readonly string[];
  /** Bu belgeyle örtüşen niyetler. */
  matchedIntents: readonly Intent[];
  /** Bu belgeyle örtüşen eşanlamlı grup adları (kanonik). */
  matchedSynonyms: readonly string[];
}

/** `recommendDocuments()`/`recommendRelated()`'ın tam çıktısı. */
export interface RecommendationResult {
  documents: readonly DocumentRecommendation[];
  /** Sorgunun kendisinden çıkarılan (belgeden bağımsız) terimler. */
  matchedKeywords: readonly string[];
  /** Sorgunun kendisinden tespit edilen niyetler. */
  matchedIntents: readonly Intent[];
  /** Sorgunun kendisinde tespit edilen eşanlamlı grup adları. */
  matchedSynonyms: readonly string[];
}
