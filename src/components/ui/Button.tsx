// Buton — primary (lacivert dolgu), secondary (beyaz + kenarlık), ghost.
import React from 'react';
import { Text, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { PressableScale } from './PressableScale.tsx';
import { colors, radius, spacing, typography } from '../../theme/index.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.96}
      style={[styles.base, CONTAINER_STYLE[variant], style]}
    >
      {icon}
      <Text style={[styles.label, LABEL_STYLE[variant]]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  label: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
  },
  primaryLabel: { color: '#FFFFFF' },
  secondaryLabel: { color: colors.primary },
  ghostLabel: { color: colors.accent },
});

const CONTAINER_STYLE: Record<ButtonVariant, StyleProp<ViewStyle>> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

const LABEL_STYLE: Record<ButtonVariant, StyleProp<TextStyle>> = {
  primary: styles.primaryLabel,
  secondary: styles.secondaryLabel,
  ghost: styles.ghostLabel,
};
