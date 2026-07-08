// Direk sınıfı detay ekranı — /enh-bilgi/direk-sinifi/:id
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/common/components/UI';
import { colors, spacing, radius } from '@/theme';
import { DIREK_SINIFLARI } from '../data/direkSiniflari';

export default function DirekSinifDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const direkSinifi = DIREK_SINIFLARI.find((d) => d.id === id);

  if (!direkSinifi) {
    return (
      <View style={styles.bosKap}>
        <Text style={styles.bosText}>Direk sınıfı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: direkSinifi.ad }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
        <Card>
          <View style={styles.ustSatir}>
            <View style={styles.gosterimKutu}>
              <Text style={styles.gosterimText}>{direkSinifi.gosterim}</Text>
            </View>
            <Text style={styles.baslik}>{direkSinifi.ad}</Text>
          </View>
          <Text style={styles.aciklama}>{direkSinifi.tanim}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Nerede Kullanılır</Text>
          <Text style={styles.metin}>{direkSinifi.kullanimYeri}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Önemli Kuvvetler</Text>
          {direkSinifi.onemliKuvvetler.map((k, i) => (
            <View key={i} style={styles.madde}>
              <Text style={styles.maddeIsaret}>▸</Text>
              <Text style={styles.metin}>{k}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.dikkatKutu}>
          <Text style={styles.dikkatText}>⚠️ {direkSinifi.dikkatNotu}</Text>
        </View>

        <Card>
          <Text style={styles.bolumBaslik}>İlişkili Hesaplar</Text>
          {direkSinifi.ilgiliHesaplar.map((h) => (
            <Pressable
              key={h.baslik}
              onPress={() => router.push(h.rota)}
              style={({ pressed }) => [styles.ilgiliSatir, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.ilgiliText}>{h.baslik}</Text>
              <Text style={styles.ilgiliOk}>›</Text>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  bosKap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bosText: { fontSize: 15, color: colors.textMuted },
  ustSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  gosterimKutu: {
    width: 36,
    height: 36,
    borderRadius: radius.s,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  gosterimText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  baslik: { fontSize: 19, fontWeight: '800', color: colors.text, flex: 1 },
  aciklama: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  metin: { fontSize: 14, color: colors.text, lineHeight: 21, flex: 1 },
  madde: { flexDirection: 'row', marginBottom: spacing.s },
  maddeIsaret: { fontSize: 15, color: colors.accent, marginRight: spacing.s, lineHeight: 21 },
  dikkatKutu: {
    backgroundColor: '#FBE9C9',
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  dikkatText: { fontSize: 13, color: '#8C6D1F', lineHeight: 19, fontWeight: '600' },
  ilgiliSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ilgiliText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  ilgiliOk: { fontSize: 20, color: colors.textMuted, paddingLeft: spacing.s },
});
