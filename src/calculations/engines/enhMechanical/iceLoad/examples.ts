// iceLoad alt motoru — demo örnek giriş/çıktı çiftleri.
// `output` değerleri engine.ts'teki formülle elle türetilmiştir (motoru
// circular-import'a sokmamak için engine.ts'e bağımlı DEĞİLDİR).
// tests/calculations/iceLoad.test.ts, bu değerlerin gerçek motorla
// senkron kaldığını doğrular.
import type { CalculationExample } from '../../../core/types.ts';
import type { IceLoadInput, IceLoadOutput } from './types.ts';

export const ICE_LOAD_EXAMPLES: readonly CalculationExample<IceLoadInput, IceLoadOutput>[] = [
  {
    id: 'hawk-bolge3',
    title: '477 MCM HAWK — Buz Bölgesi 3',
    input: { conductorType: '477-mcm-hawk', iceRegion: 3 },
    output: {
      conductorDiameterMm: 21.79,
      conductorWeightKgPerM: 0.9763,
      iceLoadKgPerM: 0.14,
      totalWeightWithIceKgPerM: 1.1163,
      doubleIceLoadKgPerM: 0.2801,
      totalWeightWithDoubleIceKgPerM: 1.2564,
    },
    description: 'pb = 0,03 × √21,79 ≈ 0,140 kg/m (k = 0,03 → kaynak doğrulaması gerekli).',
  },
  {
    id: 'swallow-bolge1',
    title: '3 AWG SWALLOW — Buz Bölgesi 1',
    input: { conductorType: '3-awg', iceRegion: 1 },
    output: {
      conductorDiameterMm: 7.14,
      conductorWeightKgPerM: 0.1078,
      iceLoadKgPerM: 0.0267,
      totalWeightWithIceKgPerM: 0.1345,
      doubleIceLoadKgPerM: 0.0534,
      totalWeightWithDoubleIceKgPerM: 0.1612,
    },
  },
  {
    id: 'pigeon-bolge5',
    title: '3/0 AWG PIGEON — Buz Bölgesi 5',
    input: { conductorType: '3-0-awg', iceRegion: 5 },
    output: {
      conductorDiameterMm: 12.75,
      conductorWeightKgPerM: 0.3437,
      iceLoadKgPerM: 0.1785,
      totalWeightWithIceKgPerM: 0.5222,
      doubleIceLoadKgPerM: 0.3571,
      totalWeightWithDoubleIceKgPerM: 0.7008,
    },
    description: 'En yüksek bölge katsayısı (k = 0,05) ile en büyük buz yükü örneği.',
  },
];
