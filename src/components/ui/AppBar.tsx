// Lacivert üst uygulama çubuğu — solda opsiyonel geri oku + başlık, sağda
// opsiyonel aksiyon(lar). `onBack` verilmezse geri oku hiç render edilmez.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/index.ts';

export function AppBar({
  title,
  right,
  onBack,
}: {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.s }]}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
  },
  left: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: spacing.xs },
  backBtn: { paddingRight: spacing.xs, paddingVertical: 2 },
  backIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '600', lineHeight: 28 },
  title: {
    color: '#FFFFFF',
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    flexShrink: 1,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
});
