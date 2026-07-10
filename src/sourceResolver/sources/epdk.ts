import type { SourceProvider } from '../types.ts';

export const EPDK_PROVIDER: SourceProvider = {
  id: 'epdk',
  name: 'EPDK',
  officialBaseUrl: 'https://www.epdk.gov.tr',
  accessType: 'officialPage',
  supportsPdf: true,
  supportsSearch: true,
  notes:
    'EPDK, yönetmelik/tebliğ ve piyasa düzenlemelerini kendi kurumsal web sitesinde ve mevzuat.gov.tr üzerinde yayınlar.',
};
