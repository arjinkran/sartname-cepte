// Direk Kuvvet Hesabı — src/calculations altyapısına bağlı ÖN HESAP
// ekranı. UI hesap yapmaz: tüm mantık PoleForceEngine içindedir
// (bkz. src/calculations/engines/enhMechanical/poleForce).
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Card, NumberField, SonucSatiri, tr } from '../../src/common/components/UI';
import { PoleForceEngine } from '../../src/calculations';
import {
  POLE_FORCE_CONDUCTOR_TYPES,
  POLE_FORCE_ICE_REGIONS,
  POLE_FORCE_POLE_FUNCTIONS,
  POLE_FORCE_WIND_REGIONS,
} from '../../src/calculations/engines/enhMechanical/poleForce/data';
import { ENH_CONDUCTOR_TYPES } from '../../src/calculations/engines/enhMechanical/data';
import type { ConductorType, IceRegion, PoleFunction } from '../../src/calculations/engines/enhMechanical/types';
import type { WindZone } from '../../src/calculations/engines/enhMechanical/betonDirek/types';
import { DIREK_SINIFLARI } from '../../modules/enhBilgi/data/direkSiniflari';
import { colors, spacing } from '../../src/theme';

// Metin girişini sayıya çevirir ("12,5" → 12.5); UI girdi ayrıştırma
// yardımcısıdır, hesap mantığı değildir.
function sayiyaCevir(metin: string): number {
  if (typeof metin !== 'string' || metin.trim() === '') return NaN;
  return Number(metin.replace(',', '.'));
}

const CONDUCTOR_TYPE_LABELS = new Map(ENH_CONDUCTOR_TYPES.map((c) => [c.id, c.label]));
const POLE_FUNCTION_LABELS = new Map(DIREK_SINIFLARI.map((d) => [d.id, d.ad]));

function Yonga({ etiket, aktif, onPress }: { etiket: string; aktif: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.yonga, aktif && styles.yongaAktif]}>
      <Text style={[styles.yongaText, aktif && styles.yongaTextAktif]}>{etiket}</Text>
    </Pressable>
  );
}

