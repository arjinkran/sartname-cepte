// ─────────────────────────────────────────────────────────────
// ŞARTNAME ARAMA MOTORU (saf fonksiyonlar — ekrandan bağımsız)
//
// Türkçe'ye uygun normalizasyon yapar: büyük/küçük harf (İ→i, I→ı)
// ve aksan katlama (ş→s, ç→c...) ile "SAYAC" araması "sayaç" bulur.
// Arama alanları: title (5), keywords (3), summary + institution +
// category (1). Puanlama: başlık eşleşmesi > anahtar kelime > gövde.
// ─────────────────────────────────────────────────────────────

import type { Document, DocumentStatus, Institution } from '../types';

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
  document: Document;
  puan: number;
}

/**
 * Belgeler içinde arama yapar.
 * - Sorgu boşluklarla terimlere ayrılır; en az bir terimi eşleşen belge listelenir.
 * - Tüm terimleri eşleşen belgeler öne gelir (terim başına bonus).
 * - Puan: title'da 5, keywords'te 3, summary/institution/category'de 1.
 */
export function ara(sorgu: string, documents: readonly Document[]): AramaSonucu[] {
  const terimler = normallestir(sorgu).split(' ').filter((t) => t.length >= 2);
  if (terimler.length === 0) return [];

  const sonuclar: AramaSonucu[] = [];
  for (const d of documents) {
    const baslik = normallestir(d.title);
    const anahtarlar = d.keywords.map(normallestir).join(' | ');
    const govde = normallestir([d.summary, d.institution, d.category].join(' '));

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
    sonuclar.push({ document: d, puan });
  }

  return sonuclar.sort(
    (a, b) => b.puan - a.puan || a.document.title.localeCompare(b.document.title, 'tr')
  );
}

export interface Filtre {
  institution?: Institution | null;
  category?: string | null;
  status?: DocumentStatus | null;
}

/**
 * Belgeleri institution / category / status ölçütlerine göre süzer.
 * null veya tanımsız ölçüt "hepsi" anlamına gelir.
 */
export function filtrele(documents: readonly Document[], f: Filtre): Document[] {
  return documents.filter(
    (d) =>
      (!f.institution || d.institution === f.institution) &&
      (!f.category || d.category === f.category) &&
      (!f.status || d.status === f.status)
  );
}
