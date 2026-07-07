// voltageDrop motoru — demo örnek giriş/çıktı çiftleri (CalculationExample).
//
// NOT: `output` değerleri, DEMO formülünün (bkz. engine.ts) referans
// çıktılarıdır ve dokümantasyon amaçlıdır (formülü DEĞİŞTİRMEZ).
// tests/calculations/voltageDrop.test.ts, bu değerlerin gerçek motorla
// senkron kaldığını doğrular.
import type { CalculationExample } from '../../core/types.ts';
import type { VoltageDropInput, VoltageDropOutput } from './types.ts';

export const VOLTAGE_DROP_EXAMPLES: readonly CalculationExample<VoltageDropInput, VoltageDropOutput>[] = [
  {
    id: 'tri-limit-icinde',
    title: 'Trifaze örnek — 100 m, 30 A, 400 V, 1,5 Ω/km',
    input: { voltage: 400, current: 30, length: 100, resistancePerKm: 1.5, phaseType: 'tri' },
    output: { voltageDropVolt: 7.7942, voltageDropPercent: 1.9486, isWithinLimit: true },
  },
  {
    id: 'mono-limit-icinde',
    title: 'Monofaze örnek — 40 m, 15 A, 230 V, 3,5 Ω/km',
    input: { voltage: 230, current: 15, length: 40, resistancePerKm: 3.5, phaseType: 'mono' },
    output: { voltageDropVolt: 4.2, voltageDropPercent: 1.8261, isWithinLimit: true },
  },
  {
    id: 'mono-limit-asimi',
    title: 'Limit aşımı örneği — 500 m, 50 A, 230 V, 5 Ω/km',
    input: { voltage: 230, current: 50, length: 500, resistancePerKm: 5, phaseType: 'mono' },
    output: { voltageDropVolt: 250, voltageDropPercent: 108.6957, isWithinLimit: false },
    description: 'isWithinLimit=false → calculate() bir LIMIT_EXCEEDED uyarısı üretir.',
  },
];
