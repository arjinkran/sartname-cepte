// Gerilim Düşümü hesaplayıcısı — src/calculations altyapısına bağlı DEMO ekranı.
// UI hesap yapmaz: tüm hesap mantığı VoltageDropEngine (src/calculations/
// engines/voltageDrop) içindedir. Gerçek Excel formülleri henüz eklenmedi.
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Card, NumberField, Secim, SonucSatiri, tr } from '../../src/common/components/UI';
import { VoltageDropEngine } from '../../src/calculations';
import type { PhaseType, VoltageDropInput } from '../../src/calculations/engines/voltageDrop/types';
import { colors, spacing } from '../../src/theme';

// Metin girişini sayıya çevirir ("12,5" → 12.5); bu bir UI girdi ayrıştırma
// yardımcısıdır, hesap mantığı değildir.
function sayiyaCevir(metin: string): number {
  if (typeof metin !== 'string' || metin.trim() === '') return NaN;
  return Number(metin.replace(',', '.'));
}

const VARSAYILAN_GERILIM: Record<PhaseType, number> = { mono: 230, tri: 400 };

export default function GerilimDusumu() {
  const [faz, setFaz] = useState<PhaseType>('tri');
  const [gerilim, setGerilim] = useState(String(VARSAYILAN_GERILIM.tri));
  const [akim, setAkim] = useState('');
  const [uzunluk, setUzunluk] = useState('');
  const [direnc, setDirenc] = useState('');

  // Faz değişince şebeke gerilimini de varsayılana çek
  const fazSec = (yeniFaz: PhaseType) => {
    setFaz(yeniFaz);
    setGerilim(String(VARSAYILAN_GERILIM[yeniFaz]));
  };

  const girdiTamam = [akim, uzunluk, direnc].every((v) => v.trim() !== '');

  const sonuc = useMemo(() => {
    const input: VoltageDropInput = {
      voltage: sayiyaCevir(gerilim),
      current: sayiyaCevir(akim),
      length: sayiyaCevir(uzunluk),
      resistancePerKm: sayiyaCevir(direnc),
      phaseType: faz,
    };
    return VoltageDropEngine.calculate(input);
  }, [faz, gerilim, akim, uzunluk, direnc]);

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
        {VoltageDropEngine.isDemo && (
          <View style={styles.demoUyari}>
            <Text style={styles.demoUyariText}>⚠️ {VoltageDropEngine.metadata.description}</Text>
          </View>
        )}

        <Card>
          <Secim<PhaseType>
            label="Faz tipi"
            secenekler={[
              { deger: 'mono', etiket: 'Monofaze' },
              { deger: 'tri', etiket: 'Trifaze' },
            ]}
            secili={faz}
            onSec={fazSec}
          />
          <NumberField label="Şebeke gerilimi" value={gerilim} onChangeText={setGerilim} suffix="V" />
          <NumberField label="Akım" value={akim} onChangeText={setAkim} suffix="A" placeholder="örn. 30" />
          <NumberField label="Hat uzunluğu" value={uzunluk} onChangeText={setUzunluk} suffix="m" placeholder="örn. 80" />
          <NumberField
            label="İletken direnci"
            value={direnc}
            onChangeText={setDirenc}
            suffix="Ω/km"
            placeholder="örn. 1,5"
          />
        </Card>

        {!girdiTamam ? (
          <Card>
            <Text style={styles.bekleme}>
              Sonucu görmek için akım, hat uzunluğu ve iletken direnci değerlerini girin.
            </Text>
          </Card>
        ) : output ? (
          <Card
            style={[
              styles.sonucKart,
              { borderColor: output.isWithinLimit ? colors.success : colors.danger },
            ]}
          >
            <View
              style={[
                styles.durumSerit,
                { backgroundColor: output.isWithinLimit ? colors.success : colors.danger },
              ]}
            >
              <Text style={styles.durumText}>
                {output.isWithinLimit ? '✓ UYGUN' : '✗ LİMİT AŞILIYOR'}
              </Text>
            </View>
            <SonucSatiri
              etiket="Gerilim düşümü"
              deger={`%${tr(output.voltageDropPercent)}`}
              vurgulu
              renk={output.isWithinLimit ? colors.success : colors.danger}
            />
            <SonucSatiri etiket="Düşüm (volt)" deger={`${tr(output.voltageDropVolt)} V`} />
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
  demoUyari: {
    backgroundColor: '#FBE9C9',
    borderRadius: 10,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  demoUyariText: { fontSize: 13, color: '#8C6D1F', lineHeight: 19, fontWeight: '600' },
  sonucKart: { borderWidth: 2, paddingTop: 0, overflow: 'hidden' },
  durumSerit: {
    marginHorizontal: -16,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  durumText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  uyariText: { fontSize: 12, color: colors.textMuted, marginTop: spacing.s, lineHeight: 17 },
  bekleme: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.s },
  hataBaslik: { fontSize: 14, fontWeight: '800', color: colors.danger, marginBottom: spacing.s },
  hataText: { fontSize: 13, color: colors.text, marginBottom: 4, lineHeight: 18 },
});
