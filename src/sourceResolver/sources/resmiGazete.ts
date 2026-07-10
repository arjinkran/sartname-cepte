// ⚠️ Bu kütüphanedeki "Resmî Gazete" kurumlu belgelerin GERÇEK sourceUrl
// alanı https://www.mevzuat.gov.tr'yi işaret eder (bkz. src/data/library/
// resmiGazete/documents.ts) — Resmî Gazete'nin kendi arşiv/yayın sitesi
// resmigazete.gov.tr olsa da, konsolide/güncel mevzuat metinleri
// Cumhurbaşkanlığı Mevzuat Bilgi Sistemi (mevzuat.gov.tr) üzerinden
// sunulur ve bu kütüphane Sprint 5'ten beri o kaynağı kullanır. Bu
// yüzden `officialBaseUrl` GERÇEK veriyle tutarlı olacak şekilde
// mevzuat.gov.tr olarak ayarlandı, resmigazete.gov.tr ise
// `alternateDomains` içinde GEÇERLİ bir alternatif olarak tutulur (bir
// PDF doğrudan o siteden de doğrulanabilsin diye).
import type { SourceProvider } from '../types.ts';

export const RESMI_GAZETE_PROVIDER: SourceProvider = {
  id: 'resmi-gazete',
  name: 'Resmî Gazete',
  officialBaseUrl: 'https://www.mevzuat.gov.tr',
  alternateDomains: ['resmigazete.gov.tr'],
  accessType: 'officialPage',
  supportsPdf: true,
  supportsSearch: true,
  notes:
    'Resmî Gazete\'de yayınlanan yönetmelik/kanunların konsolide metinleri mevzuat.gov.tr üzerinden, ham gazete sayıları resmigazete.gov.tr üzerinden erişilebilir.',
};
