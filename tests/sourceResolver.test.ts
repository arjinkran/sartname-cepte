// Resmî Kaynak Bulucu testleri (Sprint 11, madde 13).
import { test } from 'node:test';
import assert from 'node:assert';
import { getSourceProviderById, getSourceProviders, getRestrictedProviders, getPublicPdfProviders } from '../src/sourceResolver/registry.ts';
import { isOfficialDomain, looksLikePdfUrl, isRestrictedStandardProvider } from '../src/sourceResolver/validators.ts';
import { getSourceStatus, resolveOfficialSource } from '../src/sourceResolver/resolver.ts';
import {
  getAllDocuments,
  getDocumentById,
  getDocumentsNeedingSourceVerification,
  getRestrictedStandardDocuments,
  getPublicPdfEligibleDocuments,
} from '../src/data/library/repository.ts';

test('TEDAŞ provider kayıtlı', () => {
  const provider = getSourceProviderById('tedas');
  assert.ok(provider, "'tedas' sağlayıcısı registry'de bulunamadı");
  assert.strictEqual(provider!.name, 'TEDAŞ');
});

test('EPDK provider kayıtlı', () => {
  const provider = getSourceProviderById('epdk');
  assert.ok(provider, "'epdk' sağlayıcısı registry'de bulunamadı");
  assert.strictEqual(provider!.name, 'EPDK');
});

test('Resmî Gazete provider kayıtlı', () => {
  const provider = getSourceProviderById('resmi-gazete');
  assert.ok(provider, "'resmi-gazete' sağlayıcısı registry'de bulunamadı");
  assert.strictEqual(provider!.name, 'Resmî Gazete');
});

test('TSE restrictedStandard olarak işaretli', () => {
  const provider = getSourceProviderById('tse');
  assert.ok(provider);
  assert.strictEqual(provider!.accessType, 'restrictedStandard');
  assert.strictEqual(provider!.supportsPdf, false);
});

test('IEC restrictedStandard olarak işaretli', () => {
  const provider = getSourceProviderById('iec');
  assert.ok(provider);
  assert.strictEqual(provider!.accessType, 'restrictedStandard');
  assert.strictEqual(provider!.supportsPdf, false);
});

test('CENELEC ve IEEE de restrictedStandard olarak işaretli', () => {
  assert.strictEqual(getSourceProviderById('cenelec')?.accessType, 'restrictedStandard');
  assert.strictEqual(getSourceProviderById('ieee')?.accessType, 'restrictedStandard');
});

test('9 sağlayıcının tamamı registry\'de kayıtlı', () => {
  const providers = getSourceProviders();
  assert.strictEqual(providers.length, 9);
  const idler = new Set(providers.map((p) => p.id));
  for (const id of ['tedas', 'epdk', 'resmi-gazete', 'mevzuat-gov', 'teias', 'tse', 'iec', 'cenelec', 'ieee']) {
    assert.ok(idler.has(id), `'${id}' registry'de yok`);
  }
});

test('getRestrictedProviders/getPublicPdfProviders doğru ayrım yapıyor', () => {
  assert.strictEqual(getRestrictedProviders().length, 4);
  assert.strictEqual(getPublicPdfProviders().length, 5);
});

test('official domain doğrulama çalışıyor', () => {
  assert.strictEqual(isOfficialDomain('https://www.tedas.gov.tr/sartname.pdf', 'tedas'), true);
  assert.strictEqual(isOfficialDomain('https://tedas.gov.tr', 'tedas'), true);
  assert.strictEqual(isOfficialDomain('https://alt.tedas.gov.tr/dosya', 'tedas'), true);
});

test('fake domain reddediliyor', () => {
  assert.strictEqual(isOfficialDomain('https://www.sahte-tedas.com/sartname.pdf', 'tedas'), false);
  assert.strictEqual(isOfficialDomain('https://tedas.gov.tr.evil.com', 'tedas'), false);
  assert.strictEqual(isOfficialDomain('https://epdk.gov.tr', 'tedas'), false);
});

test('PDF URL tespiti çalışıyor', () => {
  assert.strictEqual(looksLikePdfUrl('https://www.tedas.gov.tr/sartname.pdf'), true);
  assert.strictEqual(looksLikePdfUrl('https://www.tedas.gov.tr/sartname.pdf?v=2'), true);
  assert.strictEqual(looksLikePdfUrl('https://www.tedas.gov.tr/sayfa'), false);
});

