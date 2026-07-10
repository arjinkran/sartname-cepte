// TEİAŞ arama adaptörü (Sprint 12, madde 7).
import type { Document } from '../../../data/library/types.ts';
import { getSourceProviderById } from '../../registry.ts';
import { isOfficialDomain } from '../../validators.ts';
import { extractPdfCandidates } from '../candidateParser.ts';
import type { HttpFetchResult, NetworkCandidate, NetworkSearchRequest, ProviderSearchAdapter } from '../types.ts';

const PROVIDER_ID = 'teias';

export const teiasAdapter: ProviderSearchAdapter = {
  providerId: PROVIDER_ID,

  canSearch(document: Document): boolean {
    return document.institution === 'TEİAŞ';
  },

  buildSearchRequests(document: Document): readonly NetworkSearchRequest[] {
    const provider = getSourceProviderById(PROVIDER_ID);
    if (!provider) return [];

    const target = document.sourceUrl && isOfficialDomain(document.sourceUrl, PROVIDER_ID) ? document.sourceUrl : provider.officialBaseUrl;

    return [{ documentId: document.id, providerId: PROVIDER_ID, url: target, method: 'GET', reason: 'TEİAŞ resmî sayfa taraması' }];
  },

  parseCandidates(response: HttpFetchResult, document: Document): readonly NetworkCandidate[] {
    return extractPdfCandidates(response, document, PROVIDER_ID);
  },

  validateCandidate(candidate: NetworkCandidate): boolean {
    return candidate.verifiedDomain === true;
  },
};
