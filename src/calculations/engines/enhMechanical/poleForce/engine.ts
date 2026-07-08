// poleForce alt motoru — direğe gelen düşey/yatay kuvvetlerin ÖN HESABI.
//
// ⚠️ ÖN MÜHENDİSLİK HESABIDIR. Nihai direk seçimi için resmi katalog,
// moment hesabı ve proje kriterleri esas alınmalıdır (bkz. README.md).
//
// Formüller (kasıtlı olarak basitleştirilmiş — bkz. README.md):
//   ortalamaAcikilkM     = (spanLeftM + spanRightM) / 2
//   verticalForceKg      = iletken.nominalWeightKgPerM × ortalamaAcikilkM + equipmentWeightKg
//   tahminiCekmeKuvveti  = iletken.breakingLoadKg × POLE_FORCE_TENSION_RATIO
//   angleForceKg         = 2 × tahminiCekmeKuvveti × sin(deviationAngleDeg / 2)
//   horizontalWindForceKg = (iletken.nominalDiameterMm / 1000) × ortalamaAcikilkM × rüzgarKatsayısı
//   totalHorizontalForceKg = horizontalWindForceKg + angleForceKg
//   resultantForceKg     = √(verticalForceKg² + totalHorizontalForceKg²)
//   designForceKg        = resultantForceKg × safetyFactor
import type { CalculationEngine, CalculationResult, CalculationWarning } from '../../../core/types.ts';
import { required, positiveNumber, nonNegativeNumber, oneOf, validateFields } from '../../../core/validation.ts';
import { makeError, makeWarning } from '../../../core/errors.ts';
import {
  POLE_FORCE_CONDUCTOR_TYPES,
  POLE_FORCE_ICE_REGIONS,
  POLE_FORCE_WIND_REGIONS,
  POLE_FORCE_POLE_FUNCTIONS,
  POLE_FORCE_TENSION_RATIO,
  WIND_REGION_COEFFICIENTS,
  iletkenVerisiGetir,
} from './data.ts';
import type { PoleForceInput, PoleForceOutput } from './types.ts';
import { POLE_FORCE_EXAMPLES } from './examples.ts';

export const POLE_FORCE_NOTICE =
  'Bu hesap ön mühendislik hesabıdır. Nihai direk seçimi için resmi katalog, moment hesabı ve proje kriterleri esas alınmalıdır.';

const DERECE_RADYAN = Math.PI / 180;

