// Hesap motoru birim testleri — elle doğrulanmış örneklerle.
// Çalıştırma: npm test  (node --experimental-strip-types --test)
import { test } from 'node:test';
import assert from 'node:assert';
import {
  hesaplaGerilimDusumu,
  gerekliMinKesit,
  hesaplaAkim,
  sayiyaCevir,
} from '../src/logic/gerilimDusumu.ts';

const yaklasik = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `beklenen ~${b}, bulunan ${a}`);

test('monofaze gerilim düşümü — Cu, 25 m, 2 kW, 2.5 mm², 230 V', () => {
  const { eYuzde, deltaU } = hesaplaGerilimDusumu({
    faz: 'mono', L: 25, P_kW: 2, S: 2.5, U: 230, malzeme: 'bakir',
  });
  // e% = 200·25·2000 / (56·2.5·230²) = 10.000.000 / 7.406.000 = 1,3502
  yaklasik(eYuzde, 1.3502, 0.001);
  yaklasik(deltaU, 3.105, 0.01);
});

test('trifaze gerilim düşümü — Cu, 100 m, 15 kW, 6 mm², 400 V', () => {
  const { eYuzde } = hesaplaGerilimDusumu({
    faz: 'tri', L: 100, P_kW: 15, S: 6, U: 400, malzeme: 'bakir',
  });
  // e% = 100·100·15000 / (56·6·160000) = 2,7902
  yaklasik(eYuzde, 2.7902, 0.001);
});

test('alüminyum iletken bakırdan daha çok düşüm verir (56/35 oranı)', () => {
  const girdi = { faz: 'tri' as const, L: 80, P_kW: 10, S: 16, U: 400 };
  const cu = hesaplaGerilimDusumu({ ...girdi, malzeme: 'bakir' }).eYuzde;
  const al = hesaplaGerilimDusumu({ ...girdi, malzeme: 'aluminyum' }).eYuzde;
  yaklasik(al / cu, 56 / 35, 0.0001);
});

test('gerekli min kesit — mono, 40 m, 3 kW, %3 limit → 4 mm²', () => {
  const { teorik, standart } = gerekliMinKesit({
    faz: 'mono', L: 40, P_kW: 3, U: 230, malzeme: 'bakir', limitYuzde: 3,
  });
  // teorik = 200·40·3000 / (56·3·52900) = 2,7005 → standart 4 mm²
  yaklasik(teorik, 2.7005, 0.001);
  assert.strictEqual(standart, 4);
});

test('gerekli min kesit — 300 mm² yetmezse null döner', () => {
  const { standart } = gerekliMinKesit({
    faz: 'mono', L: 5000, P_kW: 100, U: 230, malzeme: 'aluminyum', limitYuzde: 1.5,
  });
  assert.strictEqual(standart, null);
});

test('akım hesabı — tri, 15 kW, 400 V, cosφ 0.9 → ~24,06 A', () => {
  yaklasik(hesaplaAkim({ faz: 'tri', P_kW: 15, U: 400, cosfi: 0.9 }), 24.06, 0.01);
});

test('akım hesabı — mono, 2 kW, 230 V, cosφ 1 → ~8,70 A', () => {
  yaklasik(hesaplaAkim({ faz: 'mono', P_kW: 2, U: 230, cosfi: 1 }), 8.6957, 0.001);
});

test('sayiyaCevir Türkçe virgülü kabul eder', () => {
  assert.strictEqual(sayiyaCevir('12,5'), 12.5);
  assert.strictEqual(sayiyaCevir('80'), 80);
  assert.ok(Number.isNaN(sayiyaCevir('')));
  assert.ok(Number.isNaN(sayiyaCevir('abc')));
});

test('geçersiz girdiler hata fırlatır', () => {
  assert.throws(() => hesaplaGerilimDusumu({ faz: 'mono', L: -5, P_kW: 2, S: 2.5, U: 230, malzeme: 'bakir' }));
  // @ts-expect-error — bilinçli hatalı faz değeri
  assert.throws(() => hesaplaGerilimDusumu({ faz: 'iki', L: 5, P_kW: 2, S: 2.5, U: 230, malzeme: 'bakir' }));
  // @ts-expect-error — bilinçli hatalı malzeme
  assert.throws(() => hesaplaGerilimDusumu({ faz: 'mono', L: 5, P_kW: 2, S: 2.5, U: 230, malzeme: 'demir' }));
  assert.throws(() => hesaplaAkim({ faz: 'mono', P_kW: 2, U: 230, cosfi: 1.4 }));
});
