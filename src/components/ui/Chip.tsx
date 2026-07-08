// Yuvarlak çip — Popüler Aramalar gibi kısa etiket listeleri için.
import React from 'react';
import { Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale.tsx';
import { colors, radius, spacing, typography, scale } from '../../theme/index.ts';

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={scale.pressedSmall} style={[styles.chip, selected && styles.chipSelected, style]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.m,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.s,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  icon: { fontSize: 12 },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
  },
  labelSelected: { color: '#FFFFFF', fontWeight: typography.weight.bold },
});
