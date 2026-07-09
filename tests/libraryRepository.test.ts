// Ulusal Elektrik Mevzuat Kütüphanesi — Repository birim testleri (Sprint 5).
// Önceki tests/documentRepository.test.ts'in yerine geçer — aynı arama
// davranışı (normallestir/search puanlaması) src/data/library/
// repository.ts'e birebir taşındı. Fonksiyon adları sprint spesifikasyonuna
// göre yeniden adlandırıldı (getByInstitution → getDocumentsByInstitution
// vb.) ve yeni fonksiyonlar (searchKeywords, getCategories, getInstitutions,
// getDocumentTypes, getStatistics) için testler eklendi.
import { test } from 'node:test';
import assert from 'node:assert';
import {
  getAllDocuments,
  getCategories,
  getDocumentById,
  getDocumentsByCategory,
  getDocumentsByInstitution,
  getDocumentsByType,
  getDocumentTypes,
  getFeaturedDocuments,
  getInstitutions,
  getRecentDocuments,
  getRelatedDocuments,
  getStatistics,
  normallestir,
  search,
  searchKeywords,
} from '../src/data/library/repository.ts';
import type { DocumentType } from '../src/data/library/types.ts';

// Document.documentType'ın kapalı kümesi (types.ts'teki union ile birebir) —
// "veri bütünlüğü" testinde her belgenin geçerli bir tipte olduğunu
// doğrulamak için kullanılır.
const GECERLI_DOKUMAN_TIPLERI: readonly DocumentType[] = [
  'Şartname', 'Yönetmelik', 'Standart', 'Tebliğ', 'Genelge', 'Kılavuz', 'Teknik Doküman', 'Rehber',
];

test('normallestir Türkçe karakterleri katlar', () => {
  assert.strictEqual(normallestir('SAYAÇ'), 'sayac');
  assert.strictEqual(normallestir('Gerilim DÜŞÜMÜ'), 'gerilim dusumu');
  assert.strictEqual(normallestir('  İç   Tesis '), 'ic tesis');
});

test('search: "kablo eki" araması ek dokümanını ilk sırada getirir', () => {
  const sonuc = search('kablo eki');
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.id, 'ag-kablo-ek');
});

test('search: "og trafo" araması dağıtım trafosunu üst sıraya getirir', () => {
  const sonuc = search('og trafo');
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.id, 'og-dagitim-trafo');
});

test('search: büyük harf ve aksansız arama da eşleşir (SAYAC → sayaç)', () => {
  const sonuc = search('SAYAC');
  assert.ok(sonuc.some((s) => s.document.id === 'elektronik-sayac'));
});

test('search: "kesinti kalitesi" araması EPDK hizmet kalitesi dokümanını bulur', () => {
  const sonuc = search('kesinti kalitesi');
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.id, 'epdk-hizmet-kalitesi');
});

test('search: boş/tek harfli sorgu boş sonuç döner', () => {
  assert.deepStrictEqual(search(''), []);
  assert.deepStrictEqual(search(' a '), []);
});

test('search: eşleşmeyen sorgu boş döner', () => {
  assert.deepStrictEqual(search('uzay mekiği'), []);
});

test('search: kurum alanında da eşleşir ("gazete" hiçbir başlık/anahtar kelimede geçmez)', () => {
  const sonuc = search('gazete');
  assert.ok(sonuc.length > 0);
  assert.ok(sonuc.every((s) => s.document.institution === 'Resmî Gazete'));
});

test('search: kurum adıyla da eşleşir ("epdk")', () => {
  const sonuc = search('epdk kesinti');
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.institution, 'EPDK');
});

test('search: within parametresi verilen alt kümede arar', () => {
  const sadeceTedas = getDocumentsByInstitution('TEDAŞ');
  const sonuc = search('kablo', sadeceTedas);
  assert.ok(sonuc.length > 0);
  assert.ok(sonuc.every((s) => s.document.institution === 'TEDAŞ'));
});

test('searchKeywords: yalnızca alias/keywords/tags alanlarında arar, title dahil değil', () => {
  // "kablolar" sözcüğü hiçbir kablo dokümanının BAŞLIĞINDA aynen geçmez
  // ama kategori adı olduğundan search()'te gövdeden eşleşebilir;
  // searchKeywords() gövdeye hiç bakmaz — burada gerçek keyword'lerden
  // eşleşen "ekat" alias'ını doğruluyoruz.
  const sonuc = searchKeywords('ekat');
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.id, 'kuvvetli-akim');
});

