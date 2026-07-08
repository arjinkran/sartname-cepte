// poleForce alt motoru (ÖN HESAP) birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { PoleForceEngine } from '../../src/calculations/engines/enhMechanical/poleForce/engine.ts';
import type { PoleForceInput } from '../../src/calculations/engines/enhMechanical/poleForce/types.ts';

const yaklasik = (a: number, b: number, tol = 0.1) =>
  assert.ok(Math.abs(a - b) <= tol, `beklenen ~${b}, bulunan ${a}`);

const TEMEL_GIRDI: PoleForceInput = {
  conductorType: '1-0-awg',
  spanLeftM: 60,
  spanRightM: 80,
  iceRegion: 1,
  windRegion: 2,
  poleFunction: 'tasiyici',
  deviationAngleDeg: 0,
  equipmentWeightKg: 50,
  safetyFactor: 1.5,
};

test('düz taşıyıcı direkte açı kuvveti 0 olur', () => {
  const sonuc = PoleForceEngine.calculate({ ...TEMEL_GIRDI, poleFunction: 'tasiyici', deviationAngleDeg: 0 });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.angleForceKg, 0);
});

test('sapma açısı varsa açı kuvveti oluşur', () => {
  const sonuc = PoleForceEngine.calculate({ ...TEMEL_GIRDI, poleFunction: 'kose-durdurucu', deviationAngleDeg: 30 });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.ok(sonuc.output!.angleForceKg > 0);
});

test('emniyet katsayısı designForce değerini artırır', () => {
  const dusukKatsayi = PoleForceEngine.calculate({ ...TEMEL_GIRDI, safetyFactor: 1.2 });
  const yuksekKatsayi = PoleForceEngine.calculate({ ...TEMEL_GIRDI, safetyFactor: 2.0 });

  assert.ok(dusukKatsayi.output);
  assert.ok(yuksekKatsayi.output);
  assert.ok(yuksekKatsayi.output!.designForceKg > dusukKatsayi.output!.designForceKg);
});

test('eksik iletken hata verir', () => {
  const eksikGirdi = { ...TEMEL_GIRDI } as Partial<PoleForceInput>;
  delete eksikGirdi.conductorType;

  const sonuc = PoleForceEngine.calculate(eksikGirdi as PoleForceInput);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'conductorType'));
});

test('negatif açıklık hata verir', () => {
  const sonuc = PoleForceEngine.calculate({ ...TEMEL_GIRDI, spanLeftM: -10 });

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'spanLeftM'));
});

test('477 MCM için sonuç üretir', () => {
  const sonuc = PoleForceEngine.calculate({ ...TEMEL_GIRDI, conductorType: '477-mcm-hawk' });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.ok(Number.isFinite(sonuc.output!.designForceKg));
  assert.ok(sonuc.output!.designForceKg > 0);
});

test('örnekler (examples) gerçek motor çıktısıyla senkron', () => {
  const ornekler = PoleForceEngine.examples ?? [];
  assert.ok(ornekler.length >= 3);
  for (const ornek of ornekler) {
    const sonuc = PoleForceEngine.calculate(ornek.input);
    assert.ok(sonuc.output, `${ornek.id}: hesap başarısız oldu`);
    assert.ok(ornek.output, `${ornek.id}: örnek çıktısı tanımlı değil`);
    yaklasik(sonuc.output!.verticalForceKg, ornek.output!.verticalForceKg);
    yaklasik(sonuc.output!.horizontalWindForceKg, ornek.output!.horizontalWindForceKg);
    yaklasik(sonuc.output!.angleForceKg, ornek.output!.angleForceKg);
    yaklasik(sonuc.output!.totalHorizontalForceKg, ornek.output!.totalHorizontalForceKg);
    yaklasik(sonuc.output!.resultantForceKg, ornek.output!.resultantForceKg);
    yaklasik(sonuc.output!.designForceKg, ornek.output!.designForceKg);
  }
});
