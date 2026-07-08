// Buz Yükü Hesabı — src/calculations altyapısına bağlı ÖN HESAP ekranı.
// UI hesap yapmaz: tüm mantık IceLoadEngine içindedir (bkz.
// src/calculations/engines/enhMechanical/iceLoad).
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, SonucSatiri, tr } from '../../src/common/components/UI';
import { IceLoadEngine } from '../../src/calculations';
import {
  ICE_LOAD_CONDUCTOR_TYPES,
  ICE_LOAD_ICE_REGIONS,
} from '../../src/calculations/engines/enhMechanical/iceLoad/data';
import { ENH_CONDUCTOR_TYPES } from '../../src/calculations/engines/enhMechanical/data';
import type { ConductorType, IceRegion } from '../../src/calculations/engines/enhMechanical/types';
import { colors, spacing } from '../../src/theme';

const CONDUCTOR_TYPE_LABELS = new Map(ENH_CONDUCTOR_TYPES.map((c) => [c.id, c.label]));

function Yonga({ etiket, aktif, onPress }: { etiket: string; aktif: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.yonga, aktif && styles.yongaAktif]}>
      <Text style={[styles.yongaText, aktif && styles.yongaTextAktif]}>{etiket}</Text>
    </Pressable>
  );
}

export default function BuzYuku() {
  const [conductorType, setConductorType] = useState<ConductorType>(ICE_LOAD_CONDUCTOR_TYPES[0]!);
  const [iceRegion, setIceRegion] = useState<IceRegion>(ICE_LOAD_ICE_REGIONS[0]!);

  const sonuc = useMemo(
    () => IceLoadEngine.calculate({ conductorType, iceRegion }),
    [conductorType, iceRegion]
  );

  const output = sonuc.output;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
      {IceLoadEngine.isDemo && (
        <View style={styles.bilgiNotu}>
          <Text style={styles.bilgiNotuBaslik}>⚠️ ÖN MÜHENDİSLİK HESABI</Text>
          <Text style={styles.bilgiNotuText}>{IceLoadEngine.metadata.description}</Text>
        </View>
      )}

      <Card>
        <Text style={styles.fieldLabel}>İletken tipi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
          {ICE_LOAD_CONDUCTOR_TYPES.map((c) => (
            <Yonga
              key={c}
              etiket={CONDUCTOR_TYPE_LABELS.get(c) ?? c}
              aktif={conductorType === c}
              onPress={() => setConductorType(c)}
            />
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>Buz bölgesi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
          {ICE_LOAD_ICE_REGIONS.map((z) => (
            <Yonga key={z} etiket={String(z)} aktif={iceRegion === z} onPress={() => setIceRegion(z)} />
          ))}
        </ScrollView>
      </Card>

      {output ? (
        <Card>
          <Text style={styles.bolumBaslik}>Sonuçlar</Text>
          <SonucSatiri etiket="İletken çapı" deger={`${tr(output.conductorDiameterMm, 2)} mm`} />
          <SonucSatiri etiket="Çıplak iletken ağırlığı" deger={`${tr(output.conductorWeightKgPerM, 4)} kg/m`} />
          <SonucSatiri etiket="Bir buz yükü" deger={`${tr(output.iceLoadKgPerM, 4)} kg/m`} />
          <SonucSatiri
            etiket="Bir buz yüklü toplam ağırlık"
            deger={`${tr(output.totalWeightWithIceKgPerM, 4)} kg/m`}
            vurgulu
          />
          <SonucSatiri etiket="İki buz yükü" deger={`${tr(output.doubleIceLoadKgPerM, 4)} kg/m`} />
          <SonucSatiri
            etiket="İki buz yüklü toplam ağırlık"
            deger={`${tr(output.totalWeightWithDoubleIceKgPerM, 4)} kg/m`}
            vurgulu
          />
          {sonuc.warnings.map((w) => (
            <Text key={w.code} style={styles.uyariText}>⚠ {w.message}</Text>
          ))}
        </Card>
      ) : (
        <Card style={{ borderColor: colors.danger, borderWidth: 1.5 }}>
          <Text style={styles.hataBaslik}>Girdi hataları</Text>
          {sonuc.errors.map((e) => (
            <Text key={`${e.code}-${e.field ?? ''}`} style={styles.hataText}>• {e.message}</Text>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bilgiNotu: {
    backgroundColor: '#FBE9C9',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.danger,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  bilgiNotuBaslik: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.danger,
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  bilgiNotuText: { fontSize: 13, color: '#8C6D1F', lineHeight: 19, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs },
  yongaSatiri: { marginBottom: spacing.s },
  yonga: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    marginRight: spacing.s,
  },
  yongaAktif: { backgroundColor: colors.primary, borderColor: colors.primary },
  yongaText: { fontSize: 13, color: colors.text },
  yongaTextAktif: { color: '#FFFFFF', fontWeight: '700' },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  uyariText: { fontSize: 12, color: colors.textMuted, marginTop: spacing.s, lineHeight: 17 },
  hataBaslik: { fontSize: 14, fontWeight: '800', color: colors.danger, marginBottom: spacing.s },
  hataText: { fontSize: 13, color: colors.text, marginBottom: 4, lineHeight: 18 },
});
