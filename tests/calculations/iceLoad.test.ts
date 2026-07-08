// iceLoad alt motoru (ÖN HESAP) birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { IceLoadEngine } from '../../src/calculations/engines/enhMechanical/iceLoad/engine.ts';
import { ACSR_CONDUCTORS } from '../../src/catalogs/conductors/acsr.ts';
import type { IceLoadInput } from '../../src/calculations/engines/enhMechanical/iceLoad/types.ts';

const yaklasik = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `beklenen ~${b}, bulunan ${a}`);

test('477 MCM için çap katalogdan gelir', () => {
  const hawk = ACSR_CONDUCTORS.find((c) => c.id === 'hawk')!;
  const sonuc = IceLoadEngine.calculate({ conductorType: '477-mcm-hawk', iceRegion: 1 });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.conductorDiameterMm, hawk.nominalDiameterMm);
  assert.strictEqual(sonuc.output!.conductorWeightKgPerM, hawk.nominalWeightKgPerM);
});

test('3. bölge buz yükü üretir', () => {
  const sonuc = IceLoadEngine.calculate({ conductorType: '477-mcm-hawk', iceRegion: 3 });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.ok(sonuc.output!.iceLoadKgPerM > 0);
});

test('iki buz yükü bir buz yükünün 2 katıdır', () => {
  const sonuc = IceLoadEngine.calculate({ conductorType: '1-0-awg', iceRegion: 4 });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  yaklasik(sonuc.output!.doubleIceLoadKgPerM, sonuc.output!.iceLoadKgPerM * 2, 0.0001);
});

test('toplam ağırlık iletken ağırlığı + buz yüküdür', () => {
  const sonuc = IceLoadEngine.calculate({ conductorType: '3-0-awg', iceRegion: 2 });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  yaklasik(
    sonuc.output!.totalWeightWithIceKgPerM,
    sonuc.output!.conductorWeightKgPerM + sonuc.output!.iceLoadKgPerM,
    0.0001
  );
  yaklasik(
    sonuc.output!.totalWeightWithDoubleIceKgPerM,
    sonuc.output!.conductorWeightKgPerM + sonuc.output!.doubleIceLoadKgPerM,
    0.0001
  );
});

test('eksik iletken hata verir', () => {
  const eksikGirdi = { iceRegion: 2 } as unknown as IceLoadInput;
  const sonuc = IceLoadEngine.calculate(eksikGirdi);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'conductorType'));
});

test('geçersiz buz bölgesi hata verir', () => {
  const sonuc = IceLoadEngine.calculate({
    conductorType: '266-8-mcm',
    iceRegion: 9 as unknown as IceLoadInput['iceRegion'],
  });

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'iceRegion'));
});

test('örnekler (examples) gerçek motor çıktısıyla senkron', () => {
  const ornekler = IceLoadEngine.examples ?? [];
  assert.ok(ornekler.length >= 3);
  for (const ornek of ornekler) {
    const sonuc = IceLoadEngine.calculate(ornek.input);
    assert.ok(sonuc.output, `${ornek.id}: hesap başarısız oldu`);
    assert.ok(ornek.output, `${ornek.id}: örnek çıktısı tanımlı değil`);
    yaklasik(sonuc.output!.conductorDiameterMm, ornek.output!.conductorDiameterMm);
    yaklasik(sonuc.output!.conductorWeightKgPerM, ornek.output!.conductorWeightKgPerM);
    yaklasik(sonuc.output!.iceLoadKgPerM, ornek.output!.iceLoadKgPerM);
    yaklasik(sonuc.output!.totalWeightWithIceKgPerM, ornek.output!.totalWeightWithIceKgPerM);
    yaklasik(sonuc.output!.doubleIceLoadKgPerM, ornek.output!.doubleIceLoadKgPerM);
    yaklasik(sonuc.output!.totalWeightWithDoubleIceKgPerM, ornek.output!.totalWeightWithDoubleIceKgPerM);
  }
});
