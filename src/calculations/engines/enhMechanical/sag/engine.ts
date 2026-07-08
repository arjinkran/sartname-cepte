// sag alt motoru — klasik parabolik sehim ÖN HESABI.
//
// ⚠️ ÖN MÜHENDİSLİK HESABIDIR — gerçek bir DHD çözümü değildir.
//
// Formül (sabit çekme kuvveti varsayımıyla klasik parabolik yaklaşım):
//   sagM             = (totalLoadKgPerM × spanLengthM²) / (8 × tensionKg)
//   sagCm            = sagM × 100
//   sagPercentOfSpan = (sagM / spanLengthM) × 100
//
// Yük hali (loadCase):
//   noIce      → totalLoadKgPerM = çıplak iletken ağırlığı
//   oneIce     → totalLoadKgPerM = çıplak ağırlık + bir buz yükü
//   doubleIce  → totalLoadKgPerM = çıplak ağırlık + iki buz yükü
//
// Buz yükü DOĞRUDAN YENİDEN HESAPLANMAZ — IceLoadEngine.calculate()
// çağrılır (bkz. README.md).
import type { CalculationEngine, CalculationResult } from '../../../core/types.ts';
import { required, positiveNumber, oneOf, validateFields } from '../../../core/validation.ts';
import { makeError } from '../../../core/errors.ts';
import { IceLoadEngine } from '../iceLoad/engine.ts';
import { SAG_CONDUCTOR_TYPES, SAG_ICE_REGIONS, SAG_LOAD_CASES } from './data.ts';
import type { SagInput, SagOutput } from './types.ts';
import { SAG_EXAMPLES } from './examples.ts';

export const SAG_NOTICE =
  'Bu hesap parabolik sehim ön hesabıdır. Nihai projede değişik haller denklemi, sıcaklık ve gerilme kontrolleri ayrıca yapılmalıdır.';

export function hesapla(input: SagInput): CalculationResult<SagOutput> {
  const errors = validateFields([
    () => required(input?.conductorType, 'conductorType'),
    () => oneOf(input?.conductorType, 'conductorType', SAG_CONDUCTOR_TYPES),
    () => required(input?.spanLengthM, 'spanLengthM'),
    () => positiveNumber(input?.spanLengthM, 'spanLengthM'),
    () => required(input?.iceRegion, 'iceRegion'),
    () => oneOf(input?.iceRegion, 'iceRegion', SAG_ICE_REGIONS),
    () => required(input?.tensionKg, 'tensionKg'),
    () => positiveNumber(input?.tensionKg, 'tensionKg'),
    () => required(input?.loadCase, 'loadCase'),
    () => oneOf(input?.loadCase, 'loadCase', SAG_LOAD_CASES),
  ]);

  if (errors.length > 0) {
    return { ok: false, output: null, warnings: [], errors };
  }

  const buzSonucu = IceLoadEngine.calculate({
    conductorType: input.conductorType,
    iceRegion: input.iceRegion,
  });

  if (!buzSonucu.ok || !buzSonucu.output) {
    return {
      ok: false,
      output: null,
      warnings: [],
      errors:
        buzSonucu.errors.length > 0
          ? buzSonucu.errors
          : [makeError('FIELD_INVALID', 'Buz yükü hesaplanamadı.', 'conductorType')],
    };
  }

  const {
    conductorWeightKgPerM,
    iceLoadKgPerM: birBuzYuku,
    doubleIceLoadKgPerM,
    totalWeightWithIceKgPerM,
    totalWeightWithDoubleIceKgPerM,
  } = buzSonucu.output;

  let iceLoadKgPerM: number;
  let totalLoadKgPerM: number;
  switch (input.loadCase) {
    case 'noIce':
      iceLoadKgPerM = 0;
      totalLoadKgPerM = conductorWeightKgPerM;
      break;
    case 'oneIce':
      iceLoadKgPerM = birBuzYuku;
      totalLoadKgPerM = totalWeightWithIceKgPerM;
      break;
    case 'doubleIce':
      iceLoadKgPerM = doubleIceLoadKgPerM;
      totalLoadKgPerM = totalWeightWithDoubleIceKgPerM;
      break;
  }

  const sagM = (totalLoadKgPerM * input.spanLengthM ** 2) / (8 * input.tensionKg);
  const sagCm = sagM * 100;
  const sagPercentOfSpan = (sagM / input.spanLengthM) * 100;

  return {
    ok: true,
    output: {
      spanLengthM: input.spanLengthM,
      conductorWeightKgPerM,
      iceLoadKgPerM,
      totalLoadKgPerM,
      tensionKg: input.tensionKg,
      sagM,
      sagCm,
      sagPercentOfSpan,
      validationStatus: 'preliminary',
    },
    warnings: [],
    errors: [],
  };
}

export const SagEngine: CalculationEngine<SagInput, SagOutput> = {
  metadata: {
    id: 'enhMechanical.sag',
    name: 'Sehim Hesabı',
    description: SAG_NOTICE,
    version: '0.1.0-on-hesap',
    author: 'Şartname Cepte Ekibi',
    standard: 'Enerji Nakil Hatları Cilt 1/2 — klasik parabolik sehim yaklaşımı (DHD henüz çözümlenmedi)',
    source: 'Kaynak doğrulaması gerekli — bkz. README.md',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
  },
  category: 'mechanical',
  isDemo: true,
  inputs: [
    { key: 'conductorType', label: 'İletken tipi', unit: 'none', required: true },
    { key: 'spanLengthM', label: 'Açıklık', unit: 'm', required: true },
    { key: 'iceRegion', label: 'Buz bölgesi', unit: 'none', required: true },
    { key: 'tensionKg', label: 'Çekme kuvveti', unit: 'kg', required: true },
    { key: 'loadCase', label: 'Yük hali', unit: 'none', required: true },
  ],
  outputs: [
    { key: 'spanLengthM', label: 'Açıklık', unit: 'm' },
    { key: 'conductorWeightKgPerM', label: 'Çıplak iletken ağırlığı', unit: 'kg/m' },
    { key: 'iceLoadKgPerM', label: 'Buz yükü', unit: 'kg/m' },
    { key: 'totalLoadKgPerM', label: 'Toplam yük', unit: 'kg/m' },
    { key: 'tensionKg', label: 'Çekme kuvveti', unit: 'kg' },
    { key: 'sagM', label: 'Sehim', unit: 'm' },
    { key: 'sagCm', label: 'Sehim', unit: 'none' },
    { key: 'sagPercentOfSpan', label: 'Açıklığa oran', unit: '%' },
    { key: 'validationStatus', label: 'Doğrulama durumu', unit: 'none' },
  ],
  constants: [
    {
      key: 'sagFormula',
      label: 'Parabolik sehim formülü',
      value: 'sagM = (totalLoadKgPerM × spanLengthM²) / (8 × tensionKg)',
      unit: 'none',
      description:
        'Sabit çekme kuvveti varsayımıyla klasik parabolik yaklaşım; katener/gerçek DHD çözümü değildir.',
    },
  ],
  limits: [],
  examples: SAG_EXAMPLES,
  references: [
    {
      label: 'Enerji Nakil Hatları Cilt 1/2 — Sehim',
      note: 'Bu motor yalnızca parabolik ön hesap yapar; gerçek DHD (sıcaklık, elastik uzama, gerilme kontrolleri) henüz eklenmedi. Buz yükü verisi IceLoadEngine üzerinden gelir — bkz. ../iceLoad/README.md "KAYNAK DOĞRULAMASI GEREKLİ".',
    },
  ],
  calculate: hesapla,
};
