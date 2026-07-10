// Profil ekranı — /profil
// Şimdilik gerçek auth YOK (src/lib/supabase.ts hâlâ stub) — mock profil
// kartı gösterilir. "Favoriler", "Offline Kütüphane", "Veri Kaynakları" ve
// "Hakkında" gerçek rotalara gider; diğerleri mevcut "PDF Aç" stub'ıyla
// aynı desende (Alert) "yakında" mesajı gösterir — yeni bir servis eklenmedi.
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, BottomNavigation, Card, ListItem, Logo } from '@/components/ui';
import { useRootTabBar } from '@/navigation/tabs';
import { colors, radius, spacing, typography } from '@/theme';

const AYARLAR = [
  { id: 'bildirimler', ikon: '🔔', ad: 'Bildirimler', rota: '' },
  { id: 'offline', ikon: '📥', ad: 'Offline Kütüphane', rota: '/offline-kutuphane' },
  { id: 'favoriler', ikon: '🔖', ad: 'Favoriler', rota: '/favoriler' },
  { id: 'veri-kaynaklari', ikon: '🏛️', ad: 'Veri Kaynakları', rota: '/veri-kaynaklari' },
  {
    id: 'pdf-kapsam',
    ikon: '📄',
    ad: 'PDF Kütüphane Durumu',
    altBaslik: 'Hangi dokümanların PDF dosyası eklendiğini ve eksik olanları görüntüleyin.',
    rota: '/pdf-kapsam',
  },
  { id: 'gizlilik', ikon: '🔒', ad: 'Gizlilik Politikası', rota: '' },
  { id: 'kullanim', ikon: '📜', ad: 'Kullanım Şartları', rota: '' },
  { id: 'hakkinda', ikon: 'ℹ️', ad: 'Hakkında', rota: '/hakkinda' },
  // Sprint 14, madde 15: yalnızca geliştirme ortamında görünür — `__DEV__`
  // production build'de her zaman `false`'tur, bu satır orada HİÇ render edilmez.
  ...(__DEV__
    ? ([{ id: 'evidence-debug', ikon: '🧪', ad: 'Evidence Debug', rota: '/evidence-debug' }] as const)
    : []),
] as const;

export default function ProfilScreen() {
  const router = useRouter();
  const tabBar = useRootTabBar();

  const satirTikla = (rota: string) => {
    if (rota) {
      router.push(rota);
      return;
    }
    Alert.alert('Yakında', 'Bu özellik yakında eklenecek.');
  };

  return (
    <View style={styles.root}>
      <AppBar title="Profil" logo />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <View style={styles.kullaniciSatir}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View>
              <Text style={styles.kullaniciAd}>Misafir Kullanıcı</Text>
              <View style={styles.planRozet}>
                <Text style={styles.planRozetText}>Ücretsiz Plan</Text>
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.planKart}>
          <Logo size={32} variant="smallReverse" style={styles.planLogo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.planBaslik}>Şartname Cepte Pro</Text>
            <Text style={styles.planAciklama}>
              AI özetleme, offline kütüphane ve değişiklik bildirimleri yakında.
            </Text>
          </View>
        </View>

        <Card style={styles.listCard} padded={false}>
          {AYARLAR.map((a, i) => (
            <View key={a.id}>
              <ListItem
                icon={a.ikon}
                title={a.ad}
                subtitle={'altBaslik' in a ? a.altBaslik : undefined}
                onPress={() => satirTikla(a.rota)}
                style={styles.listRow}
                right={<Text style={styles.chevron}>›</Text>}
              />
              {i < AYARLAR.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
      </ScrollView>
      <BottomNavigation tabs={tabBar.tabs} activeId={tabBar.activeId} onChange={tabBar.onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: spacing.xl },
  card: { marginBottom: spacing.m },
  kullaniciSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26 },
  kullaniciAd: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  planRozet: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  planRozetText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  planKart: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.m,
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  planLogo: { opacity: 0.85 },
  planBaslik: { fontSize: typography.size.md, fontWeight: '800', color: '#FFFFFF' },
  planAciklama: { fontSize: typography.size.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4, lineHeight: 18 },
  listCard: { marginBottom: spacing.m, paddingVertical: spacing.xs },
  listRow: { paddingHorizontal: spacing.m },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.m },
  chevron: { fontSize: 20, color: colors.textSecondary, marginLeft: 2 },
});
