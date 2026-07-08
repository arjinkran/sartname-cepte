// poleForce alt motoru — demo örnek giriş/çıktı çiftleri.
// `output` değerleri, engine.ts'teki ÖN HESAP formülleriyle elle
// türetilmiştir (motoru circular-import'a sokmamak için engine.ts'e
// bağımlı DEĞİLDİR). tests/calculations/poleForce.test.ts, bu değerlerin
// gerçek motorla senkron kaldığını doğrular.
import type { CalculationExample } from '../../../core/types.ts';
import type { PoleForceInput, PoleForceOutput } from './types.ts';

export const POLE_FORCE_EXAMPLES: readonly CalculationExample<PoleForceInput, PoleForceOutput>[] = [
  {
    id: 'tasiyici-duz-hat-hawk',
    title: 'Taşıyıcı direk, düz hat — 477 MCM HAWK, 100+100 m açıklık',
    input: {
      conductorType: '477-mcm-hawk',
      spanLeftM: 100,
      spanRightM: 100,
      iceRegion: 1,
      windRegion: 2,
      poleFunction: 'tasiyici',
      deviationAngleDeg: 0,
      equipmentWeightKg: 50,
      safetyFactor: 1.5,
    },
    output: {
      verticalForceKg: 147.63,
      horizontalWindForceKg: 130.74,
      angleForceKg: 0,
      totalHorizontalForceKg: 130.74,
      resultantForceKg: 197.2,
      designForceKg: 295.8,
    },
    description: 'Sapma açısı 0° olduğu için angleForceKg tam olarak 0 çıkar.',
  },
  {
    id: 'kose-durdurucu-30derece-raven',
    title: 'Köşe durdurucu direk, 30° sapma — 1/0 AWG RAVEN, 60+80 m açıklık',
    input: {
      conductorType: '1-0-awg',
      spanLeftM: 60,
      spanRightM: 80,
      iceRegion: 2,
      windRegion: 3,
      poleFunction: 'kose-durdurucu',
      deviationAngleDeg: 30,
      equipmentWeightKg: 80,
      safetyFactor: 1.5,
    },
    output: {
      verticalForceKg: 95.11,
      horizontalWindForceKg: 56.62,
      angleForceKg: 205.71,
      totalHorizontalForceKg: 262.33,
      resultantForceKg: 279.03,
      designForceKg: 418.55,
    },
    description: 'Sapma açısından doğan angleForceKg, toplam yatay kuvvetin baskın bileşenidir.',
  },
  {
    id: 'nihayet-pigeon',
    title: 'Nihayet direği — 3/0 AWG PIGEON, 50+50 m açıklık',
    input: {
      conductorType: '3-0-awg',
      spanLeftM: 50,
      spanRightM: 50,
      iceRegion: 1,
      windRegion: 1,
      poleFunction: 'nihayet',
      deviationAngleDeg: 0,
      equipmentWeightKg: 100,
      safetyFactor: 2,
    },
    output: {
      verticalForceKg: 117.19,
      horizontalWindForceKg: 25.5,
      angleForceKg: 0,
      totalHorizontalForceKg: 25.5,
      resultantForceKg: 119.93,
      designForceKg: 239.85,
    },
  },
];
