// Hakkında ekranı — /hakkinda
// Büyük resmi logo + uygulama adı + sürüm + kısa açıklama + telif +
// iletişim. Sürüm numarası app.json'daki gerçek `expo.version` alanından
// (expo-constants — zaten mevcut bağımlılık, yeni paket eklenmedi) okunur,
// elle yazılmaz. Gerçek bir destek e-postası henüz doğrulanmadığı için
// uydurulmadı — "yakında eklenecek" olarak işaretlendi (bkz. genel
// "Kaynak doğrulaması gerekli" prensibi, KURULUM.md).
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppBar, Card, Logo } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';

const SURUM = Constants.expoConfig?.version ?? '—';
const TELIF_YILI = new Date().getFullYear();

export default function HakkindaScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppBar title="Hakkında" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Logo size={110} variant="small" />
          <Text style={styles.appAdi}>Şartname Cepte</Text>
          <View style={styles.surumRozet}>
            <Text style={styles.surumText}>Sürüm {SURUM}</Text>
          </View>
          <Text style={styles.aciklama}>
            Elektrik dağıtım sektörüne yönelik Teknik Şartname, Yönetmelik, Standart, Resmî
            Gazete ve AI Destekli Mevzuat Asistanı.
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Telif</Text>
          <Text style={styles.metin}>© {TELIF_YILI} Şartname Cepte. Tüm hakları saklıdır.</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>İletişim</Text>
          <Text style={styles.metin}>Kaynak kodu: github.com/arjinkran/sartname-cepte</Text>
          <Text style={styles.metinMuted}>Destek e-postası yakında eklenecek.</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: 48 },
  hero: { alignItems: 'center', paddingVertical: spacing.l },
  appAdi: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    marginTop: spacing.m,
  },
  surumRozet: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  surumText: { fontSize: typography.size.xs, fontWeight: '700', color: colors.textSecondary },
  aciklama: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.m,
    paddingHorizontal: spacing.m,
  },
  card: { marginBottom: spacing.m },
  bolumBaslik: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  metin: { fontSize: typography.size.sm, color: colors.textPrimary, lineHeight: 20 },
  metinMuted: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 4 },
});
