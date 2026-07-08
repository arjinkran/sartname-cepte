// enhBilgi modülü — Direk Malzemeleri / Devre Tipleri / İzolatörler veri testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { DIREK_MALZEMELERI } from '../modules/enhBilgi/data/direkMalzemeleri.ts';
import { DIREK_DEVRE_TIPLERI } from '../modules/enhBilgi/data/direkDevreTipleri.ts';
import { IZOLATORLER } from '../modules/enhBilgi/data/izolatorler.ts';
import { DIREK_SINIFLARI } from '../modules/enhBilgi/data/direkSiniflari.ts';

test('3 direk malzemesi var', () => {
  assert.strictEqual(DIREK_MALZEMELERI.length, 3);
});

test('4 devre tipi var', () => {
  assert.strictEqual(DIREK_DEVRE_TIPLERI.length, 4);
});

test('3 izolatör tipi var', () => {
  assert.strictEqual(IZOLATORLER.length, 3);
});

test('Beton Direk açıklaması var', () => {
  const beton = DIREK_MALZEMELERI.find((m) => m.id === 'beton');
  assert.ok(beton);
  assert.strictEqual(beton!.ad, 'Beton Direk');
  assert.ok(beton!.tanim.length > 10);
  assert.ok(beton!.kullanimAlani.length > 0);
  assert.ok(beton!.avantaj.length > 0);
  assert.ok(beton!.dikkatNotu.length > 0);
});

test('Zincir İzolatör açıklaması var', () => {
  const zincir = IZOLATORLER.find((i) => i.id === 'zincir');
  assert.ok(zincir);
  assert.strictEqual(zincir!.ad, 'Zincir İzolatör');
  assert.ok(zincir!.tanim.length > 10);
  assert.ok(zincir!.kullanimYeri.length > 0);
  assert.ok(zincir!.dikkatNotu.length > 0);
});

test('izolatörlerin ilgili direk tipleri gerçek direk sınıflarıyla eşleşiyor', () => {
  const direkSinifIdleri = new Set(DIREK_SINIFLARI.map((d) => d.id));
  for (const izolator of IZOLATORLER) {
    assert.ok(izolator.ilgiliDirekTipleri.length > 0, `${izolator.id}: ilgili direk tipi yok`);
    for (const direkId of izolator.ilgiliDirekTipleri) {
      assert.ok(direkSinifIdleri.has(direkId), `${izolator.id}: geçersiz direk sınıfı id'si ${direkId}`);
    }
  }
});
