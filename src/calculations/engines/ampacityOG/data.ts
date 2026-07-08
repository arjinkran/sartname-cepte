// ampacityOG motoru — çalışma koşulları + merkezi iletken kataloğuna bağlantı.
//
// ⚠️ Sprint 4B: İLETKEN VERİSİ ARTIK BURADA TUTULMUYOR. Tüm iletken
// verisi (kesit, çap, ağırlık, kopma dayanımı, direnç/reaktans, ampacity)
// merkezi katalogdan gelir — bkz.
// src/catalogs/conductors/README.md "Bu katalog uygulamanın tek iletken
// veri kaynağıdır." `AMPACITY_CONDUCTORS`, `ACSR_CONDUCTORS` ile AYNI
// dizi referansıdır (kopya değildir).
//
// KAYNAK NOTU: Katalogdaki yalnızca 3 değer Excel'den doğrudan
// doğrulanmıştır (HAWK ampacityCondition3A=740, SWALLOW
// ampacityCondition1A=120, RAVEN reactance35kVOhmPerKm=0.387) — bkz.
// src/catalogs/conductors/acsr.ts başlık notu.

import { ACSR_CONDUCTORS } from '../../../catalogs/conductors/index.ts';
import type { AmpacityCondition, VoltageLevel } from './types.ts';

export const AMPACITY_VOLTAGE_LEVELS: readonly VoltageLevel[] = ['10kV', '35kV'];

export const AMPACITY_CONDITIONS: readonly AmpacityCondition[] = [
  {
    id: 'condition1',
    name: 'Koşul 1',
    windSpeedMs: 0,
    ambientTempC: 40,
    conductorSurfacePercent: 80,
    hasSolarHeat: false,
    description: 'Rüzgarsız, sıcak ortam (40°C), güneş ısısı yok.',
  },
  {
    id: 'condition2',
    name: 'Koşul 2',
    windSpeedMs: 0.61,
    ambientTempC: 25,
    conductorSurfacePercent: 75,
    hasSolarHeat: false,
    description: 'Hafif rüzgar (0,61 m/sn), ılıman ortam (25°C), güneş ısısı yok.',
  },
  {
    id: 'condition3',
    name: 'Koşul 3',
    windSpeedMs: 0.6,
    ambientTempC: 20,
    conductorSurfacePercent: 80,
    hasSolarHeat: true,
    description: 'Hafif rüzgar (0,6 m/sn), serin ortam (20°C), güneş ısısı var.',
  },
];

/** Merkezi ACSR kataloğunun bu motordaki görünümü — ACSR_CONDUCTORS ile AYNI dizi referansıdır. */
export const AMPACITY_CONDUCTORS = ACSR_CONDUCTORS;
