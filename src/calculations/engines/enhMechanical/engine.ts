// enhMechanical motoru — ENH direk açıklığı / sehim / Df-Ds hesap grubu.
//
// ⚠️ SPRINT 2C: yalnızca İSKELET. Gerçek Excel formülleri henüz
// yazılmadı — bkz. README.md'deki VBA fonksiyon listesi ve öncelik
// sırası. Her alt hesap türü girdi doğrulamasından geçer ama her zaman
// `status: 'notImplemented'` sonucu döner.
import type { CalculationEngine, CalculationResult } from '../../core/types.ts';
import { required, oneOf, validateFields } from '../../core/validation.ts';
import {
  ENH_CONDUCTOR_TYPES,
  ENH_ICE_REGIONS,
  ENH_POLE_TYPES,
  ENH_VOLTAGE_LEVELS_KV,
} from './data.ts';
import type { EnhMechanicalInput, EnhMechanicalOutput, EnhMechanicalSubCalculation } from './types.ts';
import { ENH_MECHANICAL_EXAMPLES } from './examples.ts';

/** Motorun bilinen alt hesap türleri ve Excel eşlemesi (bkz. README.md). */
export const ENH_MECHANICAL_SUB_CALCULATIONS: readonly EnhMechanicalSubCalculation[] = [
  {
    id: 'betonDirekSecimi',
    label: 'Beton Direk Seçimi',
    description: 'Yük/açıklık/gerilim koşullarına göre uygun beton direk tipinin seçimi.',
    relatedExcelTabs: ['BetonDirek'],
  },
  {
    id: 'degisikHallerDenklemi',
    label: 'Değişik Haller Denklemi',
    description: 'Sıcaklık/yük durumuna göre iletkenin farklı hallerdeki gerilme/sehim denklemi (DHD).',
    relatedExcelTabs: ['DegisikHallerDenklemi', 'DHD-Serbest'],
  },
  {
    id: 'sehimSerbest',
    label: 'Sehim Tablosu (Serbest)',
    description: 'Serbest açıklıkta iletken sehiminin hesaplanması.',
    relatedExcelTabs: ['SehimSerbest'],
  },
  {
    id: 'sehimOzel',
    label: 'Özel Sehim',
    description: 'Özel (eşit olmayan seviye/açıklık gibi) durumlarda sehim hesabı.',
    relatedExcelTabs: ['SehimOzel'],
  },
  {
    id: 'dfDsHesabi',
    label: 'Df / Ds Hesabı',
    description: 'Buz yükü bölgesine göre Df/Ds (direk başı/direk gövdesi kuvvet) katsayı hesabı.',
    relatedExcelTabs: [
      'DfDs0', 'DfDs1', 'DfDs2', 'DfDs3', 'DfDs4',
      'DfDs5', 'DfDs6', 'DfDs7', 'DfDs8', 'DfDs9',
    ],
  },
  {
    id: 'amaxHesabi',
    label: 'Amax Hesabı',
    description: 'Maksimum gerilme/sehim haline göre azami açıklık (amax) hesabı.',
    relatedExcelTabs: [],
  },
];

const ENH_CALC_TYPE_IDS = ENH_MECHANICAL_SUB_CALCULATIONS.map((s) => s.id);

