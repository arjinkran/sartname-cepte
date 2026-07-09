// Kategori doküman listesi — /sartname/kategori/:kid
// Sprint 5: `kid`, artık bir kategori id'si değil — kategori ADI'nın kendisi
// (URL-encoded, expo-router otomatik çözer). Kategori listesi ve
// dokümanlar Repository'den gelir (getCategories/getDocumentsByCategory).
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '@/theme';
import { getCategories, getDocumentsByCategory } from '@/data/library';
import { DocumentRow } from '../components/DocumentRow';

export default function KategoriListesiScreen() {
  const { kid } = useLocalSearchParams<{ kid: string }>();
  const kategori = getCategories().find((k) => k.ad === kid);
  const dokumanlar = kid ? getDocumentsByCategory(kid) : [];

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
