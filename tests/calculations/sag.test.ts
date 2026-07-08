// sag alt motoru (ÖN HESAP) birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { SagEngine } from '../../src/calculations/engines/enhMechanical/sag/engine.ts';
import { IceLoadEngine } from '../../src/calculations/engines/enhMechanical/iceLoad/engine.ts';
import type { SagInput } from '../../src/calculations/engines/enhMechanical/sag/types.ts';

const yaklasik = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `beklenen ~${b}, bulunan ${a}`);

const TEMEL_GIRDI: SagInput = {
  conductorType: '1-0-awg',
  spanLengthM: 100,
  iceRegion: 2,
  tensionKg: 1000,
  loadCase: 'noIce',
};

test('buzsuz durumda iletken ağırlığı kullanılır', () => {
  const buzSonucu = IceLoadEngine.calculate({ conductorType: '1-0-awg', iceRegion: 2 });
  assert.ok(buzSonucu.output);

  const sonuc = SagEngine.calculate({ ...TEMEL_GIRDI, loadCase: 'noIce' });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.iceLoadKgPerM, 0);
  assert.strictEqual(sonuc.output!.totalLoadKgPerM, buzSonucu.output!.conductorWeightKgPerM);
});

test('bir buz yüklü durumda IceLoadEngine sonucu kullanılır', () => {
  const buzSonucu = IceLoadEngine.calculate({ conductorType: '1-0-awg', iceRegion: 2 });
  assert.ok(buzSonucu.output);

  const sonuc = SagEngine.calculate({ ...TEMEL_GIRDI, loadCase: 'oneIce' });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.iceLoadKgPerM, buzSonucu.output!.iceLoadKgPerM);
  assert.strictEqual(sonuc.output!.totalLoadKgPerM, buzSonucu.output!.totalWeightWithIceKgPerM);
});

test('iki buz yüklü durumda IceLoadEngine sonucu kullanılır', () => {
  const buzSonucu = IceLoadEngine.calculate({ conductorType: '1-0-awg', iceRegion: 2 });
  assert.ok(buzSonucu.output);

  const sonuc = SagEngine.calculate({ ...TEMEL_GIRDI, loadCase: 'doubleIce' });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.iceLoadKgPerM, buzSonucu.output!.doubleIceLoadKgPerM);
  assert.strictEqual(sonuc.output!.totalLoadKgPerM, buzSonucu.output!.totalWeightWithDoubleIceKgPerM);
});

test('çekme kuvveti artınca sehim azalır', () => {
  const dusukCekme = SagEngine.calculate({ ...TEMEL_GIRDI, tensionKg: 800 });
  const yuksekCekme = SagEngine.calculate({ ...TEMEL_GIRDI, tensionKg: 1600 });

  assert.ok(dusukCekme.output);
  assert.ok(yuksekCekme.output);
  assert.ok(yuksekCekme.output!.sagM < dusukCekme.output!.sagM);
});

test('açıklık artınca sehim artar', () => {
  const kisaAcikilk = SagEngine.calculate({ ...TEMEL_GIRDI, spanLengthM: 60 });
  const uzunAcikilk = SagEngine.calculate({ ...TEMEL_GIRDI, spanLengthM: 120 });

  assert.ok(kisaAcikilk.output);
  assert.ok(uzunAcikilk.output);
  assert.ok(uzunAcikilk.output!.sagM > kisaAcikilk.output!.sagM);
});

test('eksik iletken hata verir', () => {
  const eksikGirdi = { ...TEMEL_GIRDI } as Partial<SagInput>;
  delete eksikGirdi.conductorType;

  const sonuc = SagEngine.calculate(eksikGirdi as SagInput);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'conductorType'));
});

test('negatif açıklık hata verir', () => {
  const sonuc = SagEngine.calculate({ ...TEMEL_GIRDI, spanLengthM: -50 });

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'spanLengthM'));
});

test('sıfır çekme kuvveti hata verir', () => {
  const sonuc = SagEngine.calculate({ ...TEMEL_GIRDI, tensionKg: 0 });

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'tensionKg'));
});

test('örnekler (examples) gerçek motor çıktısıyla senkron', () => {
  const ornekler = SagEngine.examples ?? [];
  assert.ok(ornekler.length >= 3);
  for (const ornek of ornekler) {
    const sonuc = SagEngine.calculate(ornek.input);
    assert.ok(sonuc.output, `${ornek.id}: hesap başarısız oldu`);
    assert.ok(ornek.output, `${ornek.id}: örnek çıktısı tanımlı değil`);
    yaklasik(sonuc.output!.conductorWeightKgPerM, ornek.output!.conductorWeightKgPerM);
    yaklasik(sonuc.output!.iceLoadKgPerM, ornek.output!.iceLoadKgPerM);
    yaklasik(sonuc.output!.totalLoadKgPerM, ornek.output!.totalLoadKgPerM);
    yaklasik(sonuc.output!.sagM, ornek.output!.sagM);
    yaklasik(sonuc.output!.sagCm, ornek.output!.sagCm, 0.5);
    yaklasik(sonuc.output!.sagPercentOfSpan, ornek.output!.sagPercentOfSpan);
  }
});
