// Ana ekran: 6 modül kartı. Şimdilik yalnızca Hesaplayıcılar aktif;
// diğerleri fazlı planda sırayla açılacak.
import React from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../src/theme';

const MODULLER = [
  { id: 'sartname', ikon: '📚', ad: 'Şartname / Mevzuat', aciklama: 'Ara: özet bilgi kartları + kaynak', aktif: true, rota: '/sartname' },
  { id: 'hesap', ikon: '🧮', ad: 'Cep Hesaplayıcılar', aciklama: 'Gerilim düşümü, akım, kesit…', aktif: true, rota: '/hesaplayicilar' },
  { id: 'checklist', ikon: '✅', ad: 'Saha Kontrol Listeleri', aciklama: 'Manevra, topraklama, direk…', aktif: false, rota: '' },
  { id: 'isg', ikon: '🦺', ad: 'İSG Cep Rehberi', aciklama: 'LOTO, yaklaşma mesafeleri, KKD', aktif: false, rota: '' },
  { id: 'ariza', ikon: '🔍', ad: 'Arıza Teşhis Sihirbazı', aciklama: 'Belirtiden olası nedene', aktif: false, rota: '' },
  { id: 'not', ikon: '📷', ad: 'Saha Notu + Fotoğraf', aciklama: 'Kayıt, konum, PDF rapor', aktif: false, rota: '' },
] as const;

export default function Home() {
  const router = useRouter();
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.m }}>
      <Text style={styles.hosgeldin}>Sahada yanınızda.</Text>
      {MODULLER.map((m) => (
        <Pressable
          key={m.id}
          disabled={!m.aktif}
          onPress={() => m.rota && router.push(m.rota)}
          style={({ pressed }) => [
            styles.kart,
            !m.aktif && styles.kartPasif,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.ikon}>{m.ikon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kartAd, !m.aktif && { color: colors.disabled }]}>{m.ad}</Text>
            <Text style={styles.kartAciklama}>{m.aciklama}</Text>
          </View>
          {m.aktif ? (
            <Text style={styles.ok}>›</Text>
          ) : (
            <View style={styles.rozet}>
              <Text style={styles.rozetText}>Yakında</Text>
            </View>
          )}
        </Pressable>
      ))}
      <Text style={styles.dipnot}>
        Bu uygulamadaki hesaplar ve içerikler bilgilendirme amaçlıdır; resmî
        şartname ve yönetmelik hükümleri esastır.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hosgeldin: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.m },
  kart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.s + 4,
  },
  kartPasif: { backgroundColor: '#F0F2F5' },
  ikon: { fontSize: 26, marginRight: spacing.m },
  kartAd: { fontSize: 16, fontWeight: '700', color: colors.text },
  kartAciklama: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  ok: { fontSize: 26, color: colors.textMuted, paddingLeft: spacing.s },
  rozet: {
    backgroundColor: '#E8EBEF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rozetText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  dipnot: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.m,
    lineHeight: 17,
    textAlign: 'center',
  },
});
