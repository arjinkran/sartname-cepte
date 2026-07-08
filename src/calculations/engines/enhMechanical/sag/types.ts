// sag alt motoru — klasik parabolik sehim ÖN HESABI.
//
// ⚠️ Bu GERÇEK bir DHD (Değişik Haller Denklemi) çözümü DEĞİLDİR —
// yalnızca basit parabolik yaklaşımla (sabit çekme kuvveti varsayımı)
// bir ön sehim hesabı yapar. Sıcaklık etkisi, elastik uzama ve gerçek
// kablo sarkma eğrisi (katener) burada MODELLENMEMİŞTİR (bkz. README.md).
import type { ConductorType, IceRegion } from '../types.ts';

export type LoadCase = 'noIce' | 'oneIce' | 'doubleIce';

export interface SagInput {
  conductorType: ConductorType;
  spanLengthM: number;
  iceRegion: IceRegion;
  tensionKg: number;
  loadCase: LoadCase;
}

export type SagValidationStatus = 'preliminary';

export interface SagOutput {
  spanLengthM: number;
  conductorWeightKgPerM: number;
  /** loadCase'e göre seçilen buz yükü (noIce → 0). */
  iceLoadKgPerM: number;
  /** loadCase'e göre kullanılan toplam birim yük (kg/m). */
  totalLoadKgPerM: number;
  tensionKg: number;
  sagM: number;
  sagCm: number;
  /** Sehimin açıklığa oranı (%). */
  sagPercentOfSpan: number;
  /**
   * Doğrulama durumu — Sprint 5B itibarıyla her zaman 'preliminary'.
   * Excel/kitap doğrulaması tamamlanmadan başka bir değer üretilmemelidir
   * (bkz. docs/ENH_SEHIM_DOGRULAMA_PLANI.md ve README.md "Doğrulama Durumu").
   */
  validationStatus: SagValidationStatus;
}
