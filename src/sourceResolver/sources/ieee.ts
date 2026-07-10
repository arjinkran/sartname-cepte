import type { SourceProvider } from '../types.ts';

export const IEEE_PROVIDER: SourceProvider = {
  id: 'ieee',
  name: 'IEEE',
  officialBaseUrl: 'https://www.ieee.org',
  alternateDomains: ['standards.ieee.org'],
  accessType: 'restrictedStandard',
  supportsPdf: false,
  supportsSearch: true,
  notes:
    'IEEE, telif hakkıyla korunan standartlar yayınlar — tam metin PDF bu kütüphane tarafından SAĞLANMAZ/İNDİRİLMEZ. Yalnızca standart numarası doğrulanıp IEEE Standards Association resmî sayfasına yönlendirme yapılır.',
};
