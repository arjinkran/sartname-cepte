// Animasyon süreleri — yalnızca React Native'in yerleşik Animated API'siyle
// kullanılmak üzere (yeni paket yok). Splash geçişi ve PressableScale bu
// sabitleri paylaşır.
export const durations = {
  fast: 100,
  base: 200,
  slow: 300,
  splashHold: 3000,
  splashFade: 350,
} as const;

export const scale = {
  pressed: 0.97,
  pressedSmall: 0.95,
  pressedIcon: 0.92,
} as const;