test('isRestrictedStandardProvider doğru çalışıyor', () => {
  assert.strictEqual(isRestrictedStandardProvider('tse'), true);
  assert.strictEqual(isRestrictedStandardProvider('tedas'), false);
  assert.strictEqual(isRestrictedStandardProvider('olmayan-id'), false);
});

test('sourceUrl olmayan belge manualRequired dönüyor', () => {
  const sahteDoc = { ...getAllDocuments()[0]!, institution: 'Enerji Bakanlığı' as const, sourceUrl: '', pdfAvailable: undefined };
  const sonuc = resolveOfficialSource(sahteDoc);
  assert.strictEqual(sonuc.status, 'manualRequired');
  assert.strictEqual(sonuc.requiresManualVerification, true);
});

test('TSE belgesi copyrightRestricted dönüyor', () => {
  const tseDoc = getAllDocuments().find((d) => d.institution === 'TSE' || d.institution === 'TS EN');
  assert.ok(tseDoc, 'kütüphanede TSE/TS EN belgesi yok');
  const sonuc = getSourceStatus(tseDoc!);
  assert.strictEqual(sonuc.status, 'restrictedStandard');
  assert.strictEqual(sonuc.copyrightRestricted, true);
});

test('IEC belgesi de copyrightRestricted dönüyor', () => {
  const iecDoc = getAllDocuments().find((d) => d.institution === 'IEC');
  assert.ok(iecDoc);
  const sonuc = getSourceStatus(iecDoc!);
  assert.strictEqual(sonuc.copyrightRestricted, true);
});

test('public kurum belgesi publicPdfEligible dönebiliyor', () => {
  const tedasDoc = getDocumentById('ag-xlpe-kablo');
  assert.ok(tedasDoc);
  const eligible = getPublicPdfEligibleDocuments();
  assert.ok(eligible.some((d) => d.id === 'ag-xlpe-kablo'), 'TEDAŞ belgesi PDF\'ye uygun sayılmalı');
});

test('gerçek sourceUrl\'i olan TEDAŞ/EPDK/Resmî Gazete belgeleri verified officialPage/publicPdf dönüyor', () => {
  const kuvvetliAkim = getDocumentById('kuvvetli-akim');
  const epdkHizmet = getDocumentById('epdk-hizmet-kalitesi');
  assert.ok(kuvvetliAkim && epdkHizmet);
  for (const doc of [kuvvetliAkim!, epdkHizmet!]) {
    const sonuc = getSourceStatus(doc);
    assert.strictEqual(sonuc.verified, true, `${doc.id}: doğrulanmış olmalı`);
    assert.ok(sonuc.status === 'officialPage' || sonuc.status === 'publicPdf');
  }
});

test('repository getDocumentsNeedingSourceVerification çalışıyor', () => {
  const liste = getDocumentsNeedingSourceVerification();
  assert.ok(Array.isArray(liste));
  assert.ok(liste.length > 0);
  for (const d of liste) {
    assert.strictEqual(getSourceStatus(d).requiresManualVerification, true);
  }
});

test('getRestrictedStandardDocuments çalışıyor', () => {
  const liste = getRestrictedStandardDocuments();
  assert.ok(liste.length > 0);
  for (const d of liste) {
    assert.ok(['TSE', 'TS EN', 'IEC', 'CENELEC', 'IEEE'].includes(d.institution), `${d.id}: beklenmeyen kurum ${d.institution}`);
  }
});

test('getPublicPdfEligibleDocuments çalışıyor', () => {
  const liste = getPublicPdfEligibleDocuments();
  assert.ok(liste.length > 0);
  for (const d of liste) {
    assert.strictEqual(getSourceStatus(d).copyrightRestricted, false, `${d.id}: telifli bir belge PDF'ye uygun sayılmamalı`);
  }
});

test('repository fonksiyonlarının toplamı kütüphanenin tamamını kapsıyor', () => {
  const total = getAllDocuments().length;
  const needing = getDocumentsNeedingSourceVerification().length;
  const restricted = getRestrictedStandardDocuments().length;
  // restricted kümesi needing kümesinin bir alt kümesidir (hepsi manuel doğrulama gerektirir)
  assert.ok(restricted <= needing);
  assert.ok(needing <= total);
});
