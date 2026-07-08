// betonDirek alt motoru birim testleri.
import { test } from 'node:test';
import assert from 'node:assert';
import { BetonDirekEngine } from '../../src/calculations/engines/enhMechanical/betonDirek/engine.ts';
import type { BetonDirekInput } from '../../src/calculations/engines/enhMechanical/betonDirek/types.ts';

test('uygun direk seçiliyor', () => {
  const sonuc = BetonDirekEngine.calculate({
    voltageLevelKv: 34.5,
    poleType: 'tek-devre',
    windZone: 1,
    iceRegion: 1,
    spanLengthM: 40,
    conductorType: '3-awg',
    safetyFactor: 1.2,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.ok(sonuc.output!.onerilenDirek);
  assert.strictEqual(sonuc.output!.onerilenDirek!.direk.id, 'bd-8-400');
  assert.strictEqual(sonuc.output!.onerilenDirek!.siniflandirma, 'uygun');
  assert.strictEqual(sonuc.output!.alternatifDirekler.length, 1);
  assert.strictEqual(sonuc.output!.alternatifDirekler[0]!.direk.id, 'bd-9-400');
  assert.strictEqual(sonuc.output!.kritikUyarilar.length, 0);
});

test('küçük direk eleniyor', () => {
  const sonuc = BetonDirekEngine.calculate({
    voltageLevelKv: 34.5,
    poleType: 'tek-devre',
    windZone: 1,
    iceRegion: 1,
    spanLengthM: 65, // bd-8-400 (max 60 m) bu açıklığı karşılayamaz
    conductorType: '3-awg',
    safetyFactor: 1.0,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  const tumAdaylar = [
    ...(sonuc.output!.onerilenDirek ? [sonuc.output!.onerilenDirek] : []),
    ...sonuc.output!.alternatifDirekler,
    ...sonuc.output!.kritikUyarilar,
  ];
  assert.ok(!tumAdaylar.some((a) => a.direk.id === 'bd-8-400'), 'bd-8-400 (max 60 m) sonuçlarda görünmemeli');
  // bd-9-400 (max 70 m) temel filtreyi geçer ama emniyet katsayısız oranı
  // 70/65 ≈ 1.077 → eşik 1.15'in altında, "kritik" sınıfında kalmalı.
  assert.ok(tumAdaylar.some((a) => a.direk.id === 'bd-9-400' && a.siniflandirma === 'kritik'));
});

test('gerilim seviyesi filtreleniyor', () => {
  const sonuc = BetonDirekEngine.calculate({
    voltageLevelKv: 34.5,
    poleType: 'dort-devre',
    windZone: 1,
    iceRegion: 1,
    spanLengthM: 100,
    conductorType: '477-mcm-hawk',
    safetyFactor: 1.0,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  const tumAdaylar = [
    ...(sonuc.output!.onerilenDirek ? [sonuc.output!.onerilenDirek] : []),
    ...sonuc.output!.alternatifDirekler,
    ...sonuc.output!.kritikUyarilar,
  ];
  // bd-13-1600 açıklık ve kategori kriterlerini karşılar ama yalnızca
  // 154 kV destekler; 34,5 kV isteğinde filtrelenmelidir.
  assert.ok(!tumAdaylar.some((a) => a.direk.id === 'bd-13-1600'));
});

test('boş sonuç dönüyor', () => {
  const sonuc = BetonDirekEngine.calculate({
    voltageLevelKv: 34.5,
    poleType: 'dort-devre',
    windZone: 1,
    iceRegion: 1,
    spanLengthM: 100,
    conductorType: '477-mcm-hawk',
    safetyFactor: 1.0,
  });

  assert.strictEqual(sonuc.ok, true);
  assert.ok(sonuc.output);
  assert.strictEqual(sonuc.output!.onerilenDirek, null);
  assert.strictEqual(sonuc.output!.alternatifDirekler.length, 0);
  assert.strictEqual(sonuc.output!.kritikUyarilar.length, 0);
  assert.ok(sonuc.warnings.some((w) => w.code === 'NO_SUITABLE_POLE'));
});

test('eksik input hata veriyor', () => {
  const eksikGirdi = {
    voltageLevelKv: 34.5,
    poleType: 'tek-devre',
    windZone: 1,
    iceRegion: 1,
    conductorType: '3-awg',
    safetyFactor: 1.2,
    // spanLengthM eksik
  } as unknown as BetonDirekInput;

  const sonuc = BetonDirekEngine.calculate(eksikGirdi);

  assert.strictEqual(sonuc.ok, false);
  assert.strictEqual(sonuc.output, null);
  assert.ok(sonuc.errors.some((e) => e.field === 'spanLengthM'));
});

test('örnekler (examples) gerçek motor çıktısıyla senkron', () => {
  const ornekler = BetonDirekEngine.examples ?? [];
  assert.ok(ornekler.length >= 3);
  for (const ornek of ornekler) {
    const sonuc = BetonDirekEngine.calculate(ornek.input);
    assert.ok(sonuc.output, `${ornek.id}: hesap başarısız oldu`);
    assert.ok(ornek.output, `${ornek.id}: örnek çıktısı tanımlı değil`);

    const gercekOnerilenId = sonuc.output!.onerilenDirek?.direk.id ?? null;
    const beklenenOnerilenId = ornek.output!.onerilenDirek?.direk.id ?? null;
    assert.strictEqual(gercekOnerilenId, beklenenOnerilenId, `${ornek.id}: önerilen direk eşleşmiyor`);

    assert.deepStrictEqual(
      sonuc.output!.alternatifDirekler.map((a) => a.direk.id),
      ornek.output!.alternatifDirekler.map((a) => a.direk.id),
      `${ornek.id}: alternatif direkler eşleşmiyor`
    );
    assert.deepStrictEqual(
      sonuc.output!.kritikUyarilar.map((a) => a.direk.id),
      ornek.output!.kritikUyarilar.map((a) => a.direk.id),
      `${ornek.id}: kritik uyarılar eşleşmiyor`
    );
  }
});
