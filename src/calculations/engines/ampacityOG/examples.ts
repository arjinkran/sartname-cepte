// ampacityOG motoru — demo örnek giriş/çıktı çiftleri (CalculationExample).
// `output` değerleri data.ts tablosundan elle türetilmiştir (motoru
// circular-import'a sokmamak için engine.ts'e bağımlı DEĞİLDİR).
// tests/calculations/ampacityOG.test.ts, bu değerlerin gerçek motorla
// senkron kaldığını doğrular.
import type { CalculationExample } from '../../core/types.ts';
import type { AmpacityOGInput, AmpacityOGOutput } from './types.ts';

export const AMPACITY_OG_EXAMPLES: readonly CalculationExample<AmpacityOGInput, AmpacityOGOutput>[] = [
  {
    id: 'hawk-condition3-35kv-kapasite',
    title: 'HAWK — Koşul 3, 35 kV (yalnızca kapasite)',
    input: { conductorId: 'hawk', conditionId: 'condition3', voltageLevel: '35kV' },
    output: {
      ampacityA: 740,
      isSuitable: null,
      utilizationPercent: null,
      remainingCapacityA: null,
      conductorName: 'Hawk — 477 MCM',
      conductorCode: 'HAWK',
      resistance20OhmPerKm: 0.117,
      reactanceOhmPerKm: 0.339,
      equivalentCuMm2: 147.32,
      nominalDiameterMm: 21.79,
      nominalAreaMm2: 241.5,
      nominalWeightKgPerM: 0.9763,
      breakingLoadKg: 8845,
    },
  },
  {
    id: 'swallow-condition1-10kv-uygun',
    title: 'SWALLOW — Koşul 1, 10 kV, beklenen akım 100 A (uygun)',
    input: { conductorId: 'swallow', conditionId: 'condition1', voltageLevel: '10kV', expectedCurrentA: 100 },
    output: {
      ampacityA: 120,
      isSuitable: true,
      utilizationPercent: (100 / 120) * 100,
      remainingCapacityA: 20,
      conductorName: 'Swallow — 3 AWG',
      conductorCode: 'SWALLOW',
      resistance20OhmPerKm: 1.055,
      reactanceOhmPerKm: 0.372,
      equivalentCuMm2: 16.28,
      nominalDiameterMm: 7.14,
      nominalAreaMm2: 26.69,
      nominalWeightKgPerM: 0.1078,
      breakingLoadKg: 1042,
    },
    description: 'expectedCurrentA (100 A) ≤ ampacityA (120 A) → isSuitable=true.',
  },
  {
    id: 'raven-condition2-35kv-uygun-degil',
    title: 'RAVEN — Koşul 2, 35 kV, beklenen akım 300 A (uygun değil)',
    input: { conductorId: 'raven', conditionId: 'condition2', voltageLevel: '35kV', expectedCurrentA: 300 },
    output: {
      ampacityA: 254,
      isSuitable: false,
      utilizationPercent: (300 / 254) * 100,
      remainingCapacityA: 254 - 300,
      conductorName: 'Raven — 1/0 AWG',
      conductorCode: 'RAVEN',
      resistance20OhmPerKm: 0.522,
      reactanceOhmPerKm: 0.387,
      equivalentCuMm2: 32.66,
      nominalDiameterMm: 10.11,
      nominalAreaMm2: 53.54,
      nominalWeightKgPerM: 0.2158,
      breakingLoadKg: 1987,
    },
    description: 'expectedCurrentA (300 A) > ampacityA (254 A) → isSuitable=false, AMPACITY_EXCEEDED uyarısı.',
  },
];
