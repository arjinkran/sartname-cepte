// enhMechanical motoru — demo örnek giriş/çıktı çiftleri.
// Motor henüz iskelet aşamasında olduğu için her örneğin çıktısı
// `status: 'notImplemented'` olur; buradaki amaç, her alt hesap türü
// için GEÇERLİ bir girdi kombinasyonunu belgelemektir. `output` mesajları
// engine.ts'teki mesaj biçimiyle senkron tutulur (bkz.
// tests/calculations/enhMechanical.test.ts).
import type { CalculationExample } from '../../core/types.ts';
import type { EnhMechanicalInput, EnhMechanicalOutput } from './types.ts';

export const ENH_MECHANICAL_EXAMPLES: readonly CalculationExample<EnhMechanicalInput, EnhMechanicalOutput>[] = [
  {
    id: 'beton-direk-secimi-ornek',
    title: 'Beton Direk Seçimi — 34,5 kV, Tek Devre',
    input: { calcType: 'betonDirekSecimi', voltageLevelKv: 34.5, poleType: 'tek-devre' },
    output: {
      calcType: 'betonDirekSecimi',
      status: 'notImplemented',
      message: 'Beton Direk Seçimi: Bu hesap Excel analizinden sonra aktif edilecektir.',
    },
  },
  {
    id: 'degisik-haller-denklemi-ornek',
    title: 'Değişik Haller Denklemi — 1/0 AWG, buz bölgesi 3',
    input: { calcType: 'degisikHallerDenklemi', conductorType: '1-0-awg', iceRegion: 3, temperatureC: -5 },
    output: {
      calcType: 'degisikHallerDenklemi',
      status: 'notImplemented',
      message: 'Değişik Haller Denklemi: Bu hesap Excel analizinden sonra aktif edilecektir.',
    },
  },
  {
    id: 'sehim-serbest-ornek',
    title: 'Sehim Tablosu (Serbest) — 266.8 MCM, 150 m açıklık',
    input: { calcType: 'sehimSerbest', conductorType: '266-8-mcm', spanLengthM: 150 },
    output: {
      calcType: 'sehimSerbest',
      status: 'notImplemented',
      message: 'Sehim Tablosu (Serbest): Bu hesap Excel analizinden sonra aktif edilecektir.',
    },
  },
  {
    id: 'sehim-ozel-ornek',
    title: 'Özel Sehim — 477 MCM HAWK, izolatör 1,2 m',
    input: { calcType: 'sehimOzel', conductorType: '477-mcm-hawk', insulatorLengthM: 1.2 },
    output: {
      calcType: 'sehimOzel',
      status: 'notImplemented',
      message: 'Özel Sehim: Bu hesap Excel analizinden sonra aktif edilecektir.',
    },
  },
  {
    id: 'df-ds-hesabi-ornek',
    title: 'Df / Ds Hesabı — buz bölgesi 5',
    input: { calcType: 'dfDsHesabi', iceRegion: 5 },
    output: {
      calcType: 'dfDsHesabi',
      status: 'notImplemented',
      message: 'Df / Ds Hesabı: Bu hesap Excel analizinden sonra aktif edilecektir.',
    },
  },
  {
    id: 'amax-hesabi-ornek',
    title: 'Amax Hesabı — azami çekme kuvveti 2000 kg',
    input: { calcType: 'amaxHesabi', maxTensionKg: 2000 },
    output: {
      calcType: 'amaxHesabi',
      status: 'notImplemented',
      message: 'Amax Hesabı: Bu hesap Excel analizinden sonra aktif edilecektir.',
    },
  },
];
