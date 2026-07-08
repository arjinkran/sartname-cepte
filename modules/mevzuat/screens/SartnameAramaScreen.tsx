// Şartname / Mevzuat — ARAMA + FİLTRE EKRANI (modülün giriş ekranı).
// Premium tasarım — görünüm KORUNDU. Sprint 4: veri artık Repository
// üzerinden (getAllDocuments/search) okunur; filtreler Kurum, Kategori,
// Doküman Tipi olmak üzere üç boyuta genişledi (madde 12). Metin araması
// (title, summary, keywords, institution, category) + üç filtre birlikte
// çalışır. Sorgu boşken: favoriler + kategori kısayolu + (filtrelenmiş)
// tüm dokümanlar. `?q=` route param'ı (Ana Sayfa'daki Popüler Aramalar
// çiplerinden gelir) arama kutusunu otomatik doldurur.
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { AppBar, BottomNavigation, Chip, EmptyState, PressableScale } from '@/components/ui';
import { useRootTabBar } from '@/navigation/tabs';
import { colors, radius, spacing, shadow, typography } from '@/theme';
import {
  CATEGORIES,
  DOCUMENT_TYPES,
  INSTITUTIONS,
  getAllDocuments,
  getByCategory,
  getByType,
  search,
  type DocumentType,
  type Institution,
} from '@/data/documents';
import { DocumentRow } from '../components/DocumentRow';

const KURUM_ETIKETLERI = ['Tümü', ...INSTITUTIONS] as const;
// Yalnızca en az bir dokümanı olan kategori/tip çipleri gösterilir — 23
// kategorinin çoğu şu an boş, boş çipler yerine kullanışlı bir liste sunar.
const KATEGORI_ETIKETLERI = ['Tümü', ...CATEGORIES.filter((c) => getByCategory(c.ad).length > 0).map((c) => c.ad)];
const TIP_ETIKETLERI = ['Tümü', ...DOCUMENT_TYPES.filter((t) => getByType(t).length > 0)];

export default function SartnameAramaScreen() {
  const router = useRouter();
  const tabBar = useRootTabBar();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [sorgu, setSorgu] = useState(typeof q === 'string' ? q : '');
  const [kurumFiltre, setKurumFiltre] = useState<Institution | null>(null);
  const [kategoriFiltre, setKategoriFiltre] = useState<string | null>(null);
  const [tipFiltre, setTipFiltre] = useState<DocumentType | null>(null);
  const { favoriIdler } = useFavoriler();

  useEffect(() => {
    if (typeof q === 'string' && q.length > 0) setSorgu(q);
  }, [q]);

  const tumDokumanlar = useMemo(() => getAllDocuments(), []);
  const filtrelenmis = useMemo(
    () =>
      tumDokumanlar.filter(
        (d) =>
          (!kurumFiltre || d.institution === kurumFiltre) &&
          (!kategoriFiltre || d.category === kategoriFiltre) &&
          (!tipFiltre || d.documentType === tipFiltre)
      ),
    [tumDokumanlar, kurumFiltre, kategoriFiltre, tipFiltre]
  );
  const sonuclar = useMemo(() => search(sorgu, filtrelenmis), [sorgu, filtrelenmis]);
  const favoriler = useMemo(
    () => filtrelenmis.filter((d) => favoriIdler.has(d.id)),
    [filtrelenmis, favoriIdler]
  );

  const aramaModu = sorgu.trim().length >= 2;
  const filtreAktif = kurumFiltre !== null || kategoriFiltre !== null || tipFiltre !== null;

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

        <Text style={styles.filtreBaslik}>Kurum</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtreSatiri}>
          {KURUM_ETIKETLERI.map((etiket) => (
            <Chip
              key={etiket}
              label={etiket}
              selected={etiket === 'Tümü' ? kurumFiltre === null : kurumFiltre === etiket}
              onPress={() => setKurumFiltre(etiket === 'Tümü' ? null : (etiket as Institution))}
            />
          ))}
        </ScrollView>

        <Text style={styles.filtreBaslik}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtreSatiri}>
          {KATEGORI_ETIKETLERI.map((etiket) => (
            <Chip
              key={etiket}
              label={etiket}
              selected={etiket === 'Tümü' ? kategoriFiltre === null : kategoriFiltre === etiket}
              onPress={() => setKategoriFiltre(etiket === 'Tümü' ? null : etiket)}
            />
          ))}
        </ScrollView>

        <Text style={styles.filtreBaslik}>Doküman Tipi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtreSatiri}>
          {TIP_ETIKETLERI.map((etiket) => (
            <Chip
              key={etiket}
              label={etiket}
              selected={etiket === 'Tümü' ? tipFiltre === null : tipFiltre === etiket}
              onPress={() => setTipFiltre(etiket === 'Tümü' ? null : (etiket as DocumentType))}
            />
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
                  {CATEGORIES.length} kategori · {tumDokumanlar.length} doküman
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
  filtreBaslik: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginBottom: 4,
  },
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
