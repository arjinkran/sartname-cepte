// Kategoriler ekranı — her kategori kartı ilgili doküman listesine götürür.
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '@/theme';
import { KATEGORILER, kategoriDokumanSayisi } from '../data/sartnameler';

export default function KategorilerScreen() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      {KATEGORILER.map((k) => (
        <Pressable
          key={k.id}
          onPress={() => router.push(`/sartname/kategori/${k.id}`)}
          style={({ pressed }) => [styles.kart, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ikon}>{k.ikon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.ad}>{k.ad}</Text>
            <Text style={styles.aciklama}>{k.aciklama}</Text>
          </View>
          <View style={styles.sayiRozet}>
            <Text style={styles.sayiText}>{kategoriDokumanSayisi(k.id)}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
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
    marginBottom: spacing.s + 4,
  },
  ikon: { fontSize: 26, marginRight: spacing.m },
  ad: { fontSize: 15, fontWeight: '700', color: colors.text },
  aciklama: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  sayiRozet: {
    backgroundColor: '#E8EEF5',
    borderRadius: 999,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  sayiText: { fontSize: 13, fontWeight: '800', color: colors.primaryLight },
});
