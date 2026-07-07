// Hesaplama motoru altyapısı — genel doğrulama yardımcıları.
// Her yardımcı, girdi geçerliyse null, geçersizse bir CalculationError döner.
// Motorlar bu doğrulayıcıları validateFields() ile bir arada çalıştırır.
import type { CalculationError } from './types.ts';
import { makeError } from './errors.ts';

export function required(value: unknown, field: string): CalculationError | null {
  if (value === undefined || value === null || value === '') {
    return makeError('FIELD_REQUIRED', `${field} zorunludur.`, field);
  }
  return null;
}

export function positiveNumber(value: unknown, field: string): CalculationError | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return makeError('FIELD_INVALID', `${field} pozitif bir sayı olmalıdır.`, field);
  }
  return null;
}

export function numberRange(value: unknown, field: string, min: number, max: number): CalculationError | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return makeError('FIELD_INVALID', `${field} sayısal olmalıdır.`, field);
  }
  if (value < min || value > max) {
    return makeError('OUT_OF_RANGE', `${field}, ${min}-${max} aralığında olmalıdır.`, field);
  }
  return null;
}

export function oneOf<T extends string>(
  value: unknown,
  field: string,
  options: readonly T[]
): CalculationError | null {
  if (typeof value !== 'string' || !(options as readonly string[]).includes(value)) {
    return makeError(
      'FIELD_INVALID',
      `${field}, şu değerlerden biri olmalıdır: ${options.join(', ')}.`,
      field
    );
  }
  return null;
}

/** Doğrulayıcı fonksiyon listesini sırayla çalıştırır, üretilen hataları toplar. */
export function validateFields(validators: ReadonlyArray<() => CalculationError | null>): CalculationError[] {
  const errors: CalculationError[] = [];
  for (const validate of validators) {
    const err = validate();
    if (err) errors.push(err);
  }
  return errors;
}
