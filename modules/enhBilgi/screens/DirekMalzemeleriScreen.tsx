// Direk Malzemeleri listesi — enhBilgi modülü.
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/theme';
import { DIREK_MALZEMELERI } from '../data/direkMalzemeleri';
import { BilgiKarti } from '../components/BilgiKarti';

export default function DirekMalzemeleriScreen() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      <Text style={styles.aciklama}>
        Direk gövdesinin yapıldığı malzemeye göre türler. Kaynak durumu için
        docs/ENH_DIREK_SECIMI_ANALIZ.md'ye bakın.
      </Text>
      {DIREK_MALZEMELERI.map((m) => (
        <BilgiKarti
          key={m.id}
          baslik={m.ad}
          aciklama={m.tanim}
          onPress={() => router.push(`/enh-bilgi/direk-malzemesi/${m.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aciklama: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.m, lineHeight: 19 },
});
