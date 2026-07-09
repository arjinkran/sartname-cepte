// Veri Kaynakları ekranı — /veri-kaynaklari
// Elektrik dağıtım mevzuatı ekosistemindeki kurum/standart kaynaklarının
// kısa, genel açıklamalarını listeler. Sprint 5, madde 10: artık sabit
// sayılar veya elle yazılmış açıklamalar YOK — hem kurum listesi hem
// açıklamaları hem doküman sayısı tek bir `repository.getStatistics()`
// çağrısından gelir (her kurumun kendi `metadata.ts`'i + gerçek belge
// sayımı, bkz. src/data/library/repository.ts).
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import { getStatistics } from '@/data/library';

const ISTATISTIK = getStatistics();

export default function VeriKaynaklariScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppBar title="Veri Kaynakları" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.ustAciklama}>
          Şartname Cepte içeriği aşağıdaki kurum ve standart kaynaklarına dayanır. Kütüphanede
          şu an toplam {ISTATISTIK.totalDocuments} doküman bulunuyor.
        </Text>
        {ISTATISTIK.byInstitution.map((kurum) => (
          <Card key={kurum.institution} style={styles.card}>
            <Text style={styles.ad}>{kurum.ad}</Text>
            <Text style={styles.aciklama}>{kurum.aciklama}</Text>
            <Text style={styles.durum}>
              {kurum.count > 0 ? `Uygulamada ${kurum.count} doküman mevcut` : 'Doküman kütüphanesi yakında eklenecek'}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: 48 },
  ustAciklama: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginBottom: spacing.m,
    lineHeight: 19,
  },
  card: { marginBottom: spacing.s },
  ad: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  aciklama: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
  durum: { fontSize: typography.size.xs, color: colors.accent, marginTop: spacing.s, fontWeight: '700' },
});
