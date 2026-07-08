// Genel amaçlı liste kartı — Direk Malzemeleri, Direk Devre Tipleri ve
// İzolatörler ekranlarında ortak kullanılır.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '@/theme';

export function BilgiKarti({
  baslik,
  aciklama,
  onPress,
}: {
  baslik: string;
  aciklama: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.kart, pressed && { opacity: 0.85 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.ad}>{baslik}</Text>
        <Text style={styles.aciklama} numberOfLines={2}>{aciklama}</Text>
      </View>
      <Text style={styles.ok}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  ad: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  aciklama: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  ok: { fontSize: 22, color: colors.textMuted, paddingLeft: spacing.s },
});
