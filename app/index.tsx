// Ana ekran — premium tema yeniden tasarımı (Sprint UI-1A, Görsel 2).
//
// "Son Şartnameler" ve "Popüler Aramalar" içerikleri UI doğrulaması için
// hazırlanmış STATİK yer tutuculardır; modules/mevzuat veri modeline
// dokunulmadı — gerçek arama/listeleme sonraki bir sprintte bağlanacak.
//
// "Modüller" bölümü Görsel 2'de YOK; Sprint 1'den beri var olan modül
// listesinin (Şartname/Mevzuat, Cep Hesaplayıcılar, ENH Bilgi Bankası)
// erişilebilirliğini korumak için eklendi — "mevcut işlevselliği bozma"
// kuralı gereği (bkz. commit raporu "tasarım farkları").
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppBar,
  BottomNavigation,
  Button,
  Card,
  Chip,
  IconButton,
  ListItem,
  PressableScale,
  SectionTitle,
} from '../src/components/ui/index.ts';
import { useRootTabBar } from '../src/navigation/tabs.ts';
import { colors, radius, spacing, shadow, typography } from '../src/theme/index.ts';

const SON_SARTNAMELER = [
  { id: 'ag-kablo', baslik: 'AG Güç Kabloları Teknik Şartnamesi', tarih: '24.05.2024' },
  { id: 'og-trafo', baslik: 'OG Trafo Hücreleri Şartnamesi', tarih: '22.05.2024' },
  { id: 'topraklama', baslik: 'Topraklama Tesisleri Şartnamesi', tarih: '20.05.2024' },
] as const;

const POPULER_ARAMALAR = [
  'OG Hat', 'AG Kablo', 'Trafo', 'Direk', 'Topraklama', 'Parafudr', 'Branşman', 'TEDAŞ', 'EPDK',
] as const;

const MODULLER = [
  { id: 'sartname', ikon: '📚', ad: 'Şartname / Mevzuat', aktif: true, rota: '/sartname' },
  { id: 'hesap', ikon: '🧮', ad: 'Cep Hesaplayıcılar', aktif: true, rota: '/hesaplayicilar' },
  { id: 'enh-bilgi', ikon: '📖', ad: 'ENH Bilgi Bankası', aktif: true, rota: '/enh-bilgi' },
  { id: 'checklist', ikon: '✅', ad: 'Saha Kontrol Listeleri', aktif: false, rota: '' },
  { id: 'isg', ikon: '🦺', ad: 'İSG Cep Rehberi', aktif: false, rota: '' },
  { id: 'ariza', ikon: '🔍', ad: 'Arıza Teşhis Sihirbazı', aktif: false, rota: '' },
  { id: 'not', ikon: '📷', ad: 'Saha Notu + Fotoğraf', aktif: false, rota: '' },
] as const;

function WelcomeIllustration() {
  return (
    <View style={styles.illuWrap}>
      <View style={styles.illuDocBack} />
      <View style={styles.illuDocFront}>
        <View style={styles.illuLine} />
        <View style={[styles.illuLine, { width: '60%' }]} />
        <View style={[styles.illuLine, { width: '75%' }]} />
      </View>
      <View style={styles.illuBadge}>
        <Text style={styles.illuBadgeText}>✓</Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={styles.quickCard}>
      <View style={styles.quickIconWrap}>
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
      <Text style={styles.quickArrow}>→</Text>
    </PressableScale>
  );
}

