// ─────────────────────────────────────────────────────────────
// ULUSAL ELEKTRİK MEVZUAT KÜTÜPHANESİ — REPOSITORY (Sprint 5)
//
// Tüm ekranlar mevzuat verisine YALNIZCA bu dosya üzerinden erişir; hiçbir
// ekran kurum klasörlerindeki documents.ts dosyalarına doğrudan erişmez.
//
// Sprint 5, madde 6: bu dosya 10 kurum klasörünü (tedas, teias, epdk,
// enerjiBakanligi, resmiGazete, tse, iec, cenelec, ieee, other) otomatik
// birleştirir → tek `Document[]`. Kurum/kategori/doküman tipi listeleri
// ELLE YAZILMAZ (madde 7-9): kurum listesi her klasörün kendi
// `metadata.ts`'inden, kategori/tip listeleri gerçek belgelerin
// taranmasından otomatik türetilir.
// ─────────────────────────────────────────────────────────────
import { DOCUMENTS as TEDAS_DOCS, METADATA as TEDAS_META } from './tedas/index.ts';
import { DOCUMENTS as TEIAS_DOCS, METADATA as TEIAS_META } from './teias/index.ts';
import { DOCUMENTS as EPDK_DOCS, METADATA as EPDK_META } from './epdk/index.ts';
import { DOCUMENTS as ENERJI_BAKANLIGI_DOCS, METADATA as ENERJI_BAKANLIGI_META } from './enerjiBakanligi/index.ts';
import { DOCUMENTS as RESMI_GAZETE_DOCS, METADATA as RESMI_GAZETE_META } from './resmiGazete/index.ts';
import { DOCUMENTS as TSE_DOCS, METADATA as TSE_META } from './tse/index.ts';
import { DOCUMENTS as IEC_DOCS, METADATA as IEC_META } from './iec/index.ts';
import { DOCUMENTS as CENELEC_DOCS, METADATA as CENELEC_META } from './cenelec/index.ts';
import { DOCUMENTS as IEEE_DOCS, METADATA as IEEE_META } from './ieee/index.ts';
import { DOCUMENTS as OTHER_DOCS, METADATA as OTHER_META } from './other/index.ts';
import { kategoriGorunumu } from './categoryPresentation.ts';
import type { Document, DocumentType, Institution, InstitutionMeta } from './types.ts';
// Sprint 9: PDF manifest'i DOĞRUDAN import edilir (pdfChecker.ts ÜZERİNDEN
// DEĞİL) — pdfChecker.ts zaten bu dosyayı (repository.ts) import ettiğinden,
// tersi yönde bir import döngüsel bağımlılık yaratırdı. manifest.ts'in
// kendisi hiçbir şeyi import etmez (yaprak modül), bu yüzden burada
// güvenle kullanılabilir.
import { PDF_MANIFEST } from '../../assets/pdfs/manifest.ts';
// Sprint 11: source resolver de repository.ts'i import ETMEZ (yalnızca
// Document/Institution TİPLERİNİ kullanır) — bu yüzden tek yönlü, döngüsel
// olmayan bir bağımlılık (bkz. src/sourceResolver/README.md).
import { getSourceStatus } from '../../sourceResolver/resolver.ts';

interface InstitutionModule {
  docs: readonly Document[];
  meta: InstitutionMeta;
}

// Yeni bir kurum klasörü eklerken tek yapılması gereken: yukarıya bir
// import satırı + buraya bir satır eklemek (bkz. docs/LIBRARY_ARCHITECTURE.md
// "Yeni kurum ekleme"). Başka hiçbir dosya değiştirilmez.
const INSTITUTION_MODULES: readonly InstitutionModule[] = [
  { docs: TEDAS_DOCS, meta: TEDAS_META },
  { docs: TEIAS_DOCS, meta: TEIAS_META },
  { docs: EPDK_DOCS, meta: EPDK_META },
  { docs: ENERJI_BAKANLIGI_DOCS, meta: ENERJI_BAKANLIGI_META },
  { docs: RESMI_GAZETE_DOCS, meta: RESMI_GAZETE_META },
  { docs: TSE_DOCS, meta: TSE_META },
  { docs: IEC_DOCS, meta: IEC_META },
  { docs: CENELEC_DOCS, meta: CENELEC_META },
  { docs: IEEE_DOCS, meta: IEEE_META },
  { docs: OTHER_DOCS, meta: OTHER_META },
];

