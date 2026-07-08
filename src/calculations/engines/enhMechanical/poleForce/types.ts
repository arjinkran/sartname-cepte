// poleForce alt motoru — direğe gelen düşey/yatay kuvvetlerin ÖN HESABI.
//
// ⚠️ Bu bir GERÇEK moment/mukavemet hesabı DEĞİLDİR — yalnızca ilk teknik
// altyapıyı kurmak için basitleştirilmiş bir ön hesaptır (bkz. README.md).
// Nihai direk seçimi için resmi katalog, moment hesabı ve proje kriterleri
// esas alınmalıdır.
import type { ConductorType, IceRegion, PoleFunction } from '../types.ts';
import type { WindZone } from '../betonDirek/types.ts';

export interface PoleForceInput {
  conductorType: ConductorType;
  /** Direğin solundaki açıklık (m) */
  spanLeftM: number;
  /** Direğin sağındaki açıklık (m) */
  spanRightM: number;
  iceRegion: IceRegion;
  windRegion: WindZone;
  poleFunction: PoleFunction;
  /** Sapma açısı (derece); düz hatta 0. */
  deviationAngleDeg: number;
  /** Travers/izolatör/donanım ağırlığı (kg) */
  equipmentWeightKg: number;
  safetyFactor: number;
}

export interface PoleForceOutput {
  verticalForceKg: number;
  horizontalWindForceKg: number;
  angleForceKg: number;
  totalHorizontalForceKg: number;
  resultantForceKg: number;
  designForceKg: number;
}