test('searchKeywords: boş sorgu boş sonuç döner', () => {
  assert.deepStrictEqual(searchKeywords(''), []);
});

test('getDocumentsByInstitution: yalnızca o kurumu döner', () => {
  const tedas = getDocumentsByInstitution('TEDAŞ');
  assert.ok(tedas.length > 0);
  assert.ok(tedas.every((d) => d.institution === 'TEDAŞ'));
});

test('getDocumentsByCategory: Hücreler kategorisinde yalnızca OG Modüler Hücreler dokümanı var (ayrıntılı taksonomi)', () => {
  const hucreler = getDocumentsByCategory('Hücreler');
  assert.deepStrictEqual(hucreler.map((d) => d.id), ['og-moduler-hucre']);
  const trafo = getDocumentsByCategory('Trafo');
  assert.ok(trafo.some((d) => d.id === 'og-dagitim-trafo'));
  assert.ok(!trafo.some((d) => d.id === 'og-moduler-hucre'));
});

test('getDocumentsByType: documentType alanına göre doğru alt kümeyi döner', () => {
  const sartnameler = getDocumentsByType('Şartname');
  const yonetmelikler = getDocumentsByType('Yönetmelik');
  assert.ok(sartnameler.length > 0);
  assert.ok(yonetmelikler.length > 0);
  assert.ok(sartnameler.every((d) => d.documentType === 'Şartname'));
  assert.ok(yonetmelikler.every((d) => d.documentType === 'Yönetmelik'));
});

test('getDocumentById: var olan id için dokümanı, olmayan için undefined döner', () => {
  assert.strictEqual(getDocumentById('ag-xlpe-kablo')?.title, 'AG Güç Kabloları (XLPE/PVC İzoleli) Teknik Şartnamesi');
  assert.strictEqual(getDocumentById('olmayan-id'), undefined);
});

test('getFeaturedDocuments: yalnızca featured=true dokümanları, updatedAt azalan sırada döner', () => {
  const featured = getFeaturedDocuments();
  assert.ok(featured.length > 0);
  assert.ok(featured.every((d) => d.featured === true));
  for (let i = 1; i < featured.length; i++) {
    assert.ok(featured[i - 1]!.updatedAt >= featured[i]!.updatedAt, 'updatedAt azalan sırada olmalı');
  }
});

test('getRelatedDocuments: relatedDocuments id listesini gerçek dokümanlara çözer', () => {
  const ilgili = getRelatedDocuments('ag-xlpe-kablo');
  assert.ok(ilgili.length > 0);
  assert.ok(ilgili.some((d) => d.id === 'ag-kablo-ek'));
});

test('getRelatedDocuments: bilinmeyen id için boş dizi döner', () => {
  assert.deepStrictEqual(getRelatedDocuments('olmayan-id'), []);
});

test('getRecentDocuments: limit parametresine uyar ve updatedAt azalan sırada döner', () => {
  const son5 = getRecentDocuments(5);
  assert.strictEqual(son5.length, 5);
  for (let i = 1; i < son5.length; i++) {
    assert.ok(son5[i - 1]!.updatedAt >= son5[i]!.updatedAt);
  }
});

test('getCategories: kategori listesi elle yazılmadan, gerçek belgelerden otomatik türer', () => {
  const kategoriler = getCategories();
  assert.ok(kategoriler.length > 0);
  // "Hücreler" tam olarak 1 belgeye sahip olmalı (bkz. getDocumentsByCategory testi)
  const hucreler = kategoriler.find((k) => k.ad === 'Hücreler');
  assert.strictEqual(hucreler?.count, 1);
  // Boş kategoriler (hiçbir belge yok) listede GÖRÜNMEMELİ
  assert.ok(kategoriler.every((k) => k.count > 0));
});

test('getInstitutions: 10 kurum klasörünün TAMAMI döner, belgesi olmayanlar da count:0 ile listede kalır', () => {
  const kurumlar = getInstitutions();
  assert.strictEqual(kurumlar.length, 10);
  const teias = kurumlar.find((k) => k.institution === 'TEİAŞ');
  assert.strictEqual(teias?.count, 0);
  const tedas = kurumlar.find((k) => k.institution === 'TEDAŞ');
  assert.strictEqual(tedas?.count, 7);
});

