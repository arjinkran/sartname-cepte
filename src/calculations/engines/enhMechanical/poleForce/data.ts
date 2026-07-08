// poleForce alt motoru — sabitler ve mevcut iletken verisine bağlantı.
//
// ⚠️ Bu dosyadaki POLE_FORCE_TENSION_RATIO ve WIND_REGION_COEFFICIENTS
// değerleri GERÇEK mühendislik katsayıları DEĞİLDİR — yalnızca ilk teknik
// altyapıyı çalışır göstermek için seçilmiş ÖN HESAP tahminleridir.
// Gerçek değerler Enerji Nakil Hatları Cilt 1/2 veya kullanıcı Excel
// tablosundan alınmalıdır (netleştirilecek — bkz. README.md).
import { AMPACITY_CONDUCTORS } from '../../ampacityOG/data.ts';
import type { AmpacityConductor } from '../../ampacityOG/types.ts';
import type { ConductorType, IceRegion, PoleFunction } from '../types.ts';
import type { WindZone } from '../betonDirek/types.ts';

export const POLE_FORCE_CONDUCTOR_TYPES: readonly ConductorType[] = [
  '3-awg',
  '1-0-awg',
  '3-0-awg',
  '266-8-mcm',
  '477-mcm-hawk',
];

export const POLE_FORCE_ICE_REGIONS: readonly IceRegion[] = [1, 2, 3, 4, 5];

export const POLE_FORCE_WIND_REGIONS: readonly WindZone[] = [1, 2, 3, 4];

export const POLE_FORCE_POLE_FUNCTIONS: readonly PoleFunction[] = [
  'tasiyici',
  'kose-tasiyici',
  'durdurucu',
  'kose-durdurucu',
  'nihayet',
  'bransman',
];

/**
 * ConductorType (bu motor/betonDirek ailesinde kullanılan AWG/MCM kimliği)
 * → ampacityOG kataloğundaki kuş adı kimliği eşlemesi. Bu iki adlandırma
 * şeması projede farklı modüllerde bağımsız olarak ortaya çıkmıştır;
 * burada tek bir yerde köprüleniyor.
 */
const CONDUCTOR_TYPE_TO_AMPACITY_ID: Record<ConductorType, string> = {
  '3-awg': 'swallow',
  '1-0-awg': 'raven',
  '3-0-awg': 'pigeon',
  '266-8-mcm': 'partridge',
  '477-mcm-hawk': 'hawk',
};

/** Verilen conductorType için ampacityOG kataloğundaki gerçek iletken kaydını döner. */
export function iletkenVerisiGetir(conductorType: ConductorType): AmpacityConductor | undefined {
  const ampacityId = CONDUCTOR_TYPE_TO_AMPACITY_ID[conductorType];
  return AMPACITY_CONDUCTORS.find((c) => c.id === ampacityId);
}

/**
 * Tahmini çekme kuvveti = breakingLoadKg × bu oran.
 * ⚠️ Gerçek işletme gerilmesi (EDS) DEĞİLDİR — yalnızca ön hesap için
 * seçilmiş bir yer tutucu orandır.
 */
export const POLE_FORCE_TENSION_RATIO = 0.2;

/**
 * Rüzgar bölgesine göre basitleştirilmiş rüzgar katsayısı (birimsiz ön
 * hesap katsayısı — gerçek rüzgar basıncı/hız tablosu DEĞİLDİR).
 * horizontalWindForceKg = (iletken çapı[m]) × (ortalama açıklık[m]) × bu katsayı.
 */
export const WIND_REGION_COEFFICIENTS: Record<WindZone, number> = {
  1: 40,
  2: 60,
  3: 80,
  4: 100,
};
