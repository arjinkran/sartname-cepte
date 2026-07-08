// Sehim Hesabı — src/calculations altyapısına bağlı ÖN HESAP ekranı.
// UI hesap yapmaz: tüm mantık SagEngine içindedir (bkz.
// src/calculations/engines/enhMechanical/sag). SagEngine buz yükünü
// kendi başına hesaplamaz, IceLoadEngine'i çağırır.
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Card, NumberField, SonucSatiri, tr } from '../../src/common/components/UI';
import { SagEngine } from '../../src/calculations';
import {
  SAG_CONDUCTOR_TYPES,
  SAG_ICE_REGIONS,
  SAG_LOAD_CASES,
} from '../../src/calculations/engines/enhMechanical/sag/data';
import type { LoadCase } from '../../src/calculations/engines/enhMechanical/sag/types';
import { ENH_CONDUCTOR_TYPES } from '../../src/calculations/engines/enhMechanical/data';
import type { ConductorType, IceRegion } from '../../src/calculations/engines/enhMechanical/types';
import { colors, spacing } from '../../src/theme';

// Metin girişini sayıya çevirir ("12,5" → 12.5); UI girdi ayrıştırma
// yardımcısıdır, hesap mantığı değildir.
function sayiyaCevir(metin: string): number {
  if (typeof metin !== 'string' || metin.trim() === '') return NaN;
  return Number(metin.replace(',', '.'));
}

const CONDUCTOR_TYPE_LABELS = new Map(ENH_CONDUCTOR_TYPES.map((c) => [c.id, c.label]));
const LOAD_CASE_LABELS: Record<LoadCase, string> = {
  noIce: 'Buzsuz',
  oneIce: 'Bir Buz Yükü',
  doubleIce: 'İki Buz Yükü',
};

function Yonga({ etiket, aktif, onPress }: { etiket: string; aktif: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.yonga, aktif && styles.yongaAktif]}>
      <Text style={[styles.yongaText, aktif && styles.yongaTextAktif]}>{etiket}</Text>
    </Pressable>
  );
}

export default function Sehim() {
  const [conductorType, setConductorType] = useState<ConductorType>(SAG_CONDUCTOR_TYPES[0]!);
  const [spanLengthMetin, setSpanLengthMetin] = useState('');
  const [iceRegion, setIceRegion] = useState<IceRegion>(SAG_ICE_REGIONS[0]!);
  const [tensionMetin, setTensionMetin] = useState('');
  const [loadCase, setLoadCase] = useState<LoadCase>('noIce');

  const girdiTamam = spanLengthMetin.trim() !== '' && tensionMetin.trim() !== '';

  const sonuc = useMemo(
    () =>
      SagEngine.calculate({
        conductorType,
        spanLengthM: sayiyaCevir(spanLengthMetin),
        iceRegion,
        tensionKg: sayiyaCevir(tensionMetin),
        loadCase,
      }),
    [conductorType, spanLengthMetin, iceRegion, tensionMetin, loadCase]
  );

  const output = sonuc.output;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {SagEngine.isDemo && (
          <View style={styles.bilgiNotu}>
            <Text style={styles.bilgiNotuBaslik}>⚠️ ÖN MÜHENDİSLİK HESABI</Text>
            <Text style={styles.bilgiNotuText}>{SagEngine.metadata.description}</Text>
          </View>
        )}

        <Card>
          <Text style={styles.fieldLabel}>İletken tipi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {SAG_CONDUCTOR_TYPES.map((c) => (
              <Yonga
                key={c}
                etiket={CONDUCTOR_TYPE_LABELS.get(c) ?? c}
                aktif={conductorType === c}
                onPress={() => setConductorType(c)}
              />
            ))}
          </ScrollView>

          <NumberField label="Açıklık" value={spanLengthMetin} onChangeText={setSpanLengthMetin} suffix="m" placeholder="örn. 100" />

          <Text style={styles.fieldLabel}>Buz bölgesi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {SAG_ICE_REGIONS.map((z) => (
              <Yonga key={z} etiket={String(z)} aktif={iceRegion === z} onPress={() => setIceRegion(z)} />
            ))}
          </ScrollView>

          <NumberField label="Çekme kuvveti" value={tensionMetin} onChangeText={setTensionMetin} suffix="kg" placeholder="örn. 1000" />

          <Text style={styles.fieldLabel}>Yük hali</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {SAG_LOAD_CASES.map((lc) => (
              <Yonga key={lc} etiket={LOAD_CASE_LABELS[lc]} aktif={loadCase === lc} onPress={() => setLoadCase(lc)} />
            ))}
          </ScrollView>
        </Card>

        {!girdiTamam ? (
          <Card>
            <Text style={styles.bekleme}>Sonucu görmek için açıklık ve çekme kuvveti değerlerini girin.</Text>
          </Card>
        ) : output ? (
          <Card>
            <View style={styles.dogrulamaEtiketi}>
              <Text style={styles.dogrulamaEtiketiText}>Doğrulanmamış ön hesap</Text>
            </View>
            <Text style={styles.bolumBaslik}>Sonuçlar</Text>
            <SonucSatiri etiket="Toplam yük" deger={`${tr(output.totalLoadKgPerM, 4)} kg/m`} />
            <SonucSatiri etiket="Çekme kuvveti" deger={`${tr(output.tensionKg, 0)} kg`} />
            <SonucSatiri etiket="Sehim" deger={`${tr(output.sagM, 3)} m`} vurgulu />
            <SonucSatiri etiket="Sehim" deger={`${tr(output.sagCm, 1)} cm`} />
            <SonucSatiri etiket="Açıklığa oran" deger={`%${tr(output.sagPercentOfSpan, 2)}`} />
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
    </KeyboardAvoidingView>
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
  dogrulamaEtiketi: {
    alignSelf: 'flex-start',
    backgroundColor: colors.inputBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.s,
  },
  dogrulamaEtiketiText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
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
  bekleme: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.s },
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
