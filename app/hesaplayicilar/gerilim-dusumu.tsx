// Gerilim Düşümü hesaplayıcısı (StyleSheet tabanlı sade sürüm).
// Girdiler: faz tipi, iletken malzemesi, hat uzunluğu, güç, kesit,
// gerilim (düzenlenebilir), izin verilen limit.
// Çıktılar: %e, ΔU (V), yük akımı, uygunluk ve önerilen minimum kesit.
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Card, NumberField, Secim, YongaSecimi, SonucSatiri, tr } from '../../src/common/components/UI';
import {
  hesaplaGerilimDusumu,
  gerekliMinKesit,
  hesaplaAkim,
  sayiyaCevir,
} from '../../src/logic/gerilimDusumu';
import {
  STANDART_KESITLER,
  GERILIM_DUSUMU_LIMITLERI,
  VARSAYILAN_GERILIM,
  type Faz,
  type Malzeme,
} from '../../src/data/elektrik';
import { colors, spacing } from '../../src/theme';

export default function GerilimDusumu() {
  const [faz, setFaz] = useState<Faz>('tri');
  const [malzeme, setMalzeme] = useState<Malzeme>('bakir');
  const [uzunluk, setUzunluk] = useState('');
  const [guc, setGuc] = useState('');
  const [kesit, setKesit] = useState(4);
  const [gerilim, setGerilim] = useState(String(VARSAYILAN_GERILIM.tri));
  const [limit, setLimit] = useState(3);
  const [cosfi, setCosfi] = useState('0,90');

  // Faz değişince şebeke gerilimini de varsayılana çek
  const fazSec = (yeniFaz: Faz) => {
    setFaz(yeniFaz);
    setGerilim(String(VARSAYILAN_GERILIM[yeniFaz]));
  };

  const sonuc = useMemo(() => {
    const L = sayiyaCevir(uzunluk);
    const P_kW = sayiyaCevir(guc);
    const U = sayiyaCevir(gerilim);
    const cf = sayiyaCevir(cosfi);
    if (!(L > 0) || !(P_kW > 0) || !(U > 0)) return null;
    try {
      const { eYuzde, deltaU } = hesaplaGerilimDusumu({ faz, L, P_kW, S: kesit, U, malzeme });
      const min = gerekliMinKesit({ faz, L, P_kW, U, malzeme, limitYuzde: limit });
      const akim = cf > 0 && cf <= 1 ? hesaplaAkim({ faz, P_kW, U, cosfi: cf }) : null;
      return { eYuzde, deltaU, min, akim, uygun: eYuzde <= limit };
    } catch {
      return null;
    }
  }, [faz, malzeme, uzunluk, guc, kesit, gerilim, limit, cosfi]);

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
        <Card>
          <Secim<Faz>
            label="Faz tipi"
            secenekler={[
              { deger: 'mono', etiket: 'Monofaze' },
              { deger: 'tri', etiket: 'Trifaze' },
            ]}
            secili={faz}
            onSec={fazSec}
          />
          <Secim<Malzeme>
            label="İletken malzemesi"
            secenekler={[
              { deger: 'bakir', etiket: 'Bakır (k=56)' },
              { deger: 'aluminyum', etiket: 'Alüminyum (k=35)' },
            ]}
            secili={malzeme}
            onSec={setMalzeme}
          />
          <NumberField label="Hat uzunluğu" value={uzunluk} onChangeText={setUzunluk} suffix="m" placeholder="örn. 80" />
          <NumberField label="Güç" value={guc} onChangeText={setGuc} suffix="kW" placeholder="örn. 15" />
          <YongaSecimi
            label="Kablo kesiti (mm²)"
            degerler={STANDART_KESITLER}
            secili={kesit}
            onSec={setKesit}
            bicim={(s) => tr(s, s % 1 === 0 ? 0 : 1)}
          />
          <View style={styles.yanYana}>
            <View style={{ flex: 1, marginRight: spacing.s }}>
              <NumberField label="Şebeke gerilimi" value={gerilim} onChangeText={setGerilim} suffix="V" />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.s }}>
              <NumberField label="cosφ (akım için)" value={cosfi} onChangeText={setCosfi} />
            </View>
          </View>
          <Secim<number>
            label="İzin verilen düşüm limiti"
            secenekler={GERILIM_DUSUMU_LIMITLERI}
            secili={limit}
            onSec={setLimit}
          />
        </Card>

        {sonuc ? (
          <Card
            style={[
              styles.sonucKart,
              { borderColor: sonuc.uygun ? colors.success : colors.danger },
            ]}
          >
            <View
              style={[
                styles.durumSerit,
                { backgroundColor: sonuc.uygun ? colors.success : colors.danger },
              ]}
            >
              <Text style={styles.durumText}>
                {sonuc.uygun ? '✓ UYGUN' : '✗ LİMİT AŞILIYOR'} (limit %{tr(limit, 1)})
              </Text>
            </View>
            <SonucSatiri
              etiket="Gerilim düşümü"
              deger={`%${tr(sonuc.eYuzde)}`}
              vurgulu
              renk={sonuc.uygun ? colors.success : colors.danger}
            />
            <SonucSatiri etiket="Düşüm (volt)" deger={`${tr(sonuc.deltaU)} V`} />
            {sonuc.akim != null && <SonucSatiri etiket="Yük akımı" deger={`${tr(sonuc.akim)} A`} />}
            <SonucSatiri
              etiket="Limite göre min. kesit"
              deger={
                sonuc.min.standart
                  ? `${tr(sonuc.min.standart, sonuc.min.standart % 1 === 0 ? 0 : 1)} mm²`
                  : '300 mm² yetersiz!'
              }
            />
            <Text style={styles.uyari}>
              Omik düşüm yaklaşımıdır; büyük kesit ve uzun hatlarda reaktans etkisini
              ayrıca değerlendirin. Kesin tasarımda yönetmelik ve şartname esastır.
            </Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.bekleme}>
              Sonucu görmek için hat uzunluğu ve güç değerlerini girin.
            </Text>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  yanYana: { flexDirection: 'row' },
  sonucKart: { borderWidth: 2, paddingTop: 0, overflow: 'hidden' },
  durumSerit: {
    marginHorizontal: -16,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  durumText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  uyari: { fontSize: 12, color: colors.textMuted, marginTop: spacing.m, lineHeight: 17 },
  bekleme: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.s },
});