export function hesapla(input: PoleForceInput): CalculationResult<PoleForceOutput> {
  const errors = validateFields([
    () => required(input?.conductorType, 'conductorType'),
    () => oneOf(input?.conductorType, 'conductorType', POLE_FORCE_CONDUCTOR_TYPES),
    () => required(input?.spanLeftM, 'spanLeftM'),
    () => positiveNumber(input?.spanLeftM, 'spanLeftM'),
    () => required(input?.spanRightM, 'spanRightM'),
    () => positiveNumber(input?.spanRightM, 'spanRightM'),
    () => required(input?.iceRegion, 'iceRegion'),
    () => oneOf(input?.iceRegion, 'iceRegion', POLE_FORCE_ICE_REGIONS),
    () => required(input?.windRegion, 'windRegion'),
    () => oneOf(input?.windRegion, 'windRegion', POLE_FORCE_WIND_REGIONS),
    () => required(input?.poleFunction, 'poleFunction'),
    () => oneOf(input?.poleFunction, 'poleFunction', POLE_FORCE_POLE_FUNCTIONS),
    () => required(input?.deviationAngleDeg, 'deviationAngleDeg'),
    () => nonNegativeNumber(input?.deviationAngleDeg, 'deviationAngleDeg'),
    () => required(input?.equipmentWeightKg, 'equipmentWeightKg'),
    () => nonNegativeNumber(input?.equipmentWeightKg, 'equipmentWeightKg'),
    () => required(input?.safetyFactor, 'safetyFactor'),
    () => positiveNumber(input?.safetyFactor, 'safetyFactor'),
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

  const ortalamaAcikilkM = (input.spanLeftM + input.spanRightM) / 2;
  const verticalForceKg = iletken.nominalWeightKgPerM * ortalamaAcikilkM + input.equipmentWeightKg;

  const tahminiCekmeKuvvetiKg = iletken.breakingLoadKg * POLE_FORCE_TENSION_RATIO;
  const angleForceKg = 2 * tahminiCekmeKuvvetiKg * Math.sin((input.deviationAngleDeg * DERECE_RADYAN) / 2);

  const ruzgarKatsayisi = WIND_REGION_COEFFICIENTS[input.windRegion];
  const horizontalWindForceKg = (iletken.nominalDiameterMm / 1000) * ortalamaAcikilkM * ruzgarKatsayisi;

  const totalHorizontalForceKg = horizontalWindForceKg + angleForceKg;
  const resultantForceKg = Math.sqrt(verticalForceKg ** 2 + totalHorizontalForceKg ** 2);
  const designForceKg = resultantForceKg * input.safetyFactor;

  const warnings: CalculationWarning[] = [];
  if (
    (input.poleFunction === 'kose-tasiyici' || input.poleFunction === 'kose-durdurucu') &&
    input.deviationAngleDeg === 0
  ) {
    warnings.push(
      makeWarning('ANGLE_EXPECTED', 'Seçilen direk görevi bir sapma açısı gerektirir ama sapma açısı 0° girildi.')
    );
  }
  if (input.poleFunction === 'tasiyici' && input.deviationAngleDeg > 0) {
    warnings.push(
      makeWarning(
        'ANGLE_UNEXPECTED',
        'Taşıyıcı direk görevinde normalde sapma açısı olmaz; girilen açı köşe taşıyıcı direk gerektirebilir.'
      )
    );
  }

  return {
    ok: true,
    output: {
      verticalForceKg,
      horizontalWindForceKg,
      angleForceKg,
      totalHorizontalForceKg,
      resultantForceKg,
      designForceKg,
    },
    warnings,
    errors: [],
  };
}

export const PoleForceEngine: CalculationEngine<PoleForceInput, PoleForceOutput> = {
  metadata: {
    id: 'enhMechanical.poleForce',
    name: 'Direk Kuvvet Hesabı',
    description: POLE_FORCE_NOTICE,
    version: '0.1.0-on-hesap',
    author: 'Şartname Cepte Ekibi',
    standard: 'Enerji Nakil Hatları Cilt 1/2 (ön hesap — gerçek formül henüz doğrulanmadı)',
    source: 'DEK Haller ve Sehim Hesapları.xlsx (henüz birebir aktarılmadı)',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
  },
  category: 'mechanical',
  isDemo: true,
  inputs: [
    { key: 'conductorType', label: 'İletken tipi', unit: 'none', required: true },
    { key: 'spanLeftM', label: 'Sol açıklık', unit: 'm', required: true },
    { key: 'spanRightM', label: 'Sağ açıklık', unit: 'm', required: true },
    { key: 'iceRegion', label: 'Buz bölgesi', unit: 'none', required: true },
    { key: 'windRegion', label: 'Rüzgar bölgesi', unit: 'none', required: true },
    { key: 'poleFunction', label: 'Direk görevi', unit: 'none', required: true },
    { key: 'deviationAngleDeg', label: 'Sapma açısı', unit: 'none', required: true },
    { key: 'equipmentWeightKg', label: 'Donanım ağırlığı', unit: 'kg', required: true },
    { key: 'safetyFactor', label: 'Emniyet katsayısı', unit: 'none', required: true },
  ],
  outputs: [
    { key: 'verticalForceKg', label: 'Düşey kuvvet', unit: 'kg' },
    { key: 'horizontalWindForceKg', label: 'Yatay rüzgar kuvveti', unit: 'kg' },
    { key: 'angleForceKg', label: 'Açı kuvveti', unit: 'kg' },
    { key: 'totalHorizontalForceKg', label: 'Toplam yatay kuvvet', unit: 'kg' },
    { key: 'resultantForceKg', label: 'Bileşke kuvvet', unit: 'kg' },
    { key: 'designForceKg', label: 'Tasarım kuvveti', unit: 'kg' },
  ],
  constants: [
    {
      key: 'tensionRatio',
      label: 'Tahmini çekme kuvveti oranı',
      value: POLE_FORCE_TENSION_RATIO,
      unit: 'none',
      description: 'tahminiCekmeKuvveti = iletken kopma dayanımı × bu oran (gerçek işletme gerilmesi/EDS DEĞİLDİR — ön hesap yer tutucusu).',
    },
  ],
  limits: [],
  examples: POLE_FORCE_EXAMPLES,
  references: [
    {
      label: 'Enerji Nakil Hatları Cilt 1/2 — Direğe Gelen Kuvvetler',
      note: 'Formüller ve katsayılar (POLE_FORCE_TENSION_RATIO, WIND_REGION_COEFFICIENTS) ön hesap tahminidir; gerçek değerler kaynak kitaplardan/Excel\'den doğrulanmadan mühendislik kararı için kullanılmamalıdır.',
    },
  ],
  calculate: hesapla,
};
