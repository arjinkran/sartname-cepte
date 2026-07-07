// Kategori doküman listesi — /sartname/kategori/:kid
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { DOKUMANLAR, KATEGORILER } from '../../../src/data/sartnameler';
import { DokumanSatiri } from '../../../src/components/DokumanSatiri';
import { colors, spacing } from '../../../src/theme';

export default function KategoriListesi() {
  const { kid } = useLocalSearchParams<{ kid: string }>();
  const kategori = KATEGORILER.find((k) => k.id === kid);
  const dokumanlar = DOKUMANLAR.filter((d) => d.kategoriId === kid);

  return (
    <>
      <Stack.Screen options={{ title: kategori ? kategori.ad : 'Kategori' }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
        {kategori ? (
          <Text style={styles.aciklama}>
            {kategori.ikon} {kategori.aciklama}
          </Text>
        ) : null}
        {dokumanlar.length > 0 ? (
          dokumanlar.map((d) => <DokumanSatiri key={d.id} dokuman={d} />)
        ) : (
          <Text style={styles.bos}>Bu kategoride henüz doküman yok.</Text>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  aciklama: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.m },
  bos: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
