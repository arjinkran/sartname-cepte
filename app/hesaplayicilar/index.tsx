// Hesaplayıcı listesi. İlk sürümde Gerilim Düşümü aktif;
// diğer hesaplayıcılar sırayla eklenecek.
import React from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../src/theme';

const HESAPLAYICILAR = [
  { id: 'gerilim-dusumu', ad: 'Gerilim Düşümü', aciklama: 'Mono/trifaze %e ve minimum kesit', aktif: true },
  { id: 'akim-guc', ad: 'Akım / Güç', aciklama: 'I, P, cosφ dönüşümleri', aktif: false },
  { id: 'kablo-kesiti', ad: 'Kablo Kesiti Seçimi', aciklama: 'Akım taşıma + düşüm birlikte', aktif: false },
  { id: 'kisa-devre', ad: 'Kısa Devre (Yaklaşık)', aciklama: 'Trafo empedansından Ik', aktif: false },
  { id: 'trafo-yuklenme', ad: 'Trafo Yüklenme', aciklama: 'kVA, yük oranı, akım', aktif: false },
  { id: 'sigorta-salter', ad: 'Sigorta / Şalter Seçimi', aciklama: 'Yüke göre koruma kademesi', aktif: false },
  { id: 'kompanzasyon', ad: 'Kompanzasyon', aciklama: 'Gerekli kondansatör gücü', aktif: false },
  { id: 'ag-og', ad: 'AG-OG Dönüşümler', aciklama: 'Oranlar, birim çevrimleri', aktif: false },
] as const;

export default function Hesaplayicilar() {
  const router = useRouter();
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.m }}>
      {HESAPLAYICILAR.map((h) => (
        <Pressable
          key={h.id}
          disabled={!h.aktif}
          onPress={() => router.push('/hesaplayicilar/gerilim-dusumu')}
          style={({ pressed }) => [
            styles.satir,
            !h.aktif && styles.satirPasif,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.ad, !h.aktif && { color: colors.disabled }]}>{h.ad}</Text>
            <Text style={styles.aciklama}>{h.aciklama}</Text>
          </View>
          {h.aktif ? (
            <Text style={styles.ok}>›</Text>
          ) : (
            <Text style={styles.yakinda}>Yakında</Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  satirPasif: { backgroundColor: '#F0F2F5' },
  ad: { fontSize: 15, fontWeight: '700', color: colors.text },
  aciklama: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  ok: { fontSize: 24, color: colors.textMuted, paddingLeft: spacing.s },
  yakinda: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
});
