// ─────────────────────────────────────────────────────────────
// ŞARTNAME ARAMA MOTORU (saf fonksiyonlar — ekrandan bağımsız)
//
// Türkçe'ye uygun normalizasyon yapar: büyük/küçük harf (İ→i, I→ı)
// ve aksan katlama (ş→s, ç→c...) ile "SAYAC" araması "sayaç" bulur.
// Puanlama: başlık eşleşmesi > anahtar kelime > özet/madde metni.
// ─────────────────────────────────────────────────────────────

import type { Dokuman, DokumanDurumu, Kurum } from '../types';

const AKSAN_TABLOSU: Record<string, string> = {
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
};

/** Türkçe metni arama için normalleştir: küçült + aksanları katla */
export function normallestir(metin: string): string {
  return metin
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (h) => AKSAN_TABLOSU[h] ?? h)
    .replace(/\s+/g, ' ')
    .trim();
}

export interface AramaSonucu {
  dokuman: Dokuman;
  puan: number;
}

/**
 * Dokümanlar içinde arama yapar.
 * - Sorgu boşluklarla terimlere ayrılır; en az bir terimi eşleşen doküman listelenir.
 * - Tüm terimleri eşleşen dokümanlar öne gelir (terim başına bonus).
 * - Puan: başlıkta 5, anahtar kelimede 3, özet/maddelerde 1.
 */
export function ara(sorgu: string, dokumanlar: readonly Dokuman[]): AramaSonucu[] {
  const terimler = normallestir(sorgu).split(' ').filter((t) => t.length >= 2);
  if (terimler.length === 0) return [];

  const sonuclar: AramaSonucu[] = [];
  for (const d of dokumanlar) {
    const baslik = normallestir(d.baslik);
    const anahtarlar = d.anahtarKelimeler.map(normallestir).join(' | ');
    const govde = normallestir(
      [
        d.ozet,
        d.onemliNoktalar.join(' '),
        d.ilgiliMaddeler.map((m) => m.no + ' ' + m.aciklama).join(' '),
        d.kaynakNo,
        d.kurum,
        d.dokumanTuru,
      ].join(' ')
    );

    let puan = 0;
    let eslesenTerim = 0;
    for (const t of terimler) {
      let teriminPuani = 0;
      if (baslik.includes(t)) teriminPuani += 5;
      if (anahtarlar.includes(t)) teriminPuani += 3;
      if (govde.includes(t)) teriminPuani += 1;
      if (teriminPuani > 0) eslesenTerim += 1;
      puan += teriminPuani;
    }
    if (eslesenTerim === 0) continue;
    // Tüm terimleri eşleşenlere güçlü bonus → "kablo eki" araması
    // yalnızca "kablo" geçenlerden önce ek dokümanını getirir.
    if (eslesenTerim === terimler.length) puan += 20 * terimler.length;
    sonuclar.push({ dokuman: d, puan });
  }

  return sonuclar.sort(
    (a, b) => b.puan - a.puan || a.dokuman.baslik.localeCompare(b.dokuman.baslik, 'tr')
  );
}

export interface Filtre {
  kurum?: Kurum | null;
  kategoriId?: string | null;
  durum?: DokumanDurumu | null;
}

/**
 * Dokümanları kurum / kategori / durum ölçütlerine göre süzer.
 * null veya tanımsız ölçüt "hepsi" anlamına gelir.
 */
export function filtrele(dokumanlar: readonly Dokuman[], f: Filtre): Dokuman[] {
  return dokumanlar.filter(
    (d) =>
      (!f.kurum || d.kurum === f.kurum) &&
      (!f.kategoriId || d.kategoriId === f.kategoriId) &&
      (!f.durum || d.durum === f.durum)
  );
}
