// Hesaplayıcı listesi. Gerilim Düşümü, OG Akım Taşıma Kapasitesi ve
// ENH Mekanik Hesapları (iskelet) aktif; diğer hesaplayıcılar sırayla eklenecek.
import React from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../src/theme';

const HESAPLAYICILAR = [
  { id: 'gerilim-dusumu', ad: 'Gerilim Düşümü', aciklama: 'Mono/trifaze %e ve minimum kesit', aktif: true, rota: '/hesaplayicilar/gerilim-dusumu' },
  { id: 'og-akim-tasima', ad: 'OG Akım Taşıma Kapasitesi', aciklama: 'YG/OG hava hattı iletkenleri için akım kapasitesi ve iletken özellikleri', aktif: true, rota: '/hesaplayicilar/og-akim-tasima' },
  { id: 'enh-mekanik', ad: 'ENH Mekanik Hesapları', aciklama: 'Direk açıklığı, sehim, Df/Ds ve değişik haller hesapları', aktif: true, rota: '/hesaplayicilar/enh-mekanik' },
  { id: 'akim-guc', ad: 'Akım / Güç', aciklama: 'I, P, cosφ dönüşümleri', aktif: false, rota: '' },
  { id: 'kablo-kesiti', ad: 'Kablo Kesiti Seçimi', aciklama: 'Akım taşıma + düşüm birlikte', aktif: false, rota: '' },
  { id: 'kisa-devre', ad: 'Kısa Devre (Yaklaşık)', aciklama: 'Trafo empedansından Ik', aktif: false, rota: '' },
  { id: 'trafo-yuklenme', ad: 'Trafo Yüklenme', aciklama: 'kVA, yük oranı, akım', aktif: false, rota: '' },
  { id: 'sigorta-salter', ad: 'Sigorta / Şalter Seçimi', aciklama: 'Yüke göre koruma kademesi', aktif: false, rota: '' },
  { id: 'kompanzasyon', ad: 'Kompanzasyon', aciklama: 'Gerekli kondansatör gücü', aktif: false, rota: '' },
  { id: 'ag-og', ad: 'AG-OG Dönüşümler', aciklama: 'Oranlar, birim çevrimleri', aktif: false, rota: '' },
] as const;

export default function Hesaplayicilar() {
  const router = useRouter();
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.m }}>
      {HESAPLAYICILAR.map((h) => (
        <Pressable
          key={h.id}
          disabled={!h.aktif}
          onPress={() => h.rota && router.push(h.rota)}
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
