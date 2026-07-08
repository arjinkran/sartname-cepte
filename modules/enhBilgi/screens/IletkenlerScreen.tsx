// İletkenler listesi — enhBilgi modülü.
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@/theme';
import { ILETKENLER } from '../data/iletkenler';
import { IletkenKarti } from '../components/IletkenKarti';

export default function IletkenlerScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      <Text style={styles.aciklama}>
        Bu iletken verileri, Cep Hesaplayıcılar → OG Akım Taşıma Kapasitesi
        motorunda kullanılan verilerle birebir uyumludur.
      </Text>
      {ILETKENLER.map((i) => (
        <IletkenKarti key={i.id} iletken={i} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aciklama: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.m, lineHeight: 19 },
});
