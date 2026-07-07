// Arama motoru birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { ara, filtrele, normallestir } from '../src/logic/arama.ts';
import { DOKUMANLAR, KATEGORILER, KURUMLAR } from '../src/data/sartnameler.ts';

test('normallestir Türkçe karakterleri katlar', () => {
  assert.strictEqual(normallestir('SAYAÇ'), 'sayac');
  assert.strictEqual(normallestir('Gerilim DÜŞÜMÜ'), 'gerilim dusumu');
  assert.strictEqual(normallestir('  İç   Tesis '), 'ic tesis');
});

test('"kablo eki" araması ek dokümanını ilk sırada getirir', () => {
  const sonuc = ara('kablo eki', DOKUMANLAR);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.dokuman.id, 'ag-kablo-ek');
});

test('"og trafo" araması dağıtım trafosunu üst sıraya getirir', () => {
  const sonuc = ara('og trafo', DOKUMANLAR);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.dokuman.id, 'og-dagitim-trafo');
});

test('büyük harf ve aksansız arama da eşleşir (SAYAC → sayaç)', () => {
  const sonuc = ara('SAYAC', DOKUMANLAR);
  assert.ok(sonuc.some((s) => s.dokuman.id === 'elektronik-sayac'));
});

test('"kesinti" araması EPDK hizmet kalitesi dokümanını bulur', () => {
  const sonuc = ara('kesinti kalitesi', DOKUMANLAR);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.dokuman.id, 'epdk-hizmet-kalitesi');
});

test('boş/tek harfli sorgu boş sonuç döner', () => {
  assert.deepStrictEqual(ara('', DOKUMANLAR), []);
  assert.deepStrictEqual(ara(' a ', DOKUMANLAR), []);
});

test('eşleşmeyen sorgu boş döner', () => {
  assert.deepStrictEqual(ara('uzay mekiği', DOKUMANLAR), []);
});

test('filtrele: kurum filtresi yalnızca o kurumu döner', () => {
  const tedas = filtrele(DOKUMANLAR, { kurum: 'TEDAŞ' });
  assert.ok(tedas.length > 0);
  assert.ok(tedas.every((d) => d.kurum === 'TEDAŞ'));
});

test('filtrele: kurum + kategori birlikte çalışır', () => {
  const sonuc = filtrele(DOKUMANLAR, { kurum: 'TEDAŞ', kategoriId: 'sayac-olcu' });
  assert.ok(sonuc.length > 0);
  assert.ok(sonuc.every((d) => d.kurum === 'TEDAŞ' && d.kategoriId === 'sayac-olcu'));
});

test('filtrele: boş filtre tüm dokümanları döner', () => {
  assert.strictEqual(filtrele(DOKUMANLAR, {}).length, DOKUMANLAR.length);
});

test('filtrele: durum filtresi mülga dokümanı bulur', () => {
  const mulga = filtrele(DOKUMANLAR, { durum: 'mulga' });
  assert.ok(mulga.length >= 1);
  assert.ok(mulga.every((d) => d.durum === 'mulga'));
});

test('arama kurum adıyla da eşleşir ("epdk")', () => {
  const sonuc = ara('epdk kesinti', DOKUMANLAR);
  assert.ok(sonuc.length > 0);
  assert.strictEqual(sonuc[0]!.dokuman.kurum, 'EPDK');
});

test('veri bütünlüğü: kategori, kurum, künye alanları ve maddeler dolu', () => {
  const kategoriIdleri = new Set(KATEGORILER.map((k) => k.id));
  const kurumlar = new Set(KURUMLAR);
  const idler = new Set<string>();
  for (const d of DOKUMANLAR) {
    assert.ok(kategoriIdleri.has(d.kategoriId), `${d.id}: geçersiz kategori ${d.kategoriId}`);
    assert.ok(kurumlar.has(d.kurum), `${d.id}: geçersiz kurum ${d.kurum}`);
    assert.ok(!idler.has(d.id), `${d.id}: id tekrarı`);
    idler.add(d.id);
    assert.ok(d.baslik.length > 5 && d.ozet.length > 30, `${d.id}: başlık/özet eksik`);
    assert.ok(d.dokumanTuru.length > 2, `${d.id}: doküman türü eksik`);
    assert.ok(d.yayinTarihi.length > 0 && d.yururlukTarihi.length > 0, `${d.id}: tarih alanları boş`);
    assert.ok(['guncel', 'mulga', 'taslak'].includes(d.durum), `${d.id}: geçersiz durum`);
    assert.ok(d.onemliNoktalar.length >= 3, `${d.id}: en az 3 önemli nokta olmalı`);
    assert.ok(d.ilgiliMaddeler.length >= 1, `${d.id}: en az 1 ilgili madde olmalı`);
    assert.ok(d.kaynakBaglanti.startsWith('https://'), `${d.id}: kaynak bağlantısı geçersiz`);
    assert.ok(d.anahtarKelimeler.length >= 3, `${d.id}: en az 3 anahtar kelime olmalı`);
  }
});
