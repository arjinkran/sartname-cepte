// enhMechanical motoru (İSKELET) birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import {
  EnhMechanicalEngine,
  ENH_MECHANICAL_SUB_CALCULATIONS,
} from '../../src/calculations/engines/enhMechanical/engine.ts';
import type { EnhMechanicalInput } from '../../src/calculations/engines/enhMechanical/types.ts';

test('engine alt hesap türlerini listeler', () => {
  const idler = ENH_MECHANICAL_SUB_CALCULATIONS.map((s) => s.id);
  assert.ok(idler.includes('betonDirekSecimi'));
  assert.ok(idler.includes('degisikHallerDenklemi'));
  assert.ok(idler.includes('sehimSerbest'));
  assert.ok(idler.includes('sehimOzel'));
  assert.ok(idler.includes('dfDsHesabi'));
  assert.ok(idler.includes('amaxHesabi'));
  assert.strictEqual(idler.length, 6);
});

test('eksik hesap türü hata verir', () => {
  const eksikGirdi = {} as unknown as EnhMechanicalInput;
  const sonuc = EnhMechanicalEngine.calculate(eksikGirdi);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'calcType'));
});

test('geçersiz calcType hata verir', () => {
  const sonuc = EnhMechanicalEngine.calculate({
    calcType: 'bilinmeyenHesap' as unknown as EnhMechanicalInput['calcType'],
  });

  assert.strictEqual(sonuc.ok, false);
  assert.ok(sonuc.errors.some((e) => e.field === 'calcType'));
});

test('desteklenen buz bölgesi doğrulanır', () => {
  const sonuc = EnhMechanicalEngine.calculate({
    calcType: 'dfDsHesabi',
    iceRegion: 3,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.status, 'notImplemented');
  assert.strictEqual(sonuc.errors.length, 0);
});

test('desteklenmeyen buz bölgesi hata verir', () => {
  const sonuc = EnhMechanicalEngine.calculate({
    calcType: 'dfDsHesabi',
    iceRegion: 9 as unknown as EnhMechanicalInput['iceRegion'],
  });

  assert.strictEqual(sonuc.ok, false);
  assert.ok(sonuc.errors.some((e) => e.field === 'iceRegion'));
});

test('desteklenmeyen iletken hata verir', () => {
  const sonuc = EnhMechanicalEngine.calculate({
    calcType: 'sehimSerbest',
    conductorType: 'bilinmeyen-iletken' as unknown as EnhMechanicalInput['conductorType'],
  });

  assert.strictEqual(sonuc.ok, false);
  assert.ok(sonuc.errors.some((e) => e.field === 'conductorType'));
});

test('notImplemented sonucu döner', () => {
  const sonuc = EnhMechanicalEngine.calculate({
    calcType: 'betonDirekSecimi',
    voltageLevelKv: 34.5,
    poleType: 'tek-devre',
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.status, 'notImplemented');
  assert.ok(sonuc.output!.message.length > 0);
  assert.strictEqual(sonuc.errors.length, 0);
});

test('örnekler (examples) gerçek motor çıktısıyla senkron', () => {
  const ornekler = EnhMechanicalEngine.examples ?? [];
  assert.ok(ornekler.length >= 6);
  for (const ornek of ornekler) {
    const sonuc = EnhMechanicalEngine.calculate(ornek.input);
    assert.ok(sonuc.output, `${ornek.id}: hesap başarısız oldu`);
    assert.ok(ornek.output, `${ornek.id}: örnek çıktısı tanımlı değil`);
    assert.strictEqual(sonuc.output!.status, 'notImplemented');
    assert.strictEqual(sonuc.output!.calcType, ornek.output!.calcType);
    assert.strictEqual(sonuc.output!.message, ornek.output!.message);
  }
});
