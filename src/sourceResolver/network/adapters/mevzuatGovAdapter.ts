// Mevzuat.gov.tr arama adaptörü (Sprint 12, madde 7).
//
// `mevzuat-gov` sağlayıcısı tek bir kuruma bağlı DEĞİLDİR (bkz.
// src/sourceResolver/sources/mevzuatGov.ts) — bu adaptör özellikle
// Sprint 11'de KENDİ resmî kaynak sağlayıcısı OLMAYAN kurumlar (Enerji
// Bakanlığı, Diğer) ile `Kanun` türündeki belgeler için ikincil/yedek bir
// arama kaynağı olarak devreye girer.
import type { Document } from '../../../data/library/types.ts';
import { getSourceProviderById } from '../../registry.ts';
import { extractPdfCandidates } from '../candidateParser.ts';
import type { HttpFetchResult, NetworkCandidate, NetworkSearchRequest, ProviderSearchAdapter } from '../types.ts';

const PROVIDER_ID = 'mevzuat-gov';

export const mevzuatGovAdapter: ProviderSearchAdapter = {
  providerId: PROVIDER_ID,

  canSearch(document: Document): boolean {
    return document.institution === 'Enerji Bakanlığı' || document.institution === 'Diğer' || document.documentType === 'Kanun';
  },

  buildSearchRequests(document: Document): readonly NetworkSearchRequest[] {
    const provider = getSourceProviderById(PROVIDER_ID);
    if (!provider) return [];

    return [
      {
        documentId: document.id,
        providerId: PROVIDER_ID,
        url: provider.officialBaseUrl,
        method: 'GET',
        reason: 'Mevzuat.gov.tr genel arama (ikincil kaynak)',
      },
    ];
  },

  parseCandidates(response: HttpFetchResult, document: Document): readonly NetworkCandidate[] {
    return extractPdfCandidates(response, document, PROVIDER_ID);
  },

  validateCandidate(candidate: NetworkCandidate): boolean {
    return candidate.verifiedDomain === true;
  },
};
