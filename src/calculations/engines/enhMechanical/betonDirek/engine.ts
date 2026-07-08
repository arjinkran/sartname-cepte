// betonDirek alt motoru — ENH beton direk seçimi.
//
// Algoritma:
//  1) Direk tipi (kategori) + açıklık + gerilim seviyesine göre katalogdan
//     temel adayları filtrele (fiziksel/sınıfsal uygunluk).
//  2) Kalan adayları emniyet katsayısına göre güvenlik oranıyla
//     uygun / kritik / uygunsuz olarak sınıflandır.
//  3) En küçük (en ekonomik) 'uygun' adayı Önerilen Direk, geri kalan
//     'uygun' adayları Alternatif Direkler, 'kritik' + 'uygunsuz'
//     adayları Kritik Uyarılar olarak döndür.
//
// ⚠️ Henüz gerçek moment/kuvvet fizik hesabı yapılmıyor — bkz. types.ts
// başlığı ve README.md.
import type { CalculationEngine, CalculationResult, CalculationWarning } from '../../../core/types.ts';
import { required, positiveNumber, oneOf, validateFields } from '../../../core/validation.ts';
import { makeWarning } from '../../../core/errors.ts';
import {
  BETON_DIREK_CONDUCTOR_TYPES,
  BETON_DIREK_ICE_REGIONS,
  BETON_DIREK_KATALOG,
  BETON_DIREK_POLE_TYPES,
  BETON_DIREK_UYGUN_ESIK_ORANI,
  BETON_DIREK_VOLTAGE_LEVELS,
  BETON_DIREK_WIND_ZONES,
} from './data.ts';
import type { BetonDirekAday, BetonDirekInput, BetonDirekOutput, BetonDirekSiniflandirma } from './types.ts';
import { BETON_DIREK_EXAMPLES } from './examples.ts';

export const BETON_DIREK_NOTICE =
  'Bu direk kataloğu ve sınıflandırma mantığı ön hazırlık aşamasındadır; gerçek moment/kuvvet hesabı "Enerji Nakil Hatları Cilt 1" ve kullanıcı Excel tablosu analizinden sonra eklenecektir.';

export function hesapla(input: BetonDirekInput): CalculationResult<BetonDirekOutput> {
  const errors = validateFields([
    () => required(input?.voltageLevelKv, 'voltageLevelKv'),
    () => oneOf(input?.voltageLevelKv, 'voltageLevelKv', BETON_DIREK_VOLTAGE_LEVELS),
    () => required(input?.poleType, 'poleType'),
    () => oneOf(input?.poleType, 'poleType', BETON_DIREK_POLE_TYPES),
    () => required(input?.windZone, 'windZone'),
    () => oneOf(input?.windZone, 'windZone', BETON_DIREK_WIND_ZONES),
    () => required(input?.iceRegion, 'iceRegion'),
    () => oneOf(input?.iceRegion, 'iceRegion', BETON_DIREK_ICE_REGIONS),
    () => required(input?.spanLengthM, 'spanLengthM'),
    () => positiveNumber(input?.spanLengthM, 'spanLengthM'),
    () => required(input?.conductorType, 'conductorType'),
    () => oneOf(input?.conductorType, 'conductorType', BETON_DIREK_CONDUCTOR_TYPES),
    () => required(input?.safetyFactor, 'safetyFactor'),
    () => positiveNumber(input?.safetyFactor, 'safetyFactor'),
  ]);

  if (errors.length > 0) {
    return { ok: false, output: null, warnings: [], errors };
  }

  // 1) Temel filtre: kategori + açıklık kapasitesi + gerilim uygunluğu.
  const temelUygunlar = BETON_DIREK_KATALOG.filter(
    (direk) =>
      direk.kategori === input.poleType &&
      direk.maxAcikinlikM >= input.spanLengthM &&
      direk.suitableVoltageLevels.includes(input.voltageLevelKv)
  );

  // 2) Emniyet katsayısına göre sınıflandır.
  const adaylar: BetonDirekAday[] = temelUygunlar.map((direk) => {
    const guvenlikOrani = direk.maxAcikinlikM / (input.spanLengthM * input.safetyFactor);
    const siniflandirma: BetonDirekSiniflandirma =
      guvenlikOrani >= BETON_DIREK_UYGUN_ESIK_ORANI ? 'uygun' : guvenlikOrani >= 1 ? 'kritik' : 'uygunsuz';
    return { direk, siniflandirma, guvenlikOrani };
  });

  // 3) Öneri: uygun adaylar arasından en küçük (en ekonomik) direk.
  const uygunlar = adaylar
    .filter((a) => a.siniflandirma === 'uygun')
    .sort((a, b) => a.direk.nominalMomentKgm - b.direk.nominalMomentKgm);
  const kritikUyarilar = adaylar
    .filter((a) => a.siniflandirma !== 'uygun')
    .sort((a, b) => b.guvenlikOrani - a.guvenlikOrani);

  const onerilenDirek = uygunlar[0] ?? null;
  const alternatifDirekler = uygunlar.slice(1);

  const warnings: CalculationWarning[] = [];
  if (!onerilenDirek) {
    warnings.push(
      makeWarning('NO_SUITABLE_POLE', 'Girilen kriterlere uygun (güvenli) bir direk bulunamadı.')
    );
  }

  return {
    ok: true,
    output: {
      onerilenDirek,
      alternatifDirekler,
      kritikUyarilar,
      kullanilanParametreler: {
        voltageLevelKv: input.voltageLevelKv,
        poleType: input.poleType,
        windZone: input.windZone,
        iceRegion: input.iceRegion,
        spanLengthM: input.spanLengthM,
        conductorType: input.conductorType,
        safetyFactor: input.safetyFactor,
      },
    },
    warnings,
    errors: [],
  };
}

