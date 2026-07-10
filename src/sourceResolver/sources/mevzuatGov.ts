// Mevzuat.gov.tr, tek bir kuruma bağlı DEĞİLDİR — Türkiye'deki TÜM kanun/
// yönetmelik/tebliğlerin konsolide arama portalıdır. Bu yüzden
// `resolveByInstitution()` bu sağlayıcıyı doğrudan bir Institution'a
// eşlemez (bkz. resolver.ts); yalnızca `resolveByTitle()`'ın genel bir
// yedek/ikincil kaynak önerisi olarak kullanır.
import type { SourceProvider } from '../types.ts';

export const MEVZUAT_GOV_PROVIDER: SourceProvider = {
  id: 'mevzuat-gov',
  name: 'Mevzuat.gov.tr (Cumhurbaşkanlığı Mevzuat Bilgi Sistemi)',
  officialBaseUrl: 'https://www.mevzuat.gov.tr',
  accessType: 'officialPage',
  supportsPdf: true,
  supportsSearch: true,
  notes:
    'Herhangi bir kurumun kanun/yönetmelik/tebliğinin güncel/konsolide metnini bulmak için kullanılabilecek genel amaçlı devlet portalı — kurum-özel bir sağlayıcı bulunamadığında ikincil arama kaynağı olarak önerilir.',
};
