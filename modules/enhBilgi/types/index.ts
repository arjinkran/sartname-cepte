// enhBilgi modülü — ENH teknik bilgi bankası tipleri.
// Bu modül bir hesap motoru DEĞİLDİR; yalnızca statik teknik bilgi
// (iletkenler, direk sınıfları) gösterir. Sayısal iletken verileri
// src/calculations/engines/ampacityOG/data.ts ile UYUMLU tutulmalıdır.

export interface IletkenBilgi {
  id: string;
  ad: string;
  kod: string;
  aluminyumKesitMm2: number;
  celikKesitMm2: number;
  toplamKesitMm2: number;
  nominalCapMm: number;
  nominalAgirlikKgPerM: number;
  kopmaDayanimiKg: number;
  kisaAciklama: string;
  kullanimAlani: string;
}

export type DirekSinifId =
  | 'tasiyici'
  | 'kose-tasiyici'
  | 'durdurucu'
  | 'kose-durdurucu'
  | 'nihayet'
  | 'bransman';

export interface IlgiliHesap {
  baslik: string;
  rota: string;
}

export interface DirekSinifBilgi {
  id: DirekSinifId;
  ad: string;
  tanim: string;
  kullanimYeri: string;
  /** Projede kullanılan kısa gösterim/kısaltma. */
  gosterim: string;
  dikkatNotu: string;
  onemliKuvvetler: readonly string[];
  ilgiliHesaplar: readonly IlgiliHesap[];
}

export interface EnhBilgiBaslik {
  id: string;
  ad: string;
  ikon: string;
  aciklama: string;
  aktif: boolean;
  rota: string;
}
