// Hesaplama motoru altyapısı — ortak tipler.
// Bu dosya, tüm hesap motorlarının (voltageDrop, ampacityAG, ...) üzerine
// kurulacağı ortak sözleşmeyi tanımlar. Motora özgü girdi/çıktı şekilleri
// kendi engines/<ad>/types.ts dosyasında tanımlanır.
//
// Sprint 2B: yapı, ileride Excel dosyalarındaki gerçek mühendislik
// hesaplarının birebir taşınabilmesi için metadata/constants/limits
// alanlarını da içerecek şekilde genişletildi (bkz. modules/calculations/README.md).

/** Hesap motorunun ait olduğu üst kategori (gruplama/filtreleme için). */
export type CalculationCategory = 'electrical' | 'mechanical' | 'safety' | 'other';

/** Alan/sonuç birimleri — UI'da etiketleme ve biçimlendirme için kullanılır. */
export type CalculationUnit =
  | 'V'
  | 'A'
  | 'W'
  | 'kW'
  | 'kVA'
  | 'Ω'
  | 'Ω/km'
  | 'mm'
  | 'mm2'
  | 'm'
  | 'km'
  | 'kg'
  | 'kg/m'
  | 'kg/mm2'
  | 'N'
  | 'daN'
  | '°C'
  | '%'
  | 'none';

/** Bir girdi/çıktı alanının UI'da nasıl sunulacağını tanımlayan meta veri. */
export interface CalculationField {
  key: string;
  label: string;
  unit: CalculationUnit;
  required?: boolean;
  description?: string;
}

/** Bir hesap motoruna verilen girdi kümesi (motora özgü şekil). */
export type CalculationInput = Record<string, unknown>;

/** Bir hesap motorunun ürettiği çıktı kümesi (motora özgü şekil). */
export type CalculationOutput = Record<string, unknown>;

/** Hesabı geçersiz kılmayan ama kullanıcıyı uyaran durum (ör. limit aşımı). */
export interface CalculationWarning {
  code: string;
  message: string;
}

/** Hesabın tamamlanmasını engelleyen durum (ör. eksik/geçersiz girdi). */
export interface CalculationError {
  code: string;
  message: string;
  field?: string;
}

/** Bir hesap motoru çağrısının standart sonuç zarfı. */
export interface CalculationResult<TOutput = CalculationOutput> {
  ok: boolean;
  output: TOutput | null;
  warnings: CalculationWarning[];
  errors: CalculationError[];
}

/**
 * Bir hesap motorunun kimlik/köken bilgisi. Excel'den birebir taşınan
 * motorlarda `standard` ve `source` gerçek kaynağı (yönetmelik, Excel
 * dosya/sayfa adı) işaret eder; demo motorlarda placeholder metin kullanılır.
 */
export interface CalculationMetadata {
  id: string;
  name: string;
  description: string;
  /** Semantik sürüm (ör. "1.0.0"); demo motorlarda "-demo" son eki önerilir. */
  version: string;
  author: string;
  /** Dayandığı mühendislik standardı/yönetmeliği (ör. "IEC 60364"). */
  standard?: string;
  /** Formülün alındığı kaynak (ör. Excel dosya/sayfa adı). */
  source?: string;
  /** ISO tarih (YYYY-MM-DD) */
  createdAt: string;
  /** ISO tarih (YYYY-MM-DD) */
  updatedAt: string;
}

/**
 * Excel'den birebir taşınacak, motor içinde kullanılan sabit bir değer
 * (ör. iletkenlik katsayısı, standart kesit serisi elemanı).
 */
export interface CalculationConstant {
  key: string;
  label: string;
  value: number | string;
  unit?: CalculationUnit;
  description?: string;
}

/**
 * Bir hesap sonucunun değerlendirileceği eşik/sınır değeri
 * (ör. maxVoltageDrop, recommendedVoltageDrop, warningVoltageDrop).
 */
export interface CalculationLimit {
  key: string;
  label: string;
  value: number;
  unit?: CalculationUnit;
  description?: string;
}

/** Bir motorun girdi/çıktı çiftini gösteren örnek senaryo (dokümantasyon + regresyon testi). */
export interface CalculationExample<TInput = CalculationInput, TOutput = CalculationOutput> {
  id: string;
  title: string;
  input: TInput;
  output?: TOutput;
  description?: string;
}

/** Bir motorun dayandığı dış kaynağa (standart, Excel dosyası, doküman) referans. */
export interface CalculationReference {
  label: string;
  url?: string;
  note?: string;
}

/** Tüm hesap motorlarının uyması gereken ortak sözleşme. */
export interface CalculationEngine<TInput = CalculationInput, TOutput = CalculationOutput> {
  metadata: CalculationMetadata;
  category: CalculationCategory;
  /** true → motor henüz gerçek Excel formülüyle doğrulanmadı, demo/placeholder'dır. */
  isDemo: boolean;
  inputs: readonly CalculationField[];
  outputs: readonly CalculationField[];
  /** Excel'den birebir taşınacak sabitler — henüz yoksa boş dizi. */
  constants: readonly CalculationConstant[];
  /** Sonuçların değerlendirileceği eşik değerleri — henüz yoksa boş dizi. */
  limits: readonly CalculationLimit[];
  examples?: readonly CalculationExample<TInput, TOutput>[];
  references?: readonly CalculationReference[];
  calculate: (input: TInput) => CalculationResult<TOutput>;
}
