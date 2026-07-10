// Telifli standart kuruluşları için adaptör (Sprint 12, madde 7 ve 11).
//
// TSE / IEC / CENELEC / IEEE için:
// - `buildSearchRequests()` HER ZAMAN boş dizi döner → HİÇBİR ağ isteği
//   YAPILMAZ (bu kurumlar için PDF/link ARAMASI kesinlikle yapılmaz).
// - `parseCandidates()`, ağ yanıtına BAKMADAN, doğrudan sağlayıcının
//   kendi resmî sayfasına işaret eden TEK bir `restrictedStandard` aday
//   üretir — "tam metin bulundu" YANILSAMASI yaratmaz, yalnızca resmî
//   ürün/erişim sayfasına yönlendirme sağlar.
import type { Document } from '../../../data/library/types.ts';
import { getSourceProviderById } from '../../registry.ts';
import type { HttpFetchResult, NetworkCandidate, NetworkSearchRequest, ProviderSearchAdapter } from '../types.ts';

const RESTRICTED_INSTITUTION_MATCH: Record<string, readonly string[]> = {
  tse: ['TSE', 'TS EN'],
  iec: ['IEC'],
  cenelec: ['CENELEC'],
  ieee: ['IEEE'],
};

export const RESTRICTED_MESSAGE = 'Bu standart telifli veya erişimi kısıtlıdır. Tam metin yalnızca yetkili resmî kaynaktan edinilebilir.';

function createRestrictedAdapter(providerId: string): ProviderSearchAdapter {
  const matchInstitutions = RESTRICTED_INSTITUTION_MATCH[providerId] ?? [];

  return {
    providerId,

    canSearch(document: Document): boolean {
      return matchInstitutions.includes(document.institution);
    },

    buildSearchRequests(): readonly NetworkSearchRequest[] {
      return []; // madde 11: PDF/link araması KESİNLİKLE yapılmaz.
    },

    parseCandidates(_response: HttpFetchResult, document: Document): readonly NetworkCandidate[] {
      const provider = getSourceProviderById(providerId);
      if (!provider) return [];
      return [
        {
          documentId: document.id,
          providerId,
          provider,
          url: provider.officialBaseUrl,
          accessType: 'restrictedStandard',
          score: 100,
          matchReasons: [RESTRICTED_MESSAGE],
          verifiedDomain: true,
          isPdf: false,
          requiresManualReview: true,
        },
      ];
    },

    validateCandidate(): boolean {
      return true;
    },
  };
}

export const tseAdapter = createRestrictedAdapter('tse');
export const iecAdapter = createRestrictedAdapter('iec');
export const cenelecAdapter = createRestrictedAdapter('cenelec');
export const ieeeAdapter = createRestrictedAdapter('ieee');
