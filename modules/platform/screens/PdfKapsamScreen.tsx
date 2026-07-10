// PDF Kütüphane Durumu — /pdf-kapsam (Sprint 9, madde 5).
// Kütüphanedeki PDF kapsamının tam dökümü: toplam/bulunan/bekleyen
// doküman sayıları, kurum ve kategori bazlı kırılımlar, eksik PDF
// listesi. Tüm sayılar `getPdfStatistics()`/`pdfChecker.ts`'ten gelir —
// elle yazılan hiçbir sayı YOKTUR (Sprint 6'dan beri korunan ilke).
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Card } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import {
  getPdfStatistics,
  getPublicPdfEligibleDocuments,
  getRestrictedStandardDocuments,
  getDocumentsNeedingSourceVerification,
} from '@/data/library';
import { getPdfMissingDocuments } from '@/assets/pdfs/pdfChecker';
import { getAllDownloadRecords, getDownloadedCountByInstitution } from '@/offline/downloadRepository';
import { pruneInvalidDownloadRecords } from '@/offline/downloadManager';

const EKSIK_LISTE_LIMIT = 20;

const ISTATISTIK = getPdfStatistics();
const EKSIK_BELGELER = getPdfMissingDocuments();
const KAYNAK_UYGUNLUGU = {
  pdfEklenebilir: getPublicPdfEligibleDocuments().length,
  telifliKisitli: getRestrictedStandardDocuments().length,
  manuelBekleyen: getDocumentsNeedingSourceVerification().length,
};

