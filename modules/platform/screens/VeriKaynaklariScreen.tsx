// Veri Kaynakları ekranı — /veri-kaynaklari
// Elektrik dağıtım mevzuatı ekosistemindeki kurum/standart kaynaklarının
// kısa, genel açıklamalarını listeler. Sprint 4, madde 11: kartlar artık
// elle yazılmadı — INSTITUTIONS listesinin tamamı (11 kurum) taranır ve
// doküman sayısı Repository'nin getByInstitution() fonksiyonuyla otomatik
// hesaplanır.
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import { INSTITUTIONS, getByInstitution, type Institution } from '@/data/documents';

// Kurum açıklamaları — genel/bilinen kurum tanımlarıdır, doküman içeriği
// değildir. INSTITUTIONS listesindeki 11 kurumun TAMAMI için tanımlı
// olmalıdır (Record tamlığı derleme zamanında garanti eder).
const KURUM_ACIKLAMALARI: Record<Institution, string> = {
  'TEDAŞ': 'Türkiye Elektrik Dağıtım A.Ş. — elektrik dağıtım şebekesi için teknik şartnameleri hazırlar.',
  'TEİAŞ': 'Türkiye Elektrik İletim A.Ş. — yüksek gerilim iletim şebekesi standartlarını belirler.',
  'EPDK': 'Enerji Piyasası Düzenleme Kurumu — hizmet kalitesi ve tüketici mevzuatını yayınlar.',
  'Enerji Bakanlığı': 'Enerji ve Tabii Kaynaklar Bakanlığı — sektöre yönelik yönetmelik ve politikaları belirler.',
  'Resmî Gazete': 'Kanun, yönetmelik ve tebliğlerin resmî yayın organı.',
  'TSE': 'Türk Standardları Enstitüsü — ulusal (TS) standartları yayınlar.',
  'IEC': 'International Electrotechnical Commission — uluslararası elektroteknik standartları.',
  'CENELEC': 'European Committee for Electrotechnical Standardization — Avrupa elektroteknik standardizasyon komitesi.',
  'TS EN': 'Avrupa standartlarının (EN) Türkiye\'de uyumlaştırılmış (TS EN) hâli.',
  'IEEE': 'Institute of Electrical and Electronics Engineers — uluslararası elektrik/elektronik mühendisliği standartları.',
  'Diğer': 'Yukarıdaki kurumların hiçbirine girmeyen belediye, dağıtım şirketi vb. kaynaklar.',
};

export default function VeriKaynaklariScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppBar title="Veri Kaynakları" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.ustAciklama}>
          Şartname Cepte içeriği aşağıdaki kurum ve standart kaynaklarına dayanır.
        </Text>
        {INSTITUTIONS.map((kurum) => {
          const sayi = getByInstitution(kurum).length;
          return (
            <Card key={kurum} style={styles.card}>
              <Text style={styles.ad}>{kurum}</Text>
              <Text style={styles.aciklama}>{KURUM_ACIKLAMALARI[kurum]}</Text>
              <Text style={styles.durum}>
                {sayi > 0 ? `Uygulamada ${sayi} doküman mevcut` : 'Doküman kütüphanesi yakında eklenecek'}
              </Text>
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
