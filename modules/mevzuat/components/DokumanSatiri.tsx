// Doküman liste satırı — arama sonuçları, kategori listesi ve favorilerde ortak.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { colors, spacing, radius } from '@/theme';
import { DURUM_ETIKETLERI } from '../data/sartnameler';
import type { Dokuman, Kurum } from '../types';

const KURUM_RENKLERI: Record<Kurum, string> = {
  'TEDAŞ': '#1D4E7E',
  'EPDK': '#7B3FA0',
  'Resmî Gazete': '#8C6D1F',
};

export function KurumRozeti({ kurum }: { kurum: Kurum }) {
  return (
    <View style={[styles.rozet, { backgroundColor: KURUM_RENKLERI[kurum] }]}>
      <Text style={styles.rozetText}>{kurum}</Text>
    </View>
  );
}

const DURUM_RENKLERI: Record<Dokuman['durum'], { arka: string; yazi: string }> = {
  guncel: { arka: '#DCEFE1', yazi: '#1E8E3E' },
  mulga: { arka: '#F8DCDA', yazi: '#C5221F' },
  taslak: { arka: '#FBE9C9', yazi: '#8C6D1F' },
};

export function DurumRozeti({ durum }: { durum: Dokuman['durum'] }) {
  const r = DURUM_RENKLERI[durum];
  return (
    <View style={[styles.rozet, { backgroundColor: r.arka }]}>
      <Text style={[styles.rozetText, { color: r.yazi }]}>{DURUM_ETIKETLERI[durum]}</Text>
    </View>
  );
}

export function DokumanSatiri({ dokuman }: { dokuman: Dokuman }) {
  const router = useRouter();
  const { favoriMi, favoriDegistir } = useFavoriler();
  const favori = favoriMi(dokuman.id);

  return (
    <Pressable
      onPress={() => router.push(`/sartname/${dokuman.id}`)}
      style={({ pressed }) => [styles.satir, pressed && { opacity: 0.85 }]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.ustSatir}>
          <KurumRozeti kurum={dokuman.kurum} />
          {dokuman.durum !== 'guncel' ? <DurumRozeti durum={dokuman.durum} /> : null}
          {dokuman.ornek ? (
            <View style={styles.ornekRozet}>
              <Text style={styles.ornekRozetText}>örnek içerik</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.baslik} numberOfLines={2}>{dokuman.baslik}</Text>
        <Text style={styles.ozet} numberOfLines={2}>{dokuman.ozet}</Text>
      </View>
      <Pressable
        onPress={() => favoriDegistir(dokuman.id)}
        hitSlop={10}
        style={styles.yildizAlani}
      >
        <Text style={[styles.yildiz, favori && styles.yildizAktif]}>{favori ? '★' : '☆'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  ustSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rozet: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing.s,
  },
  rozetText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  ornekRozet: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FBE9C9',
  },
  ornekRozetText: { color: '#8C6D1F', fontSize: 10, fontWeight: '700' },
  baslik: { fontSize: 15, fontWeight: '700', color: colors.text },
  ozet: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  yildizAlani: { paddingLeft: spacing.m, alignSelf: 'stretch', justifyContent: 'center' },
  yildiz: { fontSize: 26, color: colors.disabled },
  yildizAktif: { color: colors.accent },
});
