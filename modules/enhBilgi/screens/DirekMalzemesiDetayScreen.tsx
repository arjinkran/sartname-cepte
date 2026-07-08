// Direk malzemesi detay ekranı — /enh-bilgi/direk-malzemesi/:id
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Card } from '@/common/components/UI';
import { colors, spacing } from '@/theme';
import { DIREK_MALZEMELERI } from '../data/direkMalzemeleri';

export default function DirekMalzemesiDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const malzeme = DIREK_MALZEMELERI.find((m) => m.id === id);

  if (!malzeme) {
    return (
      <View style={styles.bosKap}>
        <Text style={styles.bosText}>Direk malzemesi bulunamadı.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: malzeme.ad }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
        <Card>
          <Text style={styles.baslik}>{malzeme.ad}</Text>
          <Text style={styles.metin}>{malzeme.tanim}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Kullanım Alanı</Text>
          <Text style={styles.metin}>{malzeme.kullanimAlani}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Avantaj</Text>
          <Text style={styles.metin}>{malzeme.avantaj}</Text>
        </Card>

        <View style={styles.dikkatKutu}>
          <Text style={styles.dikkatText}>⚠️ {malzeme.dikkatNotu}</Text>
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
  dikkatKutu: {
    backgroundColor: '#FBE9C9',
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  dikkatText: { fontSize: 13, color: '#8C6D1F', lineHeight: 19, fontWeight: '600' },
});
