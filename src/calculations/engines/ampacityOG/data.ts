// ampacityOG motoru — Excel'den aktarılan iletken veri tabanı.
//
// KAYNAK NOTU: "OG Akım Taşıma Kapasitesi" Excel dosyasından yalnızca
// aşağıdaki 3 değer doğrudan verilmiştir ve BİREBİR korunmuştur:
//   - HAWK, condition3  → ampacityCondition3A = 740
//   - SWALLOW, condition1 → ampacityCondition1A = 120
//   - RAVEN, 35 kV reaktans → reactance35kVOhmPerKm = 0.387
// Bu üç değer tests/calculations/ampacityOG.test.ts içinde doğrulanır ve
// DEĞİŞTİRİLMEMELİDİR.
//
// Geri kalan alanlar (boyut/ağırlık/direnç: gerçek ACSR üretici tablolarından
// [Priority Wire ACSR #4020-03, Nexans AWG serisi] metrik birime çevrilerek;
// diğer koşul/gerilim kombinasyonlarındaki ampacity ve reaktans değerleri:
// yukarıdaki 3 sabit noktaya kalibre edilmiş, fiziksel olarak tutarlı
// mühendislik tahminleriyle) doldurulmuştur. Gerçek Excel dosyasına erişim
// sağlandığında bu dosya birebir üzerine yazılmalıdır — bkz.
// modules/calculations/README.md "Excel'den engine'e dönüşüm adımları".

import type { AmpacityCondition, AmpacityConductor, VoltageLevel } from './types.ts';

export const AMPACITY_VOLTAGE_LEVELS: readonly VoltageLevel[] = ['10kV', '35kV'];

export const AMPACITY_CONDITIONS: readonly AmpacityCondition[] = [
  {
    id: 'condition1',
    name: 'Koşul 1',
    windSpeedMs: 0,
    ambientTempC: 40,
    conductorSurfacePercent: 80,
    hasSolarHeat: false,
    description: 'Rüzgarsız, sıcak ortam (40°C), güneş ısısı yok.',
  },
  {
    id: 'condition2',
    name: 'Koşul 2',
    windSpeedMs: 0.61,
    ambientTempC: 25,
    conductorSurfacePercent: 75,
    hasSolarHeat: false,
    description: 'Hafif rüzgar (0,61 m/sn), ılıman ortam (25°C), güneş ısısı yok.',
  },
  {
    id: 'condition3',
    name: 'Koşul 3',
    windSpeedMs: 0.6,
    ambientTempC: 20,
    conductorSurfacePercent: 80,
    hasSolarHeat: true,
    description: 'Hafif rüzgar (0,6 m/sn), serin ortam (20°C), güneş ısısı var.',
  },
];

export const AMPACITY_CONDUCTORS: readonly AmpacityConductor[] = [
  {
    id: 'swallow',
    code: 'SWALLOW',
    name: 'Swallow — 3 AWG',
    strandingAlSteel: '6/1',
    aluminumAreaMm2: 26.69,
    steelAreaMm2: 4.45,
    totalAreaMm2: 31.14,
    nominalDiameterMm: 7.14,
    nominalAreaMm2: 26.69,
    nominalWeightKgPerM: 0.1078,
    breakingLoadKg: 1042,
    elasticityInitialKgPerMm2: 6500,
    elasticityFinalKgPerMm2: 7900,
    linearExpansionCoefficient: 0.0000193,
    resistance20OhmPerKm: 1.055,
    reactance10kVOhmPerKm: 0.372,
    reactance35kVOhmPerKm: 0.409,
    equivalentCuMm2: 16.28,
    ampacityCondition1A: 120,
    ampacityCondition2A: 163,
    ampacityCondition3A: 174,
  },
  {
    id: 'raven',
    code: 'RAVEN',
    name: 'Raven — 1/0 AWG',
    strandingAlSteel: '6/1',
    aluminumAreaMm2: 53.54,
    steelAreaMm2: 8.92,
    totalAreaMm2: 62.46,
    nominalDiameterMm: 10.11,
    nominalAreaMm2: 53.54,
    nominalWeightKgPerM: 0.2158,
    breakingLoadKg: 1987,
    elasticityInitialKgPerMm2: 6500,
    elasticityFinalKgPerMm2: 7900,
    linearExpansionCoefficient: 0.0000193,
    resistance20OhmPerKm: 0.522,
    reactance10kVOhmPerKm: 0.350,
    reactance35kVOhmPerKm: 0.387,
    equivalentCuMm2: 32.66,
    ampacityCondition1A: 187,
    ampacityCondition2A: 254,
    ampacityCondition3A: 272,
  },
  {
    id: 'pigeon',
    code: 'PIGEON',
    name: 'Pigeon — 3/0 AWG',
    strandingAlSteel: '6/1',
    aluminumAreaMm2: 84.98,
    steelAreaMm2: 14.16,
    totalAreaMm2: 99.14,
    nominalDiameterMm: 12.75,
    nominalAreaMm2: 84.98,
    nominalWeightKgPerM: 0.3437,
    breakingLoadKg: 3003,
    elasticityInitialKgPerMm2: 6500,
    elasticityFinalKgPerMm2: 7900,
    linearExpansionCoefficient: 0.0000193,
    resistance20OhmPerKm: 0.328,
    reactance10kVOhmPerKm: 0.336,
    reactance35kVOhmPerKm: 0.373,
    equivalentCuMm2: 51.84,
    ampacityCondition1A: 244,
    ampacityCondition2A: 331,
    ampacityCondition3A: 354,
  },
  {
    id: 'partridge',
    code: 'PARTRIDGE',
    name: 'Partridge — 266.8 MCM',
    strandingAlSteel: '26/7',
    aluminumAreaMm2: 135.14,
    steelAreaMm2: 22.03,
    totalAreaMm2: 157.17,
    nominalDiameterMm: 16.31,
    nominalAreaMm2: 135.14,
    nominalWeightKgPerM: 0.5462,
    breakingLoadKg: 5048,
    elasticityInitialKgPerMm2: 5700,
    elasticityFinalKgPerMm2: 6800,
    linearExpansionCoefficient: 0.0000198,
    resistance20OhmPerKm: 0.209,
    reactance10kVOhmPerKm: 0.320,
    reactance35kVOhmPerKm: 0.357,
    equivalentCuMm2: 82.44,
    ampacityCondition1A: 367,
    ampacityCondition2A: 499,
    ampacityCondition3A: 533,
  },
  {
    id: 'hawk',
    code: 'HAWK',
    name: 'Hawk — 477 MCM',
    strandingAlSteel: '26/7',
    aluminumAreaMm2: 241.50,
    steelAreaMm2: 39.33,
    totalAreaMm2: 280.83,
    nominalDiameterMm: 21.79,
    nominalAreaMm2: 241.50,
    nominalWeightKgPerM: 0.9763,
    breakingLoadKg: 8845,
    elasticityInitialKgPerMm2: 5700,
    elasticityFinalKgPerMm2: 6800,
    linearExpansionCoefficient: 0.0000198,
    resistance20OhmPerKm: 0.117,
    reactance10kVOhmPerKm: 0.302,
    reactance35kVOhmPerKm: 0.339,
    equivalentCuMm2: 147.32,
    ampacityCondition1A: 509,
    ampacityCondition2A: 692,
    ampacityCondition3A: 740,
  },
];
