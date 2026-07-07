// Hesaplama motoru altyapısı — ortak tipler.
// Bu dosya, tüm hesap motorlarının (voltageDrop, ampacityAG, ...) üzerine
// kurulacağı ortak sözleşmeyi tanımlar. Motora özgü girdi/çıktı şekilleri
// kendi engines/<ad>/types.ts dosyasında tanımlanır.

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
  | 'mm2'
  | 'm'
  | 'km'
  | 'kg'
  | 'N'
  | 'daN'
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

/** Tüm hesap motorlarının uyması gereken ortak sözleşme. */
export interface CalculationEngine<TInput = CalculationInput, TOutput = CalculationOutput> {
  id: string;
  name: string;
  category: CalculationCategory;
  description: string;
  /** true → motor henüz gerçek Excel formülüyle doğrulanmadı, demo/placeholder'dır. */
  isDemo: boolean;
  inputFields: readonly CalculationField[];
  outputFields: readonly CalculationField[];
  calculate: (input: TInput) => CalculationResult<TOutput>;
}
