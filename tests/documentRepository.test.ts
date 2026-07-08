// Doküman Repository birim testleri (Sprint 4).
// Önceki tests/arama.test.ts'in yerine geçer — aynı arama davranışı
// (normallestir/search puanlaması) src/data/documents/repository.ts'e
// birebir taşındı, testler de oraya taşındı. Ayrıca yeni repository
// fonksiyonlarının (getFeaturedDocuments, getByType, getRelatedDocuments,
// getRecentDocuments) her biri için en az bir test eklendi.
import { test } from 'node:test';
import assert from 'node:assert';
import {
  getAllDocuments,
  getByCategory,
  getByInstitution,
  getByType,
  getDocumentById,
  getFeaturedDocuments,
  getRecentDocuments,
  getRelatedDocuments,
  normallestir,
  search,
} from '../src/data/documents/repository.ts';
import { CATEGORIES } from '../src/data/documents/categories.ts';
import { INSTITUTIONS } from '../src/data/documents/institutions.ts';
import { DOCUMENT_TYPES } from '../src/data/documents/documentTypes.ts';

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
  const sadeceTedas = getByInstitution('TEDAŞ');
  const sonuc = search('kablo', sadeceTedas);
  assert.ok(sonuc.length > 0);
  assert.ok(sonuc.every((s) => s.document.institution === 'TEDAŞ'));
});

test('getByInstitution: yalnızca o kurumu döner', () => {
  const tedas = getByInstitution('TEDAŞ');
  assert.ok(tedas.length > 0);
  assert.ok(tedas.every((d) => d.institution === 'TEDAŞ'));
});

test('getByCategory: Hücreler kategorisinde yalnızca OG Modüler Hücreler dokümanı var (yeni ayrıntılı taksonomi)', () => {
  // Eski dar kategori sisteminde "OG / Trafo ve Hücreler" tek kategoriydi;
  // Sprint 4'te Trafo ve Hücreler ayrı kategorilere bölündü (madde 4).
  const hucreler = getByCategory('Hücreler');
  assert.deepStrictEqual(hucreler.map((d) => d.id), ['og-moduler-hucre']);
  const trafo = getByCategory('Trafo');
  assert.ok(trafo.some((d) => d.id === 'og-dagitim-trafo'));
  assert.ok(!trafo.some((d) => d.id === 'og-moduler-hucre'));
});

test('getByType: documentType alanına göre doğru alt kümeyi döner', () => {
  const sartnameler = getByType('Şartname');
  const yonetmelikler = getByType('Yönetmelik');
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

test('veri bütünlüğü: Document alanları geçerli ve dolu', () => {
  const kategoriAdlari = new Set(CATEGORIES.map((k) => k.ad));
  const kurumlar = new Set(INSTITUTIONS);
  const tipler = new Set(DOCUMENT_TYPES);
  const tumDokumanlar = getAllDocuments();
  const idler = new Set(tumDokumanlar.map((d) => d.id));
  assert.strictEqual(idler.size, tumDokumanlar.length, 'id tekrarı olmamalı');

  for (const d of tumDokumanlar) {
    assert.ok(kategoriAdlari.has(d.category), `${d.id}: geçersiz kategori ${d.category}`);
    assert.ok(kurumlar.has(d.institution), `${d.id}: geçersiz kurum ${d.institution}`);
    assert.ok(tipler.has(d.documentType), `${d.id}: geçersiz doküman tipi ${d.documentType}`);
    assert.ok(d.title.length > 5 && d.shortTitle.length > 0 && d.summary.length > 30, `${d.id}: başlık/özet eksik`);
    assert.ok(['active', 'deprecated', 'draft'].includes(d.status), `${d.id}: geçersiz durum`);
    assert.ok(d.publishDate.length > 0 && d.effectiveDate.length > 0, `${d.id}: tarih alanları boş`);
    assert.ok(d.revision.length > 0, `${d.id}: revizyon eksik`);
    assert.ok(d.pdfPath.startsWith('https://'), `${d.id}: pdfPath geçersiz`);
    assert.ok(d.keywords.length >= 3, `${d.id}: en az 3 anahtar kelime olmalı`);
    assert.ok(d.relatedDocuments.length > 0, `${d.id}: relatedDocuments boş bırakılmamalı (madde 7)`);
    assert.strictEqual(d.favorite, false, `${d.id}: seed veride favorite her zaman false olmalı`);
    assert.strictEqual(typeof d.featured, 'boolean', `${d.id}: featured boolean olmalı`);
    assert.match(d.updatedAt, /^\d{4}-\d{2}-\d{2}$/, `${d.id}: updatedAt YYYY-MM-DD biçiminde olmalı`);
    for (const relId of d.relatedDocuments) {
      assert.ok(idler.has(relId), `${d.id}: geçersiz ilgili doküman id ${relId}`);
    }
  }
});
