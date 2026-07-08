// Beton Direk Seçimi hesaplayıcısı — src/calculations altyapısına bağlı
// ekran. UI hesap yapmaz: tüm mantık BetonDirekEngine içindedir
// (bkz. src/calculations/engines/enhMechanical/betonDirek).
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Card, NumberField, Secim, SonucSatiri, tr } from '../../src/common/components/UI';
import { BetonDirekEngine } from '../../src/calculations';
import {
  BETON_DIREK_CONDUCTOR_TYPES,
  BETON_DIREK_ICE_REGIONS,
  BETON_DIREK_POLE_TYPES,
  BETON_DIREK_VOLTAGE_LEVELS,
  BETON_DIREK_WIND_ZONES,
} from '../../src/calculations/engines/enhMechanical/betonDirek/data';
import type { BetonDirekAday, WindZone } from '../../src/calculations/engines/enhMechanical/betonDirek/types';
import { ENH_CONDUCTOR_TYPES, ENH_POLE_TYPES } from '../../src/calculations/engines/enhMechanical/data';
import type { ConductorType, IceRegion, PoleType, VoltageLevelKv } from '../../src/calculations/engines/enhMechanical/types';
import { colors, spacing, radius } from '../../src/theme';

// Metin girişini sayıya çevirir ("1,5" → 1.5); UI girdi ayrıştırma
// yardımcısıdır, hesap mantığı değildir.
function sayiyaCevir(metin: string): number {
  if (typeof metin !== 'string' || metin.trim() === '') return NaN;
  return Number(metin.replace(',', '.'));
}

const POLE_TYPE_LABELS = new Map(ENH_POLE_TYPES.map((p) => [p.id, p.label]));
const CONDUCTOR_TYPE_LABELS = new Map(ENH_CONDUCTOR_TYPES.map((c) => [c.id, c.label]));
const SINIFLANDIRMA_ETIKETLERI = { uygun: 'Uygun', kritik: 'Kritik', uygunsuz: 'Uygun Değil' } as const;
const SINIFLANDIRMA_RENKLERI = { uygun: '#1E8E3E', kritik: '#B07A0E', uygunsuz: '#C5221F' } as const;

function Yonga({ etiket, aktif, onPress }: { etiket: string; aktif: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.yonga, aktif && styles.yongaAktif]}>
      <Text style={[styles.yongaText, aktif && styles.yongaTextAktif]}>{etiket}</Text>
    </Pressable>
  );
}

function DirekSatiri({ aday, vurgulu }: { aday: BetonDirekAday; vurgulu?: boolean }) {
  return (
    <View style={[styles.direkSatir, vurgulu && styles.direkSatirVurgulu]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.direkKod}>{aday.direk.kod}</Text>
        <Text style={styles.direkDetay}>
          {tr(aday.direk.yukseklikM, 0)} m · {tr(aday.direk.nominalMomentKgm, 0)} kgm · maks {tr(aday.direk.maxAcikinlikM, 0)} m açıklık
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <View style={[styles.rozet, { backgroundColor: SINIFLANDIRMA_RENKLERI[aday.siniflandirma] }]}>
          <Text style={styles.rozetText}>{SINIFLANDIRMA_ETIKETLERI[aday.siniflandirma]}</Text>
        </View>
        <Text style={styles.demoIbare}>demo</Text>
      </View>
    </View>
  );
}

