// Merkezi ACSR iletken kataloğu — birim testleri.
// Bu testler hem kataloğun kendisini hem de üç tüketici motorun/ekranın
// (ampacityOG, poleForce, enhBilgi) gerçekten AYNI veriyi kullandığını
// (duplicate/kopya OLMADIĞINI) doğrular.
import { test } from 'node:test';
import assert from 'node:assert';
import { ACSR_CONDUCTORS } from '../../src/catalogs/conductors/acsr.ts';
import { AMPACITY_CONDUCTORS } from '../../src/calculations/engines/ampacityOG/data.ts';
import { PoleForceEngine } from '../../src/calculations/engines/enhMechanical/poleForce/engine.ts';
import { ILETKENLER } from '../../modules/enhBilgi/data/iletkenler.ts';

test('5 iletken var', () => {
  assert.strictEqual(ACSR_CONDUCTORS.length, 5);
});

test('Hawk 477 MCM bulunuyor', () => {
  const hawk = ACSR_CONDUCTORS.find((c) => c.id === 'hawk');
  assert.ok(hawk);
  assert.strictEqual(hawk!.name, 'Hawk');
  assert.strictEqual(hawk!.awgMcm, '477 MCM');
  assert.strictEqual(hawk!.breakingLoadKg, 8845);
  assert.strictEqual(hawk!.ampacityCondition3A, 740);
});

test('OG Akım motoru katalogdaki Hawk verisini kullanıyor', () => {
  // AMPACITY_CONDUCTORS, ACSR_CONDUCTORS ile AYNI dizi referansı olmalı —
  // ayrı bir kopya OLMAMALI.
  assert.strictEqual(AMPACITY_CONDUCTORS, ACSR_CONDUCTORS);

  const katalogHawk = ACSR_CONDUCTORS.find((c) => c.id === 'hawk')!;
  const motorHawk = AMPACITY_CONDUCTORS.find((c) => c.id === 'hawk')!;
  assert.strictEqual(motorHawk, katalogHawk);
  assert.strictEqual(motorHawk.breakingLoadKg, katalogHawk.breakingLoadKg);
});

test('ENH Bilgi Bankası katalogdaki Pigeon verisini kullanıyor', () => {
  const katalogPigeon = ACSR_CONDUCTORS.find((c) => c.id === 'pigeon')!;
  const bilgiPigeon = ILETKENLER.find((i) => i.id === 'pigeon')!;

  assert.ok(bilgiPigeon);
  assert.strictEqual(bilgiPigeon.ad, katalogPigeon.name);
  assert.strictEqual(bilgiPigeon.kod, katalogPigeon.awgMcm);
  assert.strictEqual(bilgiPigeon.aluminyumKesitMm2, katalogPigeon.aluminumAreaMm2);
  assert.strictEqual(bilgiPigeon.celikKesitMm2, katalogPigeon.steelAreaMm2);
  assert.strictEqual(bilgiPigeon.toplamKesitMm2, katalogPigeon.totalAreaMm2);
  assert.strictEqual(bilgiPigeon.nominalCapMm, katalogPigeon.nominalDiameterMm);
  assert.strictEqual(bilgiPigeon.nominalAgirlikKgPerM, katalogPigeon.nominalWeightKgPerM);
  assert.strictEqual(bilgiPigeon.kopmaDayanimiKg, katalogPigeon.breakingLoadKg);
});

test('Direk Kuvvet motoru katalogdaki conductor weight değerini kullanıyor', () => {
  const katalogHawk = ACSR_CONDUCTORS.find((c) => c.id === 'hawk')!;
  const spanLeftM = 100;
  const spanRightM = 100;
  const equipmentWeightKg = 0;
  const ortalamaAcikilkM = (spanLeftM + spanRightM) / 2;
  const beklenenDuseyKuvvet = katalogHawk.nominalWeightKgPerM * ortalamaAcikilkM + equipmentWeightKg;

  const sonuc = PoleForceEngine.calculate({
    conductorType: '477-mcm-hawk',
    spanLeftM,
    spanRightM,
    iceRegion: 1,
    windRegion: 1,
    poleFunction: 'tasiyici',
    deviationAngleDeg: 0,
    equipmentWeightKg,
    safetyFactor: 1,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.ok(Math.abs(sonuc.output!.verticalForceKg - beklenenDuseyKuvvet) < 0.001);
});

test('hiçbir engine içinde duplicate iletken listesi kalmamış', () => {
  // ampacityOG: kendi dizisi yok, katalogla aynı referans.
  assert.strictEqual(AMPACITY_CONDUCTORS, ACSR_CONDUCTORS);

  // enhBilgi: ILETKENLER, ACSR_CONDUCTORS'tan türetilmiş (map edilmiş) bir
  // dizi olmalı — uzunluk ve id sırası birebir eşleşmeli (ayrı elle
  // yazılmış bir liste değil).
  assert.strictEqual(ILETKENLER.length, ACSR_CONDUCTORS.length);
  assert.deepStrictEqual(
    ILETKENLER.map((i) => i.id),
    ACSR_CONDUCTORS.map((c) => c.id)
  );

  // poleForce: iletkenVerisiGetir, katalogdaki NESNENİN KENDİSİNİ
  // döndürmeli (ayrı bir kopya oluşturmamalı).
  for (const conductorType of ['3-awg', '1-0-awg', '3-0-awg', '266-8-mcm', '477-mcm-hawk'] as const) {
    const sonuc = PoleForceEngine.calculate({
      conductorType,
      spanLeftM: 50,
      spanRightM: 50,
      iceRegion: 1,
      windRegion: 1,
      poleFunction: 'tasiyici',
      deviationAngleDeg: 0,
      equipmentWeightKg: 0,
      safetyFactor: 1,
    });
    assert.strictEqual(sonuc.ok, true, `${conductorType}: hesap başarısız oldu`);
  }
});
