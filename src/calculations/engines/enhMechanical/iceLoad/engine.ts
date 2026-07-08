// iceLoad alt motoru — iletken üzerindeki buz yükünün ÖN HESABI.
//
// ⚠️ ÖN MÜHENDİSLİK HESABIDIR. Bölge katsayıları (k) kaynak
// doğrulaması gerektirir — bkz. README.md.
//
// Formül (kitapta görülen pb = k√d yapısına göre):
//   iceLoadKgPerM                  = k(iceRegion) × √(conductorDiameterMm)
//   totalWeightWithIceKgPerM       = conductorWeightKgPerM + iceLoadKgPerM
//   doubleIceLoadKgPerM            = 2 × iceLoadKgPerM
//   totalWeightWithDoubleIceKgPerM = conductorWeightKgPerM + doubleIceLoadKgPerM
import type { CalculationEngine, CalculationResult } from '../../../core/types.ts';
import { required, oneOf, validateFields } from '../../../core/validation.ts';
import { makeError } from '../../../core/errors.ts';
import {
  ICE_LOAD_CONDUCTOR_TYPES,
  ICE_LOAD_ICE_REGIONS,
  ICE_LOAD_COEFFICIENTS,
  iletkenVerisiGetir,
} from './data.ts';
import type { IceLoadInput, IceLoadOutput } from './types.ts';
import { ICE_LOAD_EXAMPLES } from './examples.ts';

export const ICE_LOAD_NOTICE =
  'Bu hesap ENH mekanik hesaplarında kullanılan buz yükü ön hesabıdır. Bölge katsayıları kaynak doğrulaması tamamlandıkça güncellenecektir.';

export function hesapla(input: IceLoadInput): CalculationResult<IceLoadOutput> {
  const errors = validateFields([
    () => required(input?.conductorType, 'conductorType'),
    () => oneOf(input?.conductorType, 'conductorType', ICE_LOAD_CONDUCTOR_TYPES),
    () => required(input?.iceRegion, 'iceRegion'),
    () => oneOf(input?.iceRegion, 'iceRegion', ICE_LOAD_ICE_REGIONS),
  ]);

  if (errors.length > 0) {
    return { ok: false, output: null, warnings: [], errors };
  }

  const iletken = iletkenVerisiGetir(input.conductorType);
  if (!iletken) {
    return {
      ok: false,
      output: null,
      warnings: [],
      errors: [makeError('FIELD_INVALID', `Bilinmeyen iletken: ${input.conductorType}`, 'conductorType')],
    };
  }

  const k = ICE_LOAD_COEFFICIENTS[input.iceRegion];
  const conductorDiameterMm = iletken.nominalDiameterMm;
  const conductorWeightKgPerM = iletken.nominalWeightKgPerM;

  const iceLoadKgPerM = k * Math.sqrt(conductorDiameterMm);
  const totalWeightWithIceKgPerM = conductorWeightKgPerM + iceLoadKgPerM;
  const doubleIceLoadKgPerM = 2 * iceLoadKgPerM;
  const totalWeightWithDoubleIceKgPerM = conductorWeightKgPerM + doubleIceLoadKgPerM;

  return {
    ok: true,
    output: {
      conductorDiameterMm,
      conductorWeightKgPerM,
      iceLoadKgPerM,
      totalWeightWithIceKgPerM,
      doubleIceLoadKgPerM,
      totalWeightWithDoubleIceKgPerM,
    },
    warnings: [],
    errors: [],
  };
}

export const IceLoadEngine: CalculationEngine<IceLoadInput, IceLoadOutput> = {
  metadata: {
    id: 'enhMechanical.iceLoad',
    name: 'Buz Yükü Hesabı',
    description: ICE_LOAD_NOTICE,
    version: '0.1.0-on-hesap',
    author: 'Şartname Cepte Ekibi',
    standard: 'Enerji Nakil Hatları Cilt 1/2 — pb = k√d formül yapısı (k katsayıları kaynak doğrulaması gerektiriyor)',
    source: 'Kaynak doğrulaması gerekli — bkz. README.md',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
  },
  category: 'mechanical',
  isDemo: true,
  inputs: [
    { key: 'conductorType', label: 'İletken tipi', unit: 'none', required: true },
    { key: 'iceRegion', label: 'Buz bölgesi', unit: 'none', required: true },
  ],
  outputs: [
    { key: 'conductorDiameterMm', label: 'İletken çapı', unit: 'mm' },
    { key: 'conductorWeightKgPerM', label: 'Çıplak iletken ağırlığı', unit: 'kg/m' },
    { key: 'iceLoadKgPerM', label: 'Bir buz yükü', unit: 'kg/m' },
    { key: 'totalWeightWithIceKgPerM', label: 'Bir buz yüklü toplam ağırlık', unit: 'kg/m' },
    { key: 'doubleIceLoadKgPerM', label: 'İki buz yükü', unit: 'kg/m' },
    { key: 'totalWeightWithDoubleIceKgPerM', label: 'İki buz yüklü toplam ağırlık', unit: 'kg/m' },
  ],
  constants: [
    {
      key: 'iceLoadFormula',
      label: 'Buz yükü formülü',
      value: 'pb = k × √d',
      unit: 'none',
      description: 'k: buz bölgesi katsayısı (kaynak doğrulaması gerekli, bkz. data.ts), d: iletken çapı (mm).',
    },
  ],
  limits: [],
  examples: ICE_LOAD_EXAMPLES,
  references: [
    {
      label: 'Enerji Nakil Hatları Cilt 1/2 — Buz Yükü',
      note: 'ICE_LOAD_COEFFICIENTS içindeki k değerleri KAYNAK DOĞRULAMASI GEREKTİRİR — yer tutucudur, gerçek mühendislik değeri olarak kullanılmamalıdır.',
    },
  ],
  calculate: hesapla,
};