export default function BetonDirek() {
  const [voltageLevelKv, setVoltageLevelKv] = useState<VoltageLevelKv>(BETON_DIREK_VOLTAGE_LEVELS[0]!);
  const [poleType, setPoleType] = useState<PoleType>(BETON_DIREK_POLE_TYPES[0]!);
  const [windZone, setWindZone] = useState<WindZone>(BETON_DIREK_WIND_ZONES[0]!);
  const [iceRegion, setIceRegion] = useState<IceRegion>(BETON_DIREK_ICE_REGIONS[0]!);
  const [spanLengthMetin, setSpanLengthMetin] = useState('');
  const [conductorType, setConductorType] = useState<ConductorType>(BETON_DIREK_CONDUCTOR_TYPES[0]!);
  const [safetyFactorMetin, setSafetyFactorMetin] = useState('1,5');

  const girdiTamam = spanLengthMetin.trim() !== '' && safetyFactorMetin.trim() !== '';

  const sonuc = useMemo(
    () =>
      BetonDirekEngine.calculate({
        voltageLevelKv,
        poleType,
        windZone,
        iceRegion,
        spanLengthM: sayiyaCevir(spanLengthMetin),
        conductorType,
        safetyFactor: sayiyaCevir(safetyFactorMetin),
      }),
    [voltageLevelKv, poleType, windZone, iceRegion, spanLengthMetin, conductorType, safetyFactorMetin]
  );

  const output = sonuc.output;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {BetonDirekEngine.isDemo && (
          <View style={styles.bilgiNotu}>
            <Text style={styles.bilgiNotuBaslik}>⚠️ MOCK VERİ — ÖN HAZIRLIK AŞAMASI</Text>
            <Text style={styles.bilgiNotuText}>{BetonDirekEngine.metadata.description}</Text>
          </View>
        )}

        <Card>
          <Secim<VoltageLevelKv>
            label="Hat gerilimi"
            secenekler={BETON_DIREK_VOLTAGE_LEVELS.map((v) => ({ deger: v, etiket: `${tr(v, 1)} kV` }))}
            secili={voltageLevelKv}
            onSec={setVoltageLevelKv}
          />

          <Text style={styles.fieldLabel}>Direk tipi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {BETON_DIREK_POLE_TYPES.map((p) => (
              <Yonga key={p} etiket={POLE_TYPE_LABELS.get(p) ?? p} aktif={poleType === p} onPress={() => setPoleType(p)} />
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Rüzgar bölgesi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {BETON_DIREK_WIND_ZONES.map((z) => (
              <Yonga key={z} etiket={String(z)} aktif={windZone === z} onPress={() => setWindZone(z)} />
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Buz bölgesi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {BETON_DIREK_ICE_REGIONS.map((z) => (
              <Yonga key={z} etiket={String(z)} aktif={iceRegion === z} onPress={() => setIceRegion(z)} />
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>İletken tipi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yongaSatiri}>
            {BETON_DIREK_CONDUCTOR_TYPES.map((c) => (
              <Yonga
                key={c}
                etiket={CONDUCTOR_TYPE_LABELS.get(c) ?? c}
                aktif={conductorType === c}
                onPress={() => setConductorType(c)}
              />
            ))}
          </ScrollView>

          <NumberField label="Açıklık" value={spanLengthMetin} onChangeText={setSpanLengthMetin} suffix="m" placeholder="örn. 60" />
          <NumberField
            label="Emniyet katsayısı"
            value={safetyFactorMetin}
            onChangeText={setSafetyFactorMetin}
            placeholder="örn. 1,5"
          />
        </Card>

        {!girdiTamam ? (
          <Card>
            <Text style={styles.bekleme}>Sonucu görmek için açıklık ve emniyet katsayısı değerlerini girin.</Text>
          </Card>
        ) : output ? (
          <>
            <View style={styles.sonucUyarisi}>
              <Text style={styles.sonucUyarisiText}>
                ⚠️ Bu sonuç gerçek proje hesabı değildir. Direk kataloğu ve moment hesabı resmi kaynak / Excel analizi ile doğrulanmadan mühendislik kararı için kullanılmamalıdır.
              </Text>
            </View>

            <Card>
              <View style={styles.onHazirlikRozet}>
                <Text style={styles.onHazirlikRozetText}>ÖN HAZIRLIK SONUCU</Text>
              </View>
              <Text style={styles.bolumBaslik}>Önerilen Direk</Text>
              {output.onerilenDirek ? (
                <DirekSatiri aday={output.onerilenDirek} vurgulu />
              ) : (
                <Text style={styles.bosText}>Girilen kriterlere uygun (güvenli) bir direk bulunamadı.</Text>
              )}
            </Card>

            {output.alternatifDirekler.length > 0 && (
              <Card>
                <Text style={styles.bolumBaslik}>Alternatif Direkler</Text>
                {output.alternatifDirekler.map((a) => (
                  <DirekSatiri key={a.direk.id} aday={a} />
                ))}
              </Card>
            )}

            {output.kritikUyarilar.length > 0 && (
              <Card style={{ borderColor: colors.accent, borderWidth: 1.5 }}>
                <Text style={styles.bolumBaslik}>Kritik Uyarılar</Text>
                {output.kritikUyarilar.map((a) => (
                  <DirekSatiri key={a.direk.id} aday={a} />
                ))}
              </Card>
            )}

            <Card>
              <Text style={styles.bolumBaslik}>Kullanılan Parametreler</Text>
              <SonucSatiri etiket="Hat gerilimi" deger={`${tr(output.kullanilanParametreler.voltageLevelKv, 1)} kV`} />
              <SonucSatiri etiket="Direk tipi" deger={POLE_TYPE_LABELS.get(output.kullanilanParametreler.poleType) ?? output.kullanilanParametreler.poleType} />
              <SonucSatiri etiket="Rüzgar bölgesi" deger={String(output.kullanilanParametreler.windZone)} />
              <SonucSatiri etiket="Buz bölgesi" deger={String(output.kullanilanParametreler.iceRegion)} />
              <SonucSatiri etiket="Açıklık" deger={`${tr(output.kullanilanParametreler.spanLengthM, 0)} m`} />
              <SonucSatiri
                etiket="İletken tipi"
                deger={CONDUCTOR_TYPE_LABELS.get(output.kullanilanParametreler.conductorType) ?? output.kullanilanParametreler.conductorType}
              />
              <SonucSatiri etiket="Emniyet katsayısı" deger={tr(output.kullanilanParametreler.safetyFactor, 2)} />
            </Card>

            {sonuc.warnings.map((w) => (
              <Text key={w.code} style={styles.uyariText}>⚠ {w.message}</Text>
            ))}
          </>
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
  sonucUyarisi: {
    backgroundColor: '#F8DCDA',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.danger,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  sonucUyarisiText: { fontSize: 13, color: colors.danger, lineHeight: 19, fontWeight: '700' },
  onHazirlikRozet: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: spacing.s,
  },
  onHazirlikRozetText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  demoIbare: { fontSize: 10, color: colors.disabled, fontWeight: '700', marginTop: 2 },
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
  bosText: { fontSize: 14, color: colors.textMuted },
  direkSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  direkSatirVurgulu: { paddingVertical: 10 },
  direkKod: { fontSize: 15, fontWeight: '700', color: colors.text },
  direkDetay: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rozet: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: spacing.s },
  rozetText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  uyariText: { fontSize: 12, color: colors.textMuted, marginTop: spacing.s, lineHeight: 17 },
  hataBaslik: { fontSize: 14, fontWeight: '800', color: colors.danger, marginBottom: spacing.s },
  hataText: { fontSize: 13, color: colors.text, marginBottom: 4, lineHeight: 18 },
});
