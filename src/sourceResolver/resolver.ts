// Resmî Kaynak Bulucu — ana çözümleyici (Sprint 11, madde 6).
//
// ⚠️ Bu dosyadaki HİÇBİR fonksiyon gerçek bir ağ isteği YAPMAZ. Tamamı,
// zaten kütüphanede duran belge alanlarına (institution, sourceUrl,
// pdfAvailable, documentType, category) bakarak KURAL TABANLI bir
// sınıflandırma üretir — gerçek bir "arama" veya "indirme" yalnızca
// gelecekte eklenecektir (bkz. docs/SOURCE_RESOLVER_ARCHITECTURE.md
// "Gelecekte otomatik PDF indirme akışı").
import type { Document, Institution } from '../data/library/types.ts';
import { getSourceProviderById, getSourceProviders } from './registry.ts';
import { isOfficialDomain, looksLikePdfUrl } from './validators.ts';
import type { SourceDocumentCandidate, SourceProvider, SourceResolverResult, SourceSearchInput } from './types.ts';

/** `Document.institution` → sağlayıcı id eşlemesi. Enerji Bakanlığı/Diğer için KASITLI OLARAK kayıtlı bir sağlayıcı yok. */
const INSTITUTION_PROVIDER_ID: Partial<Record<Institution, string>> = {
  'TEDAŞ': 'tedas',
  'TEİAŞ': 'teias',
  'EPDK': 'epdk',
  'Resmî Gazete': 'resmi-gazete',
  'TSE': 'tse',
  'TS EN': 'tse',
  'IEC': 'iec',
  'CENELEC': 'cenelec',
  'IEEE': 'ieee',
};

function getProviderForInstitution(institution: Institution): SourceProvider | undefined {
  const id = INSTITUTION_PROVIDER_ID[institution];
  return id ? getSourceProviderById(id) : undefined;
}

/**
 * Bir belgenin resmî kaynak durumunu çözümler — Sprint 11'in TEK ana
 * fonksiyonu, diğer üçü (`getSourceStatus`, `resolveByInstitution` kısmi
 * olarak) bunun üzerine kuruludur. Karar sırası (madde 6):
 *
 * 1. `pdfAvailable: true` ise → `publicPdf`, doğrulanmış (PDF zaten kütüphanede).
 * 2. Kurum TSE/IEC/CENELEC/IEEE ise → `restrictedStandard`, telifli.
 * 3. `sourceUrl` yoksa → `manualRequired`.
 * 4. `sourceUrl` var ve kayıtlı sağlayıcının resmî domaininden ise →
 *    doğrulanmış `publicPdf` (URL doğrudan .pdf'e işaret ediyorsa) veya `officialPage`.
 * 5. `sourceUrl` var ama doğrulanamıyor (sağlayıcı yok veya domain eşleşmiyor) → `manualRequired`.
 */
export function resolveOfficialSource(document: Document): SourceResolverResult {
  const provider = getProviderForInstitution(document.institution);

  if (document.pdfAvailable === true) {
    return {
      status: 'publicPdf',
      provider,
      url: document.pdfUrl ?? document.sourceUrl ?? undefined,
      verified: true,
      requiresManualVerification: false,
      copyrightRestricted: provider?.accessType === 'restrictedStandard',
      reason: "Belgenin PDF'i kütüphanede zaten mevcut (pdfAvailable=true).",
    };
  }

  if (provider?.accessType === 'restrictedStandard') {
    return {
      status: 'restrictedStandard',
      provider,
      url: provider.officialBaseUrl,
      verified: false,
      requiresManualVerification: true,
      copyrightRestricted: true,
      reason: `${document.institution}, telifli bir standart kuruluşudur — tam metin PDF sağlanamaz, yalnızca resmî erişim/satış sayfasına yönlendirilir.`,
    };
  }

  if (!document.sourceUrl) {
    return {
      status: 'manualRequired',
      provider,
      url: undefined,
      verified: false,
      requiresManualVerification: true,
      copyrightRestricted: false,
      reason: 'Belgede kayıtlı bir kaynak bağlantısı (sourceUrl) yok — manuel doğrulama gerekli.',
    };
  }

  if (provider && isOfficialDomain(document.sourceUrl, provider.id)) {
    const pdfGibiGoruyor = looksLikePdfUrl(document.sourceUrl) || looksLikePdfUrl(document.pdfPath ?? '');
    return {
      status: pdfGibiGoruyor ? 'publicPdf' : 'officialPage',
      provider,
      url: document.sourceUrl,
      verified: true,
      requiresManualVerification: false,
      copyrightRestricted: false,
      reason: `Kaynak, ${provider.name} resmî domainine ait olarak doğrulandı.`,
    };
  }

  return {
    status: 'manualRequired',
    provider,
    url: document.sourceUrl,
    verified: false,
    requiresManualVerification: true,
    copyrightRestricted: false,
    reason: provider
      ? `Kaynak bağlantısı ${provider.name} resmî domainiyle eşleşmiyor — manuel doğrulama gerekli.`
      : 'Bu kurum için kayıtlı bir resmî kaynak sağlayıcı yok — manuel doğrulama gerekli.',
  };
}

