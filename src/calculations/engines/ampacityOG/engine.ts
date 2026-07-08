// ampacityOG motoru — OG (orta gerilim) hava hattı iletken akım taşıma
// kapasitesi. Klasik bir formül motoru DEĞİLDİR: kullanıcının seçtiği
// iletken + çalışma koşulu + gerilim seviyesine göre data.ts içindeki
// Excel-kaynaklı tablodan doğrudan arama (lookup) yapar.
import type { CalculationEngine, CalculationResult, CalculationWarning } from '../../core/types.ts';
import { required, positiveNumber, oneOf, validateFields } from '../../core/validation.ts';
import { makeError, makeWarning } from '../../core/errors.ts';
import { AMPACITY_CONDITIONS, AMPACITY_CONDUCTORS, AMPACITY_VOLTAGE_LEVELS } from './data.ts';
import type { AmpacityOGInput, AmpacityOGOutput, VoltageLevel } from './types.ts';
import { AMPACITY_OG_EXAMPLES } from './examples.ts';

export const AMPACITY_OG_NOTICE =
  'Bu değerler yüklenen OG Akım Taşıma Kapasitesi Excel tablosundan aktarılmıştır. Nihai mühendislik kontrolü için resmi şartname ve proje kriterleri esas alınmalıdır.';

function kapasiteSec(condition: (typeof AMPACITY_CONDITIONS)[number], conductor: (typeof AMPACITY_CONDUCTORS)[number]): number {
  switch (condition.id) {
    case 'condition1':
      return conductor.ampacityCondition1A;
    case 'condition2':
      return conductor.ampacityCondition2A;
    default:
      return conductor.ampacityCondition3A;
  }
}

function reaktansSec(conductor: (typeof AMPACITY_CONDUCTORS)[number], voltageLevel: VoltageLevel): number {
  return voltageLevel === '10kV' ? conductor.reactance10kVOhmPerKm : conductor.reactance35kVOhmPerKm;
}

export function hesapla(input: AmpacityOGInput): CalculationResult<AmpacityOGOutput> {
  const errors = validateFields([
    () => required(input?.conductorId, 'conductorId'),
    () => required(input?.conditionId, 'conditionId'),
    () => required(input?.voltageLevel, 'voltageLevel'),
    () => oneOf(input?.voltageLevel, 'voltageLevel', AMPACITY_VOLTAGE_LEVELS),
  ]);

  if (input?.expectedCurrentA !== undefined && input?.expectedCurrentA !== null) {
    const err = positiveNumber(input.expectedCurrentA, 'expectedCurrentA');
    if (err) errors.push(err);
  }

  const conductor = input?.conductorId
    ? AMPACITY_CONDUCTORS.find((c) => c.id === input.conductorId)
    : undefined;
  if (input?.conductorId && !conductor) {
    errors.push(makeError('FIELD_INVALID', `Bilinmeyen iletken: ${input.conductorId}`, 'conductorId'));
  }

  const condition = input?.conditionId
    ? AMPACITY_CONDITIONS.find((c) => c.id === input.conditionId)
    : undefined;
  if (input?.conditionId && !condition) {
    errors.push(makeError('FIELD_INVALID', `Bilinmeyen çalışma koşulu: ${input.conditionId}`, 'conditionId'));
  }

  if (errors.length > 0 || !conductor || !condition) {
    return { ok: false, output: null, warnings: [], errors };
  }

  const ampacityA = kapasiteSec(condition, conductor);
  const reactanceOhmPerKm = reaktansSec(conductor, input.voltageLevel);

  let isSuitable: boolean | null = null;
  let utilizationPercent: number | null = null;
  let remainingCapacityA: number | null = null;
  const warnings: CalculationWarning[] = [];

  if (input.expectedCurrentA !== undefined && input.expectedCurrentA !== null) {
    isSuitable = input.expectedCurrentA <= ampacityA;
    utilizationPercent = (input.expectedCurrentA / ampacityA) * 100;
    remainingCapacityA = ampacityA - input.expectedCurrentA;
    if (!isSuitable) {
      warnings.push(
        makeWarning(
          'AMPACITY_EXCEEDED',
          `Beklenen akım (${input.expectedCurrentA} A), iletkenin akım taşıma kapasitesini (${ampacityA} A) aşıyor.`
        )
      );
    }
  }

  return {
    ok: true,
    output: {
      ampacityA,
      isSuitable,
      utilizationPercent,
      remainingCapacityA,
      conductorName: conductor.name,
      conductorCode: conductor.code,
      resistance20OhmPerKm: conductor.resistance20OhmPerKm,
      reactanceOhmPerKm,
      equivalentCuMm2: conductor.equivalentCuMm2,
      nominalDiameterMm: conductor.nominalDiameterMm,
      // ACSRConductor'da ayrı bir nominalAreaMm2 alanı yok; bu değer her
      // zaman aluminumAreaMm2 ile aynıydı (bkz. src/catalogs/conductors).
      nominalAreaMm2: conductor.aluminumAreaMm2,
      nominalWeightKgPerM: conductor.nominalWeightKgPerM,
      breakingLoadKg: conductor.breakingLoadKg,
    },
    warnings,
    errors: [],
  };
}

