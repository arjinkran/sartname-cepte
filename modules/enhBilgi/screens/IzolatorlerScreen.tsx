// İzolatörler listesi — enhBilgi modülü.
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/theme';
import { IZOLATORLER } from '../data/izolatorler';
import { BilgiKarti } from '../components/BilgiKarti';

export default function IzolatorlerScreen() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      <Text style={styles.aciklama}>
        İletkeni direğe bağlayan ve elektriksel olarak yalıtan donanım tipleri.
      </Text>
      {IZOLATORLER.map((i) => (
        <BilgiKarti
          key={i.id}
          baslik={i.ad}
          aciklama={i.tanim}
          onPress={() => router.push(`/enh-bilgi/izolator/${i.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aciklama: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.m, lineHeight: 19 },
});
