// Ana ekran — V3 mevzuat dönüşümü.
//
// Ürün artık yalnızca mevzuat platformudur: Cep Hesaplayıcılar ve ENH Bilgi
// Bankası bu ekrandan (ve dolayısıyla tüm normal gezinme akışından)
// KALDIRILDI. Hesap motorlarının kodu SİLİNMEDİ — app/hesaplayicilar/* ve
// app/enh-bilgi/* rotaları hâlâ dosya sisteminde durur, yalnızca buraya
// (veya başka hiçbir ekrana) bağlantı verilmiyor. Bkz. KURULUM.md "Ürün
// Tanımı" ve src/calculations/ (dokunulmadı).
//
// "Son Şartnameler" artık src/data/documents Repository'sinden gelen
// featured dokümanları gösterir (DocumentRow bileşeni Arama/Favoriler ile
// paylaşılır — component tekrarı yok).
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
import { getFeaturedDocuments } from '../src/data/documents/index.ts';
import { DocumentRow } from '../modules/mevzuat/components/DocumentRow';

// featured=true dokümanlar, updatedAt'e göre en yeniden eskiye sıralı
// gelir (bkz. repository.ts getFeaturedDocuments) — Sprint 4, madde 8-9.
const SON_SARTNAMELER_LIMIT = 3;
const sonSartnameler = getFeaturedDocuments().slice(0, SON_SARTNAMELER_LIMIT);

const POPULER_ARAMALAR = [
  'Topraklama', 'XLPE', 'Trafo', 'Parafudr', 'EKAT', 'IEC', 'TS HD', 'Dağıtım', 'AG', 'OG',
] as const;

interface ModulKarti {
  id: string;
  ikon: string;
  ad: string;
  aktif: boolean;
  rota: string;
}

const AKTIF_MODULLER: readonly ModulKarti[] = [
  { id: 'sartname', ikon: '📚', ad: 'Şartname / Mevzuat', aktif: true, rota: '/sartname' },
  { id: 'ai', ikon: '✨', ad: 'AI Mevzuat Asistanı', aktif: true, rota: '/ai' },
  { id: 'favoriler', ikon: '🔖', ad: 'Favoriler', aktif: true, rota: '/favoriler' },
  { id: 'offline', ikon: '📥', ad: 'Offline Kütüphane', aktif: true, rota: '/offline-kutuphane' },
  { id: 'son-guncellenenler', ikon: '🕓', ad: 'Son Güncellenenler', aktif: true, rota: '/sartname' },
  { id: 'veri-kaynaklari', ikon: '🏛️', ad: 'Veri Kaynakları', aktif: true, rota: '/veri-kaynaklari' },
];

const PASIF_MODULLER: readonly ModulKarti[] = [
  { id: 'bildirimler', ikon: '🔔', ad: 'Bildirimler', aktif: false, rota: '' },
  { id: 'checklist', ikon: '✅', ad: 'Saha Kontrol Listeleri', aktif: false, rota: '' },
  { id: 'isg', ikon: '🦺', ad: 'İSG Rehberi', aktif: false, rota: '' },
];

const MODULLER: readonly ModulKarti[] = [...AKTIF_MODULLER, ...PASIF_MODULLER];

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

  const aramaYap = (sorgu: string) => {
    router.push({ pathname: '/sartname', params: { q: sorgu } });
  };

  return (
    <View style={styles.root}>
      <AppBar
        title="Şartname Cepte"
        logo
        right={<IconButton icon="🔔" badge />}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeGreeting}>Hoş Geldiniz</Text>
              <Text style={styles.welcomeTitle}>
                Elektrik dağıtım sektöründeki şartname, yönetmelik, standart ve teknik
                dokümanlara tek uygulamadan ulaşın.
              </Text>
              <Text style={styles.welcomeAlt}>
                <Text style={{ color: colors.accent, fontWeight: '800' }}>AI destekli mevzuat asistanı</Text>{' '}
                ile aradığınız bilgiyi saniyeler içinde bulun.
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
            title="AI Asistanı"
            subtitle="Sorunu yaz, ilgili mevzuatı bul"
            onPress={() => router.push('/ai')}
          />
          <QuickAction
            icon="🔖"
            title="Favoriler"
            subtitle="Kaydettiğin şartnamelere göz at"
            onPress={() => router.push('/favoriler')}
          />
        </View>

        <SectionTitle
          title="Son Şartnameler"
          actionLabel="Tümünü Gör"
          onActionPress={() => router.push('/sartname')}
        />
        {sonSartnameler.map((d) => (
          <DocumentRow key={d.id} document={d} />
        ))}

        <SectionTitle title="Popüler Aramalar" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {POPULER_ARAMALAR.map((etiket) => (
            <Chip key={etiket} label={etiket} icon="🔍" onPress={() => aramaYap(etiket)} />
          ))}
        </ScrollView>

        <View style={styles.aiCard}>
          <View style={styles.aiTopRow}>
            <View style={styles.aiIconWrap}>
              <Text style={{ fontSize: 22 }}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>AI Mevzuat Asistanı</Text>
              <Text style={styles.aiDesc}>
                Şartnamelerinle ilgili sorularını sor, AI asistanımız ilgili şartname,
                yönetmelik ve standartları anında bulsun.
              </Text>
            </View>
          </View>
          <Button
            label="AI Asistanını Aç"
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
          Bu uygulamadaki içerikler bilgilendirme amaçlıdır; resmî şartname ve yönetmelik
          hükümleri esastır.
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
  welcomeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  welcomeGreeting: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  welcomeTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  welcomeAlt: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.s,
  },

  illuWrap: { width: 68, height: 80, marginLeft: spacing.xs },
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
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  aiTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s, marginBottom: spacing.m },
  aiIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: typography.size.lg, fontWeight: '800', color: '#FFFFFF' },
  aiDesc: { fontSize: typography.size.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4, lineHeight: 19 },
  aiButton: { alignSelf: 'flex-end' },

  dipnot: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.s,
    lineHeight: 17,
    textAlign: 'center',
  },
});
