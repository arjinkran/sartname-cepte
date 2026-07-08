// Basınca göre ölçek animasyonu — yalnızca React Native Animated API (yeni
// paket yok). Diğer tüm UI kit bileşenleri basılabilir yüzeyler için bunu
// kullanır.
import React, { useRef } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { durations, scale as scaleTokens } from '../../theme/index.ts';

export function PressableScale({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = scaleTokens.pressed,
  disabled = false,
  hitSlop,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  hitSlop?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: durations.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => animateTo(scaleTo)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View style={[{ transform: [{ scale }] }, disabled && { opacity: 0.5 }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
