// iceLoad alt motoru — buz bölgesi katsayıları + merkezi iletken kataloğuna bağlantı.
//
// ⚠️⚠️ KAYNAK DOĞRULAMASI GEREKLİ ⚠️⚠️
// ICE_LOAD_COEFFICIENTS içindeki k değerleri, "Enerji Nakil Hatları
// Cilt 1/2" veya kullanıcının sağlayacağı Excel'den ALINMAMIŞTIR. Bunlar
// yalnızca pb = k√d formül YAPISININ altyapıda çalıştığını göstermek
// için seçilmiş, kasıtlı olarak yuvarlak (0,01 – 0,05) YER TUTUCU
// sayılardır. GERÇEK MÜHENDİSLİK DEĞERİ GİBİ SUNULMAMALI/kullanılmamalıdır.
// Kaynak doğrulandığında bu tablo ve README.md birlikte güncellenmelidir.
import { ACSR_CONDUCTORS } from '../../../../catalogs/conductors/index.ts';
import type { ACSRConductor } from '../../../../catalogs/conductors/index.ts';
import type { ConductorType, IceRegion } from '../types.ts';

export const ICE_LOAD_CONDUCTOR_TYPES: readonly ConductorType[] = [
  '3-awg',
  '1-0-awg',
  '3-0-awg',
  '266-8-mcm',
  '477-mcm-hawk',
];

export const ICE_LOAD_ICE_REGIONS: readonly IceRegion[] = [1, 2, 3, 4, 5];

/**
 * ⚠️ KAYNAK DOĞRULAMASI GEREKLİ. pb = k√d formülündeki k katsayısı,
 * buz yükü bölgesine (1-5) göre değişir. Değerler YER TUTUCUDUR — bkz.
 * dosya başlığı ve README.md.
 */
export const ICE_LOAD_COEFFICIENTS: Record<IceRegion, number> = {
  1: 0.01,
  2: 0.02,
  3: 0.03,
  4: 0.04,
  5: 0.05,
};

/**
 * ConductorType (bu motor/betonDirek/poleForce ailesinde kullanılan
 * AWG/MCM kimliği) → merkezi katalogdaki (src/catalogs/conductors) kuş
 * adı kimliği eşlemesi.
 */
const CONDUCTOR_TYPE_TO_CATALOG_ID: Record<ConductorType, string> = {
  '3-awg': 'swallow',
  '1-0-awg': 'raven',
  '3-0-awg': 'pigeon',
  '266-8-mcm': 'partridge',
  '477-mcm-hawk': 'hawk',
};

/** Verilen conductorType için merkezi katalogdaki gerçek iletken kaydını döner. */
export function iletkenVerisiGetir(conductorType: ConductorType): ACSRConductor | undefined {
  const catalogId = CONDUCTOR_TYPE_TO_CATALOG_ID[conductorType];
  return ACSR_CONDUCTORS.find((c) => c.id === catalogId);
}
