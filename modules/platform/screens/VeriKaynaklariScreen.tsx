// Veri Kaynakları ekranı — /veri-kaynaklari
// Elektrik dağıtım mevzuatı ekosistemindeki kurum/standart kaynaklarının
// kısa, genel açıklamalarını listeler (V3 mevzuat dönüşümü, madde 18).
// Doküman sayıları modules/mevzuat/data/sartnameler.ts'teki gerçek
// DOCUMENTS'tan hesaplanır — veri modeline dokunulmadı, yalnızca okunur.
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import { DOCUMENTS } from '../../mevzuat/data/sartnameler';
import type { Institution } from '../../mevzuat/types';

interface Kaynak {
  ad: string;
  aciklama: string;
  institution?: Institution;
}

const KAYNAKLAR: readonly Kaynak[] = [
  {
    ad: 'TEDAŞ',
    aciklama: 'Türkiye Elektrik Dağıtım A.Ş. — elektrik dağıtım şebekesi için teknik şartnameleri hazırlar.',
    institution: 'TEDAŞ',
  },
  {
    ad: 'TEİAŞ',
    aciklama: 'Türkiye Elektrik İletim A.Ş. — yüksek gerilim iletim şebekesi standartlarını belirler.',
    institution: 'TEİAŞ',
  },
  {
    ad: 'EPDK',
    aciklama: 'Enerji Piyasası Düzenleme Kurumu — hizmet kalitesi ve tüketici mevzuatını yayınlar.',
    institution: 'EPDK',
  },
  {
    ad: 'Enerji Bakanlığı',
    aciklama: 'Enerji ve Tabii Kaynaklar Bakanlığı — sektöre yönelik yönetmelik ve politikaları belirler.',
  },
  {
    ad: 'Resmî Gazete',
    aciklama: 'Kanun, yönetmelik ve tebliğlerin resmî yayın organı.',
    institution: 'Resmî Gazete',
  },
  {
    ad: 'TS',
    aciklama: 'Türk Standardları Enstitüsü (TSE) tarafından yayınlanan ulusal standartlar.',
    institution: 'TS',
  },
  {
    ad: 'IEC',
    aciklama: 'International Electrotechnical Commission — uluslararası elektroteknik standartları.',
    institution: 'IEC',
  },
  {
    ad: 'CENELEC',
    aciklama: 'European Committee for Electrotechnical Standardization — Avrupa elektroteknik standardizasyon komitesi.',
  },
];

function dokumanSayisi(institution?: Institution): number {
  if (!institution) return 0;
  return DOCUMENTS.filter((d) => d.institution === institution).length;
}

export default function VeriKaynaklariScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppBar title="Veri Kaynakları" onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.ustAciklama}>
          Şartname Cepte içeriği aşağıdaki kurum ve standart kaynaklarına dayanır.
        </Text>
        {KAYNAKLAR.map((k) => {
          const sayi = dokumanSayisi(k.institution);
          return (
            <Card key={k.ad} style={styles.card}>
              <Text style={styles.ad}>{k.ad}</Text>
              <Text style={styles.aciklama}>{k.aciklama}</Text>
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
