// İletken liste kartı — İletkenler ekranında kullanılır.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '@/theme';
import type { IletkenBilgi } from '../types';

export function IletkenKarti({ iletken }: { iletken: IletkenBilgi }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/enh-bilgi/iletken/${iletken.id}`)}
      style={({ pressed }) => [styles.kart, pressed && { opacity: 0.85 }]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.ustSatir}>
          <Text style={styles.ad}>{iletken.ad}</Text>
          <View style={styles.kodRozet}>
            <Text style={styles.kodRozetText}>{iletken.kod}</Text>
          </View>
        </View>
        <Text style={styles.detay}>
          {iletken.aluminyumKesitMm2} mm² Al · Ø{iletken.nominalCapMm} mm · {iletken.nominalAgirlikKgPerM} kg/m
        </Text>
        <Text style={styles.aciklama} numberOfLines={2}>{iletken.kisaAciklama}</Text>
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
  ustSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ad: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: spacing.s },
  kodRozet: {
    backgroundColor: '#E8EEF5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kodRozetText: { fontSize: 11, fontWeight: '800', color: colors.primaryLight },
  detay: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  aciklama: { fontSize: 12, color: colors.textMuted },
  ok: { fontSize: 22, color: colors.textMuted, paddingLeft: spacing.s },
});