test('getDocumentTypes: yalnızca gerçekten kullanılan tipleri döner', () => {
  const tipler = getDocumentTypes();
  assert.ok(tipler.every((t) => t.count > 0));
  assert.ok(tipler.some((t) => t.documentType === 'Şartname'));
  assert.ok(tipler.some((t) => t.documentType === 'Yönetmelik'));
});

test('getStatistics: toplam sayılar ve alt kırılımlar tutarlı', () => {
  const istatistik = getStatistics();
  const tumDokumanlar = getAllDocuments();
  assert.strictEqual(istatistik.totalDocuments, tumDokumanlar.length);
  assert.strictEqual(istatistik.totalDocuments, 14);
  assert.strictEqual(
    istatistik.byInstitution.reduce((t, k) => t + k.count, 0),
    istatistik.totalDocuments,
    'kurum bazlı sayılar toplamı toplam belge sayısına eşit olmalı'
  );
  assert.strictEqual(istatistik.deprecatedCount, 1);
  assert.ok(istatistik.featuredCount > 0);
});

test('veri bütünlüğü: Document alanları geçerli ve dolu', () => {
  const kurumlar = new Set(getInstitutions().map((k) => k.institution));
  const tumDokumanlar = getAllDocuments();
  const idler = new Set(tumDokumanlar.map((d) => d.id));
  assert.strictEqual(idler.size, tumDokumanlar.length, 'id tekrarı olmamalı');
  assert.strictEqual(tumDokumanlar.length, 14, 'mevcut 14 belge silinmemeli (Sprint 5 kuralı)');

  for (const d of tumDokumanlar) {
    assert.ok(d.category.length > 0, `${d.id}: kategori boş olamaz`);
    assert.ok(kurumlar.has(d.institution), `${d.id}: geçersiz kurum ${d.institution}`);
    assert.ok(GECERLI_DOKUMAN_TIPLERI.includes(d.documentType), `${d.id}: geçersiz doküman tipi ${d.documentType}`);
    assert.ok(d.title.length > 5 && d.shortTitle.length > 0 && d.summary.length > 30, `${d.id}: başlık/özet eksik`);
    assert.ok(['active', 'deprecated', 'draft'].includes(d.status), `${d.id}: geçersiz durum`);
    assert.ok(d.publishDate.length > 0 && d.effectiveDate.length > 0, `${d.id}: tarih alanları boş`);
    assert.ok(d.revision.length > 0, `${d.id}: revizyon eksik`);
    assert.ok(d.pdfPath.startsWith('https://'), `${d.id}: pdfPath geçersiz`);
    assert.ok(d.keywords.length >= 3, `${d.id}: en az 3 anahtar kelime olmalı`);
    assert.ok(d.relatedDocuments.length > 0, `${d.id}: relatedDocuments boş bırakılmamalı`);
    assert.strictEqual(d.favorite, false, `${d.id}: seed veride favorite her zaman false olmalı`);
    assert.strictEqual(typeof d.featured, 'boolean', `${d.id}: featured boolean olmalı`);
    assert.match(d.updatedAt, /^\d{4}-\d{2}-\d{2}$/, `${d.id}: updatedAt YYYY-MM-DD biçiminde olmalı`);
    for (const relId of d.relatedDocuments) {
      assert.ok(idler.has(relId), `${d.id}: geçersiz ilgili doküman id ${relId}`);
    }

    // Sprint 5'te eklenen alanlar
    assert.strictEqual(d.sourceVerified, true, `${d.id}: mevcut belgeler sourceVerified: true olmalı`);
    assert.ok(d.version.length > 0, `${d.id}: version boş olamaz`);
    assert.ok(d.language === 'TR' || d.language === 'EN', `${d.id}: geçersiz dil ${d.language}`);
    assert.match(d.lastChecked, /^\d{4}-\d{2}-\d{2}$/, `${d.id}: lastChecked YYYY-MM-DD biçiminde olmalı`);
    assert.ok(typeof d.searchWeight === 'number' && d.searchWeight > 0, `${d.id}: searchWeight pozitif olmalı`);
    assert.ok(typeof d.priority === 'number', `${d.id}: priority sayı olmalı`);
    assert.strictEqual(d.deprecated, d.status === 'deprecated', `${d.id}: deprecated ile status senkron olmalı`);
    if (d.deprecated) {
      assert.ok(d.replacementDocumentId, `${d.id}: deprecated belgede replacementDocumentId olmalı`);
      assert.ok(idler.has(d.replacementDocumentId!), `${d.id}: geçersiz replacementDocumentId`);
    }
  }
});
