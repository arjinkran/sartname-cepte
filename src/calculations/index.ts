// src/calculations — hesaplama motoru altyapısı (barrel export).
//
// UI katmanı hesap YAPMAZ; tüm hesap mantığı burada, motora özgü
// engines/<ad>/ klasörleri altında yaşar. Ekranlar yalnızca bir motorun
// `calculate()` fonksiyonunu çağırır ve dönen CalculationResult'ı gösterir.

export * from './core/types.ts';
export * from './core/validation.ts';
export * from './core/errors.ts';
export * from './core/format.ts';

import { VoltageDropEngine } from './engines/voltageDrop/index.ts';
import { AmpacityOGEngine } from './engines/ampacityOG/index.ts';
import { EnhMechanicalEngine } from './engines/enhMechanical/index.ts';

export { VoltageDropEngine, AmpacityOGEngine, EnhMechanicalEngine };
export type {
  VoltageDropInput,
  VoltageDropOutput,
  PhaseType as VoltageDropPhaseType,
} from './engines/voltageDrop/index.ts';
export type {
  AmpacityOGInput,
  AmpacityOGOutput,
  AmpacityConductor,
  AmpacityCondition,
  VoltageLevel as AmpacityVoltageLevel,
} from './engines/ampacityOG/index.ts';
export type {
  EnhMechanicalCalcType,
  EnhMechanicalInput,
  EnhMechanicalOutput,
  EnhMechanicalSubCalculation,
} from './engines/enhMechanical/index.ts';

/** Şu an aktif (gerçek veya demo/iskelet) hesap motorlarının kayıt listesi. */
export const CALCULATION_ENGINES = [VoltageDropEngine, AmpacityOGEngine, EnhMechanicalEngine] as const;
