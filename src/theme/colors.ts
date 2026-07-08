// Premium tema renk paleti (Sprint UI-1A).
export const palette = {
  primary: '#0B1F3A',
  accent: '#2563EB',
  background: '#FFFFFF',
  secondaryBackground: '#F6F8FB',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
} as const;

// `colors` — eski `src/theme.ts` (Sprint 1-5) sözlüğünün alan adlarını da
// içerir; böylece bu sprintten önce yazılmış tüm ekranlar (colors.card,
// colors.text, colors.textMuted, colors.inputBg, colors.disabled,
// colors.primaryLight) hiçbir kod değişikliği yapılmadan yeni paleti
// otomatik olarak kullanır. Yeni yazılan bileşenler `palette` alan adlarını
// (textPrimary, textSecondary, secondaryBackground) tercih etmelidir.
export const colors = {
  ...palette,
  primaryLight: '#1D4E7E',
  card: palette.background,
  text: palette.textPrimary,
  textMuted: palette.textSecondary,
  disabled: '#9CA3AF',
  inputBg: palette.secondaryBackground,
} as const;

export type ThemeColors = typeof colors;
