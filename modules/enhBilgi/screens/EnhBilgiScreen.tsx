// ENH Bilgi Bankası — ana ekran. 7 başlık; şimdilik yalnızca İletkenler
// ve Direk Sınıfları aktif, diğerleri "Yakında".
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '@/theme';
import { ENH_BILGI_BASLIKLARI } from '../data/basliklar';

export default function EnhBilgiScreen() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      <Text style={styles.aciklama}>
        Enerji Nakil Hatları Cilt 1 kaynaklı iletken, direk ve donanım bilgileri.
      </Text>
      {ENH_BILGI_BASLIKLARI.map((b) => (
        <Pressable
          key={b.id}
          disabled={!b.aktif}
          onPress={() => b.rota && router.push(b.rota)}
          style={({ pressed }) => [
            styles.kart,
            !b.aktif && styles.kartPasif,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.ikon}>{b.ikon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kartAd, !b.aktif && { color: colors.disabled }]}>{b.ad}</Text>
            <Text style={styles.kartAciklama}>{b.aciklama}</Text>
          </View>
          {b.aktif ? (
            <Text style={styles.ok}>›</Text>
          ) : (
            <View style={styles.rozet}>
              <Text style={styles.rozetText}>Yakında</Text>
            </View>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aciklama: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.m, lineHeight: 20 },
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
  kartPasif: { backgroundColor: '#F0F2F5' },
  ikon: { fontSize: 26, marginRight: spacing.m },
  kartAd: { fontSize: 16, fontWeight: '700', color: colors.text },
  kartAciklama: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  ok: { fontSize: 26, color: colors.textMuted, paddingLeft: spacing.s },
  rozet: {
    backgroundColor: '#E8EBEF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rozetText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
});