/**
 * `resolveOfficialSource()`'un UI-dostu takma adı — Doküman Detay ekranı
 * ve repository fonksiyonları anlamsal netlik için bu adı kullanır.
 * Mantık AYNIDIR, iki ayrı fonksiyon TUTULMAZ (kod tekrarı olmasın diye).
 */
export function getSourceStatus(document: Document): SourceResolverResult {
  return resolveOfficialSource(document);
}

/**
 * Yalnızca KURUM bilgisine bakarak (sourceUrl'i değerlendirmeden) bir
 * belgenin BEKLENEN/varsayılan kaynak durumunu döner — "bu kurumun genel
 * olarak nasıl bir kaynağı var" sorusuna cevap verir. Kurum bazlı
 * istatistikler (ör. Veri Kaynakları ekranı) için kullanılır;
 * `resolveOfficialSource()`'un aksine belge-özel `sourceUrl` doğrulaması
 * YAPMAZ.
 */
export function resolveByInstitution(document: Document): SourceResolverResult {
  const provider = getProviderForInstitution(document.institution);

  if (provider?.accessType === 'restrictedStandard') {
    return {
      status: 'restrictedStandard',
      provider,
      url: provider.officialBaseUrl,
      verified: false,
      requiresManualVerification: true,
      copyrightRestricted: true,
      reason: `${document.institution}, telifli bir standart kuruluşudur.`,
    };
  }

  if (provider) {
    return {
      status: 'officialPage',
      provider,
      url: provider.officialBaseUrl,
      verified: false,
      requiresManualVerification: true,
      copyrightRestricted: false,
      reason: `${document.institution} için kayıtlı bir resmî kaynak sağlayıcı var, ancak bu belgeye özel bağlantı doğrulanmadı.`,
    };
  }

  return {
    status: 'manualRequired',
    provider: undefined,
    url: undefined,
    verified: false,
    requiresManualVerification: true,
    copyrightRestricted: false,
    reason: `${document.institution} için kayıtlı bir resmî kaynak sağlayıcı yok.`,
  };
}

/**
 * Yalnızca bir BAŞLIK metninden (henüz bir Document nesnesi olmadan) en
 * olası kaynak sağlayıcıyı tahmin etmeye çalışır — GERÇEK bir arama
 * DEĞİLDİR, yalnızca sağlayıcı adı/anahtar kelime eşleşmesine dayanan
 * basit bir sezgiseldir. Gelecekte gerçek bir arama motoruyla
 * değiştirilmeye hazır bir yer tutucudur (bkz.
 * docs/SOURCE_RESOLVER_ARCHITECTURE.md).
 */
export function resolveByTitle(titleOrInput: string | SourceSearchInput): SourceResolverResult {
  const title = typeof titleOrInput === 'string' ? titleOrInput : titleOrInput.title;
  const normalizedTitle = title.toLocaleLowerCase('tr-TR');

  const adaylar: SourceDocumentCandidate[] = [];
  for (const provider of getSourceProviders()) {
    const providerAdiKucuk = provider.name.toLocaleLowerCase('tr-TR');
    if (normalizedTitle.includes(providerAdiKucuk)) {
      adaylar.push({
        provider,
        url: provider.officialBaseUrl,
        accessType: provider.accessType,
        confidence: 40,
      });
    }
  }
  if (normalizedTitle.includes('resmî gazete') || normalizedTitle.includes('resmi gazete') || normalizedTitle.includes('yönetmelik') || normalizedTitle.includes('kanun')) {
    const rgProvider = getSourceProviderById('resmi-gazete');
    if (rgProvider && !adaylar.some((a) => a.provider.id === 'resmi-gazete')) {
      adaylar.push({ provider: rgProvider, url: rgProvider.officialBaseUrl, accessType: rgProvider.accessType, confidence: 25 });
    }
  }

  if (adaylar.length === 0) {
    return {
      status: 'notFound',
      provider: undefined,
      url: undefined,
      verified: false,
      requiresManualVerification: true,
      copyrightRestricted: false,
      reason: 'Başlıktan otomatik kaynak tahmini yapılamadı — bu özellik ileride gerçek arama ile değiştirilecektir.',
    };
  }

  const enIyi = adaylar.reduce((a, b) => (b.confidence > a.confidence ? b : a));
  return {
    status: enIyi.accessType === 'restrictedStandard' ? 'restrictedStandard' : 'manualRequired',
    provider: enIyi.provider,
    url: enIyi.url,
    verified: false,
    requiresManualVerification: true,
    copyrightRestricted: enIyi.accessType === 'restrictedStandard',
    reason: `Başlıkta '${enIyi.provider.name}' geçtiği için bu sağlayıcı önerildi (düşük güven — otomatik arama henüz aktif değil).`,
  };
}
