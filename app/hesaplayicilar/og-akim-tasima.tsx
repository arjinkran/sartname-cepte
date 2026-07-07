// OG Akım Taşıma Kapasitesi hesaplayıcısı — src/calculations altyapısına
// bağlı ekran. UI hesap yapmaz: tüm mantık AmpacityOGEngine içindedir
// (bkz. src/calculations/engines/ampacityOG).
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Card, NumberField, Secim, SonucSatiri, tr } from '../../src/common/components/UI';
import { AmpacityOGEngine } from '../../src/calculations';
import { AMPACITY_CONDITIONS, AMPACITY_CONDUCTORS } from '../../src/calculations/engines/ampacityOG/data';
import type { VoltageLevel } from '../../src/calculations/engines/ampacityOG/types';
import { colors, spacing } from '../../src/theme';

// Metin girişini sayıya çevirir ("12,5" → 12.5); UI girdi ayrıştırma
// yardımcısıdır, hesap mantığı değildir.
function sayiyaCevir(metin: string): number {
  if (typeof metin !== 'string' || metin.trim() === '') return NaN;
  return Number(metin.replace(',', '.'));
}

function SecimYongasi({
  etiket,
  aktif,
  onPress,
}: {
  etiket: string;
  aktif: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.yonga, aktif && styles.yongaAktif]}>
      <Text style={[styles.yongaText, aktif && styles.yongaTextAktif]}>{etiket}</Text>
    </Pressable>
  );
}

export default function OGAkimTasima() {
  const [conductorId, setConductorId] = useState(AMPACITY_CONDUCTORS[0]!.id);
  const [conditionId, setConditionId] = useState(AMPACITY_CONDITIONS[0]!.id);
  const [voltageLevel, setVoltageLevel] = useState<VoltageLevel>('10kV');
  const [beklenenAkimMetin, setBeklenenAkimMetin] = useState('');

  const seciliKosul = AMPACITY_CONDITIONS.find((c) => c.id === conditionId);
  const beklenenAkimSayi =
    beklenenAkimMetin.trim() === '' ? undefined : sayiyaCevir(beklenenAkimMetin.trim());

  const sonuc = useMemo(
    () =>
      AmpacityOGEngine.calculate({
        conductorId,
        conditionId,
        voltageLevel,
        ...(beklenenAkimSayi !== undefined ? { expectedCurrentA: beklenenAkimSayi } : {}),
      }),
    [conductorId, conditionId, voltageLevel, beklenenAkimSayi]
  );

  const output = sonuc.output;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bilgiNotu}>
          <Text style={styles.bilgiNotuText}>ℹ️ {AmpacityOGEngine.metadata.description}</Text>
        </View>

        <Card>
          <Text style={styles.fieldLabel}>İletken</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {AMPACITY_CONDUCTORS.map((c) => (
              <SecimYongasi
                key={c.id}
                etiket={c.name}
                aktif={conductorId === c.id}
                onPress={() => setConductorId(c.id)}
              />
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Çalışma koşulu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {AMPACITY_CONDITIONS.map((c) => (
              <SecimYongasi
                key={c.id}
                etiket={c.name}
                aktif={conditionId === c.id}
                onPress={() => setConditionId(c.id)}
              />
            ))}
          </ScrollView>
          {seciliKosul?.description && (
            <Text style={styles.kosulAciklama}>{seciliKosul.description}</Text>
          )}

          <Secim<VoltageLevel>
            label="Gerilim seviyesi"
            secenekler={[
              { deger: '10kV', etiket: '10 kV' },
              { deger: '35kV', etiket: '35 kV' },
            ]}
            secili={voltageLevel}
            onSec={setVoltageLevel}
          />

          <NumberField
            label="Beklenen akım (opsiyonel)"
            value={beklenenAkimMetin}
            onChangeText={setBeklenenAkimMetin}
            suffix="A"
            placeholder="örn. 250"
          />
        </Card>

        {output ? (
          <Card
            style={[
              styles.sonucKart,
              output.isSuitable === true && { borderColor: colors.success },
              output.isSuitable === false && { borderColor: colors.danger },
            ]}
          >
            {output.isSuitable !== null && (
              <View
                style={[
                  styles.durumSerit,
                  { backgroundColor: output.isSuitable ? colors.success : colors.danger },
                ]}
              >
                <Text style={styles.durumText}>
                  {output.isSuitable ? '✓ UYGUN' : '✗ UYGUN DEĞİL'}
                </Text>
              </View>
            )}
            <SonucSatiri etiket="Akım taşıma kapasitesi" deger={`${tr(output.ampacityA, 0)} A`} vurgulu />
            {output.utilizationPercent != null && beklenenAkimSayi !== undefined && (
              <SonucSatiri etiket="Beklenen akım" deger={`${tr(beklenenAkimSayi, 0)} A`} />
            )}
            {output.utilizationPercent != null && (
              <SonucSatiri
                etiket="Kullanım oranı"
                deger={`%${tr(output.utilizationPercent)}`}
                renk={output.isSuitable ? colors.success : colors.danger}
              />
            )}
            <SonucSatiri etiket="Direnç (20°C)" deger={`${tr(output.resistance20OhmPerKm, 3)} Ω/km`} />
            <SonucSatiri etiket="Reaktans" deger={`${tr(output.reactanceOhmPerKm, 3)} Ω/km`} />
            <SonucSatiri etiket="Eşdeğer Cu kesiti" deger={`${tr(output.equivalentCuMm2, 1)} mm²`} />
            <SonucSatiri etiket="Anma çapı" deger={`${tr(output.nominalDiameterMm, 2)} mm`} />
            <SonucSatiri etiket="Anma kesiti" deger={`${tr(output.nominalAreaMm2, 1)} mm²`} />
            <SonucSatiri etiket="Anma ağırlığı" deger={`${tr(output.nominalWeightKgPerM, 3)} kg/m`} />
            <SonucSatiri etiket="Kopma dayanımı" deger={`${tr(output.breakingLoadKg, 0)} kg`} />
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
    backgroundColor: '#E8EEF5',
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  bilgiNotuText: { fontSize: 13, color: colors.primaryLight, lineHeight: 19, fontWeight: '600' },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
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
  kosulAciklama: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
    marginBottom: spacing.m,
    lineHeight: 16,
  },
  sonucKart: { borderWidth: 2, paddingTop: 0, overflow: 'hidden' },
  durumSerit: {
    marginHorizontal: -16,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  durumText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  uyariText: { fontSize: 12, color: colors.textMuted, marginTop: spacing.s, lineHeight: 17 },
  hataBaslik: { fontSize: 14, fontWeight: '800', color: colors.danger, marginBottom: spacing.s },
  hataText: { fontSize: 13, color: colors.text, marginBottom: 4, lineHeight: 18 },
});
