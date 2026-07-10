// Kanıt toplayıcı — Document Repository + Source Resolver katmanlarından
// (madde 3, akışın 3. ve 4. adımı) tek bir belge için `EvidenceReference`/
// `EvidenceSection` üretir. Repository mimarisini DEĞİŞTİRMEZ, yalnızca
// mevcut fonksiyonları çağırır.
import { hasPdf } from '../data/library/repository.ts';
import type { Document } from '../data/library/types.ts';
import { getSourceStatus } from '../sourceResolver/resolver.ts';
import type { SourceAccessType } from '../sourceResolver/types.ts';
import type { EvidenceReference, EvidenceSection } from './types.ts';

export interface EvidenceSignals {
  pdfAvailable: boolean;
  officialSourceStatus: SourceAccessType;
  officialSourceProvider?: string;
  sourceAccessType: SourceAccessType;
}

/**
 * Bir belgenin Source Resolver + PDF durumunu TEK SEFERDE hesaplar —
 * `rankEvidence()` (puanlama) ve `buildEvidenceReference()` (referans)
 * bu sinyalleri PAYLAŞIR, Source Resolver iki kez ÇAĞRILMAZ.
 */
export function getEvidenceSignals(document: Document): EvidenceSignals {
  const kaynakDurumu = getSourceStatus(document);
  const accessType = document.officialSourceStatus ?? kaynakDurumu.status;

  return {
    pdfAvailable: hasPdf(document),
    officialSourceStatus: accessType,
    officialSourceProvider: document.officialSourceProvider ?? kaynakDurumu.provider?.id,
    sourceAccessType: document.sourceAccessType ?? accessType,
  };
}

/**
 * Bir belgenin tam kimlik/durum bilgisini üretir (madde 4) — tüm alanlar
 * ZORUNLUDUR. `signals`, `getEvidenceSignals()`'ten önceden hesaplanmış
 * olarak verilir (Source Resolver'ın gereksiz ikinci kez çağrılmaması için).
 */
export function buildEvidenceReference(
  document: Document,
  signals: EvidenceSignals,
  confidence: number,
  reason: string
): EvidenceReference {
  return {
    documentId: document.id,
    title: document.title,
    institution: document.institution,
    category: document.category,
    documentType: document.documentType,
    revision: document.revision,
    sourceUrl: document.sourceUrl,
    officialSourceStatus: signals.officialSourceStatus,
    officialSourceProvider: signals.officialSourceProvider,
    sourceAccessType: signals.sourceAccessType,
    pdfAvailable: signals.pdfAvailable,
    confidence: Math.round(confidence),
    reason,
  };
}

/**
 * Madde 5: bu sprintte PDF içeriği HENÜZ PARSE EDİLMEZ — `available`
 * her zaman `false`, `pageHint`/`excerpt` her zaman tanımsızdır. Mimari
 * bu tipi (bkz. types.ts `EvidenceSection`) gelecekteki gerçek bir PDF
 * parser'a hazır tutar; bu fonksiyon o zaman İÇİ değiştirilerek
 * genişletilecektir — dışa açılan sözleşme DEĞİŞMEYECEK.
 */
export function buildEvidenceSection(document: Document): EvidenceSection {
  return {
    documentId: document.id,
    label: document.category,
    available: false,
  };
}
