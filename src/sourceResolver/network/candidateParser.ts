// Aday çıkarımı ve puanlama (Sprint 12, madde 8-9).
//
// ⚠️ Bu TAM bir HTML parser DEĞİLDİR — yeni paket eklenmedi. Yalnızca
// `<a href="...">metin</a>` bağlantılarını yakalayan SINIRLI bir regex
// kullanılır; `<script>`/`<style>` blokları ayrıştırmadan ÖNCE tamamen
// çıkarılır (içerikleri asla yorumlanmaz). Karmaşık/iç içe HTML yapıları
// için GÜVENİLİR değildir — yalnızca basit, düz bağlantı listeleri için
// tasarlandı (kurum web sitelerinin PDF listeleme sayfaları gibi).
import type { Document } from '../../data/library/types.ts';
import { getSourceProviderById } from '../registry.ts';
import { isOfficialDomain, looksLikePdfUrl } from '../validators.ts';
import type { HttpFetchResult, NetworkCandidate } from './types.ts';

const STRONG_SCORE_THRESHOLD = 70;
const MANUAL_REVIEW_THRESHOLD = 45;

const SCRIPT_STYLE_REGEX = /<(script|style)[\s\S]*?<\/\1>/gi;
const ANCHOR_REGEX = /<a\s+[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

function stripScriptsAndStyles(html: string): string {
  return html.replace(SCRIPT_STYLE_REGEX, '');
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}

/** Göreli bir `href`'i, GERÇEK URL sınıfı KULLANMADAN (RN/Hermes uyumluluğu için) çözer. */
function resolveUrl(href: string, baseUrl: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || /^(javascript|mailto|tel):/i.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  const originMatch = baseUrl.match(/^(https?:\/\/[^/]+)/i);
  if (!originMatch) return null;
  const origin = originMatch[1]!;

  if (trimmed.startsWith('/')) return `${origin}${trimmed}`;

  const lastSlash = baseUrl.lastIndexOf('/');
  const baseDir = lastSlash > origin.length ? baseUrl.slice(0, lastSlash + 1) : `${origin}/`;
  return `${baseDir}${trimmed}`;
}

interface RawLink {
  href: string;
  text: string;
}

/** HTML gövdesinden `<a href>` bağlantılarını çıkarır — script/style İÇERİKLERİ YOK SAYILIR. */
export function extractLinks(html: string, baseUrl: string): RawLink[] {
  const cleaned = stripScriptsAndStyles(html);
  const links: RawLink[] = [];
  ANCHOR_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANCHOR_REGEX.exec(cleaned)) !== null) {
    const resolved = resolveUrl(match[1]!, baseUrl);
    if (resolved) links.push({ href: resolved, text: stripTags(match[2]!) });
  }
  return links;
}

function normalize(s: string): string {
  const AKSAN: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (c) => AKSAN[c] ?? c)
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ScoreInput {
  document: Document;
  candidateUrl: string;
  candidateTitle: string;
  providerId: string;
  /** İsteğin GERÇEKTEN gittiği son URL (redirect sonrası) — burada AYRICA doğrulanır. */
  finalUrl: string;
  contentType?: string;
}

export interface ScoreOutput {
  score: number;
  matchReasons: string[];
  verifiedDomain: boolean;
  isPdf: boolean;
}

/**
 * Bir adayı 0-100 arası puanlar (madde 9). Domain doğrulanmadıysa puan
 * HER ZAMAN 0'dır ve aday sonuçlara asla giremez (çağıran taraf bunu
 * `verifiedDomain === false` ile filtreler).
 */