export default function DirekKuvvet() {
  const [conductorType, setConductorType] = useState<ConductorType>(POLE_FORCE_CONDUCTOR_TYPES[0]!);
  const [spanLeftMetin, setSpanLeftMetin] = useState('');
  const [spanRightMetin, setSpanRightMetin] = useState('');
  const [iceRegion, setIceRegion] = useState<IceRegion>(POLE_FORCE_ICE_REGIONS[0]!);
  const [windRegion, setWindRegion] = useState<WindZone>(POLE_FORCE_WIND_REGIONS[0]!);
  const [poleFunction, setPoleFunction] = useState<PoleFunction>(POLE_FORCE_POLE_FUNCTIONS[0]!);
  const [deviationAngleMetin, setDeviationAngleMetin] = useState('0');
  const [equipmentWeightMetin, setEquipmentWeightMetin] = useState('50');
  const [safetyFactorMetin, setSafetyFactorMetin] = useState('1,5');

  const girdiTamam =
    spanLeftMetin.trim() !== '' &&
    spanRightMetin.trim() !== '' &&
    deviationAngleMetin.trim() !== '' &&
    equipmentWeightMetin.trim() !== '' &&
    safetyFactorMetin.trim() !== '';

  const sonuc = useMemo(
    () =>
      PoleForceEngine.calculate({
        conductorType,
        spanLeftM: sayiyaCevir(spanLeftMetin),
        spanRightM: sayiyaCevir(spanRightMetin),
        iceRegion,
        windRegion,
        poleFunction,
        deviationAngleDeg: sayiyaCevir(deviationAngleMetin),
        equipmentWeightKg: sayiyaCevir(equipmentWeightMetin),
        safetyFactor: sayiyaCevir(safetyFactorMetin),
      }),
    [
      conductorType,
      spanLeftMetin,
      spanRightMetin,
      iceRegion,
      windRegion,
      poleFunction,
      deviationAngleMetin,
      equipmentWeightMetin,
      safetyFactorMetin,
    ]
  );

  const output = sonuc.output;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {PoleForceEngine.isDemo && (
          <View style={styles.bilgiNotu}>
            <Text style={styles.bilgiNotuBaslik}>⚠️ ÖN MÜHENDİSLİK HESABI</Text>
            <Text style={styles.bilgiNotuText}>{PoleForceEngine.metadata.description}</Text>
          </View>
        )}

        <Card>
          <Text style={styles.fieldLabel}>İletken tipi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {POLE_FORCE_CONDUCTOR_TYPES.map((c) => (
              <Yonga
                key={c}
                etiket={CONDUCTOR_TYPE_LABELS.get(c) ?? c}
                aktif={conductorType === c}
                onPress={() => setConductorType(c)}
              />
            ))}
          </ScrollView>

          <View style={styles.yanYana}>
            <View style={{ flex: 1, marginRight: spacing.s }}>
              <NumberField label="Sol açıklık" value={spanLeftMetin} onChangeText={setSpanLeftMetin} suffix="m" placeholder="örn. 60" />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.s }}>
              <NumberField label="Sağ açıklık" value={spanRightMetin} onChangeText={setSpanRightMetin} suffix="m" placeholder="örn. 80" />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Buz bölgesi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {POLE_FORCE_ICE_REGIONS.map((z) => (
              <Yonga key={z} etiket={String(z)} aktif={iceRegion === z} onPress={() => setIceRegion(z)} />
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Rüzgar bölgesi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {POLE_FORCE_WIND_REGIONS.map((z) => (
              <Yonga key={z} etiket={String(z)} aktif={windRegion === z} onPress={() => setWindRegion(z)} />
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Direk görevi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {POLE_FORCE_POLE_FUNCTIONS.map((p) => (
              <Yonga
                key={p}
                etiket={POLE_FUNCTION_LABELS.get(p) ?? p}
                aktif={poleFunction === p}
                onPress={() => setPoleFunction(p)}
              />
            ))}
          </ScrollView>

          <NumberField
            label="Sapma açısı"
            value={deviationAngleMetin}
            onChangeText={setDeviationAngleMetin}
            suffix="°"
            placeholder="örn. 0"
          />
          <NumberField
            label="Donanım ağırlığı"
            value={equipmentWeightMetin}
            onChangeText={setEquipmentWeightMetin}
            suffix="kg"
            placeholder="örn. 50"
          />
          <NumberField
            label="Emniyet katsayısı"
            value={safetyFactorMetin}
            onChangeText={setSafetyFactorMetin}
            placeholder="örn. 1,5"
          />
        </Card>

        {!girdiTamam ? (
          <Card>
            <Text style={styles.bekleme}>Sonucu görmek için tüm alanları doldurun.</Text>
          </Card>
        ) : output ? (
          <Card>
            <Text style={styles.bolumBaslik}>Sonuçlar</Text>
            <SonucSatiri etiket="Düşey kuvvet" deger={`${tr(output.verticalForceKg)} kg`} />
            <SonucSatiri etiket="Yatay rüzgar kuvveti" deger={`${tr(output.horizontalWindForceKg)} kg`} />
            <SonucSatiri etiket="Açı kuvveti" deger={`${tr(output.angleForceKg)} kg`} />
            <SonucSatiri etiket="Toplam yatay kuvvet" deger={`${tr(output.totalHorizontalForceKg)} kg`} />
            <SonucSatiri etiket="Bileşke kuvvet" deger={`${tr(output.resultantForceKg)} kg`} />
            <SonucSatiri etiket="Tasarım kuvveti" deger={`${tr(output.designForceKg)} kg`} vurgulu />
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
  yanYana: { flexDirection: 'row' },
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
