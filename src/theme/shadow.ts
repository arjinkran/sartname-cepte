// Kart gölgesi ön ayarları — iOS'ta shadow*, Android'de elevation kullanır.
import { Platform } from 'react-native';

function makeShadow(elevation: number, opacity: number, blurRadius: number, offsetY: number) {
  return Platform.select({
    ios: {
      shadowColor: '#0B1F3A',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blurRadius,
    },
    android: { elevation },
    default: {},
  });
}

export const shadow = {
  none: {},
  sm: makeShadow(2, 0.06, 4, 1),
  md: makeShadow(4, 0.08, 10, 3),
  lg: makeShadow(8, 0.12, 20, 6),
} as const;
