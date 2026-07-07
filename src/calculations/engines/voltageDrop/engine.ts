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
import { VOLTAGE_DROP_EXAMPLES } from './examples.ts';

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
  // Sprint 2B: yalnızca ÖRNEK/placeholder metadata — gerçek standard/source
  // Excel analizinden sonra doldurulacak. Formül (hesapla) değişmedi.
  metadata: {
    id: 'voltageDrop.demo',
    name: 'Gerilim Düşümü (Demo)',
    description: VOLTAGE_DROP_DEMO_NOTICE,
    version: '0.1.0-demo',
    author: 'Şartname Cepte Ekibi',
    standard: 'Demo — henüz resmi bir standarda bağlanmadı',
    source: 'Demo — Excel kaynağı henüz tanımlanmadı',
    createdAt: '2026-07-07',
    updatedAt: '2026-07-07',
  },
  category: 'electrical',
  isDemo: true,
  inputs: [
    { key: 'voltage', label: 'Şebeke gerilimi', unit: 'V', required: true },
    { key: 'current', label: 'Akım', unit: 'A', required: true },
    { key: 'length', label: 'Hat uzunluğu', unit: 'm', required: true },
    { key: 'resistancePerKm', label: 'İletken direnci', unit: 'Ω/km', required: true },
    { key: 'phaseType', label: 'Faz tipi', unit: 'none', required: true },
  ],
  outputs: [
    { key: 'voltageDropVolt', label: 'Gerilim düşümü', unit: 'V' },
    { key: 'voltageDropPercent', label: 'Gerilim düşümü yüzdesi', unit: '%' },
    { key: 'isWithinLimit', label: 'Limit içinde mi', unit: 'none' },
  ],
  // Formülde ('FAZ_FAKTORU') zaten kullanılan sabitlerin dokümantasyon
  // amaçlı yansıması — Excel'den gerçek sabitler geldiğinde burası ve
  // hesapla() birlikte güncellenecek.
  constants: [
    {
      key: 'phaseFactorMono',
      label: 'Monofaze faz faktörü',
      value: FAZ_FAKTORU.mono,
      unit: 'none',
      description: 'DEMO formülünde monofaze gerilim düşümü çarpanı.',
    },
    {
      key: 'phaseFactorTri',
      label: 'Trifaze faz faktörü',
      value: FAZ_FAKTORU.tri,
      unit: 'none',
      description: 'DEMO formülünde trifaze gerilim düşümü çarpanı (√3).',
    },
  ],
  limits: [
    {
      key: 'maxVoltageDrop',
      label: 'Azami gerilim düşümü',
      value: VOLTAGE_DROP_DEFAULT_LIMIT_PERCENT,
      unit: '%',
      description:
        'calculate() bu değeri aşan sonuçlar için LIMIT_EXCEEDED uyarısı üretir (limitPercent verilmezse varsayılan budur).',
    },
    {
      key: 'recommendedVoltageDrop',
      label: 'Önerilen gerilim düşümü',
      value: 3,
      unit: '%',
      description: 'Saha pratiğinde hedeflenmesi önerilen üst sınır (bilgi amaçlı — calculate() tarafından kullanılmaz).',
    },
    {
      key: 'warningVoltageDrop',
      label: 'Uyarı eşiği',
      value: 4,
      unit: '%',
      description: 'Azami sınıra yaklaşıldığını göstermek için ayrılmış eşik (bilgi amaçlı — calculate() tarafından kullanılmaz).',
    },
  ],
  examples: VOLTAGE_DROP_EXAMPLES,
  references: [
    {
      label: 'Excel kaynağı',
      note: 'Demo motor — henüz gerçek bir Excel/standart kaynağına bağlanmadı. Excel analizinden sonra doldurulacak.',
    },
  ],
  calculate: hesapla,
};
