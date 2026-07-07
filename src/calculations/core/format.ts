// Hesaplama motoru altyapısı — sonuç biçimlendirme yardımcıları.
// Türkçe sayı biçimi (binlik nokta, ondalık virgül) kullanır.

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(value: number, digits = 2): string {
  return `%${formatNumber(value, digits)}`;
}

export function formatVoltage(value: number, digits = 1): string {
  return `${formatNumber(value, digits)} V`;
}

export function formatCurrent(value: number, digits = 2): string {
  return `${formatNumber(value, digits)} A`;
}

export function formatPower(value: number, digits = 2): string {
  return `${formatNumber(value, digits)} kW`;
}

export function formatLength(value: number, digits = 1): string {
  return `${formatNumber(value, digits)} m`;
}
