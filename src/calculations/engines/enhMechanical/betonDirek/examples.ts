// betonDirek alt motoru — demo örnek giriş/çıktı çiftleri.
// `output` değerleri data.ts kataloğundan ve BETON_DIREK_UYGUN_ESIK_ORANI
// eşiğinden elle türetilmiştir (motoru circular-import'a sokmamak için
// engine.ts'e bağımlı DEĞİLDİR). tests/calculations/betonDirek.test.ts,
// bu değerlerin gerçek motorla senkron kaldığını doğrular.
import type { CalculationExample } from '../../../core/types.ts';
import type { BetonDirekInput, BetonDirekOutput } from './types.ts';
import { BETON_DIREK_KATALOG } from './data.ts';

const bd8400 = BETON_DIREK_KATALOG.find((d) => d.id === 'bd-8-400')!;
const bd9400 = BETON_DIREK_KATALOG.find((d) => d.id === 'bd-9-400')!;
const bd9600 = BETON_DIREK_KATALOG.find((d) => d.id === 'bd-9-600')!;
const bd10800 = BETON_DIREK_KATALOG.find((d) => d.id === 'bd-10-800')!;

export const BETON_DIREK_EXAMPLES: readonly CalculationExample<BetonDirekInput, BetonDirekOutput>[] = [
  {
    id: 'tek-devre-345kv-uygun',
    title: 'Tek Devre, 34,5 kV, 40 m açıklık — uygun direk bulunur',
    input: {
      voltageLevelKv: 34.5,
      poleType: 'tek-devre',
      windZone: 1,
      iceRegion: 1,
      spanLengthM: 40,
      conductorType: '3-awg',
      safetyFactor: 1.2,
    },
    output: {
      onerilenDirek: { direk: bd8400, siniflandirma: 'uygun', guvenlikOrani: 60 / (40 * 1.2) },
      alternatifDirekler: [{ direk: bd9400, siniflandirma: 'uygun', guvenlikOrani: 70 / (40 * 1.2) }],
      kritikUyarilar: [],
      kullanilanParametreler: {
        voltageLevelKv: 34.5,
        poleType: 'tek-devre',
        windZone: 1,
        iceRegion: 1,
        spanLengthM: 40,
        conductorType: '3-awg',
        safetyFactor: 1.2,
      },
    },
  },
  {
    id: 'cift-devre-cam-345kv-kritik',
    title: 'Çift Devre ÇAM, 34,5 kV, 85 m açıklık — bir kritik uyarı içerir',
    input: {
      voltageLevelKv: 34.5,
      poleType: 'cift-devre-cam',
      windZone: 2,
      iceRegion: 2,
      spanLengthM: 85,
      conductorType: '1-0-awg',
      safetyFactor: 1.0,
    },
    output: {
      onerilenDirek: { direk: bd10800, siniflandirma: 'uygun', guvenlikOrani: 110 / 85 },
      alternatifDirekler: [],
      kritikUyarilar: [{ direk: bd9600, siniflandirma: 'kritik', guvenlikOrani: 90 / 85 }],
      kullanilanParametreler: {
        voltageLevelKv: 34.5,
        poleType: 'cift-devre-cam',
        windZone: 2,
        iceRegion: 2,
        spanLengthM: 85,
        conductorType: '1-0-awg',
        safetyFactor: 1.0,
      },
    },
    description: 'Az önerilir bir aday olmasa da, güvenlik oranı 1 ile eşik arasında olan direkler Kritik Uyarılar bölümünde listelenir.',
  },
  {
    id: 'dort-devre-345kv-bos-sonuc',
    title: '4 Devre, 34,5 kV — kataloğa uygun (bu gerilim için) direk yok',
    input: {
      voltageLevelKv: 34.5,
      poleType: 'dort-devre',
      windZone: 1,
      iceRegion: 1,
      spanLengthM: 100,
      conductorType: '477-mcm-hawk',
      safetyFactor: 1.0,
    },
    output: {
      onerilenDirek: null,
      alternatifDirekler: [],
      kritikUyarilar: [],
      kullanilanParametreler: {
        voltageLevelKv: 34.5,
        poleType: 'dort-devre',
        windZone: 1,
        iceRegion: 1,
        spanLengthM: 100,
        conductorType: '477-mcm-hawk',
        safetyFactor: 1.0,
      },
    },
    description: 'Kataloğdaki tüm "dort-devre" direkleri yalnızca 154 kV desteklediği için 34,5 kV isteğinde boş sonuç döner.',
  },
];
