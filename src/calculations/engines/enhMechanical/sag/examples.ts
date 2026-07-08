// sag alt motoru — demo örnek giriş/çıktı çiftleri.
// `output` değerleri engine.ts'teki formülle (ve IceLoadEngine'in kendi
// formülüyle) elle türetilmiştir (motoru circular-import'a sokmamak için
// engine.ts'e bağımlı DEĞİLDİR). tests/calculations/sag.test.ts, bu
// değerlerin gerçek motorla senkron kaldığını doğrular.
import type { CalculationExample } from '../../../core/types.ts';
import type { SagInput, SagOutput } from './types.ts';

export const SAG_EXAMPLES: readonly CalculationExample<SagInput, SagOutput>[] = [
  {
    id: 'hawk-buzsuz',
    title: '477 MCM HAWK — Buzsuz, 200 m açıklık, 1500 kg çekme',
    input: {
      conductorType: '477-mcm-hawk',
      spanLengthM: 200,
      iceRegion: 1,
      tensionKg: 1500,
      loadCase: 'noIce',
    },
    output: {
      spanLengthM: 200,
      conductorWeightKgPerM: 0.9763,
      iceLoadKgPerM: 0,
      totalLoadKgPerM: 0.9763,
      tensionKg: 1500,
      sagM: 3.2543,
      sagCm: 325.43,
      sagPercentOfSpan: 1.6272,
      validationStatus: 'preliminary',
    },
    description: 'loadCase=noIce → totalLoadKgPerM yalnızca çıplak iletken ağırlığıdır.',
  },
  {
    id: 'raven-bir-buz',
    title: '1/0 AWG RAVEN — Bir Buz Yükü (Bölge 3), 80 m açıklık, 800 kg çekme',
    input: {
      conductorType: '1-0-awg',
      spanLengthM: 80,
      iceRegion: 3,
      tensionKg: 800,
      loadCase: 'oneIce',
    },
    output: {
      spanLengthM: 80,
      conductorWeightKgPerM: 0.2158,
      iceLoadKgPerM: 0.0954,
      totalLoadKgPerM: 0.3112,
      tensionKg: 800,
      sagM: 0.3112,
      sagCm: 31.12,
      sagPercentOfSpan: 0.389,
      validationStatus: 'preliminary',
    },
    description: 'loadCase=oneIce → buz yükü IceLoadEngine.iceLoadKgPerM değeridir.',
  },
  {
    id: 'pigeon-iki-buz',
    title: '3/0 AWG PIGEON — İki Buz Yükü (Bölge 5), 100 m açıklık, 1000 kg çekme',
    input: {
      conductorType: '3-0-awg',
      spanLengthM: 100,
      iceRegion: 5,
      tensionKg: 1000,
      loadCase: 'doubleIce',
    },
    output: {
      spanLengthM: 100,
      conductorWeightKgPerM: 0.3437,
      iceLoadKgPerM: 0.3571,
      totalLoadKgPerM: 0.7008,
      tensionKg: 1000,
      sagM: 0.876,
      sagCm: 87.6,
      sagPercentOfSpan: 0.876,
      validationStatus: 'preliminary',
    },
    description: 'loadCase=doubleIce → buz yükü IceLoadEngine.doubleIceLoadKgPerM değeridir.',
  },
];
