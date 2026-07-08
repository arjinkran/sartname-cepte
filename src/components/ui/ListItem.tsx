// Liste satırı — sol ikon, başlık/alt başlık, sağ serbest içerik (rozet/ok).
import React from 'react';
import { Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale.tsx';
import { colors, radius, spacing, typography } from '../../theme/index.ts';

export function ListItem({
  icon,
  title,
  titleLines = 1,
  subtitle,
  right,
  onPress,
  style,
}: {
  icon?: string;
  title: string;
  /** Başlık kaç satıra kadar sarılabilir (uzun örnek soru/başlıklar için). */
  titleLines?: number;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98} style={[styles.row, style]}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={titleLines}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s, gap: spacing.s },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.m,
    backgroundColor: colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 17 },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
