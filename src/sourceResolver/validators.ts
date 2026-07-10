// Kaynak doğrulama yardımcı fonksiyonları (Sprint 11, madde 5).
// Tamamı SAF (pure) fonksiyonlardır — ağ isteği yapmaz, yalnızca string
// karşılaştırması yapar.
import { getSourceProviderById } from './registry.ts';
import type { SourceDocumentCandidate, SourceValidationResult } from './types.ts';

/** URL'den host'u çıkarır ("www." öneki atılır) — basit, bağımlılıksız bir ayrıştırıcı. */
function extractHost(url: string): string {
  const match = url.trim().match(/^https?:\/\/([^/?#]+)/i);
  const host = (match ? match[1]! : url.trim()).toLowerCase();
  return host.replace(/^www\./, '');
}

/**
 * URL'i normalize eder: protokol eksikse `https://` eklenir, küçük harfe
 * çevrilir, sondaki `/` atılır. Karşılaştırma öncesi tutarlılık için.
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
  normalized = normalized.toLowerCase();
  if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
  return normalized;
}

/**
 * Bir URL'in belirtilen sağlayıcının resmî domain(ler)inden birine ait
 * olup olmadığını kontrol eder. Alt alan adları da (ör. "e-mevzuat.
 * mevzuat.gov.tr") kabul edilir; tamamen farklı bir domain (sahte kaynak)
 * REDDEDİLİR.
 */
export function isOfficialDomain(url: string, providerId: string): boolean {
  const provider = getSourceProviderById(providerId);
  if (!provider || !url) return false;

  const gecerliDomainler = [provider.officialBaseUrl, ...(provider.alternateDomains ?? [])].map((d) =>
    extractHost(normalizeUrl(d))
  );
  const urlHost = extractHost(normalizeUrl(url));

  return gecerliDomainler.some((domain) => urlHost === domain || urlHost.endsWith(`.${domain}`));
}

/** URL'in bir PDF dosyasına doğrudan işaret edip etmediğini (uzantıya bakarak) tahmin eder. */
export function looksLikePdfUrl(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url.trim());
}

/** Bir sağlayıcının telifli standart kuruluşu (TSE/IEC/CENELEC/IEEE) olup olmadığını döner. */
export function isRestrictedStandardProvider(providerId: string): boolean {
  return getSourceProviderById(providerId)?.accessType === 'restrictedStandard';
}

/**
 * Bir aday kaynağın (`SourceDocumentCandidate`) geçerli olup olmadığını
 * doğrular: URL sağlayıcının resmî domaininden mi geliyor, sağlayıcı
 * kısıtlı bir standart kuruluşu mu (o zaman tam metin adayı geçersizdir).
 */
export function validateCandidate(candidate: SourceDocumentCandidate): SourceValidationResult {
  const reasons: string[] = [];

  if (!isOfficialDomain(candidate.url, candidate.provider.id)) {
    reasons.push(`URL, ${candidate.provider.name} resmî domainine ait değil.`);
  }
  if (candidate.provider.accessType === 'restrictedStandard' && candidate.accessType === 'publicPdf') {
    reasons.push(`${candidate.provider.name} telifli bir standart kuruluşudur — tam metin PDF adayı geçersiz.`);
  }

  return { valid: reasons.length === 0, reasons };
}

// ── Ağ isteği güvenlik kapısı (Sprint 12, madde 4) ───────────────────────
// `isSafeRequestUrl()`, GERÇEK bir ağ isteği yapılmadan ÖNCE her zaman
// çağrılması gereken TEK güvenlik kapısıdır (bkz. network/httpClient.ts
// ve network/searchCoordinator.ts). `isOfficialDomain()`den FARKLI olarak
// yalnızca domain eşleşmesine değil, protokole ve host'un "gerçek bir genel
// internet domaini" olup olmadığına da bakar.

const PRIVATE_OR_RESERVED_HOST_PATTERNS: readonly RegExp[] = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /^\[::1\]$/,
];

function isRawIpAddress(host: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true; // IPv4
  if (host.includes(':')) return true; // IPv6 (basit tespit — host içinde ":" varsa)
  return false;
}

/**
 * Bir URL'e GERÇEKTEN ağ isteği atılıp atılamayacağını belirler:
 * - Yalnızca `https:` kabul edilir (`http:`/`file:` REDDEDİLİR).
 * - `localhost`, ham IP adresleri (v4/v6) ve özel/ayrılmış ağ aralıkları REDDEDİLİR.
 * - Geri kalan kontrol `isOfficialDomain()`e devredilir (lookalike domain
 *   reddi zaten oradaki katı alt-domain eşleşmesiyle sağlanır, ör.
 *   "tedas.gov.tr.evil.com" "tedas.gov.tr" ile EŞLEŞMEZ).
 */
export function isSafeRequestUrl(url: string, providerId: string): boolean {
  const trimmed = url.trim();
  if (!/^https:\/\//i.test(trimmed)) return false;

  const hostMatch = trimmed.match(/^https:\/\/([^/?#]+)/i);
  if (!hostMatch) return false;
  const host = hostMatch[1]!.toLowerCase().split(':')[0]!; // port varsa at

  if (PRIVATE_OR_RESERVED_HOST_PATTERNS.some((p) => p.test(host))) return false;
  if (isRawIpAddress(host)) return false;

  return isOfficialDomain(trimmed, providerId);
}
