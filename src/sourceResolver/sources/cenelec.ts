import type { SourceProvider } from '../types.ts';

export const CENELEC_PROVIDER: SourceProvider = {
  id: 'cenelec',
  name: 'CENELEC',
  officialBaseUrl: 'https://www.cenelec.eu',
  accessType: 'restrictedStandard',
  supportsPdf: false,
  supportsSearch: true,
  notes:
    'CENELEC, telif hakkıyla korunan Avrupa standartları yayınlar — tam metin PDF bu kütüphane tarafından SAĞLANMAZ/İNDİRİLMEZ. Yalnızca standart numarası doğrulanıp resmî erişim sayfasına yönlendirme yapılır.',
};
