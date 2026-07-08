// Direk Devre Tipleri listesi — enhBilgi modülü.
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/theme';
import { DIREK_DEVRE_TIPLERI } from '../data/direkDevreTipleri';
import { BilgiKarti } from '../components/BilgiKarti';

export default function DirekDevreTipleriScreen() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      <Text style={styles.aciklama}>
        Direk üzerinde taşınan enerji hattı (devre) sayısına göre türler.
      </Text>
      {DIREK_DEVRE_TIPLERI.map((d) => (
        <BilgiKarti
          key={d.id}
          baslik={d.ad}
          aciklama={d.tanim}
          onPress={() => router.push(`/enh-bilgi/devre-tipi/${d.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aciklama: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.m, lineHeight: 19 },
});
