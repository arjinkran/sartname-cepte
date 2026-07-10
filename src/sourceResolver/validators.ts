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