export const BetonDirekEngine: CalculationEngine<BetonDirekInput, BetonDirekOutput> = {
  metadata: {
    id: 'enhMechanical.betonDirek',
    name: 'Beton Direk Seçimi',
    description: BETON_DIREK_NOTICE,
    version: '0.2.0-partial',
    author: 'Şartname Cepte Ekibi',
    standard: 'Enerji Nakil Hatları Cilt 1 — Beton Direk Seçimi (kısmi uygulama)',
    source: 'DEK Haller ve Sehim Hesapları.xlsx (BetonDirek sekmesi — henüz birebir aktarılmadı)',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
  },
  category: 'mechanical',
  isDemo: true,
  inputs: [
    { key: 'voltageLevelKv', label: 'Hat gerilimi', unit: 'none', required: true },
    { key: 'poleType', label: 'Direk tipi', unit: 'none', required: true },
    { key: 'windZone', label: 'Rüzgar bölgesi', unit: 'none', required: true },
    { key: 'iceRegion', label: 'Buz bölgesi', unit: 'none', required: true },
    { key: 'spanLengthM', label: 'Açıklık', unit: 'm', required: true },
    { key: 'conductorType', label: 'İletken tipi', unit: 'none', required: true },
    { key: 'safetyFactor', label: 'Emniyet katsayısı', unit: 'none', required: true },
  ],
  outputs: [
    { key: 'onerilenDirek', label: 'Önerilen direk', unit: 'none' },
    { key: 'alternatifDirekler', label: 'Alternatif direkler', unit: 'none' },
    { key: 'kritikUyarilar', label: 'Kritik uyarılar', unit: 'none' },
    { key: 'kullanilanParametreler', label: 'Kullanılan parametreler', unit: 'none' },
  ],
  constants: [],
  limits: [
    {
      key: 'guvenlikEsikOrani',
      label: 'Uygun/kritik güvenlik eşik oranı',
      value: BETON_DIREK_UYGUN_ESIK_ORANI,
      unit: 'none',
      description:
        'guvenlikOrani (maxAcikinlikM / (spanLengthM × safetyFactor)) bu değerin altındaysa direk "kritik", 1 değerinin altındaysa "uygunsuz" sınıflandırılır.',
    },
  ],
  examples: BETON_DIREK_EXAMPLES,
  references: [
    {
      label: 'Enerji Nakil Hatları Cilt 1 — Beton Direk Seçimi',
      note: 'Direk katalog verisi (data.ts) şu an MOCK\'tur; gerçek katalog ve kullanıcı Excel tablosuyla doğrulanacaktır. Gerçek eğilme momenti/rüzgar-buz yükü hesabı henüz eklenmedi.',
    },
  ],
  calculate: hesapla,
};
