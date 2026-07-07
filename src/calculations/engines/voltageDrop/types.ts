// voltageDrop motoru — girdi/çıktı tipleri (DEMO).

export type PhaseType = 'mono' | 'tri';

export interface VoltageDropInput {
  /** Şebeke gerilimi (V) */
  voltage: number;
  /** Yük akımı (A) */
  current: number;
  /** Hat uzunluğu (m) */
  length: number;
  /** İletken direnci (Ω/km) */
  resistancePerKm: number;
  phaseType: PhaseType;
  /** İzin verilen gerilim düşümü limiti (%) — verilmezse motorun varsayılanı kullanılır */
  limitPercent?: number;
}

export interface VoltageDropOutput {
  voltageDropVolt: number;
  voltageDropPercent: number;
  isWithinLimit: boolean;
}