export function scoreCandidate(input: ScoreInput): ScoreOutput {
  const verifiedDomain =
    isOfficialDomain(input.finalUrl, input.providerId) && isOfficialDomain(input.candidateUrl, input.providerId);

  if (!verifiedDomain) {
    return { score: 0, matchReasons: ['Domain doğrulanamadı.'], verifiedDomain: false, isPdf: false };
  }

  const reasons: string[] = ['Resmî domainden doğrulandı.'];
  let score = 20;

  const candidateNorm = normalize(input.candidateTitle);
  const titleNorm = normalize(input.document.title);
  const shortNorm = normalize(input.document.shortTitle);

  if (candidateNorm.length > 0 && (candidateNorm.includes(titleNorm) || titleNorm.includes(candidateNorm))) {
    score += 25;
    reasons.push('Tam başlık eşleşmesi.');
  } else if (shortNorm.length > 0 && candidateNorm.includes(shortNorm)) {
    score += 15;
    reasons.push('Kısa başlık eşleşmesi.');
  }

  for (const alias of input.document.aliases) {
    if (alias && candidateNorm.includes(normalize(alias))) {
      score += 10;
      reasons.push(`Alternatif ad eşleşmesi: '${alias}'.`);
      break;
    }
  }

  if (input.document.revision && candidateNorm.includes(normalize(input.document.revision))) {
    score += 10;
    reasons.push('Revizyon eşleşmesi.');
  }

  if (candidateNorm.includes(normalize(input.document.institution))) {
    score += 5;
    reasons.push('Kurum adı eşleşmesi.');
  }

  const isPdfExt = looksLikePdfUrl(input.candidateUrl);
  const isPdfContentType = input.contentType?.toLowerCase().includes('application/pdf') ?? false;
  if (isPdfExt) {
    score += 15;
    reasons.push("'.pdf' uzantısı.");
  }
  if (isPdfContentType) {
    score += 10;
    reasons.push('Content-Type: application/pdf.');
  }

  if (input.document.category && candidateNorm.includes(normalize(input.document.category))) {
    score += 5;
    reasons.push('Kategori eşleşmesi.');
  }

  const yearMatch = input.candidateTitle.match(/(19|20)\d{2}/);
  if (yearMatch && (input.document.publishDate.includes(yearMatch[0]) || input.document.effectiveDate.includes(yearMatch[0]))) {
    score += 5;
    reasons.push('Tarih eşleşmesi.');
  }

  return { score: Math.min(100, score), matchReasons: reasons, verifiedDomain: true, isPdf: isPdfExt || isPdfContentType };
}

/**
 * Bir HTTP yanıtından (HTML gövdesi) PDF adayı bağlantıları çıkarır,
 * puanlar ve filtreler. Domain doğrulanmayan veya 45 puan ALTINDAKİ
 * hiçbir aday DÖNMEZ (madde 9 kuralı — "tek aday olsa bile 45 altını
 * kabul etme").
 */
export function extractPdfCandidates(response: HttpFetchResult, document: Document, providerId: string): NetworkCandidate[] {
  const provider = getSourceProviderById(providerId);
  if (!provider || !response.body) return [];

  const finalUrl = response.metadata.finalUrl;
  if (!isOfficialDomain(finalUrl, providerId)) return [];

  const links = extractLinks(response.body, finalUrl);
  const seenUrls = new Set<string>();
  const candidates: NetworkCandidate[] = [];

  for (const link of links) {
    if (!looksLikePdfUrl(link.href)) continue;
    if (seenUrls.has(link.href)) continue;
    seenUrls.add(link.href);

    const scored = scoreCandidate({
      document,
      candidateUrl: link.href,
      candidateTitle: link.text || link.href,
      providerId,
      finalUrl: link.href,
    });

    if (!scored.verifiedDomain || scored.score < MANUAL_REVIEW_THRESHOLD) continue;

    candidates.push({
      documentId: document.id,
      providerId,
      provider,
      url: link.href,
      title: link.text || undefined,
      accessType: scored.isPdf ? 'publicPdf' : 'officialPage',
      score: scored.score,
      matchReasons: scored.matchReasons,
      verifiedDomain: scored.verifiedDomain,
      isPdf: scored.isPdf,
      requiresManualReview: scored.score < STRONG_SCORE_THRESHOLD,
    });
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export { STRONG_SCORE_THRESHOLD, MANUAL_REVIEW_THRESHOLD };
