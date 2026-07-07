// Şartname / Mevzuat — ARAMA + FİLTRE EKRANI (modülün giriş ekranı).
// Metin araması (ad, kurum, tür, özet, maddeler) + kurum ve kategori
// filtreleri birlikte çalışır. Sorgu boşken: favoriler + kategori
// kısayolu + (filtrelenmiş) tüm dokümanlar.
import React, { useMemo, useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { colors, spacing, radius } from '@/theme';
import { DOKUMANLAR, KATEGORILER, KURUMLAR } from '../data/sartnameler';
import { ara, filtrele } from '../services/arama';
import { DokumanSatiri } from '../components/DokumanSatiri';
import type { Kurum } from '../types';

function FiltreYonga({
  etiket,
  aktif,
  onPress,
}: {
  etiket: string;
  aktif: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filtreYonga, aktif && styles.filtreYongaAktif]}
    >
      <Text style={[styles.filtreYongaText, aktif && styles.filtreYongaTextAktif]}>
        {etiket}
      </Text>
    </Pressable>
  );
}

export default function SartnameAramaScreen() {
  const router = useRouter();
  const [sorgu, setSorgu] = useState('');
  const [kurumFiltre, setKurumFiltre] = useState<Kurum | null>(null);
  const [kategoriFiltre, setKategoriFiltre] = useState<string | null>(null);
  const { favoriIdler } = useFavoriler();

  // Önce filtreler uygulanır, arama filtrelenmiş küme üzerinde çalışır
  const filtrelenmis = useMemo(
    () => filtrele(DOKUMANLAR, { kurum: kurumFiltre, kategoriId: kategoriFiltre }),
    [kurumFiltre, kategoriFiltre]
  );
  const sonuclar = useMemo(() => ara(sorgu, filtrelenmis), [sorgu, filtrelenmis]);
  const favoriler = useMemo(
    () => filtrelenmis.filter((d) => favoriIdler.has(d.id)),
    [filtrelenmis, favoriIdler]
  );

  const aramaModu = sorgu.trim().length >= 2;
  const filtreAktif = kurumFiltre !== null || kategoriFiltre !== null;

  return (
    <View style={styles.root}>
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
          <Pressable onPress={() => setSorgu('')} hitSlop={10}>
            <Text style={styles.temizle}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Kurum filtresi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtreSatiri}
        contentContainerStyle={{ paddingHorizontal: spacing.m }}
      >
        <FiltreYonga etiket="Tüm Kurumlar" aktif={kurumFiltre === null} onPress={() => setKurumFiltre(null)} />
        {KURUMLAR.map((k) => (
          <FiltreYonga
            key={k}
            etiket={k}
            aktif={kurumFiltre === k}
            onPress={() => setKurumFiltre(kurumFiltre === k ? null : k)}
          />
        ))}
      </ScrollView>

      {/* Kategori filtresi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtreSatiri}
        contentContainerStyle={{ paddingHorizontal: spacing.m }}
      >
        <FiltreYonga etiket="Tüm Kategoriler" aktif={kategoriFiltre === null} onPress={() => setKategoriFiltre(null)} />
        {KATEGORILER.map((k) => (
          <FiltreYonga
            key={k.id}
            etiket={`${k.ikon} ${k.ad}`}
            aktif={kategoriFiltre === k.id}
            onPress={() => setKategoriFiltre(kategoriFiltre === k.id ? null : k.id)}
          />
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.m, paddingTop: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        {aramaModu ? (
          <>
            <Text style={styles.bolumBaslik}>
              {sonuclar.length > 0
                ? `${sonuclar.length} sonuç${filtreAktif ? ' (filtreli)' : ''}`
                : 'Sonuç bulunamadı — terimi veya filtreleri değiştir'}
            </Text>
            {sonuclar.map((s) => (
              <DokumanSatiri key={s.dokuman.id} dokuman={s.dokuman} />
            ))}
          </>
        ) : (
          <>
            {!filtreAktif && (
              <Pressable
                onPress={() => router.push('/sartname/kategoriler')}
                style={({ pressed }) => [styles.kategoriKisayol, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.kategoriKisayolText}>📂 Kategorilere Göz At</Text>
                <Text style={styles.kategoriKisayolAlt}>
                  {KATEGORILER.length} kategori · {DOKUMANLAR.length} doküman
                </Text>
              </Pressable>
            )}

            {favoriler.length > 0 && (
              <>
                <Text style={styles.bolumBaslik}>★ Favorilerim</Text>
                {favoriler.map((d) => (
                  <DokumanSatiri key={d.id} dokuman={d} />
                ))}
              </>
            )}

            <Text style={styles.bolumBaslik}>
              {filtreAktif ? `Filtrelenmiş Dokümanlar (${filtrelenmis.length})` : 'Tüm Dokümanlar'}
            </Text>
            {filtrelenmis.map((d) => (
              <DokumanSatiri key={d.id} dokuman={d} />
            ))}
            {filtrelenmis.length === 0 && (
              <Text style={styles.bosText}>Bu filtrelerle eşleşen doküman yok.</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  aramaKutusu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.m,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.m,
  },
  aramaIkon: { fontSize: 16, marginRight: spacing.s },
  aramaGirisi: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
  temizle: { fontSize: 16, color: colors.textMuted, padding: 4 },
  filtreSatiri: { flexGrow: 0, marginBottom: spacing.s },
  filtreYonga: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.s,
  },
  filtreYongaAktif: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtreYongaText: { fontSize: 13, color: colors.text },
  filtreYongaTextAktif: { color: '#FFFFFF', fontWeight: '700' },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  bosText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.m },
  kategoriKisayol: {
    backgroundColor: colors.primary,
    borderRadius: radius.m,
    padding: spacing.m,
    marginTop: spacing.s,
  },
  kategoriKisayolText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  kategoriKisayolAlt: { color: '#B9C9DB', fontSize: 13, marginTop: 2 },
});