function boyutGoster(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface IndirilenIstatistik {
  toplam: number;
  kurumBazli: Record<string, number>;
  toplamAlan: number;
  gecersizKayit: number;
}

export default function PdfKapsamScreen() {
  const router = useRouter();
  // Sprint 13, madde 16: "Cihaza İndirilenler" — sayılar download
  // repository'den (AsyncStorage) gelir, elle yazılan bir sayı YOKTUR.
  const [indirilen, setIndirilen] = useState<IndirilenIstatistik | null>(null);

  useEffect(() => {
    (async () => {
      const gecersizKayit = await pruneInvalidDownloadRecords().catch(() => 0);
      const [kayitlar, kurumBazli] = await Promise.all([getAllDownloadRecords(), getDownloadedCountByInstitution()]);
      setIndirilen({
        toplam: kayitlar.length,
        kurumBazli,
        toplamAlan: kayitlar.reduce((acc, k) => acc + k.fileSize, 0),
        gecersizKayit,
      });
    })().catch(() => setIndirilen({ toplam: 0, kurumBazli: {}, toplamAlan: 0, gecersizKayit: 0 }));
  }, []);

  return (
    <View style={styles.root}>
      <AppBar title="PDF Kütüphane Durumu" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.ustAciklama}>
          Hangi dokümanların PDF dosyası eklendiğini ve eksik olanları burada görebilirsiniz.
        </Text>

        {/* Özet sayılar */}
        <View style={styles.ozetSatiri}>
          <Card style={styles.ozetKart}>
            <Text style={styles.ozetSayi}>{ISTATISTIK.totalDocuments}</Text>
            <Text style={styles.ozetEtiket}>Toplam Doküman</Text>
          </Card>
          <Card style={styles.ozetKart}>
            <Text style={[styles.ozetSayi, { color: colors.success }]}>{ISTATISTIK.withPdf}</Text>
            <Text style={styles.ozetEtiket}>PDF Bulunan</Text>
          </Card>
          <Card style={styles.ozetKart}>
            <Text style={[styles.ozetSayi, { color: colors.warning }]}>{ISTATISTIK.withoutPdf}</Text>
            <Text style={styles.ozetEtiket}>PDF Bekleyen</Text>
          </Card>
        </View>

        {/* Cihaza İndirilenler — Sprint 13 madde 16 */}
        <Text style={styles.bolumBaslik}>Cihaza İndirilenler</Text>
        <Card style={styles.card} padded={false}>
          <View style={styles.satir}>
            <Text style={styles.satirBaslik}>Toplam İndirilen PDF</Text>
            <Text style={styles.satirDeger}>{indirilen ? indirilen.toplam : '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.satir}>
            <Text style={styles.satirBaslik}>Toplam Kullanılan Alan</Text>
            <Text style={styles.satirDeger}>{indirilen ? boyutGoster(indirilen.toplamAlan) : '—'}</Text>
          </View>
          {indirilen && indirilen.gecersizKayit > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.satir}>
                <Text style={styles.satirBaslik}>Geçersiz/Kayıp Dosya Kaydı</Text>
                <Text style={[styles.satirDeger, { color: colors.warning }]}>{indirilen.gecersizKayit}</Text>
              </View>
            </>
          )}
          {indirilen && Object.keys(indirilen.kurumBazli).length > 0 && (
            <>
              <View style={styles.divider} />
              {Object.entries(indirilen.kurumBazli).map(([kurum, sayi], i, arr) => (
                <View key={kurum}>
                  <View style={styles.satir}>
                    <Text style={styles.satirBaslik}>{kurum}</Text>
                    <Text style={styles.satirDeger}>{sayi}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </>
          )}
        </Card>

        {/* Resmî Kaynak Uygunluğu — Sprint 11 madde 11 */}
        <Text style={styles.bolumBaslik}>Resmî Kaynak Uygunluğu</Text>
        <Card style={styles.card} padded={false}>
          <View style={styles.satir}>
            <Text style={styles.satirBaslik}>PDF Eklenebilir Kamu Dokümanları</Text>
            <Text style={styles.satirDeger}>{KAYNAK_UYGUNLUGU.pdfEklenebilir}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.satir}>
            <Text style={styles.satirBaslik}>Telifli / Kısıtlı Standartlar</Text>
            <Text style={styles.satirDeger}>{KAYNAK_UYGUNLUGU.telifliKisitli}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.satir}>
            <Text style={styles.satirBaslik}>Manuel Doğrulama Bekleyenler</Text>
            <Text style={styles.satirDeger}>{KAYNAK_UYGUNLUGU.manuelBekleyen}</Text>
          </View>
        </Card>

        {/* Kurum bazlı */}
        <Text style={styles.bolumBaslik}>Kurum Bazlı PDF Durumu</Text>
        <Card style={styles.card} padded={false}>
          {ISTATISTIK.byInstitution.map((k, i) => (
            <View key={k.institution}>
              <View style={styles.satir}>
                <Text style={styles.satirBaslik}>{k.institution}</Text>
                <Text style={styles.satirDeger}>
                  PDF: {k.withPdf} / {k.total}
                </Text>
              </View>
              {i < ISTATISTIK.byInstitution.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Kategori bazlı */}
        <Text style={styles.bolumBaslik}>Kategori Bazlı PDF Durumu</Text>
        <Card style={styles.card} padded={false}>
          {ISTATISTIK.byCategory.map((k, i) => (
            <View key={k.category}>
              <View style={styles.satir}>
                <Text style={styles.satirBaslik}>{k.category}</Text>
                <Text style={styles.satirDeger}>
                  PDF: {k.withPdf} / {k.total}
                </Text>
              </View>
              {i < ISTATISTIK.byCategory.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Eksik PDF listesi */}
        <Text style={styles.bolumBaslik}>
          Eksik PDF Listesi {EKSIK_BELGELER.length > 0 ? `(${EKSIK_BELGELER.length})` : ''}
        </Text>
        <Card style={styles.card} padded={false}>
          {EKSIK_BELGELER.length > 0 ? (
            <>
              {EKSIK_BELGELER.slice(0, EKSIK_LISTE_LIMIT).map((d, i) => (
                <View key={d.id}>
                  <View style={styles.satir}>
                    <Text style={styles.eksikBaslik} numberOfLines={1}>{d.title}</Text>
                    <Text style={styles.eksikKurum}>{d.institution}</Text>
                  </View>
                  {i < Math.min(EKSIK_BELGELER.length, EKSIK_LISTE_LIMIT) - 1 && <View style={styles.divider} />}
                </View>
              ))}
              {EKSIK_BELGELER.length > EKSIK_LISTE_LIMIT && (
                <Text style={styles.dahaFazla}>
                  + {EKSIK_BELGELER.length - EKSIK_LISTE_LIMIT} doküman daha
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.eksikYok, { padding: spacing.m }]}>Tüm dokümanların PDF'i mevcut.</Text>
          )}
        </Card>

        <Text style={styles.dipnot}>
          PDF henüz eklenmemiş dokümanlar, resmî kaynaktan doğrulandıktan sonra kütüphaneye eklenecektir.
        </Text>
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
  ozetSatiri: { flexDirection: 'row', gap: spacing.s, marginBottom: spacing.m },
  ozetKart: { flex: 1, alignItems: 'center', paddingVertical: spacing.m },
  ozetSayi: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  ozetEtiket: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
  card: { marginBottom: spacing.m },
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    gap: spacing.s,
  },
  satirBaslik: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  satirDeger: { fontSize: 13, fontWeight: '700', color: colors.accent },
  eksikBaslik: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  eksikKurum: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  eksikYok: { fontSize: 14, color: colors.textSecondary },
  dahaFazla: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.s,
    fontWeight: '600',
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.m },
  dipnot: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 17, textAlign: 'center' },
});
