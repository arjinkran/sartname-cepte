// betonDirek alt motoru — ENH beton direk seçimi.
//
// Sprint 3A: enhMechanical modülündeki ilk GERÇEK hesap. Girilen açıklık,
// gerilim seviyesi ve direk tipi (kategori) kriterlerine göre katalogdan
// (data.ts) uygun direkleri filtreler, emniyet katsayısına göre
// uygun / kritik / uygunsuz olarak sınıflandırır.
//
// ⚠️ Henüz GERÇEK moment/kuvvet fizik hesabı yapılmıyor (rüzgar/buz
// yükünden gerçek eğilme momenti hesaplanmıyor); yalnızca katalogdaki
// maxAcikinlikM değeri, açıklık ve emniyet katsayısı ile karşılaştırılıyor.
// Gerçek moment hesabı "Enerji Nakil Hatları Cilt 1" ve kullanıcının
// sağlayacağı Excel tablosu analiz edildikten sonra eklenecektir
// (bkz. README.md).
import type { ConductorType, IceRegion, PoleType, VoltageLevelKv } from '../types.ts';

export type WindZone = 1 | 2 | 3 | 4;

/** Beton direk kataloğundaki tek bir direk modeli. */
export interface BetonDirek {
  id: string;
  kod: string;
  yukseklikM: number;
  nominalMomentKgm: number;
  tepeKuvvetiKg: number;
  agirlikKg: number;
  gomulmeDerinligiM: number;
  maxAcikinlikM: number;
  kategori: PoleType;
  /**
   * Bu direğin uygun olduğu gerilim seviyeleri. Temel 9 alanlık katalog
   * şemasına ek olarak, "gerilim seviyesine uygun olmayanları çıkar"
   * filtresinin çalışabilmesi için gereklidir (bkz. README.md).
   */
  suitableVoltageLevels: readonly VoltageLevelKv[];
}

export interface BetonDirekInput {
  voltageLevelKv: VoltageLevelKv;
  poleType: PoleType;
  windZone: WindZone;
  iceRegion: IceRegion;
  spanLengthM: number;
  conductorType: ConductorType;
  safetyFactor: number;
}

export type BetonDirekSiniflandirma = 'uygun' | 'kritik' | 'uygunsuz';

export interface BetonDirekAday {
  direk: BetonDirek;
  siniflandirma: BetonDirekSiniflandirma;
  /** maxAcikinlikM / (spanLengthM × safetyFactor) — 1'in üzerinde olması beklenir. */
  guvenlikOrani: number;
}

export interface BetonDirekUsedParameters {
  voltageLevelKv: VoltageLevelKv;
  poleType: PoleType;
  windZone: WindZone;
  iceRegion: IceRegion;
  spanLengthM: number;
  conductorType: ConductorType;
  safetyFactor: number;
}

export interface BetonDirekOutput {
  onerilenDirek: BetonDirekAday | null;
  alternatifDirekler: readonly BetonDirekAday[];
  kritikUyarilar: readonly BetonDirekAday[];
  kullanilanParametreler: BetonDirekUsedParameters;
}
