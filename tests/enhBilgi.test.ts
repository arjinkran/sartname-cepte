// enhBilgi modülü (ENH Bilgi Bankası) veri testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { ILETKENLER } from '../modules/enhBilgi/data/iletkenler.ts';
import { DIREK_SINIFLARI } from '../modules/enhBilgi/data/direkSiniflari.ts';

test('5 iletken listeleniyor', () => {
  assert.strictEqual(ILETKENLER.length, 5);
});

test('6 direk sınıfı listeleniyor', () => {
  assert.strictEqual(DIREK_SINIFLARI.length, 6);
});

test('477 MCM Hawk verisi bulunuyor', () => {
  const hawk = ILETKENLER.find((i) => i.id === 'hawk');
  assert.ok(hawk);
  assert.strictEqual(hawk!.ad, 'Hawk');
  assert.strictEqual(hawk!.kod, '477 MCM');
  // src/calculations/engines/ampacityOG/data.ts ile uyumlu olmalı.
  assert.strictEqual(hawk!.aluminyumKesitMm2, 241.5);
  assert.strictEqual(hawk!.celikKesitMm2, 39.33);
  assert.strictEqual(hawk!.toplamKesitMm2, 280.83);
  assert.strictEqual(hawk!.nominalCapMm, 21.79);
  assert.strictEqual(hawk!.nominalAgirlikKgPerM, 0.9763);
  assert.strictEqual(hawk!.kopmaDayanimiKg, 8845);
});

test('Taşıyıcı Direk açıklaması var', () => {
  const tasiyici = DIREK_SINIFLARI.find((d) => d.id === 'tasiyici');
  assert.ok(tasiyici);
  assert.strictEqual(tasiyici!.ad, 'Taşıyıcı Direk');
  assert.ok(tasiyici!.tanim.length > 10);
  assert.ok(tasiyici!.kullanimYeri.length > 0);
  assert.ok(tasiyici!.dikkatNotu.length > 0);
});

test('Branşman Direği açıklaması var', () => {
  const bransman = DIREK_SINIFLARI.find((d) => d.id === 'bransman');
  assert.ok(bransman);
  assert.strictEqual(bransman!.ad, 'Branşman Direği');
  assert.ok(bransman!.tanim.length > 10);
  assert.ok(bransman!.kullanimYeri.length > 0);
  assert.ok(bransman!.dikkatNotu.length > 0);
});
