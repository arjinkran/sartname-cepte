// iceLoad alt motoru — iletken üzerindeki buz yükünün ÖN HESABI.
//
// Formül (kitapta görülen pb = k√d yapısına göre):
//   iceLoadKgPerM = k(iceRegion) × √(conductorDiameterMm)
//
// ⚠️ k katsayıları (bkz. data.ts → ICE_LOAD_COEFFICIENTS) KAYNAK
// DOĞRULAMASI GEREKTİRİR — gerçek buz yükü bölgesi tablosu değildir,
// yer tutucudur (bkz. README.md).
import type { ConductorType, IceRegion } from '../types.ts';

export interface IceLoadInput {
  conductorType: ConductorType;
  iceRegion: IceRegion;
}

export interface IceLoadOutput {
  conductorDiameterMm: number;
  conductorWeightKgPerM: number;
  /** Bir kat buz yükü (kg/m) — pb = k√d. */
  iceLoadKgPerM: number;
  /** Çıplak iletken ağırlığı + bir kat buz yükü. */
  totalWeightWithIceKgPerM: number;
  /** İki kat buz yükü (2 × iceLoadKgPerM). */
  doubleIceLoadKgPerM: number;
  /** Çıplak iletken ağırlığı + iki kat buz yükü. */
  totalWeightWithDoubleIceKgPerM: number;
}
