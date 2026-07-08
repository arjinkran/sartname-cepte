// İletken detay ekranı — /enh-bilgi/iletken/:id
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Card, SonucSatiri } from '@/common/components/UI';
import { colors, spacing, radius } from '@/theme';
import { ILETKENLER } from '../data/iletkenler';

export default function IletkenDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const iletken = ILETKENLER.find((i) => i.id === id);

  if (!iletken) {
    return (
      <View style={styles.bosKap}>
        <Text style={styles.bosText}>İletken bulunamadı.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: iletken.ad }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
        <Card>
          <View style={styles.ustSatir}>
            <Text style={styles.baslik}>{iletken.ad}</Text>
            <View style={styles.kodRozet}>
              <Text style={styles.kodRozetText}>{iletken.kod}</Text>
            </View>
          </View>
          <Text style={styles.aciklama}>{iletken.kisaAciklama}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Teknik Özellikler</Text>
          <SonucSatiri etiket="Alüminyum kesiti" deger={`${iletken.aluminyumKesitMm2} mm²`} />
          <SonucSatiri etiket="Çelik kesiti" deger={`${iletken.celikKesitMm2} mm²`} />
          <SonucSatiri etiket="Toplam kesit" deger={`${iletken.toplamKesitMm2} mm²`} />
          <SonucSatiri etiket="Nominal çap" deger={`${iletken.nominalCapMm} mm`} />
          <SonucSatiri etiket="Nominal ağırlık" deger={`${iletken.nominalAgirlikKgPerM} kg/m`} />
          <SonucSatiri etiket="Kopma dayanımı" deger={`${iletken.kopmaDayanimiKg} kg`} />
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Kullanım Alanı</Text>
          <Text style={styles.metin}>{iletken.kullanimAlani}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>İlgili Hesaplayıcı</Text>
          <Pressable
            onPress={() => router.push('/hesaplayicilar/og-akim-tasima')}
            style={({ pressed }) => [styles.hesapBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.hesapBtnText}>🧮 OG Akım Taşıma Kapasitesi'nde kullan</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  bosKap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bosText: { fontSize: 15, color: colors.textMuted },
  ustSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  baslik: { fontSize: 20, fontWeight: '800', color: colors.text, marginRight: spacing.s },
  kodRozet: {
    backgroundColor: '#E8EEF5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  kodRozetText: { fontSize: 12, fontWeight: '800', color: colors.primaryLight },
  aciklama: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  metin: { fontSize: 14, color: colors.text, lineHeight: 21 },
  hesapBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    padding: spacing.m,
    alignItems: 'center',
  },
  hesapBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
