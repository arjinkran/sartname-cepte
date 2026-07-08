// Şartname / Mevzuat — ARAMA + FİLTRE EKRANI (modülün giriş ekranı).
// Premium tasarım — iş mantığı DEĞİŞMEDİ: aynı `ara`/`filtrele` servisleri,
// aynı favoriler context'i. Metin araması (title, summary, keywords,
// institution, category) + kurum ve kategori filtreleri birlikte çalışır.
// Sorgu boşken: favoriler + kategori kısayolu + (filtrelenmiş) tüm
// dokümanlar. `?q=` route param'ı (Ana Sayfa'daki Popüler Aramalar
// çiplerinden gelir) arama kutusunu otomatik doldurur.
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { AppBar, BottomNavigation, Chip, EmptyState, PressableScale } from '@/components/ui';
import { useRootTabBar } from '@/navigation/tabs';
import { colors, radius, spacing, shadow, typography } from '@/theme';
import { DOCUMENTS, KATEGORILER, KURUMLAR } from '../data/sartnameler';
import { ara, filtrele } from '../services/arama';
import { DocumentRow } from '../components/DocumentRow';
import type { Institution } from '../types';

const FILTRE_ETIKETLERI = ['Tümü', ...KURUMLAR] as const;

export default function SartnameAramaScreen() {
  const router = useRouter();
  const tabBar = useRootTabBar();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [sorgu, setSorgu] = useState(typeof q === 'string' ? q : '');
  const [kurumFiltre, setKurumFiltre] = useState<Institution | null>(null);
  const [kategoriIdFiltre, setKategoriIdFiltre] = useState<string | null>(null);
  const { favoriIdler } = useFavoriler();

  useEffect(() => {
    if (typeof q === 'string' && q.length > 0) setSorgu(q);
  }, [q]);

  const kategoriAdFiltre = useMemo(
    () => (kategoriIdFiltre ? KATEGORILER.find((k) => k.id === kategoriIdFiltre)?.ad ?? null : null),
    [kategoriIdFiltre]
  );

  const filtrelenmis = useMemo(
    () => filtrele(DOCUMENTS, { institution: kurumFiltre, category: kategoriAdFiltre }),
    [kurumFiltre, kategoriAdFiltre]
  );
  const sonuclar = useMemo(() => ara(sorgu, filtrelenmis), [sorgu, filtrelenmis]);
  const favoriler = useMemo(
    () => filtrelenmis.filter((d) => favoriIdler.has(d.id)),
    [filtrelenmis, favoriIdler]
  );

  const aramaModu = sorgu.trim().length >= 2;
  const filtreAktif = kurumFiltre !== null || kategoriIdFiltre !== null;

  const etiketSec = (etiket: (typeof FILTRE_ETIKETLERI)[number]) => {
    setSorgu('');
    setKurumFiltre(etiket === 'Tümü' ? null : (etiket as Institution));
  };

  const etiketAktifMi = (etiket: (typeof FILTRE_ETIKETLERI)[number]) =>
    etiket === 'Tümü' ? kurumFiltre === null : kurumFiltre === etiket;

  return (
    <View style={styles.root}>
      <AppBar title="Şartname Ara" onBack={router.canGoBack() ? () => router.back() : undefined} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.aramaKutusu}>
          <Text style={styles.aramaIkon}>🔎</Text>
          <TextInput
            style={styles.aramaGirisi}
            value={sorgu}
            onChangeText={setSorgu}
            placeholder='Ara: "AG kablo eki", "OG trafo", "kesinti"…'
            placeholderTextColor={colors.disabled}
            autoCorrect={false}
            returnKeyType="search"
          />
          {sorgu.length > 0 && (
            <PressableScale onPress={() => setSorgu('')} scaleTo={0.9}>
              <Text style={styles.temizle}>✕</Text>
            </PressableScale>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtreSatiri}>
          {FILTRE_ETIKETLERI.map((etiket) => (
            <Chip key={etiket} label={etiket} selected={etiketAktifMi(etiket)} onPress={() => etiketSec(etiket)} />
          ))}
        </ScrollView>

        {aramaModu ? (
          <>
            <Text style={styles.bolumBaslik}>
              {sonuclar.length > 0
                ? `${sonuclar.length} sonuç${filtreAktif ? ' (filtreli)' : ''}`
                : 'Sonuç'}
            </Text>
            {sonuclar.length > 0 ? (
              sonuclar.map((s) => <DocumentRow key={s.document.id} document={s.document} />)
            ) : (
              <EmptyState
                icon="🔍"
                title="Sonuç bulunamadı"
                description="Farklı anahtar kelimelerle tekrar deneyin."
              />
            )}
          </>
        ) : (
          <>
            {!filtreAktif && (
              <PressableScale
                onPress={() => router.push('/sartname/kategoriler')}
                scaleTo={0.98}
                style={styles.kategoriKisayol}
              >
                <Text style={styles.kategoriKisayolText}>📂 Kategorilere Göz At</Text>
                <Text style={styles.kategoriKisayolAlt}>
                  {KATEGORILER.length} kategori · {DOCUMENTS.length} doküman
                </Text>
              </PressableScale>
            )}

            {favoriler.length > 0 && (
              <>
                <Text style={styles.bolumBaslik}>★ Favorilerim</Text>
                {favoriler.map((d) => (
                  <DocumentRow key={d.id} document={d} />
                ))}
              </>
            )}

            <Text style={styles.bolumBaslik}>
              {filtreAktif ? `Filtrelenmiş Dokümanlar (${filtrelenmis.length})` : 'Tüm Dokümanlar'}
            </Text>
            {filtrelenmis.length > 0 ? (
              filtrelenmis.map((d) => <DocumentRow key={d.id} document={d} />)
            ) : (
              <EmptyState
                icon="🔍"
                title="Sonuç bulunamadı"
                description="Farklı anahtar kelimelerle tekrar deneyin."
              />
            )}
          </>
        )}
      </ScrollView>

      <BottomNavigation tabs={tabBar.tabs} activeId={tabBar.activeId} onChange={tabBar.onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: spacing.xl },
  aramaKutusu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
    ...shadow.sm,
  },
  aramaIkon: { fontSize: 18, marginRight: spacing.s },
  aramaGirisi: {
    flex: 1,
    paddingVertical: 14,
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  temizle: { fontSize: 16, color: colors.textSecondary, padding: 4 },
  filtreSatiri: { flexGrow: 0, marginBottom: spacing.s },
  bolumBaslik: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  kategoriKisayol: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.m,
    marginTop: spacing.xs,
  },
  kategoriKisayolText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  kategoriKisayolAlt: { color: '#B9C9DB', fontSize: 13, marginTop: 2 },
});
