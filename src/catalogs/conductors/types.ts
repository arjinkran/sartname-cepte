// src/catalogs/conductors — merkezi ACSR iletken kataloğu tipleri.
//
// Bu katalog, uygulamadaki TÜM ENH hesap motorlarının ve bilgi
// ekranlarının kullanması gereken TEK iletken veri kaynağıdır.
// Bkz. README.md.

/**
 * Bir iletken kaydının kaynak/doğrulama durumu.
 * - 'verifiedFromExcel'      → değer, kullanıcının sağladığı Excel'den birebir doğrulanmıştır.
 * - 'pendingBookVerification' → gerçek ACSR üretici tablolarından türetilmiştir, kaynak
 *                                kitap (Enerji Nakil Hatları Cilt 1/2) veya Excel ile
 *                                henüz birebir doğrulanmamıştır.
 * - 'mock'                   → tamamen yer tutucu/tahmini değer, gerçek kaynağa dayanmaz.
 */
export type ConductorSourceStatus = 'verifiedFromExcel' | 'pendingBookVerification' | 'mock';

/** Merkezi ACSR iletken kataloğundaki tek bir iletken kaydı. */
export interface ACSRConductor {
  id: string;
  code: string;
  name: string;
  /** Kod + boyut birleşimi (ör. "Swallow — 3 AWG") — birleşik görünen ad. */
  standardName: string;
  awgMcm: string;
  aluminumAreaMm2: number;
  steelAreaMm2: number;
  totalAreaMm2: number;
  nominalDiameterMm: number;
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
  notes: string;
  sourceStatus: ConductorSourceStatus;
}
