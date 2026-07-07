// voltageDrop motoru — demo örnek girdiler (dokümantasyon/manuel test amaçlı).
import type { VoltageDropInput } from './types.ts';

export interface VoltageDropExample {
  title: string;
  input: VoltageDropInput;
}

export const VOLTAGE_DROP_EXAMPLES: readonly VoltageDropExample[] = [
  {
    title: 'Trifaze örnek — 100 m, 30 A, 400 V, 1,5 Ω/km',
    input: { voltage: 400, current: 30, length: 100, resistancePerKm: 1.5, phaseType: 'tri' },
  },
  {
    title: 'Monofaze örnek — 40 m, 15 A, 230 V, 3,5 Ω/km',
    input: { voltage: 230, current: 15, length: 40, resistancePerKm: 3.5, phaseType: 'mono' },
  },
  {
    title: 'Limit aşımı örneği — 500 m, 50 A, 230 V, 5 Ω/km',
    input: { voltage: 230, current: 50, length: 500, resistancePerKm: 5, phaseType: 'mono' },
  },
];
