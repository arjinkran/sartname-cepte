// Hesaplama motoru altyapısı — hata yardımcıları.
import type { CalculationError, CalculationWarning } from './types.ts';

export type CalculationErrorCode =
  | 'FIELD_REQUIRED'
  | 'FIELD_INVALID'
  | 'OUT_OF_RANGE'
  | 'CALCULATION_FAILED';

/**
 * Hesap motorlarının, doğrulamadan bağımsız beklenmedik durumlarda
 * fırlatabileceği genel hata sınıfı (ör. motor içi tutarsızlık).
 */
export class CalculationEngineError extends Error {
  readonly code: CalculationErrorCode;
  readonly field?: string;

  constructor(code: CalculationErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'CalculationEngineError';
    this.code = code;
    this.field = field;
  }
}

export function makeError(code: CalculationErrorCode, message: string, field?: string): CalculationError {
  return { code, message, field };
}

export function makeWarning(code: string, message: string): CalculationWarning {
  return { code, message };
}
