import type { SourceProvider } from '../types.ts';

export const TEIAS_PROVIDER: SourceProvider = {
  id: 'teias',
  name: 'TEİAŞ',
  officialBaseUrl: 'https://www.teias.gov.tr',
  accessType: 'officialPage',
  supportsPdf: true,
  supportsSearch: true,
  notes: 'TEİAŞ, şebeke yönetmeliği ve bağlantı kriterleri gibi teknik dokümanları kendi kurumsal web sitesinde yayınlar.',
};
