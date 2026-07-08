// enhMechanical motoru — ENH direk açıklığı / sehim / Df-Ds hesap grubu.
//
// Bu motor Sprint 2C'de yalnızca İSKELET olarak kurulmuştur: gerçek Excel
// formülleri ("DEK Haller ve Sehim Hesapları" dosyası, bkz. README.md'deki
// VBA fonksiyon listesi) sonraki sprintlerde fonksiyon fonksiyon
// çözümlenip buraya taşınacaktır. Şimdilik her alt hesap türü, girdi
// doğrulaması çalışan ama sonuç ÜRETMEYEN bir "notImplemented" yanıtı döner.

/** Motorun desteklediği alt hesap türleri (bkz. README.md Excel eşleme tablosu). */
export type EnhMechanicalCalcType =
  | 'betonDirekSecimi'
  | 'degisikHallerDenklemi'
  | 'sehimSerbest'
  | 'sehimOzel'
  | 'dfDsHesabi'
  | 'amaxHesabi';

export type ConductorType = '3-awg' | '1-0-awg' | '3-0-awg' | '266-8-mcm' | '477-mcm-hawk';

export type IceRegion = 1 | 2 | 3 | 4 | 5;

export type VoltageLevelKv = 34.5 | 154;

export type PoleType =
  | 'tek-devre'
  | 'cift-devre-cam'
  | 'cift-devre-fici'
  | 'dort-devre'
  | 'sek-d'
  | 'demir';

export type CircuitType = 'single' | 'double' | 'quad';

/**
 * Tüm alt hesapların ortak girdi havuzu. Her alan opsiyoneldir; hangi alt
 * hesabın hangi alanı zorunlu kılacağı gerçek formüller eklendiğinde
 * netleşecektir (o zaman `EnhMechanicalInput` muhtemelen calcType bazlı
 * ayrık birleşime (discriminated union) dönüştürülecektir). Şimdilik
 * yalnızca `calcType` zorunludur; diğer alanlar verilirse (undefined
 * değilse) desteklenen değer kümesine karşı doğrulanır.
 */
export interface EnhMechanicalCommonInput {
  iceRegion?: IceRegion;
  conductorType?: ConductorType;
  voltageLevelKv?: VoltageLevelKv;
  spanLengthM?: number;
  averageSpanM?: number;
  poleType?: PoleType;
  circuitType?: CircuitType;
  insulatorLengthM?: number;
  temperatureC?: number;
  maxTensionKg?: number;
  conductorSectionMm2?: number;
  conductorWeightKgPerM?: number;
  elasticityKgPerMm2?: number;
  expansionCoefficient?: number;
}

export interface EnhMechanicalInput extends EnhMechanicalCommonInput {
  calcType: EnhMechanicalCalcType;
}

export interface EnhMechanicalOutput {
  calcType: EnhMechanicalCalcType;
  status: 'notImplemented';
  message: string;
}

/** Bir alt hesabın kayıt/metadata bilgisi (UI kart listesi + Excel eşleme için). */
export interface EnhMechanicalSubCalculation {
  id: EnhMechanicalCalcType;
  label: string;
  description: string;
  /** İlişkili Excel sekmeleri (bkz. README.md). */
  relatedExcelTabs: readonly string[];
}
