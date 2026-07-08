// Direk sınıfı liste kartı — Direk Sınıfları ekranında kullanılır.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '@/theme';
import type { DirekSinifBilgi } from '../types';

export function DirekSinifKarti({ direkSinifi }: { direkSinifi: DirekSinifBilgi }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/enh-bilgi/direk-sinifi/${direkSinifi.id}`)}
      style={({ pressed }) => [styles.kart, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.gosterimKutu}>
        <Text style={styles.gosterimText}>{direkSinifi.gosterim}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ad}>{direkSinifi.ad}</Text>
        <Text style={styles.tanim} numberOfLines={2}>{direkSinifi.tanim}</Text>
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
  gosterimKutu: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  gosterimText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  ad: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  tanim: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  ok: { fontSize: 22, color: colors.textMuted, paddingLeft: spacing.s },
});
