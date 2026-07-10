import type { SourceProvider } from '../types.ts';

export const IEC_PROVIDER: SourceProvider = {
  id: 'iec',
  name: 'IEC',
  officialBaseUrl: 'https://www.iec.ch',
  accessType: 'restrictedStandard',
  supportsPdf: false,
  supportsSearch: true,
  notes:
    'IEC, telif hakkıyla korunan uluslararası standartlar yayınlar — tam metin PDF bu kütüphane tarafından SAĞLANMAZ/İNDİRİLMEZ. Yalnızca standart numarası doğrulanıp resmî satış/erişim sayfasına (IEC Webstore) yönlendirme yapılır.',
};