export default function Home() {
  const router = useRouter();
  const tabBar = useRootTabBar();

  return (
    <View style={styles.root}>
      <AppBar
        title="Şartname Cepte"
        right={<IconButton icon="🔔" badge />}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeGreeting}>Hoş geldiniz,</Text>
              <Text style={styles.welcomeTitle}>
                Şartnamelerini hızlıca bul, analiz et ve{' '}
                <Text style={{ color: colors.accent }}>AI desteği</Text> al.
              </Text>
            </View>
            <WelcomeIllustration />
          </View>
        </Card>

        <View style={styles.quickRow}>
          <QuickAction
            icon="📄"
            title="Şartname Ara"
            subtitle="Binlerce şartnamede hızlı arama yap"
            onPress={() => router.push('/sartname')}
          />
          <QuickAction
            icon="✨"
            title="AI ile Özetle"
            subtitle="Şartnameni AI ile hızlıca özetle"
            onPress={() => router.push('/ai')}
          />
          <QuickAction
            icon="🔖"
            title="Kaydedilenler"
            subtitle="Kaydettiğin şartnamelere göz at"
            onPress={() => router.push('/favoriler')}
          />
        </View>

        <SectionTitle
          title="Son Şartnameler"
          actionLabel="Tümünü Gör"
          onActionPress={() => router.push('/sartname')}
        />
        <Card style={styles.listCard} padded={false}>
          {SON_SARTNAMELER.map((s, i) => (
            <View key={s.id}>
              <ListItem
                icon="📄"
                title={s.baslik}
                subtitle={s.tarih}
                onPress={() => router.push('/sartname')}
                style={styles.listRow}
                right={
                  <View style={styles.listRight}>
                    <View style={styles.pdfBadge}>
                      <Text style={styles.pdfBadgeText}>PDF</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                }
              />
              {i < SON_SARTNAMELER.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <SectionTitle title="Popüler Aramalar" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {POPULER_ARAMALAR.map((etiket) => (
            <Chip key={etiket} label={etiket} icon="🔍" onPress={() => router.push('/sartname')} />
          ))}
        </ScrollView>

        <View style={styles.aiCard}>
          <View style={styles.aiTopRow}>
            <View style={styles.aiIconWrap}>
              <Text style={{ fontSize: 20 }}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>AI Destek</Text>
              <Text style={styles.aiDesc}>
                Şartnamelerinle ilgili sorularını sor, AI asistanımız anında yanıtlasın.
              </Text>
            </View>
          </View>
          <Button
            label="Sorunuzu Sorun"
            variant="secondary"
            style={styles.aiButton}
            onPress={() => router.push('/ai')}
          />
        </View>

        <SectionTitle title="Modüller" />
        <Card style={styles.listCard} padded={false}>
          {MODULLER.map((m, i) => (
            <View key={m.id}>
              <ListItem
                icon={m.ikon}
                title={m.ad}
                onPress={m.aktif ? () => m.rota && router.push(m.rota) : undefined}
                style={[styles.listRow, !m.aktif && styles.listRowPasif]}
                right={
                  m.aktif ? (
                    <Text style={styles.chevron}>›</Text>
                  ) : (
                    <View style={styles.rozet}>
                      <Text style={styles.rozetText}>Yakında</Text>
                    </View>
                  )
                }
              />
              {i < MODULLER.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <Text style={styles.dipnot}>
          Bu uygulamadaki hesaplar ve içerikler bilgilendirme amaçlıdır; resmî şartname ve
          yönetmelik hükümleri esastır.
        </Text>
      </ScrollView>
      <BottomNavigation tabs={tabBar.tabs} activeId={tabBar.activeId} onChange={tabBar.onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: spacing.xl },

  welcomeCard: { marginBottom: spacing.m },
  welcomeRow: { flexDirection: 'row', alignItems: 'center' },
  welcomeGreeting: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  illuWrap: { width: 80, height: 80, marginLeft: spacing.s },
  illuDocBack: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: 52,
    height: 66,
    borderRadius: 12,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
    transform: [{ rotate: '8deg' }],
  },
  illuDocFront: {
    position: 'absolute',
    top: 0,
    right: 14,
    width: 52,
    height: 66,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 9,
    justifyContent: 'center',
    gap: 6,
    transform: [{ rotate: '-6deg' }],
    ...shadow.sm,
  },
  illuLine: { height: 4, borderRadius: 2, backgroundColor: colors.border, width: '85%' },
  illuBadge: {
    position: 'absolute',
    bottom: -2,
    left: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  illuBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  quickRow: { flexDirection: 'row', gap: spacing.s, marginBottom: spacing.m },
  quickCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.m,
    minHeight: 128,
    justifyContent: 'space-between',
    ...shadow.sm,
  },
  quickIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.m,
    backgroundColor: colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  quickTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  quickSubtitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickArrow: { fontSize: 15, color: colors.accent, alignSelf: 'flex-end', marginTop: spacing.xs },

  listCard: { marginBottom: spacing.m, paddingVertical: spacing.xs },
  listRow: { paddingHorizontal: spacing.m },
  listRowPasif: { opacity: 0.5 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.m },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pdfBadge: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.s,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pdfBadgeText: { fontSize: 10, fontWeight: '800', color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textSecondary, marginLeft: 2 },
  rozet: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rozetText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },

  chipRow: { marginBottom: spacing.m },

  aiCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  aiTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s, marginBottom: spacing.m },
  aiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: typography.size.md, fontWeight: '800', color: '#FFFFFF' },
  aiDesc: { fontSize: typography.size.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4, lineHeight: 18 },
  aiButton: { alignSelf: 'flex-end' },

  dipnot: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.s,
    lineHeight: 17,
    textAlign: 'center',
  },
});
