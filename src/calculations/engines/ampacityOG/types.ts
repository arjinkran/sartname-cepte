// ampacityOG motoru — OG (orta gerilim) hava hattı iletken veri tabanı ve
// akım taşıma kapasitesi.
//
// Bu motor klasik bir "formül" motoru DEĞİLDİR: kullanıcı bir iletken,
// bir çalışma koşulu ve bir gerilim seviyesi seçer; motor Excel'den
// aktarılmış veri tablosundan (bkz. data.ts) ilgili akım taşıma
// kapasitesini ve iletken özelliklerini döndürür (arama/lookup motoru).

/** Uygulama gerilim seviyesi — reaktans değeri buna göre seçilir. */
export type VoltageLevel = '10kV' | '35kV';

/** Excel'den aktarılan tek bir iletkenin tüm teknik verisi. */
export interface AmpacityConductor {
  id: string;
  code: string;
  name: string;
  /** Alüminyum/çelik tel sayısı gösterimi (ör. "6/1", "26/7") */
  strandingAlSteel: string;
  aluminumAreaMm2: number;
  steelAreaMm2: number;
  totalAreaMm2: number;
  nominalDiameterMm: number;
  nominalAreaMm2: number;
  nominalWeightKgPerM: number;
  breakingLoadKg: number;
  elasticityInitialKgPerMm2: number;
  elasticityFinalKgPerMm2: number;
  /** Doğrusal genleşme katsayısı (1/°C) */
  linearExpansionCoefficient: number;
  resistance20OhmPerKm: number;
  reactance10kVOhmPerKm: number;
  reactance35kVOhmPerKm: number;
  equivalentCuMm2: number;
  ampacityCondition1A: number;
  ampacityCondition2A: number;
  ampacityCondition3A: number;
}

/** Akım taşıma kapasitesinin hesaplandığı varsayılan çevresel çalışma koşulu. */
export interface AmpacityCondition {
  id: string;
  name: string;
  windSpeedMs: number;
  ambientTempC: number;
  /** İletken yüzey katsayısı (emisivite/soğurganlık, %) */
  conductorSurfacePercent: number;
  hasSolarHeat: boolean;
  description?: string;
}

export interface AmpacityOGInput {
  conductorId: string;
  conditionId: string;
  voltageLevel: VoltageLevel;
  /** Beklenen işletme akımı (A) — opsiyonel; verilmezse yalnızca kapasite bilgisi döner. */
  expectedCurrentA?: number;
}

export interface AmpacityOGOutput {
  ampacityA: number;
  /** expectedCurrentA verilmediyse null. */
  isSuitable: boolean | null;
  /** expectedCurrentA verilmediyse null. */
  utilizationPercent: number | null;
  /** expectedCurrentA verilmediyse null. */
  remainingCapacityA: number | null;
  conductorName: string;
  conductorCode: string;
  resistance20OhmPerKm: number;
  reactanceOhmPerKm: number;
  equivalentCuMm2: number;
  nominalDiameterMm: number;
  nominalAreaMm2: number;
  nominalWeightKgPerM: number;
  breakingLoadKg: number;
}
