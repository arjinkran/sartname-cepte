// ─────────────────────────────────────────────────────────────
// DOKÜMAN REPOSITORY (Sprint 4)
//
// Tüm ekranlar mevzuat verisine YALNIZCA bu dosya üzerinden erişir; hiçbir
// ekran documents.ts'i (veya eski modules/mevzuat/data/sartnameler.ts'i)
// doğrudan import etmemelidir. Arama mantığı, önceki
// modules/mevzuat/services/arama.ts'teki `ara()`/`normallestir()`
// fonksiyonlarının birebir taşınmış hâlidir (Türkçe aksan katlama,
// title(5)/keywords(3)/gövde(1) puanlama) — davranış DEĞİŞMEDİ.
// ─────────────────────────────────────────────────────────────
import { DOCUMENTS } from './documents.ts';
import type { Document, DocumentType, Institution } from './types.ts';

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

export interface SearchResult {
  document: Document;
  score: number;
}

/** Tüm dokümanları döner (kütüphanenin tamamı). */
export function getAllDocuments(): readonly Document[] {
  return DOCUMENTS;
}

/**
 * `featured: true` olan dokümanları `updatedAt`'e göre (en yeni önce)
 * sıralanmış döner — Ana Sayfa "Son Şartnameler" bunu kullanır (bkz.
 * Sprint 4 madde 8-9).
 */
export function getFeaturedDocuments(): readonly Document[] {
  return DOCUMENTS.filter((d) => d.featured).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getDocumentById(id: string): Document | undefined {
  return DOCUMENTS.find((d) => d.id === id);
}

export function getByInstitution(institution: Institution): readonly Document[] {
  return DOCUMENTS.filter((d) => d.institution === institution);
}

/** `category`, categories.ts CATEGORIES listesindeki `ad` alanıyla eşleşmelidir. */
export function getByCategory(category: string): readonly Document[] {
  return DOCUMENTS.filter((d) => d.category === category);
}

export function getByType(documentType: DocumentType): readonly Document[] {
  return DOCUMENTS.filter((d) => d.documentType === documentType);
}

/**
 * Belgeler içinde arama yapar (title/keywords/summary/institution/category).
 * - Sorgu boşluklarla terimlere ayrılır; en az bir terimi eşleşen belge listelenir.
 * - Tüm terimleri eşleşen belgeler öne gelir (terim başına bonus).
 * - Puan: title'da 5, keywords'te 3, summary/institution/category'de 1.
 * `within` verilmezse tüm kütüphanede arar (AI ekranı bunu kullanır).
 */
export function search(query: string, within: readonly Document[] = DOCUMENTS): SearchResult[] {
  const terimler = normallestir(query).split(' ').filter((t) => t.length >= 2);
  if (terimler.length === 0) return [];

  const sonuclar: SearchResult[] = [];
  for (const d of within) {
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
    // Tüm terimleri eşleşenlere güçlü bonus → "kablo eki" araması yalnızca
    // "kablo" geçenlerden önce ek dokümanını getirir.
    if (eslesenTerim === terimler.length) puan += 20 * terimler.length;
    sonuclar.push({ document: d, score: puan });
  }

  return sonuclar.sort(
    (a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, 'tr')
  );
}

/** Bir dokümanın `relatedDocuments` id listesini gerçek Document nesnelerine çözer. */
export function getRelatedDocuments(id: string): readonly Document[] {
  const doc = getDocumentById(id);
  if (!doc) return [];
  return doc.relatedDocuments
    .map((relId) => getDocumentById(relId))
    .filter((d): d is Document => d != null);
}

/** `updatedAt`'e göre en yeni `limit` dokümanı döner (featured filtresi YOK). */
export function getRecentDocuments(limit = 10): readonly Document[] {
  return DOCUMENTS.slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}
