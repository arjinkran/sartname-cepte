// Arama motoru birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { ara, filtrele, normallestir } from '../modules/mevzuat/services/arama.ts';
import { DOCUMENTS, KATEGORILER, KURUMLAR } from '../modules/mevzuat/data/sartnameler.ts';

test('normallestir Türkçe karakterleri katlar', () => {
  assert.strictEqual(normallestir('SAYAÇ'), 'sayac');
  assert.strictEqual(normallestir('Gerilim DÜŞÜMÜ'), 'gerilim dusumu');
  assert.strictEqual(normallestir('  İç   Tesis '), 'ic tesis');
});

test('"kablo eki" araması ek dokümanını ilk sırada getirir', () => {
  const sonuc = ara('kablo eki', DOCUMENTS);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.id, 'ag-kablo-ek');
});

test('"og trafo" araması dağıtım trafosunu üst sıraya getirir', () => {
  const sonuc = ara('og trafo', DOCUMENTS);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.id, 'og-dagitim-trafo');
});

test('büyük harf ve aksansız arama da eşleşir (SAYAC → sayaç)', () => {
  const sonuc = ara('SAYAC', DOCUMENTS);
  assert.ok(sonuc.some((s) => s.document.id === 'elektronik-sayac'));
});

test('"kesinti" araması EPDK hizmet kalitesi dokümanını bulur', () => {
  const sonuc = ara('kesinti kalitesi', DOCUMENTS);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.id, 'epdk-hizmet-kalitesi');
});

test('boş/tek harfli sorgu boş sonuç döner', () => {
  assert.deepStrictEqual(ara('', DOCUMENTS), []);
  assert.deepStrictEqual(ara(' a ', DOCUMENTS), []);
});

test('eşleşmeyen sorgu boş döner', () => {
  assert.deepStrictEqual(ara('uzay mekiği', DOCUMENTS), []);
});

test('arama artık kategori alanında da eşleşir (og-dagitim-trafo başlığında "hücreler" geçmez)', () => {
  const sonuc = ara('hücreler', DOCUMENTS);
  const idler = sonuc.map((s) => s.document.id);
  assert.ok(idler.includes('og-moduler-hucre'));
  assert.ok(idler.includes('og-dagitim-trafo'));
});

test('arama artık kurum alanında da eşleşir ("gazete" hiçbir başlık/anahtar kelimede geçmez)', () => {
  const sonuc = ara('gazete', DOCUMENTS);
  assert.ok(sonuc.length > 0);
  assert.ok(sonuc.every((s) => s.document.institution === 'Resmî Gazete'));
});

test('filtrele: kurum filtresi yalnızca o kurumu döner', () => {
  const tedas = filtrele(DOCUMENTS, { institution: 'TEDAŞ' });
  assert.ok(tedas.length > 0);
  assert.ok(tedas.every((d) => d.institution === 'TEDAŞ'));
});

test('filtrele: kurum + kategori birlikte çalışır', () => {
  const kategori = KATEGORILER.find((k) => k.id === 'sayac-olcu')!;
  const sonuc = filtrele(DOCUMENTS, { institution: 'TEDAŞ', category: kategori.ad });
  assert.ok(sonuc.length > 0);
  assert.ok(sonuc.every((d) => d.institution === 'TEDAŞ' && d.category === kategori.ad));
});

test('filtrele: boş filtre tüm dokümanları döner', () => {
  assert.strictEqual(filtrele(DOCUMENTS, {}).length, DOCUMENTS.length);
});

test('filtrele: durum filtresi mülga (deprecated) dokümanı bulur', () => {
  const mulga = filtrele(DOCUMENTS, { status: 'deprecated' });
  assert.ok(mulga.length >= 1);
  assert.ok(mulga.every((d) => d.status === 'deprecated'));
});

test('arama kurum adıyla da eşleşir ("epdk")', () => {
  const sonuc = ara('epdk kesinti', DOCUMENTS);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.document.institution, 'EPDK');
});

test('veri bütünlüğü: Document alanları geçerli ve dolu', () => {
  const kategoriAdlari = new Set(KATEGORILER.map((k) => k.ad));
  const kurumlar = new Set(KURUMLAR);
  const idler = new Set(DOCUMENTS.map((d) => d.id));
  assert.strictEqual(idler.size, DOCUMENTS.length, 'id tekrarı olmamalı');

  for (const d of DOCUMENTS) {
    assert.ok(kategoriAdlari.has(d.category), `${d.id}: geçersiz kategori ${d.category}`);
    assert.ok(kurumlar.has(d.institution), `${d.id}: geçersiz kurum ${d.institution}`);
    assert.ok(d.title.length > 5 && d.summary.length > 30, `${d.id}: başlık/özet eksik`);
    assert.ok(['active', 'deprecated', 'draft'].includes(d.status), `${d.id}: geçersiz durum`);
    assert.ok(d.publishDate.length > 0 && d.effectiveDate.length > 0, `${d.id}: tarih alanları boş`);
    assert.ok(d.revision.length > 0, `${d.id}: revizyon eksik`);
    assert.ok(d.pdfUrl.startsWith('https://'), `${d.id}: pdfUrl geçersiz`);
    assert.ok(d.keywords.length >= 3, `${d.id}: en az 3 anahtar kelime olmalı`);
    assert.ok(d.tags.length >= 1, `${d.id}: en az 1 etiket olmalı`);
    for (const relId of d.relatedDocuments) {
      assert.ok(idler.has(relId), `${d.id}: geçersiz ilgili doküman id ${relId}`);
    }
  }
});
