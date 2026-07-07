// Elektrik hesaplarında kullanılan sabitler ve standart tablolar.
// Kaynak: TS/IEC standart kesit serisi; iletkenlik değerleri 20°C için
// pratikte kullanılan mühendislik değerleridir (Elektrik İç Tesisleri
// Yönetmeliği hesap pratiği).

export type Faz = 'mono' | 'tri';
export type Malzeme = 'bakir' | 'aluminyum';

// Standart kablo kesitleri (mm²)
export const STANDART_KESITLER: readonly number[] = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300,
];

// İletkenlik k (m / (Ω·mm²)) — 20°C
export const ILETKENLIK: Record<Malzeme, number> = {
  bakir: 56,
  aluminyum: 35,
};

// Tipik gerilim düşümü sınırları (%) — Elektrik İç Tesisleri Yönetmeliği pratiği
export const GERILIM_DUSUMU_LIMITLERI: readonly { deger: number; etiket: string }[] = [
  { deger: 1.5, etiket: '%1,5 (aydınlatma)' },
  { deger: 3, etiket: '%3 (priz / motor)' },
  { deger: 5, etiket: '%5 (besleme hattı)' },
];

// Şebeke anma gerilimleri (V)
export const VARSAYILAN_GERILIM: Record<Faz, number> = {
  mono: 230,
  tri: 400,
};
