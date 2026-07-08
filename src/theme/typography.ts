// Tipografi ölçeği — gerçek SF Pro veya harici font paketi YOK; yalnızca
// platformun sistem fontu kullanılır (iOS: San Francisco, Android: Roboto),
// Inter/Manrope benzeri "geometrik, sıkı" tasarım dili yalnızca boyut/ağırlık
// seçimleriyle taklit edilir.
import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 32,
} as const;

export const typography = {
  fontFamily,
  weight: fontWeight,
  size: fontSize,
} as const;
