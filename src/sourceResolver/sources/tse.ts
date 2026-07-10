import type { SourceProvider } from '../types.ts';

export const TSE_PROVIDER: SourceProvider = {
  id: 'tse',
  name: 'TSE',
  officialBaseUrl: 'https://www.tse.org.tr',
  accessType: 'restrictedStandard',
  supportsPdf: false,
  supportsSearch: true,
  notes:
    'TSE, telif hakkıyla korunan standartlar yayınlar — tam metin PDF bu kütüphane tarafından SAĞLANMAZ/İNDİRİLMEZ. Yalnızca standart numarası doğrulanıp resmî satış/erişim sayfasına yönlendirme yapılır.',
};
