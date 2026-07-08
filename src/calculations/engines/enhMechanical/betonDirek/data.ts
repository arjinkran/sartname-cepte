// betonDirek alt motoru — direk kataloğu ve doğrulama/sınıflandırma sabitleri.
//
// ⚠️ MOCK VERİ: "Enerji Nakil Hatları Cilt 1" beton direk seçimi bölümü ve
// kullanıcının sağlayacağı Excel tablosu ile doğrulanacaktır. Yükseklik/
// nominal moment sınıfları TEDAŞ tipi standart beton direk uygulamasındaki
// tipik değerlere yakın seçilmiştir; tepeKuvvetiKg, agirlikKg,
// maxAcikinlikM ve suitableVoltageLevels alanları şimdilik mühendislik
// tahminidir, gerçek katalog verisiyle birebir değiştirilecektir.
import type { ConductorType, IceRegion, PoleType, VoltageLevelKv } from '../types.ts';
import type { BetonDirek, WindZone } from './types.ts';

export const BETON_DIREK_VOLTAGE_LEVELS: readonly VoltageLevelKv[] = [34.5, 154];

export const BETON_DIREK_WIND_ZONES: readonly WindZone[] = [1, 2, 3, 4];

export const BETON_DIREK_ICE_REGIONS: readonly IceRegion[] = [1, 2, 3, 4, 5];

export const BETON_DIREK_CONDUCTOR_TYPES: readonly ConductorType[] = [
  '3-awg',
  '1-0-awg',
  '3-0-awg',
  '266-8-mcm',
  '477-mcm-hawk',
];

/** Beton direk kataloğunda görülen kategoriler (parent PoleType'ın alt kümesi — 'sek-d'/'demir' beton değildir). */
export const BETON_DIREK_POLE_TYPES: readonly PoleType[] = [
  'tek-devre',
  'cift-devre-cam',
  'cift-devre-fici',
  'dort-devre',
];

/**
 * Güvenlik oranı = maxAcikinlikM / (spanLengthM × safetyFactor).
 * >= bu eşik → 'uygun'; 1 ile eşik arası → 'kritik'; < 1 → 'uygunsuz'.
 */
export const BETON_DIREK_UYGUN_ESIK_ORANI = 1.15;

export const BETON_DIREK_KATALOG: readonly BetonDirek[] = [
  {
    id: 'bd-8-400',
    kod: 'B8/400',
    yukseklikM: 8,
    nominalMomentKgm: 400,
    tepeKuvvetiKg: 60,
    agirlikKg: 450,
    gomulmeDerinligiM: 1.3,
    maxAcikinlikM: 60,
    kategori: 'tek-devre',
    suitableVoltageLevels: [34.5],
  },
  {
    id: 'bd-9-400',
    kod: 'B9/400',
    yukseklikM: 9,
    nominalMomentKgm: 400,
    tepeKuvvetiKg: 53,
    agirlikKg: 500,
    gomulmeDerinligiM: 1.4,
    maxAcikinlikM: 70,
    kategori: 'tek-devre',
    suitableVoltageLevels: [34.5],
  },
  {
    id: 'bd-9-600',
    kod: 'B9/600',
    yukseklikM: 9,
    nominalMomentKgm: 600,
    tepeKuvvetiKg: 79,
    agirlikKg: 600,
    gomulmeDerinligiM: 1.4,
    maxAcikinlikM: 90,
    kategori: 'cift-devre-cam',
    suitableVoltageLevels: [34.5],
  },
  {
    id: 'bd-10-800',
    kod: 'B10/800',
    yukseklikM: 10,
    nominalMomentKgm: 800,
    tepeKuvvetiKg: 94,
    agirlikKg: 750,
    gomulmeDerinligiM: 1.5,
    maxAcikinlikM: 110,
    kategori: 'cift-devre-cam',
    suitableVoltageLevels: [34.5, 154],
  },
  {
    id: 'bd-11-1000',
    kod: 'B11/1000',
    yukseklikM: 11,
    nominalMomentKgm: 1000,
    tepeKuvvetiKg: 106,
    agirlikKg: 900,
    gomulmeDerinligiM: 1.6,
    maxAcikinlikM: 130,
    kategori: 'cift-devre-fici',
    suitableVoltageLevels: [34.5, 154],
  },
  {
    id: 'bd-12-1200',
    kod: 'B12/1200',
    yukseklikM: 12,
    nominalMomentKgm: 1200,
    tepeKuvvetiKg: 117,
    agirlikKg: 1100,
    gomulmeDerinligiM: 1.7,
    maxAcikinlikM: 150,
    kategori: 'cift-devre-fici',
    suitableVoltageLevels: [154],
  },
  {
    id: 'bd-13-1600',
    kod: 'B13/1600',
    yukseklikM: 13,
    nominalMomentKgm: 1600,
    tepeKuvvetiKg: 143,
    agirlikKg: 1350,
    gomulmeDerinligiM: 1.8,
    maxAcikinlikM: 180,
    kategori: 'dort-devre',
    suitableVoltageLevels: [154],
  },
  {
    id: 'bd-14-2000',
    kod: 'B14/2000',
    yukseklikM: 14,
    nominalMomentKgm: 2000,
    tepeKuvvetiKg: 165,
    agirlikKg: 1600,
    gomulmeDerinligiM: 1.9,
    maxAcikinlikM: 200,
    kategori: 'dort-devre',
    suitableVoltageLevels: [154],
  },
];
