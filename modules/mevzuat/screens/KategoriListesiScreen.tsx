// Kategori doküman listesi — /sartname/kategori/:kid
// Sprint 4: CATEGORIES ve dokümanlar artık Repository'den gelir.
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '@/theme';
import { CATEGORIES, getByCategory } from '@/data/documents';
import { DocumentRow } from '../components/DocumentRow';

export default function KategoriListesiScreen() {
  const { kid } = useLocalSearchParams<{ kid: string }>();
  const kategori = CATEGORIES.find((k) => k.id === kid);
  const dokumanlar = kategori ? getByCategory(kategori.ad) : [];

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
          dokumanlar.map((d) => <DocumentRow key={d.id} document={d} />)
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
