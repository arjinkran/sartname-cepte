// enhBilgi modülü — İletkenler bilgi bankası verisi.
//
// ⚠️ Sayısal değerler src/calculations/engines/ampacityOG/data.ts
// (AMPACITY_CONDUCTORS) ile BİREBİR UYUMLUDUR — bu iki dosya birbirinden
// bağımsız güncellenmemelidir. Yalnızca kisaAciklama/kullanimAlani
// (anlatım metni) bu dosyaya özeldir; hesap motoru burada YOKTUR.
import type { IletkenBilgi } from '../types';

export const ILETKENLER: readonly IletkenBilgi[] = [
  {
    id: 'swallow',
    ad: 'Swallow',
    kod: '3 AWG',
    aluminyumKesitMm2: 26.69,
    celikKesitMm2: 4.45,
    toplamKesitMm2: 31.14,
    nominalCapMm: 7.14,
    nominalAgirlikKgPerM: 0.1078,
    kopmaDayanimiKg: 1042,
    kisaAciklama:
      'Bu grubun en küçük kesitli iletkeni. Kısa açıklıklı ve akım taşıma ihtiyacı düşük OG hatlarında kullanılır.',
    kullanimAlani: 'OG (orta gerilim) hava hattı dağıtım şebekesi — kısa açıklık, düşük yük.',
  },
  {
    id: 'raven',
    ad: 'Raven',
    kod: '1/0 AWG',
    aluminyumKesitMm2: 53.54,
    celikKesitMm2: 8.92,
    toplamKesitMm2: 62.46,
    nominalCapMm: 10.11,
    nominalAgirlikKgPerM: 0.2158,
    kopmaDayanimiKg: 1987,
    kisaAciklama: 'Küçük-orta kesitli iletken. Kısa-orta açıklıklı dağıtım hatlarında yaygın kullanılır.',
    kullanimAlani: 'OG hava hattı dağıtım şebekesi — kısa-orta açıklık.',
  },
  {
    id: 'pigeon',
    ad: 'Pigeon',
    kod: '3/0 AWG',
    aluminyumKesitMm2: 84.98,
    celikKesitMm2: 14.16,
    toplamKesitMm2: 99.14,
    nominalCapMm: 12.75,
    nominalAgirlikKgPerM: 0.3437,
    kopmaDayanimiKg: 3003,
    kisaAciklama: 'Orta kesitli iletken. Orta açıklık ve orta düzey akım taşıma ihtiyacı olan hatlarda tercih edilir.',
    kullanimAlani: 'OG hava hattı dağıtım şebekesi — orta açıklık, orta yük.',
  },
  {
    id: 'partridge',
    ad: 'Partridge',
    kod: '266.8 MCM',
    aluminyumKesitMm2: 135.14,
    celikKesitMm2: 22.03,
    toplamKesitMm2: 157.17,
    nominalCapMm: 16.31,
    nominalAgirlikKgPerM: 0.5462,
    kopmaDayanimiKg: 5048,
    kisaAciklama: 'Büyük kesitli iletken. Daha uzun açıklık ve yüksek akım taşıma kapasitesi gereken hatlarda kullanılır.',
    kullanimAlani: 'OG/YG hava hattı — uzun açıklık, yüksek yük.',
  },
  {
    id: 'hawk',
    ad: 'Hawk',
    kod: '477 MCM',
    aluminyumKesitMm2: 241.50,
    celikKesitMm2: 39.33,
    toplamKesitMm2: 280.83,
    nominalCapMm: 21.79,
    nominalAgirlikKgPerM: 0.9763,
    kopmaDayanimiKg: 8845,
    kisaAciklama:
      'Bu grubun en büyük kesitli iletkeni. Yüksek akım taşıma kapasitesi ve uzun açıklık gerektiren OG/YG hatlarında kullanılır.',
    kullanimAlani: 'OG/YG hava hattı — uzun açıklık, yüksek akım taşıma ihtiyacı.',
  },
];
