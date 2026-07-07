// ampacityOG motoru birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { AmpacityOGEngine } from '../../src/calculations/engines/ampacityOG/engine.ts';
import type { AmpacityOGInput } from '../../src/calculations/engines/ampacityOG/types.ts';

const yaklasik = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `beklenen ~${b}, bulunan ${a}`);

test('HAWK, condition3 için ampacity 740 A dönmeli', () => {
  const sonuc = AmpacityOGEngine.calculate({
    conductorId: 'hawk',
    conditionId: 'condition3',
    voltageLevel: '35kV',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.ampacityA, 740);
});

test('SWALLOW, condition1 için ampacity 120 A dönmeli', () => {
  const sonuc = AmpacityOGEngine.calculate({
    conductorId: 'swallow',
    conditionId: 'condition1',
    voltageLevel: '10kV',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.ampacityA, 120);
});

test('RAVEN, 35kV reaktans 0.387 dönmeli', () => {
  const sonuc = AmpacityOGEngine.calculate({
    conductorId: 'raven',
    conditionId: 'condition2',
    voltageLevel: '35kV',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  yaklasik(sonuc.output!.reactanceOhmPerKm, 0.387, 0.0001);
});

test('expectedCurrentA ampacity\'den küçükse uygun dönmeli', () => {
  const sonuc = AmpacityOGEngine.calculate({
    conductorId: 'swallow',
    conditionId: 'condition1',
    voltageLevel: '10kV',
    expectedCurrentA: 100,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.isSuitable, true);
  yaklasik(sonuc.output!.utilizationPercent!, (100 / 120) * 100, 0.01);
  yaklasik(sonuc.output!.remainingCapacityA!, 20, 0.01);
  assert.strictEqual(sonuc.warnings.length, 0);
});

test('expectedCurrentA ampacity\'den büyükse uygun değil dönmeli', () => {
  const sonuc = AmpacityOGEngine.calculate({
    conductorId: 'raven',
    conditionId: 'condition2',
    voltageLevel: '35kV',
    expectedCurrentA: 300,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.isSuitable, false);
  assert.ok(sonuc.warnings.length > 0);
  assert.strictEqual(sonuc.warnings[0]!.code, 'AMPACITY_EXCEEDED');
});

test('expectedCurrentA verilmezse yalnızca kapasite bilgisi döner', () => {
  const sonuc = AmpacityOGEngine.calculate({
    conductorId: 'hawk',
    conditionId: 'condition3',
    voltageLevel: '35kV',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.isSuitable, null);
  assert.strictEqual(sonuc.output!.utilizationPercent, null);
  assert.strictEqual(sonuc.output!.remainingCapacityA, null);
});

test('eksik conductorId hata vermeli', () => {
  const eksikGirdi = {
    conditionId: 'condition1',
    voltageLevel: '10kV',
  } as unknown as AmpacityOGInput;

  const sonuc = AmpacityOGEngine.calculate(eksikGirdi);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'conductorId'));
});

test('eksik conditionId hata vermeli', () => {
  const eksikGirdi = {
    conductorId: 'hawk',
    voltageLevel: '10kV',
  } as unknown as AmpacityOGInput;

  const sonuc = AmpacityOGEngine.calculate(eksikGirdi);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'conditionId'));
});

test('bilinmeyen conductorId hata vermeli', () => {
  const sonuc = AmpacityOGEngine.calculate({
    conductorId: 'bilinmeyen-iletken',
    conditionId: 'condition1',
    voltageLevel: '10kV',
  });

  assert.strictEqual(sonuc.ok, false);
  assert.ok(sonuc.errors.some((e) => e.field === 'conductorId'));
});

test('örnekler (examples) gerçek motor çıktısıyla senkron', () => {
  const ornekler = AmpacityOGEngine.examples ?? [];
  assert.ok(ornekler.length > 0);
  for (const ornek of ornekler) {
    const sonuc = AmpacityOGEngine.calculate(ornek.input);
    assert.ok(sonuc.output, `${ornek.id}: hesap başarısız oldu`);
    assert.ok(ornek.output, `${ornek.id}: örnek çıktısı tanımlı değil`);
    assert.strictEqual(sonuc.output!.ampacityA, ornek.output!.ampacityA);
    assert.strictEqual(sonuc.output!.isSuitable, ornek.output!.isSuitable);
    yaklasik(sonuc.output!.reactanceOhmPerKm, ornek.output!.reactanceOhmPerKm, 0.001);
    if (ornek.output!.utilizationPercent != null) {
      yaklasik(sonuc.output!.utilizationPercent!, ornek.output!.utilizationPercent, 0.01);
    }
  }
});
