// İzolatör detay ekranı — /enh-bilgi/izolator/:id
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/common/components/UI';
import { colors, spacing } from '@/theme';
import { IZOLATORLER } from '../data/izolatorler';
import { DIREK_SINIFLARI } from '../data/direkSiniflari';

export default function IzolatorDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const izolator = IZOLATORLER.find((i) => i.id === id);

  if (!izolator) {
    return (
      <View style={styles.bosKap}>
        <Text style={styles.bosText}>İzolatör bulunamadı.</Text>
      </View>
    );
  }

  const ilgiliDirekSiniflari = izolator.ilgiliDirekTipleri
    .map((direkId) => DIREK_SINIFLARI.find((d) => d.id === direkId))
    .filter((d): d is (typeof DIREK_SINIFLARI)[number] => d != null);

  return (
    <>
      <Stack.Screen options={{ title: izolator.ad }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
        <Card>
          <Text style={styles.baslik}>{izolator.ad}</Text>
          <Text style={styles.metin}>{izolator.tanim}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Kullanım Yeri</Text>
          <Text style={styles.metin}>{izolator.kullanimYeri}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>İlgili Direk Tipleri</Text>
          {ilgiliDirekSiniflari.length > 0 ? (
            ilgiliDirekSiniflari.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => router.push(`/enh-bilgi/direk-sinifi/${d.id}`)}
                style={({ pressed }) => [styles.ilgiliSatir, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ilgiliText}>{d.ad}</Text>
                <Text style={styles.ilgiliOk}>›</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.metin}>İlgili direk sınıfı bulunmuyor.</Text>
          )}
        </Card>

        <View style={styles.dikkatKutu}>
          <Text style={styles.dikkatText}>⚠️ {izolator.dikkatNotu}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  bosKap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bosText: { fontSize: 15, color: colors.textMuted },
  baslik: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: spacing.s },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  metin: { fontSize: 14, color: colors.text, lineHeight: 21 },
  ilgiliSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ilgiliText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  ilgiliOk: { fontSize: 20, color: colors.textMuted, paddingLeft: spacing.s },
  dikkatKutu: {
    backgroundColor: '#FBE9C9',
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  dikkatText: { fontSize: 13, color: '#8C6D1F', lineHeight: 19, fontWeight: '600' },
});