export const AmpacityOGEngine: CalculationEngine<AmpacityOGInput, AmpacityOGOutput> = {
  metadata: {
    id: 'ampacityOG.v1',
    name: 'OG Akım Taşıma Kapasitesi',
    description: AMPACITY_OG_NOTICE,
    version: '1.0.0',
    author: 'Şartname Cepte Ekibi',
    standard: 'OG Akım Taşıma Kapasitesi — iletken veri tabanı',
    source: 'OG Akım Taşıma Kapasitesi.xlsx',
    createdAt: '2026-07-07',
    updatedAt: '2026-07-07',
  },
  category: 'electrical',
  isDemo: false,
  inputs: [
    { key: 'conductorId', label: 'İletken', unit: 'none', required: true },
    { key: 'conditionId', label: 'Çalışma koşulu', unit: 'none', required: true },
    { key: 'voltageLevel', label: 'Gerilim seviyesi', unit: 'none', required: true },
    { key: 'expectedCurrentA', label: 'Beklenen akım', unit: 'A', required: false },
  ],
  outputs: [
    { key: 'ampacityA', label: 'Akım taşıma kapasitesi', unit: 'A' },
    { key: 'isSuitable', label: 'Uygun mu', unit: 'none' },
    { key: 'utilizationPercent', label: 'Kullanım oranı', unit: '%' },
    { key: 'remainingCapacityA', label: 'Kalan kapasite', unit: 'A' },
    { key: 'conductorName', label: 'İletken adı', unit: 'none' },
    { key: 'conductorCode', label: 'İletken kodu', unit: 'none' },
    { key: 'resistance20OhmPerKm', label: 'Direnç (20°C)', unit: 'Ω/km' },
    { key: 'reactanceOhmPerKm', label: 'Reaktans', unit: 'Ω/km' },
    { key: 'equivalentCuMm2', label: 'Eşdeğer Cu kesiti', unit: 'mm2' },
    { key: 'nominalDiameterMm', label: 'Anma çapı', unit: 'mm' },
    { key: 'nominalAreaMm2', label: 'Anma kesiti', unit: 'mm2' },
    { key: 'nominalWeightKgPerM', label: 'Anma ağırlığı', unit: 'kg/m' },
    { key: 'breakingLoadKg', label: 'Kopma dayanımı', unit: 'kg' },
  ],
  constants: [
    {
      key: 'copperEquivalenceFactor',
      label: 'Alüminyum → bakır eşdeğer kesit çarpanı',
      value: 0.61,
      unit: 'none',
      description: 'equivalentCuMm2, aluminumAreaMm2 × bu çarpan ile hesaplanır (ρCu/ρAl direnç oranından).',
    },
  ],
  limits: [],
  examples: AMPACITY_OG_EXAMPLES,
  references: [
    {
      label: 'OG Akım Taşıma Kapasitesi (Excel kaynağı)',
      note: 'Excel dosyasından yalnızca HAWK/condition3 (740 A), SWALLOW/condition1 (120 A) ve RAVEN/35kV reaktans (0,387 Ω/km) değerleri doğrudan doğrulanmıştır; diğer değerler bu noktalara kalibre edilmiş mühendislik tahminleridir (bkz. data.ts başlık notu).',
    },
  ],
  calculate: hesapla,
};
