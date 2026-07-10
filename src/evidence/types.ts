// Kanıt Toplama Motoru — ortak tip tanımları (Sprint 14, madde 2).
//
// ⚠️ Bu katman bir LLM/RAG/OpenAI entegrasyonu DEĞİLDİR. Hiçbir metin
// üretmez — yalnızca `src/ai/` (Intent Engine + AI Recommendation),
// `src/data/library/repository.ts` (Document Repository) ve
// `src/sourceResolver/resolver.ts` (Source Resolver) üzerinde çalışan,
// tamamen kural tabanlı bir "kanıt bulma ve sıralama" katmanıdır (bkz.
// README.md, docs/EVIDENCE_ENGINE.md, PROJECT_CONSTITUTION.md).
import type { Document, DocumentType, Institution } from '../data/library/types.ts';
import type { Intent } from '../ai/types.ts';
import type { SourceAccessType } from '../sourceResolver/types.ts';

/** 0-100 arası güven skorunun 3 renkli sınıflandırması (madde 7). */
export type EvidenceConfidenceBand = 'green' | 'yellow' | 'red';

/** Bir kanıtın NEDEN seçildiğini açıklayan, makine-okunur + insan-okunur çift. */
export interface EvidenceReason {
  /** Sabit, programatik kod (ör. 'intent-match', 'official-source') — testlerde ve UI filtrelemede kullanılabilir. */
  code: string;
  /** Kullanıcıya gösterilebilir Türkçe açıklama. */
  label: string;
}

/** `ranking.ts`'in ürettiği puan bileşenleri — toplamı `total` alanına eşittir (madde 6). */
export interface EvidenceScore {
  /** 0-100 arası nihai toplam puan. */
  total: number;
  breakdown: {
    intentMatch: number;
    aiRecommendation: number;
    documentPriority: number;
    institutionPriority: number;
    categoryMatch: number;
    crossReference: number;
    pdfAvailable: number;
    officialSource: number;
    revision: number;
  };
}

/** `confidence.ts`'in ürettiği, kullanıcıya gösterilebilir güven sınıflandırması (madde 7). */
export interface EvidenceConfidence {
  /** 0-100 — `EvidenceScore.total` ile AYNI ölçekte. */
  score: number;
  band: EvidenceConfidenceBand;
  /** "Yüksek Güven" / "Orta Güven" / "Düşük Güven". */
  label: string;
}

/**
 * Bir kanıtın DIŞA AÇILAN, sadeleştirilmiş kimlik/durum bilgisi (madde 4).
 * Her kanıt bu alanların TAMAMINI taşımak ZORUNDADIR.
 */
export interface EvidenceReference {
  documentId: string;
  title: string;
  institution: Institution;
  category: string;
  documentType: DocumentType;
  revision: string;
  /** Belgede kayıtlı ham `sourceUrl` — bilinmiyorsa boş string (uydurulmaz). */
  sourceUrl: string;
  /** Source Resolver'ın hesapladığı erişim durumu (Sprint 11 `getSourceStatus().status`). */
  officialSourceStatus: SourceAccessType;
  /** İlgili `SourceProvider.id` (ör. "tedas") — sağlayıcı yoksa tanımsız. */
  officialSourceProvider?: string;
  /** `officialSourceStatus` ile AYNI değer — madde 4 iki ayrı alan istedi (Sprint 11 deseniyle tutarlı, bkz. Document tipi). */
  sourceAccessType: SourceAccessType;
  pdfAvailable: boolean;
  /** Bu referansın kendi güven skoru (0-100) — `EvidenceCandidate.confidence.score` ile AYNI. */
  confidence: number;
  /** Bu kanıtın neden seçildiğine dair tek cümlelik özet. */
  reason: string;
}

/**
 * PDF içi bir bölüm/kesit referansı — madde 5: bu sprintte PDF HENÜZ
 * PARSE EDİLMEZ, bu yüzden `available` her zaman `false`'tur ve
 * `pageHint`/`excerpt` her zaman tanımsızdır. Mimari, gelecekte gerçek
 * bir PDF parser eklendiğinde bu alanların doldurulmasına HAZIRDIR —
 * sözleşme ŞİMDİDEN sabitlendi ki o sprint bu tipi DEĞİŞTİRMESİN.
 */
export interface EvidenceSection {
  documentId: string;
  /** Şimdilik yalnızca kategori/başlık düzeyinde bir etiket (gerçek bir sayfa/paragraf DEĞİL). */
  label: string;
  /** Her zaman `false` — gerçek metin kesiti henüz çıkarılmadı (dürüst yer tutucu). */
  available: boolean;
  /** Gelecekteki PDF parser için ayrılmış alan — bu sprintte HER ZAMAN tanımsız. */
  pageHint?: number;
  /** Gelecekteki PDF parser için ayrılmış alan — bu sprintte HER ZAMAN tanımsız. */
  excerpt?: string;
}

/** Sıralanmış, puanlanmış tek bir aday belge — motorun İÇ (dahili) temsili. */
export interface EvidenceCandidate {
  document: Document;
  reference: EvidenceReference;
  section: EvidenceSection;
  score: EvidenceScore;
  confidence: EvidenceConfidence;
  reasons: readonly EvidenceReason[];
  /** Template tabanlı, LLM KULLANILMADAN üretilmiş kısa açıklama (madde 10). */
  explanation: string;
  /** 0 = doğrudan eşleşme, 1-3 = cross-reference zinciri üzerinden ulaşıldı (madde 8). */
  crossReferenceDepth: number;
}

/** Dışa açılan, sadeleştirilmiş tek kanıt kaydı (UI'ın tükettiği ana birim). */
export interface Evidence {
  reference: EvidenceReference;
  confidence: EvidenceConfidence;
  explanation: string;
  crossReferenceDepth: number;
}

/** Madde 9'daki 6 sabit grup adından biri. */
export type EvidenceGroupName = 'Yönetmelikler' | 'Şartnameler' | 'Standartlar' | 'Tebliğler' | 'Rehberler' | 'Diğer';

export interface EvidenceGroup {
  name: EvidenceGroupName;
  evidences: readonly Evidence[];
}

/**
 * `collectEvidence()`'ın ürettiği tam koleksiyon — madde 11'in
 * istediği "en iyi belgeler / ilgili belgeler / cross reference
 * belgeleri / confidence / özet" bileşenlerinin TAMAMINI taşır.
 */
export interface EvidenceCollection {
  query: string;
  /** Skora göre azalan sırada TÜM kanıtlar (best + related + cross-reference birleşimi, tekrarsız). */
  evidences: readonly Evidence[];
  groups: readonly EvidenceGroup[];
  /** Yalnızca cross-reference zinciri üzerinden (crossReferenceDepth > 0) ulaşılan kanıtlar. */
  crossReferenced: readonly Evidence[];
  /** Madde 12: "Bu soru için N doğrulanmış kaynak bulundu." biçiminde, LLM KULLANMADAN üretilen özet. */
  summary: string;
}

/** `collectEvidence()`'ın TAM dönüş sözleşmesi — ileride LLM/RAG katmanının TEK veri kaynağı (madde 21, PROJECT_CONSTITUTION.md madde 10). */
export interface EvidenceResult {
  collection: EvidenceCollection;
  bestDocuments: readonly EvidenceCandidate[];
  relatedDocuments: readonly EvidenceCandidate[];
  crossReferenceDocuments: readonly EvidenceCandidate[];
  /** Tüm koleksiyonun toplu (aggregate) güven durumu — en iyi kanıtın confidence'ı ile AYNI. */
  confidence: EvidenceConfidence;
  summary: string;
}