export function hesapla(input: EnhMechanicalInput): CalculationResult<EnhMechanicalOutput> {
  const errors = validateFields([
    () => required(input?.calcType, 'calcType'),
    () => oneOf(input?.calcType, 'calcType', ENH_CALC_TYPE_IDS),
  ]);

  if (input?.iceRegion !== undefined && input?.iceRegion !== null) {
    const err = oneOf(input.iceRegion, 'iceRegion', ENH_ICE_REGIONS);
    if (err) errors.push(err);
  }
  if (input?.conductorType !== undefined && input?.conductorType !== null) {
    const err = oneOf(
      input.conductorType,
      'conductorType',
      ENH_CONDUCTOR_TYPES.map((c) => c.id)
    );
    if (err) errors.push(err);
  }
  if (input?.voltageLevelKv !== undefined && input?.voltageLevelKv !== null) {
    const err = oneOf(input.voltageLevelKv, 'voltageLevelKv', ENH_VOLTAGE_LEVELS_KV);
    if (err) errors.push(err);
  }
  if (input?.poleType !== undefined && input?.poleType !== null) {
    const err = oneOf(
      input.poleType,
      'poleType',
      ENH_POLE_TYPES.map((p) => p.id)
    );
    if (err) errors.push(err);
  }

  if (errors.length > 0) {
    return { ok: false, output: null, warnings: [], errors };
  }

  const subCalc = ENH_MECHANICAL_SUB_CALCULATIONS.find((s) => s.id === input.calcType)!;

  return {
    ok: true,
    output: {
      calcType: input.calcType,
      status: 'notImplemented',
      message: `${subCalc.label}: Bu hesap Excel analizinden sonra aktif edilecektir.`,
    },
    warnings: [],
    errors: [],
  };
}

export const EnhMechanicalEngine: CalculationEngine<EnhMechanicalInput, EnhMechanicalOutput> = {
  metadata: {
    id: 'enhMechanical.scaffold',
    name: 'ENH Mekanik Hesapları',
    description:
      'Direk açıklığı, sehim, Df/Ds ve değişik haller hesapları. Bu motor henüz iskelet aşamasındadır; gerçek formüller "DEK Haller ve Sehim Hesapları" Excel analizinden sonra eklenecektir.',
    version: '0.1.0-scaffold',
    author: 'Şartname Cepte Ekibi',
    standard: 'DEK Haller ve Sehim Hesapları (iskelet — henüz uygulanmadı)',
    source: 'DEK Haller ve Sehim Hesapları.xlsx',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
  },
  category: 'mechanical',
  isDemo: true,
  inputs: [
    { key: 'calcType', label: 'Alt hesap türü', unit: 'none', required: true },
    { key: 'iceRegion', label: 'Buz yükü bölgesi', unit: 'none' },
    { key: 'conductorType', label: 'İletken tipi', unit: 'none' },
    { key: 'voltageLevelKv', label: 'Gerilim seviyesi', unit: 'none' },
    { key: 'spanLengthM', label: 'Açıklık', unit: 'm' },
    { key: 'averageSpanM', label: 'Ortalama açıklık', unit: 'm' },
    { key: 'poleType', label: 'Devre / direk tipi', unit: 'none' },
    { key: 'circuitType', label: 'Devre tipi', unit: 'none' },
    { key: 'insulatorLengthM', label: 'İzolatör boyu', unit: 'm' },
    { key: 'temperatureC', label: 'Sıcaklık', unit: '°C' },
    { key: 'maxTensionKg', label: 'Azami çekme kuvveti', unit: 'kg' },
    { key: 'conductorSectionMm2', label: 'İletken kesiti', unit: 'mm2' },
    { key: 'conductorWeightKgPerM', label: 'İletken ağırlığı', unit: 'kg/m' },
    { key: 'elasticityKgPerMm2', label: 'Elastisite modülü', unit: 'kg/mm2' },
    { key: 'expansionCoefficient', label: 'Genleşme katsayısı', unit: 'none' },
  ],
  outputs: [
    { key: 'calcType', label: 'Alt hesap türü', unit: 'none' },
    { key: 'status', label: 'Durum', unit: 'none' },
    { key: 'message', label: 'Mesaj', unit: 'none' },
  ],
  constants: [],
  limits: [],
  examples: ENH_MECHANICAL_EXAMPLES,
  references: [
    {
      label: 'DEK Haller ve Sehim Hesapları (Excel kaynağı)',
      note: 'Excel sekmeleri ve VBA fonksiyonları henüz kod satırına dönüştürülmedi — bkz. README.md.',
    },
  ],
  calculate: hesapla,
};
