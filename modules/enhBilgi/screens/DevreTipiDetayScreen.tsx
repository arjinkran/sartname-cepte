// Devre tipi detay ekranı — /enh-bilgi/devre-tipi/:id
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Card } from '@/common/components/UI';
import { colors, spacing } from '@/theme';
import { DIREK_DEVRE_TIPLERI } from '../data/direkDevreTipleri';

export default function DevreTipiDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const devreTipi = DIREK_DEVRE_TIPLERI.find((d) => d.id === id);

  if (!devreTipi) {
    return (
      <View style={styles.bosKap}>
        <Text style={styles.bosText}>Devre tipi bulunamadı.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: devreTipi.ad }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
        <Card>
          <Text style={styles.baslik}>{devreTipi.ad}</Text>
          <Text style={styles.metin}>{devreTipi.tanim}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Nerede Kullanılır</Text>
          <Text style={styles.metin}>{devreTipi.neredeKullanilir}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Direk Yüklerine Etkisi</Text>
          <Text style={styles.metin}>{devreTipi.direkYukuneEtkisi}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Proje Notu</Text>
          <Text style={styles.metin}>{devreTipi.projeNotu}</Text>
        </Card>
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
});
