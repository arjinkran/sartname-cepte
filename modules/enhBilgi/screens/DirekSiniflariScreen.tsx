// Direk Sınıfları listesi — enhBilgi modülü.
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@/theme';
import { DIREK_SINIFLARI } from '../data/direkSiniflari';
import { DirekSinifKarti } from '../components/DirekSinifKarti';

export default function DirekSiniflariScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      <Text style={styles.aciklama}>
        Görev/kullanım yerine göre direk sınıfları. Kaynak durumu ve
        doğrulanacak eşik değerleri için docs/ENH_DIREK_SECIMI_ANALIZ.md'ye
        bakın.
      </Text>
      {DIREK_SINIFLARI.map((d) => (
        <DirekSinifKarti key={d.id} direkSinifi={d} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aciklama: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.m, lineHeight: 19 },
});
