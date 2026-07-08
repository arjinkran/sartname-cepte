// Ekran kök kapsayıcısı — güvenli alan + arka plan rengi.
import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors } from '../../theme/index.ts';

export function Screen({
  children,
  style,
  edges = ['top', 'left', 'right'],
  backgroundColor = colors.secondaryBackground,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
  backgroundColor?: string;
}) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor }, style]} edges={edges as Edge[]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
