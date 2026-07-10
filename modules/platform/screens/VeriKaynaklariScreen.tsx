// Veri Kaynakları ekranı — /veri-kaynaklari
// Elektrik dağıtım mevzuatı ekosistemindeki kurum/standart kaynaklarının
// kısa, genel açıklamalarını listeler. Sprint 5, madde 10: artık sabit
// sayılar veya elle yazılmış açıklamalar YOK — hem kurum listesi hem
// açıklamaları hem doküman sayısı tek bir `repository.getStatistics()`
// çağrısından gelir (her kurumun kendi `metadata.ts`'i + gerçek belge
// sayımı, bkz. src/data/library/repository.ts).
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import {
  getStatistics,
  getPdfStatistics,
  getDocumentsWithOfficialSources,
  getDocumentsNeedingSourceVerification,
  getRestrictedStandardDocuments,
  getPublicPdfEligibleDocuments,
} from '@/data/library';
import { getDownloadedCountByInstitution } from '@/offline/downloadRepository';

const ISTATISTIK = getStatistics();
const PDF_ISTATISTIK = getPdfStatistics();
const PDF_KURUM_SAYISI = new Map(PDF_ISTATISTIK.byInstitution.map((k) => [k.institution, k]));
const KAYNAK_DURUMU = {
  resmiKaynakli: getDocumentsWithOfficialSources().length,
  manuelBekleyen: getDocumentsNeedingSourceVerification().length,
  telifli: getRestrictedStandardDocuments().length,
  pdfUygun: getPublicPdfEligibleDocuments().length,
};

export default function VeriKaynaklariScreen() {
  const router = useRouter();
  // Sprint 13, madde 17: "Çevrimdışı: x" — sayı download repository'den
  // (AsyncStorage) gelir, elle yazılan bir sayı YOKTUR.
  const [cevrimdisiSayilari, setCevrimdisiSayilari] = useState<Record<string, number>>({});

  useEffect(() => {
    getDownloadedCountByInstitution().then(setCevrimdisiSayilari).catch(() => {});
  }, []);

  return (
    <View style={styles.root}>
      <AppBar title="Veri Kaynakları" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.ustAciklama}>
          Şartname Cepte içeriği aşağıdaki kurum ve standart kaynaklarına dayanır. Kütüphanede
          şu an toplam {ISTATISTIK.totalDocuments} doküman bulunuyor ({PDF_ISTATISTIK.withPdf} PDF).
        </Text>

        <Text style={styles.bolumBaslik}>Kaynak Durumu</Text>
        <View style={styles.kaynakGrid}>
          <Card style={styles.kaynakKart}>
            <Text style={styles.kaynakSayi}>{KAYNAK_DURUMU.resmiKaynakli}</Text>
            <Text style={styles.kaynakEtiket}>Resmî Kaynaklı Belge</Text>
          </Card>
          <Card style={styles.kaynakKart}>
            <Text style={[styles.kaynakSayi, { color: colors.warning }]}>{KAYNAK_DURUMU.manuelBekleyen}</Text>
            <Text style={styles.kaynakEtiket}>Manuel Doğrulama Bekleyen</Text>
          </Card>
          <Card style={styles.kaynakKart}>
            <Text style={[styles.kaynakSayi, { color: colors.textSecondary }]}>{KAYNAK_DURUMU.telifli}</Text>
            <Text style={styles.kaynakEtiket}>Telifli Standart Referansı</Text>
          </Card>
          <Card style={styles.kaynakKart}>
            <Text style={[styles.kaynakSayi, { color: colors.success }]}>{KAYNAK_DURUMU.pdfUygun}</Text>
            <Text style={styles.kaynakEtiket}>PDF'ye Uygun Kamu Dokümanı</Text>
          </Card>
        </View>

        <Text style={styles.bolumBaslik}>Kurumlar</Text>
        {ISTATISTIK.byInstitution.map((kurum) => {
          const pdfDurum = PDF_KURUM_SAYISI.get(kurum.institution);
          const cevrimdisiSayisi = cevrimdisiSayilari[kurum.institution] ?? 0;
          return (
            <Card key={kurum.institution} style={styles.card}>
              <Text style={styles.ad}>{kurum.ad}</Text>
              <Text style={styles.aciklama}>{kurum.aciklama}</Text>
              <View style={styles.durumSatiri}>
                <Text style={styles.durum}>
                  {kurum.count > 0 ? `Uygulamada ${kurum.count} doküman mevcut` : 'Doküman kütüphanesi yakında eklenecek'}
                </Text>
                {kurum.count > 0 && pdfDurum && (
                  <Text style={styles.pdfSayisi}>PDF: {pdfDurum.withPdf} / {pdfDurum.total}</Text>
                )}
              </View>
              {cevrimdisiSayisi > 0 && (
                <Text style={styles.cevrimdisiSayisi}>Çevrimdışı: {cevrimdisiSayisi}</Text>
              )}
            </Card>
          );
        })}
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
  bolumBaslik: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  kaynakGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginBottom: spacing.m },
  kaynakKart: { width: '47%', alignItems: 'center', paddingVertical: spacing.m },
  kaynakSayi: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  kaynakEtiket: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  card: { marginBottom: spacing.s },
  ad: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  aciklama: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
  durumSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  durum: { fontSize: typography.size.xs, color: colors.accent, fontWeight: '700' },
  pdfSayisi: { fontSize: typography.size.xs, color: colors.textSecondary, fontWeight: '700' },
  cevrimdisiSayisi: { fontSize: typography.size.xs, color: colors.success, fontWeight: '700', marginTop: 4 },
});