/** TEDAŞ + TEİAŞ + EPDK + ... → tek Document[] (Sprint 5, madde 6). */
const DOCUMENTS: readonly Document[] = INSTITUTION_MODULES.flatMap((m) => m.docs);

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

// ── Temel erişim ───────────────────────────────────────────────────────

/** Tüm dokümanları döner (kütüphanenin tamamı, 10 kurum birleşik). */
export function getAllDocuments(): readonly Document[] {
  return DOCUMENTS;
}

/**
 * `featured: true` olan dokümanları `updatedAt`'e göre (en yeni önce)
 * sıralanmış döner — Ana Sayfa "Son Şartnameler" bunu kullanır.
 */
export function getFeaturedDocuments(): readonly Document[] {
  return DOCUMENTS.filter((d) => d.featured).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** `updatedAt`'e göre en yeni `limit` dokümanı döner (featured filtresi YOK). */
export function getRecentDocuments(limit = 10): readonly Document[] {
  return DOCUMENTS.slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function getDocumentById(id: string): Document | undefined {
  return DOCUMENTS.find((d) => d.id === id);
}

export function getDocumentsByInstitution(institution: Institution): readonly Document[] {
  return DOCUMENTS.filter((d) => d.institution === institution);
}

/** `category`, gerçek belgelerdeki `category` alanıyla birebir eşleşmelidir. */
export function getDocumentsByCategory(category: string): readonly Document[] {
  return DOCUMENTS.filter((d) => d.category === category);
}

export function getDocumentsByType(documentType: DocumentType): readonly Document[] {
  return DOCUMENTS.filter((d) => d.documentType === documentType);
}

// ── Arama ───────────────────────────────────────────────────────────────

/**
 * Genel amaçlı arama (title/aliases/keywords/tags/summary/institution/
 * category). Arama ekranının serbest metin kutusu bunu kullanır.
 * - Sorgu boşluklarla terimlere ayrılır; en az bir terimi eşleşen belge listelenir.
 * - Tüm terimleri eşleşen belgeler öne gelir (terim başına bonus).
 * - Puan: title/aliases'te 5, keywords'te 3, tags'te 2, gövdede 1;
 *   sonuç `document.searchWeight` ile çarpılır.
 * `within` verilmezse tüm kütüphanede arar.
 */
export function search(query: string, within: readonly Document[] = DOCUMENTS): SearchResult[] {
  const terimler = normallestir(query).split(' ').filter((t) => t.length >= 2);
  if (terimler.length === 0) return [];

  const sonuclar: SearchResult[] = [];
  for (const d of within) {
    const baslik = normallestir(d.title);
    const takmaAdlar = d.aliases.map(normallestir).join(' | ');
    const anahtarlar = d.keywords.map(normallestir).join(' | ');
    const etiketler = d.tags.map(normallestir).join(' | ');
    const govde = normallestir([d.summary, d.institution, d.category].join(' '));

    let puan = 0;
    let eslesenTerim = 0;
    for (const t of terimler) {
      let teriminPuani = 0;
      if (baslik.includes(t)) teriminPuani += 5;
      if (takmaAdlar.includes(t)) teriminPuani += 5;
      if (anahtarlar.includes(t)) teriminPuani += 3;
      if (etiketler.includes(t)) teriminPuani += 2;
      if (govde.includes(t)) teriminPuani += 1;
      if (teriminPuani > 0) eslesenTerim += 1;
      puan += teriminPuani;
    }
    if (eslesenTerim === 0) continue;
    // Tüm terimleri eşleşenlere güçlü bonus → "kablo eki" araması yalnızca
    // "kablo" geçenlerden önce ek dokümanını getirir.
    if (eslesenTerim === terimler.length) puan += 20 * terimler.length;
    sonuclar.push({ document: d, score: puan * d.searchWeight });
  }

  return sonuclar.sort(
    (a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, 'tr')
  );
}

/**
 * Yalnızca `keywords`/`tags`/`aliases` alanlarında arar (title/summary
 * hariç) — AI Asistanı'nın "kelime eşleşmesi" öneri motoru bunu kullanır
 * (bkz. Document.searchWeight "AI önerilerinde kullanılacak").
 */
export function searchKeywords(query: string, within: readonly Document[] = DOCUMENTS): SearchResult[] {
  const terimler = normallestir(query).split(' ').filter((t) => t.length >= 2);
  if (terimler.length === 0) return [];

  const sonuclar: SearchResult[] = [];
  for (const d of within) {
    const takmaAdlar = d.aliases.map(normallestir).join(' | ');
    const anahtarlar = d.keywords.map(normallestir).join(' | ');
    const etiketler = d.tags.map(normallestir).join(' | ');

    let puan = 0;
    let eslesenTerim = 0;
    for (const t of terimler) {
      let teriminPuani = 0;
      if (takmaAdlar.includes(t)) teriminPuani += 5;
      if (anahtarlar.includes(t)) teriminPuani += 3;
      if (etiketler.includes(t)) teriminPuani += 2;
      if (teriminPuani > 0) eslesenTerim += 1;
      puan += teriminPuani;
    }
    if (eslesenTerim === 0) continue;
    if (eslesenTerim === terimler.length) puan += 20 * terimler.length;
    sonuclar.push({ document: d, score: puan * d.searchWeight });
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

// ── Otomatik türetilen listeler (madde 7-9) ─────────────────────────────

export interface CategoryStat {
  ad: string;
  ikon: string;
  aciklama: string;
  count: number;
}

/**
 * Kategori listesi ELLE YAZILMAZ — gerçek belgeler taranarak, kaç belgesi
 * olduğu bilgisiyle birlikte otomatik oluşturulur (madde 7). İkon/açıklama
 * yalnızca sunum amaçlı bir zenginleştirmedir (bkz. categoryPresentation.ts);
 * tanımsız bir kategori çıkarsa genel 📁 ikonuyla yine listeye girer.
 */
export function getCategories(): readonly CategoryStat[] {
  const sayac = new Map<string, number>();
  for (const d of DOCUMENTS) sayac.set(d.category, (sayac.get(d.category) ?? 0) + 1);
  return Array.from(sayac.entries())
    .map(([ad, count]) => ({ ad, count, ...kategoriGorunumu(ad) }))
    .sort((a, b) => b.count - a.count || a.ad.localeCompare(b.ad, 'tr'));
}

export interface InstitutionStat extends InstitutionMeta {
  count: number;
}

/**
 * Kurum listesi ELLE YAZILMAZ — her kurum klasörünün kendi `metadata.ts`'i
 * otomatik toplanır (madde 8). Belgesi olmayan kurumlar da (count: 0)
 * listede kalır — Veri Kaynakları ekranı bunları "yakında" gösterir.
 */
export function getInstitutions(): readonly InstitutionStat[] {
  return INSTITUTION_MODULES.map((m) => ({ ...m.meta, count: m.docs.length }));
}

export interface DocumentTypeStat {
  documentType: DocumentType;
  count: number;
}

/** Doküman tipi listesi ELLE YAZILMAZ — gerçek belgeler taranarak otomatik oluşturulur (madde 9). */
export function getDocumentTypes(): readonly DocumentTypeStat[] {
  const sayac = new Map<DocumentType, number>();
  for (const d of DOCUMENTS) sayac.set(d.documentType, (sayac.get(d.documentType) ?? 0) + 1);
  return Array.from(sayac.entries())
    .map(([documentType, count]) => ({ documentType, count }))
    .sort((a, b) => b.count - a.count);
}

export interface LibraryStatistics {
  totalDocuments: number;
  featuredCount: number;
  deprecatedCount: number;
  byInstitution: readonly InstitutionStat[];
  byCategory: readonly CategoryStat[];
  byType: readonly DocumentTypeStat[];
}

/**
 * Kütüphanenin tam istatistik özeti — Veri Kaynakları ekranı artık sabit
 * sayılar yerine bunu kullanır (madde 10: "TEDAŞ 42 belge" gibi örnekler
 * yalnızca FORMAT örneğidir, gerçek sayılar mevcut 14 belgeye göre çok
 * daha küçüktür — mock belge üretilmedi).
 */
export function getStatistics(): LibraryStatistics {
  return {
    totalDocuments: DOCUMENTS.length,
    featuredCount: DOCUMENTS.filter((d) => d.featured).length,
    deprecatedCount: DOCUMENTS.filter((d) => d.deprecated).length,
    byInstitution: getInstitutions(),
    byCategory: getCategories(),
    byType: getDocumentTypes(),
  };
}

// ── PDF (Sprint 8-9) ─────────────────────────────────────────────────────
//
// `document.pdfPath` (Sprint 4'ten kalan alan) HER belgede doludur (kurum
// ana sayfası yer tutucusu) — bu yüzden gerçek bir PDF'in var olup
// olmadığı İKİ kaynaktan gelir (Sprint 9, madde 3): belgenin kendi
// `pdfAvailable` alanı VEYA `src/assets/pdfs/manifest.ts`'te o belge
// id'sine ait bir kayıt. Bu bölümdeki fonksiyonlar `document.pdfPath`e
// ASLA bakmaz.
const MANIFEST_DOCUMENT_IDS = new Set(PDF_MANIFEST.map((m) => m.documentId));

/**
 * Bir belgenin ŞU AN gerçekten açılabilir bir PDF'i olup olmadığını döner.
 * `pdfAvailable` alanı tanımsız (undefined) olan belgeler de `false` kabul
 * edilir — "belirtilmemiş" ile "yok" arasında UI açısından fark yoktur.
 * Sprint 9'dan itibaren, manifest'te bir kaydı olan belgeler de `true`
 * sayılır (pdfAvailable alanı elle `true` yapılmamış olsa bile).
 */
export function hasPdf(document: Document): boolean {
  return document.pdfAvailable === true || MANIFEST_DOCUMENT_IDS.has(document.id);
}

/** Gerçek PDF'i olan belgeleri döner (madde 3). */
export function getAvailablePdfDocuments(): readonly Document[] {
  return DOCUMENTS.filter(hasPdf);
}

/** Henüz PDF'i olmayan belgeleri döner (madde 3) — "PDF Yakında" listelemesi için. */
export function getMissingPdfDocuments(): readonly Document[] {
  return DOCUMENTS.filter((d) => !hasPdf(d));
}

/**
 * Bir belgenin görüntülenebilir PDF kaynağını döner. Öncelik sırası:
 * manifest kaydının `relativePath`i (Sprint 9) → belgenin kendi
 * `localAsset`i → `pdfUrl`. PDF yoksa (veya belge bulunamazsa) `undefined`
 * döner; hiçbir zaman `pdfPath`e (kurum ana sayfası yer tutucusu) düşmez.
 */
export function getPdfPath(id: string): string | undefined {
  const doc = getDocumentById(id);
  if (!doc || !hasPdf(doc)) return undefined;
  const manifestKaydi = PDF_MANIFEST.find((m) => m.documentId === id);
  return manifestKaydi?.relativePath ?? doc.localAsset ?? doc.pdfUrl ?? undefined;
}

export interface PdfInstitutionStat {
  institution: Institution;
  total: number;
  withPdf: number;
}

export interface PdfCategoryStat {
  category: string;
  total: number;
  withPdf: number;
}

export interface PdfStatistics {
  totalDocuments: number;
  withPdf: number;
  withoutPdf: number;
  byInstitution: readonly PdfInstitutionStat[];
  byCategory: readonly PdfCategoryStat[];
  /** `pageCount` alanı bilinen belgelerin toplamı — bilinmeyenler sayılmaz (uydurulmaz). */
  totalKnownPageCount: number;
  /** `src/assets/pdfs/manifest.ts`'teki kayıt sayısı (Sprint 9) — `withPdf` ile AYNI olmak zorunda değildir: bir belge yalnızca `pdfAvailable: true` ile de (manifest kaydı olmadan) sayılabilir. */
  manifestCount: number;
}

/**
 * PDF kapsamının tam istatistik özeti (madde 16). Veri Kaynakları ekranının
 * "Toplam PDF" sayıları BUNDAN gelir — elle yazılan bir sayı YOKTUR.
 */
export function getPdfStatistics(): PdfStatistics {
  const withPdfDocs = getAvailablePdfDocuments();

  const institutionTotals = new Map<Institution, { total: number; withPdf: number }>();
  const categoryTotals = new Map<string, { total: number; withPdf: number }>();

  for (const d of DOCUMENTS) {
    const inst = institutionTotals.get(d.institution) ?? { total: 0, withPdf: 0 };
    inst.total += 1;
    if (hasPdf(d)) inst.withPdf += 1;
    institutionTotals.set(d.institution, inst);

    const cat = categoryTotals.get(d.category) ?? { total: 0, withPdf: 0 };
    cat.total += 1;
    if (hasPdf(d)) cat.withPdf += 1;
    categoryTotals.set(d.category, cat);
  }

  return {
    totalDocuments: DOCUMENTS.length,
    withPdf: withPdfDocs.length,
    withoutPdf: DOCUMENTS.length - withPdfDocs.length,
    byInstitution: Array.from(institutionTotals.entries())
      .map(([institution, v]) => ({ institution, ...v }))
      .sort((a, b) => b.withPdf - a.withPdf || a.institution.localeCompare(b.institution, 'tr')),
    byCategory: Array.from(categoryTotals.entries())
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.withPdf - a.withPdf || a.category.localeCompare(b.category, 'tr')),
    totalKnownPageCount: DOCUMENTS.reduce((sum, d) => sum + (d.pageCount ?? 0), 0),
    manifestCount: PDF_MANIFEST.length,
  };
}

// ── Resmî Kaynak Durumu (Sprint 11) ──────────────────────────────────────
//
// Bu 4 fonksiyon, `src/sourceResolver/resolver.ts`'teki `getSourceStatus()`
// ile UYUMLU çalışır — her belge için doğrudan resolver'ı çağırır (belge
// başına O(1) saf hesaplama, ağ isteği YOK). Bir belgenin
// `officialSourceStatus` alanı elle doldurulmuşsa o değer ÖNCELENİR
// (manuel sabitleme), yoksa resolver'ın hesapladığı değer kullanılır.

function cozumlenmisDurum(document: Document) {
  return document.officialSourceStatus
    ? { ...getSourceStatus(document), status: document.officialSourceStatus }
    : getSourceStatus(document);
}

/** Kaynağı otomatik doğrulanamayan, manuel teyit gerektiren belgeler (madde 8). */
export function getDocumentsNeedingSourceVerification(): readonly Document[] {
  return DOCUMENTS.filter((d) => cozumlenmisDurum(d).requiresManualVerification);
}

/** Kaynağı resmî domainden otomatik doğrulanmış belgeler. */
export function getDocumentsWithOfficialSources(): readonly Document[] {
  return DOCUMENTS.filter((d) => cozumlenmisDurum(d).verified);
}

/** Telifli standart kuruluşlarına (TSE/IEC/CENELEC/IEEE) ait belgeler. */
export function getRestrictedStandardDocuments(): readonly Document[] {
  return DOCUMENTS.filter((d) => cozumlenmisDurum(d).copyrightRestricted);
}

/** PDF sağlanmaya UYGUN (kamuya açık, telifsiz) belgeler. */
export function getPublicPdfEligibleDocuments(): readonly Document[] {
  return DOCUMENTS.filter((d) => {
    const durum = cozumlenmisDurum(d);
    if (durum.copyrightRestricted) return false;
    return durum.status === 'publicPdf' || durum.provider?.supportsPdf === true;
  });
}
