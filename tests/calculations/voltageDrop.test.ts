// voltageDrop motoru (DEMO) birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { VoltageDropEngine } from '../../src/calculations/engines/voltageDrop/engine.ts';
import type { VoltageDropInput } from '../../src/calculations/engines/voltageDrop/types.ts';

const yaklasik = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `beklenen ~${b}, bulunan ${a}`);

test('trifaze demo hesap çalışıyor', () => {
  const sonuc = VoltageDropEngine.calculate({
    voltage: 400,
    current: 30,
    length: 100,
    resistancePerKm: 1.5,
    phaseType: 'tri',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  // eV = √3 · 30 · (1.5/1000) · 100 ≈ 7.7942
  yaklasik(sonuc.output!.voltageDropVolt, 7.7942, 0.01);
  yaklasik(sonuc.output!.voltageDropPercent, 1.9486, 0.01);
  assert.strictEqual(sonuc.output!.isWithinLimit, true);
  assert.strictEqual(sonuc.errors.length, 0);
});

test('monofaze demo hesap çalışıyor', () => {
  const sonuc = VoltageDropEngine.calculate({
    voltage: 230,
    current: 15,
    length: 40,
    resistancePerKm: 3.5,
    phaseType: 'mono',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  // eV = 2 · 15 · (3.5/1000) · 40 = 4.2
  yaklasik(sonuc.output!.voltageDropVolt, 4.2, 0.001);
  yaklasik(sonuc.output!.voltageDropPercent, (4.2 / 230) * 100, 0.001);
  assert.strictEqual(sonuc.output!.isWithinLimit, true);
});

test('eksik input hata veriyor', () => {
  // "current" alanı eksik — formdan gelen eksik girdiyi simüle eder.
  const eksikGirdi = {
    voltage: 400,
    length: 100,
    resistancePerKm: 1.5,
    phaseType: 'tri',
  } as unknown as VoltageDropInput;

  const sonuc = VoltageDropEngine.calculate(eksikGirdi);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.length > 0);
  assert.ok(sonuc.errors.some((e) => e.field === 'current'));
});

test('geçersiz faz tipi hata veriyor', () => {
  const sonuc = VoltageDropEngine.calculate({
    voltage: 230,
    current: 10,
    length: 50,
    resistancePerKm: 2,
    phaseType: 'uc-faz' as unknown as VoltageDropInput['phaseType'],
  });

  assert.strictEqual(sonuc.ok, false);
  assert.ok(sonuc.errors.some((e) => e.field === 'phaseType'));
});

test('limit aşımı warning üretiyor', () => {
  const sonuc = VoltageDropEngine.calculate({
    voltage: 230,
    current: 50,
    length: 500,
    resistancePerKm: 5,
    phaseType: 'mono',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.isWithinLimit, false);
  assert.ok(sonuc.warnings.length > 0);
  assert.strictEqual(sonuc.warnings[0]!.code, 'LIMIT_EXCEEDED');
});

test('metadata Excel entegrasyonu için gerekli alanları içerir', () => {
  const { metadata } = VoltageDropEngine;
  assert.strictEqual(metadata.id, 'voltageDrop.demo');
  assert.ok(metadata.name.length > 0);
  assert.ok(metadata.description.length > 0);
  assert.ok(metadata.version.length > 0);
  assert.ok(metadata.author.length > 0);
  assert.ok(metadata.createdAt.length > 0);
  assert.ok(metadata.updatedAt.length > 0);
});

test('inputs/outputs/constants/limits dizileri dolu', () => {
  assert.ok(VoltageDropEngine.inputs.length >= 5);
  assert.ok(VoltageDropEngine.outputs.length >= 3);
  assert.ok(VoltageDropEngine.constants.length >= 1);
  assert.ok(VoltageDropEngine.limits.length >= 1);
  assert.ok(VoltageDropEngine.limits.some((l) => l.key === 'maxVoltageDrop'));
  assert.ok(VoltageDropEngine.limits.some((l) => l.key === 'recommendedVoltageDrop'));
  assert.ok(VoltageDropEngine.limits.some((l) => l.key === 'warningVoltageDrop'));
});

test('örnekler (examples) gerçek motor çıktısıyla senkron', () => {
  const ornekler = VoltageDropEngine.examples ?? [];
  assert.ok(ornekler.length > 0);
  for (const ornek of ornekler) {
    const sonuc = VoltageDropEngine.calculate(ornek.input);
    assert.ok(sonuc.output, `${ornek.id}: hesap başarısız oldu`);
    assert.ok(ornek.output, `${ornek.id}: örnek çıktısı tanımlı değil`);
    yaklasik(sonuc.output!.voltageDropVolt, ornek.output!.voltageDropVolt, 0.01);
    yaklasik(sonuc.output!.voltageDropPercent, ornek.output!.voltageDropPercent, 0.01);
    assert.strictEqual(sonuc.output!.isWithinLimit, ornek.output!.isWithinLimit);
  }
});
