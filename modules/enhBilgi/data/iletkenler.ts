// enhBilgi modülü — İletkenler bilgi bankası verisi.
//
// ⚠️ Sprint 4B: Sayısal iletken verisi ARTIK BURADA TUTULMUYOR — merkezi
// katalogdan (src/catalogs/conductors) türetilir. Bu dosya yalnızca
// UI'a özgü anlatım metnini (kisaAciklama/kullanimAlani) katalog
// verisiyle birleştirir. Hesap motoru burada YOKTUR.
import { ACSR_CONDUCTORS } from '../../../src/catalogs/conductors/index.ts';
import type { IletkenBilgi } from '../types';

const ANLATIM_METNI: Record<string, { kisaAciklama: string; kullanimAlani: string }> = {
  swallow: {
    kisaAciklama:
      'Bu grubun en küçük kesitli iletkeni. Kısa açıklıklı ve akım taşıma ihtiyacı düşük OG hatlarında kullanılır.',
    kullanimAlani: 'OG (orta gerilim) hava hattı dağıtım şebekesi — kısa açıklık, düşük yük.',
  },
  raven: {
    kisaAciklama: 'Küçük-orta kesitli iletken. Kısa-orta açıklıklı dağıtım hatlarında yaygın kullanılır.',
    kullanimAlani: 'OG hava hattı dağıtım şebekesi — kısa-orta açıklık.',
  },
  pigeon: {
    kisaAciklama: 'Orta kesitli iletken. Orta açıklık ve orta düzey akım taşıma ihtiyacı olan hatlarda tercih edilir.',
    kullanimAlani: 'OG hava hattı dağıtım şebekesi — orta açıklık, orta yük.',
  },
  partridge: {
    kisaAciklama:
      'Büyük kesitli iletken. Daha uzun açıklık ve yüksek akım taşıma kapasitesi gereken hatlarda kullanılır.',
    kullanimAlani: 'OG/YG hava hattı — uzun açıklık, yüksek yük.',
  },
  hawk: {
    kisaAciklama:
      'Bu grubun en büyük kesitli iletkeni. Yüksek akım taşıma kapasitesi ve uzun açıklık gerektiren OG/YG hatlarında kullanılır.',
    kullanimAlani: 'OG/YG hava hattı — uzun açıklık, yüksek akım taşıma ihtiyacı.',
  },
};

export const ILETKENLER: readonly IletkenBilgi[] = ACSR_CONDUCTORS.map((c) => ({
  id: c.id,
  ad: c.name,
  kod: c.awgMcm,
  aluminyumKesitMm2: c.aluminumAreaMm2,
  celikKesitMm2: c.steelAreaMm2,
  toplamKesitMm2: c.totalAreaMm2,
  nominalCapMm: c.nominalDiameterMm,
  nominalAgirlikKgPerM: c.nominalWeightKgPerM,
  kopmaDayanimiKg: c.breakingLoadKg,
  kisaAciklama: ANLATIM_METNI[c.id]?.kisaAciklama ?? '',
  kullanimAlani: ANLATIM_METNI[c.id]?.kullanimAlani ?? '',
}));
