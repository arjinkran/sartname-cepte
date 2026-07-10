// Resmî Kaynak Bulucu — ortak tip tanımları (Sprint 11).
// Bu modül GERÇEK bir ağ isteği YAPMAZ (bkz. resolver.ts üst yorumu) —
// yalnızca kütüphanedeki belge alanlarına (institution/sourceUrl/
// pdfAvailable/documentType/category) bakarak kural tabanlı bir
// sınıflandırma üretir.
import type { Document, Institution } from '../data/library/types.ts';

/**
 * Bir kaynağın erişim türü — Sprint 11 madde 2'deki 5 değerle birebir:
 * - `publicPdf`: gerçek, indirilebilir/görüntülenebilir bir PDF var (kamuya açık).
 * - `officialPage`: resmî bir sayfa var ama PDF'in kendisi doğrudan değil (ör. kurum sayfası).
 * - `restrictedStandard`: telifli standart kuruluşu (TSE/IEC/CENELEC/IEEE) — tam metin SAĞLANMAZ.
 * - `manualRequired`: otomatik doğrulama yapılamadı, kaynak elle teyit edilmeli.
 * - `notFound`: hiçbir aday kaynak bulunamadı.
 */
export type SourceAccessType = 'publicPdf' | 'officialPage' | 'restrictedStandard' | 'manualRequired' | 'notFound';

/** Bir resmî kaynak sağlayıcısının (kurum/standart kuruluşu) sabit meta verisi. */
export interface SourceProvider {
  /** Kısa, kod-dostu kimlik (ör. "tedas", "resmi-gazete"). */
  id: string;
  name: string;
  /** Sağlayıcının GERÇEK, doğrulanmış resmî web adresi. */
  officialBaseUrl: string;
  /** `officialBaseUrl` dışında GEÇERLİ kabul edilen ek resmî domainler (varsa). */
  alternateDomains?: readonly string[];
  /** Bu sağlayıcının TİPİK/varsayılan erişim türü. */
  accessType: SourceAccessType;
  supportsPdf: boolean;
  supportsSearch: boolean;
  notes: string;
}

/** `resolveByTitle()`'a verilen serbest metin arama girdisi. */
export interface SourceSearchInput {
  title: string;
  institution?: Institution;
  documentType?: Document['documentType'];
  category?: string;
}

/** Bir aday kaynağın (henüz doğrulanmamış) tanımı. */
export interface SourceDocumentCandidate {
  provider: SourceProvider;
  url: string;
  accessType: SourceAccessType;
  /** 0-100 — bu adayın doğru belgeyle eşleştiğine dair kaba güven skoru. */
  confidence: number;
}

/** `validateCandidate()`'ın döndürdüğü doğrulama sonucu. */
export interface SourceValidationResult {
  valid: boolean;
  reasons: readonly string[];
}

/**
 * `resolveOfficialSource()`/`resolveByTitle()`/`resolveByInstitution()`/
 * `getSourceStatus()`'un TAMAMININ ortak dönüş tipi (Sprint 11 madde 6).
 */
export interface SourceResolverResult {
  status: SourceAccessType;
  provider?: SourceProvider;
  url?: string;
  /** Kaynağın resmî domaine ait olduğu OTOMATİK olarak doğrulandı mı. */
  verified: boolean;
  requiresManualVerification: boolean;
  copyrightRestricted: boolean;
  /** Kullanıcıya gösterilebilir, bu sonucun NEDEN bu şekilde üretildiğini açıklayan cümle. */
  reason: string;
}
