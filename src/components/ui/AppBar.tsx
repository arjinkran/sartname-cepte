// Lacivert üst uygulama çubuğu — solda opsiyonel geri oku + opsiyonel marka
// logosu + başlık, sağda opsiyonel aksiyon(lar). `onBack` verilmezse geri
// oku, `logo` verilmezse logo hiç render edilmez.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from './Logo.tsx';
import { colors, spacing, typography } from '../../theme/index.ts';

export function AppBar({
  title,
  right,
  onBack,
  logo = false,
}: {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
  /** Solda, geri okundan sonra/başlıktan önce resmi marka logosunu gösterir (31px). */
  logo?: boolean;
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
        {logo ? <Logo size={31} variant="navbar" style={styles.logo} /> : null}
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
  left: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  backBtn: { paddingRight: spacing.xs, paddingVertical: 2 },
  backIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '600', lineHeight: 28 },
  logo: { marginRight: 12 },
  title: {
    color: '#FFFFFF',
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    flexShrink: 1,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
});
