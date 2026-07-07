// ─────────────────────────────────────────────────────────────
// GERİLİM DÜŞÜMÜ HESAP MOTORU (saf fonksiyonlar — ekrandan bağımsız)
//
// Formüller (omik düşüm yaklaşımı, Elektrik İç Tesisleri Yönetmeliği pratiği):
//   Monofaze : e% = (200 · L · P) / (k · S · U²)
//   Trifaze  : e% = (100 · L · P) / (k · S · U²)
//
//   L : hat uzunluğu (m)          P : güç (W)
//   k : iletkenlik (m/Ω·mm²)      S : kesit (mm²)
//   U : şebeke gerilimi (V)       e%: yüzde gerilim düşümü
//
// Not: Bu yaklaşım hattın endüktif reaktansını ihmal eder; AG dağıtımında
// küçük/orta kesitler için standart pratiktir. Büyük kesit + uzun hatlarda
// reaktans etkisi ayrıca değerlendirilmelidir (uygulamada uyarı gösterilir).
// ─────────────────────────────────────────────────────────────

import { ILETKENLIK, STANDART_KESITLER, type Faz, type Malzeme } from '../data/elektrik.ts';

export interface GerilimDusumuGirdi {
  faz: Faz;
  /** Hat uzunluğu (m) */
  L: number;
  /** Güç (kW) */
  P_kW: number;
  /** Kesit (mm²) */
  S: number;
  /** Gerilim (V) */
  U: number;
  malzeme: Malzeme;
}

export interface GerilimDusumuSonuc {
  eYuzde: number;
  deltaU: number;
}

export function hesaplaGerilimDusumu(g: GerilimDusumuGirdi): GerilimDusumuSonuc {
  dogrula(g);
  const P = g.P_kW * 1000; // W
  const k = ILETKENLIK[g.malzeme];
  const sabit = g.faz === 'mono' ? 200 : 100;
  const eYuzde = (sabit * g.L * P) / (k * g.S * g.U * g.U);
  const deltaU = (eYuzde / 100) * g.U;
  return { eYuzde, deltaU };
}

export interface MinKesitSonuc {
  /** Formülden çıkan teorik kesit (mm²) */
  teorik: number;
  /** Uygun ilk standart kesit; 300 mm² yetmiyorsa null */
  standart: number | null;
}

export function gerekliMinKesit(g: {
  faz: Faz;
  L: number;
  P_kW: number;
  U: number;
  malzeme: Malzeme;
  limitYuzde: number;
}): MinKesitSonuc {
  dogrula({ ...g, S: 1 });
  if (!(g.limitYuzde > 0)) throw new Error('Limit % pozitif olmalı');
  const P = g.P_kW * 1000;
  const k = ILETKENLIK[g.malzeme];
  const sabit = g.faz === 'mono' ? 200 : 100;
  const teorik = (sabit * g.L * P) / (k * g.limitYuzde * g.U * g.U);
  const standart = STANDART_KESITLER.find((s) => s >= teorik) ?? null;
  return { teorik, standart };
}

/**
 * Yük akımını hesaplar (bilgi amaçlı).
 * Monofaze: I = P / (U·cosφ)   Trifaze: I = P / (√3·U·cosφ)
 */
export function hesaplaAkim(g: { faz: Faz; P_kW: number; U: number; cosfi?: number }): number {
  const cosfi = g.cosfi ?? 1;
  if (!(g.P_kW > 0) || !(g.U > 0) || !(cosfi > 0) || cosfi > 1) {
    throw new Error('Geçersiz akım hesabı girdisi');
  }
  const P = g.P_kW * 1000;
  return g.faz === 'mono' ? P / (g.U * cosfi) : P / (Math.sqrt(3) * g.U * cosfi);
}

function dogrula(g: GerilimDusumuGirdi): void {
  if (g.faz !== 'mono' && g.faz !== 'tri') throw new Error('Faz tipi mono/tri olmalı');
  if (!ILETKENLIK[g.malzeme]) throw new Error('Malzeme bakir/aluminyum olmalı');
  if (!(g.L > 0)) throw new Error('Hat uzunluğu pozitif olmalı');
  if (!(g.P_kW > 0)) throw new Error('Güç pozitif olmalı');
  if (!(g.S > 0)) throw new Error('Kesit pozitif olmalı');
  if (!(g.U > 0)) throw new Error('Gerilim pozitif olmalı');
}

// "12,5" → 12.5 ; geçersizse NaN (Türkçe ondalık virgülü desteği)
export function sayiyaCevir(metin: string): number {
  if (typeof metin !== 'string' || metin.trim() === '') return NaN;
  return Number(metin.replace(',', '.'));
}
