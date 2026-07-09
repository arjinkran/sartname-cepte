// Boş durum — arama sonucu yok / favori yok gibi durumlarda ortak gösterim.
// `logo`: yalnızca "kütüphanede henüz içerik yok" türü tüm-ekran boş
// durumlarında (ör. Favoriler, Offline Kütüphane) kullanılır — emoji
// simgesinin yerine küçük resmi logo gösterir. Arama/AI gibi "sonuç
// bulunamadı" durumlarında logo KULLANILMAZ (gereksiz tekrar olmasın diye).
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from './Logo.tsx';
import { colors, spacing, typography } from '../../theme/index.ts';

export function EmptyState({
  icon = '🔍',
  logo = false,
  title,
  description,
}: {
  icon?: string;
  logo?: boolean;
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.root}>
      {logo ? <Logo size={40} style={styles.logo} /> : <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.l },
  icon: { fontSize: 40, marginBottom: spacing.s },
  logo: { marginBottom: spacing.s },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  desc: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 19,
  },
});
