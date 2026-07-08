// ampacityOG motoru — OG (orta gerilim) hava hattı iletken veri tabanı ve
// akım taşıma kapasitesi.
//
// Bu motor klasik bir "formül" motoru DEĞİLDİR: kullanıcı bir iletken,
// bir çalışma koşulu ve bir gerilim seviyesi seçer; motor Excel'den
// aktarılmış veri tablosundan (bkz. data.ts) ilgili akım taşıma
// kapasitesini ve iletken özelliklerini döndürür (arama/lookup motoru).
//
// ⚠️ Sprint 4B: iletken tipi artık BURADA TANIMLI DEĞİL — merkezi
// katalogdan (src/catalogs/conductors) alınır. Bkz.
// src/catalogs/conductors/README.md "Bu katalog uygulamanın tek iletken
// veri kaynağıdır."

/** Uygulama gerilim seviyesi — reaktans değeri buna göre seçilir. */
export type VoltageLevel = '10kV' | '35kV';

/** Merkezi ACSR kataloğu tipinin bu motordaki adı (geriye dönük uyumluluk için). */
export type { ACSRConductor as AmpacityConductor } from '../../../catalogs/conductors/index.ts';

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
