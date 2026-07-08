// ENH Mekanik Hesapları — alt hesap kartları listesi.
// "Beton Direk Seçimi" (Sprint 3A) ve "Direk Kuvvet Hesabı" (Sprint 4A,
// ön hesap) gerçek ekranlara yönlendirir; diğer kartlara basınca hâlâ
// aynı sayfada "henüz aktif değil" bilgi kartı gösterilir — bkz.
// src/calculations/engines/enhMechanical/README.md.
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ENH_MECHANICAL_SUB_CALCULATIONS } from '../../src/calculations/engines/enhMechanical/engine';
import { colors, spacing, radius } from '../../src/theme';

interface HesapKarti {
  id: string;
  label: string;
  description: string;
  relatedExcelTabs: readonly string[];
}

// Sprint 2C'nin genel (notImplemented dönen) alt hesap listesine ek olarak
// kendi bağımsız motoru olan hesaplar — bkz. poleForce/README.md.
const EK_KARTLAR: readonly HesapKarti[] = [
  {
    id: 'direkKuvvetHesabi',
    label: 'Direk Kuvvet Hesabı',
    description: 'Direğe gelen düşey ve yatay kuvvetlerin ön hesabı (PoleForceEngine).',
    relatedExcelTabs: [],
  },
];

const TUM_KARTLAR: readonly HesapKarti[] = [...ENH_MECHANICAL_SUB_CALCULATIONS, ...EK_KARTLAR];

const AKTIF_HESAPLAR: Record<string, string> = {
  betonDirekSecimi: '/hesaplayicilar/beton-direk',
  direkKuvvetHesabi: '/hesaplayicilar/direk-kuvvet',
};

export default function EnhMekanik() {
  const router = useRouter();
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const secili = TUM_KARTLAR.find((s) => s.id === seciliId);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m }}>
      <View style={styles.bilgiNotu}>
        <Text style={styles.bilgiNotuText}>
          ℹ️ Beton Direk Seçimi ve Direk Kuvvet Hesabı (ön hesap) aktif; diğer alt hesaplar iskelet aşamasındadır. Gerçek formüller Excel analizinden sonra eklenecektir.
        </Text>
      </View>

      {TUM_KARTLAR.map((s) => {
        const seciliMi = seciliId === s.id;
        const rota = AKTIF_HESAPLAR[s.id];
        return (
          <Pressable
            key={s.id}
            onPress={() => (rota ? router.push(rota) : setSeciliId(seciliMi ? null : s.id))}
            style={({ pressed }) => [
              styles.kart,
              seciliMi && styles.kartAktif,
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.kartAd}>{s.label}</Text>
              <Text style={styles.kartAciklama}>{s.description}</Text>
            </View>
            <Text style={styles.ok}>{rota ? '›' : seciliMi ? '︿' : '›'}</Text>
          </Pressable>
        );
      })}

      {secili && (
        <View style={styles.bilgiKarti}>
          <Text style={styles.bilgiKartiBaslik}>{secili.label}</Text>
          <Text style={styles.bilgiKartiText}>Bu hesap Excel analizinden sonra aktif edilecektir.</Text>
          {secili.relatedExcelTabs.length > 0 && (
            <Text style={styles.bilgiKartiAlt}>
              İlgili Excel sekmesi: {secili.relatedExcelTabs.join(', ')}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bilgiNotu: {
    backgroundColor: '#E8EEF5',
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  bilgiNotuText: { fontSize: 13, color: colors.primaryLight, lineHeight: 19, fontWeight: '600' },
  kart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  kartAktif: { borderColor: colors.primary, borderWidth: 1.5 },
  kartAd: { fontSize: 15, fontWeight: '700', color: colors.text },
  kartAciklama: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  ok: { fontSize: 20, color: colors.textMuted, paddingLeft: spacing.s },
  bilgiKarti: {
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginTop: spacing.s,
  },
  bilgiKartiBaslik: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  bilgiKartiText: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  bilgiKartiAlt: { fontSize: 12, color: colors.disabled, marginTop: spacing.s },
});
