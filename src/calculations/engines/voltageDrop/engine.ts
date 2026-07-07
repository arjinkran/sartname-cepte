// voltageDrop motoru — DEMO uygulama.
//
// ⚠️ Bu gerçek bir Excel formülü DEĞİLDİR. Sprint 2A kapsamında yalnızca
// calculation engine altyapısının (doğrulama → hesap → sonuç zarfı) nasıl
// çalışacağını göstermek için basitleştirilmiş bir omik düşüm yaklaşımı
// kullanır. Nihai formüller Excel analizinden sonra bu dosyada değiştirilecektir.
import type { CalculationEngine, CalculationResult } from '../../core/types.ts';
import { required, positiveNumber, oneOf, validateFields } from '../../core/validation.ts';
import { makeWarning } from '../../core/errors.ts';
import type { PhaseType, VoltageDropInput, VoltageDropOutput } from './types.ts';

export const VOLTAGE_DROP_PHASE_TYPES: readonly PhaseType[] = ['mono', 'tri'];

/** Demo varsayılan gerilim düşümü limiti (%) — girdide limitPercent verilmezse kullanılır. */
export const VOLTAGE_DROP_DEFAULT_LIMIT_PERCENT = 5;

const FAZ_FAKTORU: Record<PhaseType, number> = {
  mono: 2,
  tri: Math.sqrt(3),
};

export const VOLTAGE_DROP_DEMO_NOTICE =
  "Bu hesap motoru demo amaçlıdır. Nihai formüller Excel analizinden sonra eklenecektir.";

/**
 * DEMO gerilim düşümü hesabı.
 * eV = fazFaktörü · I · (R/km ÷ 1000) · L
 * e% = (eV / U) × 100
 */
export function hesapla(input: VoltageDropInput): CalculationResult<VoltageDropOutput> {
  const errors = validateFields([
    () => required(input?.voltage, 'voltage'),
    () => positiveNumber(input?.voltage, 'voltage'),
    () => required(input?.current, 'current'),
    () => positiveNumber(input?.current, 'current'),
    () => required(input?.length, 'length'),
    () => positiveNumber(input?.length, 'length'),
    () => required(input?.resistancePerKm, 'resistancePerKm'),
    () => positiveNumber(input?.resistancePerKm, 'resistancePerKm'),
    () => required(input?.phaseType, 'phaseType'),
    () => oneOf(input?.phaseType, 'phaseType', VOLTAGE_DROP_PHASE_TYPES),
  ]);

  if (errors.length > 0) {
    return { ok: false, output: null, warnings: [], errors };
  }

  const limitPercent = input.limitPercent ?? VOLTAGE_DROP_DEFAULT_LIMIT_PERCENT;
  const faktor = FAZ_FAKTORU[input.phaseType];
  const voltageDropVolt = faktor * input.current * (input.resistancePerKm / 1000) * input.length;
  const voltageDropPercent = (voltageDropVolt / input.voltage) * 100;
  const isWithinLimit = voltageDropPercent <= limitPercent;

  const warnings = isWithinLimit
    ? []
    : [makeWarning('LIMIT_EXCEEDED', `Gerilim düşümü, izin verilen %${limitPercent} limitini aşıyor.`)];

  return {
    ok: true,
    output: { voltageDropVolt, voltageDropPercent, isWithinLimit },
    warnings,
    errors: [],
  };
}

export const VoltageDropEngine: CalculationEngine<VoltageDropInput, VoltageDropOutput> = {
  id: 'voltageDrop.demo',
  name: 'Gerilim Düşümü (Demo)',
  category: 'electrical',
  description: VOLTAGE_DROP_DEMO_NOTICE,
  isDemo: true,
  inputFields: [
    { key: 'voltage', label: 'Şebeke gerilimi', unit: 'V', required: true },
    { key: 'current', label: 'Akım', unit: 'A', required: true },
    { key: 'length', label: 'Hat uzunluğu', unit: 'm', required: true },
    { key: 'resistancePerKm', label: 'İletken direnci', unit: 'Ω/km', required: true },
    { key: 'phaseType', label: 'Faz tipi', unit: 'none', required: true },
  ],
  outputFields: [
    { key: 'voltageDropVolt', label: 'Gerilim düşümü', unit: 'V' },
    { key: 'voltageDropPercent', label: 'Gerilim düşümü yüzdesi', unit: '%' },
    { key: 'isWithinLimit', label: 'Limit içinde mi', unit: 'none' },
  ],
  calculate: hesapla,
};
