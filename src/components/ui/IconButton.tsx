// Dairesel ikon düğmesi — ör. AppBar'daki bildirim ikonu (opsiyonel rozet).
import React from 'react';
import { Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale.tsx';
import { colors, scale } from '../../theme/index.ts';

export function IconButton({
  icon,
  onPress,
  size = 40,
  backgroundColor = 'rgba(255,255,255,0.14)',
  badge = false,
  style,
}: {
  icon: string;
  onPress?: () => void;
  size?: number;
  backgroundColor?: string;
  badge?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={scale.pressedIcon}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.48 }}>{icon}</Text>
      {badge ? <View style={styles.badge} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});
