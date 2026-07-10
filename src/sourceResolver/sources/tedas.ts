import type { SourceProvider } from '../types.ts';

export const TEDAS_PROVIDER: SourceProvider = {
  id: 'tedas',
  name: 'TEDAŞ',
  officialBaseUrl: 'https://www.tedas.gov.tr',
  accessType: 'officialPage',
  supportsPdf: true,
  supportsSearch: true,
  notes:
    'TEDAŞ, teknik şartnamelerini kendi kurumsal web sitesinde yayınlar. Bu kütüphanedeki TEDAŞ belgelerinin sourceUrl alanı bu domaine işaret eder.',
};
