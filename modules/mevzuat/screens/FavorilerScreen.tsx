// Favoriler ekranı — /favoriler
// Mevcut FavorilerProvider (src/lib/favoriler.tsx, React context, kalıcı
// saklama yok) + Repository'nin getAllDocuments() fonksiyonu üzerinden
// okuma yapar; yeni bir servis/veri modeli eklenmedi.
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { AppBar, Card, EmptyState, PressableScale } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import { getAllDocuments } from '@/data/documents';

export default function FavorilerScreen() {
  const router = useRouter();
  const { favoriIdler } = useFavoriler();

  const favoriler = useMemo(
    () => getAllDocuments().filter((d) => favoriIdler.has(d.id)),
    [favoriIdler]
  );

  return (
    <View style={styles.root}>
      <AppBar title="Favoriler" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {favoriler.length === 0 ? (
          <EmptyState logo title="Henüz favori doküman eklemediniz." />
        ) : (
          favoriler.map((d) => (
            <PressableScale key={d.id} onPress={() => router.push(`/sartname/${d.id}`)} scaleTo={0.98}>
              <Card style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.baslik} numberOfLines={2}>{d.title}</Text>
                  <Text style={styles.altSatir}>
                    {d.institution} · {d.category}
                  </Text>
                  <Text style={styles.tarih}>{d.publishDate}</Text>
                </View>
                <Text style={styles.ok}>›</Text>
              </Card>
            </PressableScale>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: 48 },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  baslik: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  altSatir: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 3 },
  tarih: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  ok: { fontSize: 22, color: colors.textSecondary, paddingLeft: spacing.s },
});
