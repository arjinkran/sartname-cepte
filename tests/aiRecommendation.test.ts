// AI Mevzuat Tavsiye Motoru — Sprint 7, madde 12.
// Her test, bir saha konusuna dair bir sorgunun İLGİLİ belgeyi ilk 5
// sonuç arasında döndürdüğünü doğrular (`expectedId === null` olan
// durumlarda yalnızca EN AZ 1 sonuç dönmesi beklenir — konu kütüphanede
// karşılığı olan ama tek bir "doğru" belgeye indirgenemeyen daha geniş
// bir alanı temsil eder).
import { test } from 'node:test';
import assert from 'node:assert';
import { recommendDocuments, recommendRelated } from '../src/ai/engine.ts';
import { getIndex } from '../src/ai/matcher.ts';

const TOP_N = 5;

function assertTopIncludes(query: string, expectedId: string | null) {
  const result = recommendDocuments(query, TOP_N);
  const ids = result.documents.map((d) => d.document.id);
  if (expectedId === null) {
    assert.ok(ids.length > 0, `"${query}" için hiç sonuç dönmedi`);
  } else {
    assert.ok(ids.includes(expectedId), `"${query}" için beklenen '${expectedId}' ilk ${TOP_N} sonuçta yok: [${ids.join(', ')}]`);
  }
}

const CASES: readonly [string, string | null][] = [
  ['branşman', 'epdk-baglanti-sku'],
  ['branşman talebi', 'epdk-baglanti-gorusu'],
  ['hat ayrımı', 'epdk-baglanti-sku'],
  ['trafo', 'og-dagitim-trafo'],
  ['dağıtım trafosu', 'og-dagitim-trafo'],
  ['transformatör seçimi', 'og-dagitim-trafo'],
  ['beton köşk', 'beton-kosk'],
  ['topraklama', 'topraklama-yonetmelik'],
  ['toprak direnci', 'topraklama-elektrot'],
  ['dokunma gerilimi', 'topraklama-yonetmelik'],
  ['adım gerilimi', 'topraklama-yonetmelik'],
  ['eşpotansiyel', 'topraklama-yonetmelik'],
  ['parafudr', 'og-parafudr'],
  ['aşırı gerilim koruması', 'og-parafudr'],
  ['surge arrester', 'og-parafudr'],
  ['xlpe kablo', 'ag-xlpe-kablo'],
  ['güç kablosu', 'ag-xlpe-kablo'],
  ['yeraltı kablosu', 'og-xlpe-kablo'],
  ['kablo eki', 'ag-kablo-ek'],
  ['ek mufu', 'ag-kablo-ek'],
  ['ring', 'og-moduler-hucre'],
  ['loop şebeke', 'og-moduler-hucre'],
  ['kapalı ring', 'og-moduler-hucre'],
  ['kompanzasyon', 'kompanzasyon'],
  ['reaktif güç', 'kompanzasyon'],
  ['kondansatör grubu', 'kompanzasyon'],
  ['ölçü trafosu', 'olcu-trafolari'],
  ['akım trafosu', 'olcu-trafolari'],
  ['gerilim trafosu', 'olcu-trafolari'],
  ['kesici', 'og-kesici'],
  ['devre kesici', 'ag-kesici'],
  ['vakumlu kesici', 'og-kesici'],
  ['ayırıcı', 'og-ayirici'],
  ['yük ayırıcı', 'og-ayirici'],
  ['seksiyoner', 'og-ayirici'],
  ['AG dağıtım panosu', 'ag-pano-kofra'],
  ['pano kofra', 'ag-pano-kofra'],
  ['OG hücre', 'og-moduler-hucre'],
  ['modüler hücre', 'og-moduler-hucre'],
  ['metal mahfazalı hücre', 'og-moduler-hucre'],
  ['sayaç panosu', 'sayac-panosu'],
  ['elektronik sayaç', 'elektronik-sayac'],
  ['sayaç endeksi', 'elektronik-sayac'],
  ['beton direk', 'beton-direk'],
  ['demir direk', 'demir-direk'],
  ['çelik direk', 'demir-direk'],
  ['travers', 'travers'],
  ['çapraz kol', 'travers'],
  ['izolatör', 'og-izolator'],
  ['post izolatör', 'og-izolator'],
  ['askı izolatör', 'og-izolator'],
  ['havai hat', null],
  ['enerji nakil hattı', null],
  ['hizmet kalitesi', 'epdk-hizmet-kalitesi'],
  ['kesinti süresi', 'epdk-hizmet-kalitesi'],
  ['bağlantı anlaşması', 'epdk-baglanti-sku'],
  ['sistem kullanım anlaşması', 'epdk-baglanti-sku'],
  ['bağlantı görüşü', 'epdk-baglanti-gorusu'],
  ['geçici kabul', null],
  ['iç tesisat', 'ic-tesisler'],
  ['gerilim düşümü', 'ic-tesisler'],
  ['aydınlatma direği', 'aydinlatma-diregi'],
  ['genel aydınlatma', 'genel-aydinlatma-uygulama-esaslari'],
  ['SCADA', 'scada-ekipman'],
  ['uzaktan izleme', 'scada-ekipman'],
  ['ACSR iletken', 'iletken'],
  ['şebeke yönetmeliği', 'teias-sebeke-yonetmelik'],
  ['OG YG bağlantı kriterleri', 'teias-og-yg-baglanti-kriterleri'],
  ['koruma koordinasyon', 'teias-koruma-koordinasyon'],
  ['elektrik piyasası kanunu', 'elektrik-piyasasi-kanunu'],
  ['kayıp kaçak', 'epdk-kayip-kacak'],
  ['dağıtım şirketi lisans', 'epdk-lisans'],
];

for (const [query, expectedId] of CASES) {
  test(`recommendDocuments: "${query}" → ${expectedId ?? '(en az 1 sonuç)'}`, () => {
    assertTopIncludes(query, expectedId);
  });
}

test('recommendDocuments: alakasız/anlamsız sorgu boş sonuç döner', () => {
  const result = recommendDocuments('uzay mekiği pizza tarifi lorem ipsum', 5);
  assert.strictEqual(result.documents.length, 0);
});

test('recommendDocuments: boş sorgu boş sonuç döner', () => {
  const result = recommendDocuments('', 5);
  assert.strictEqual(result.documents.length, 0);
});

test('recommendDocuments: confidence her zaman 0-100 aralığında', () => {
  const result = recommendDocuments('trafo topraklama kablo kesici', 20);
  assert.ok(result.documents.length > 0);
  for (const d of result.documents) {
    assert.ok(d.confidence >= 0 && d.confidence <= 100, `confidence aralık dışı: ${d.confidence}`);
    assert.ok(Number.isInteger(d.confidence), 'confidence tam sayı olmalı');
  }
});

test('recommendDocuments: sonuçlar puana göre azalan sırada', () => {
  const result = recommendDocuments('trafo', 10);
  for (let i = 1; i < result.documents.length; i++) {
    assert.ok(result.documents[i - 1]!.score >= result.documents[i]!.score, 'sıralama azalan olmalı');
  }
});

test('recommendDocuments: her sonucun en az bir gerekçesi (reasons) var', () => {
  const result = recommendDocuments('topraklama ölçümü', 5);
  assert.ok(result.documents.length > 0);
  for (const d of result.documents) {
    assert.ok(d.reasons.length > 0, `${d.document.id}: reasons boş olmamalı`);
  }
});

test('recommendDocuments: niyet tespiti — "OG ring" hem "og" hem "ring" niyetini yakalar', () => {
  const result = recommendDocuments('OG ring şebekede hangi hücre kullanılır?', 5);
  assert.ok(result.matchedIntents.includes('og'));
  assert.ok(result.matchedIntents.includes('ring'));
});

test('recommendDocuments: eşanlamlı terim tespiti — "orta gerilim" "og" ile eşleşir', () => {
  const result = recommendDocuments('orta gerilim hattı için hangi kablo kullanılır?', 5);
  assert.ok(result.matchedSynonyms.includes('og'));
});

test('recommendDocuments: kurum adıyla arama — "TEDAŞ" içeren sorgu TEDAŞ belgelerini önceliklendirir', () => {
  const result = recommendDocuments('TEDAŞ trafo şartnamesi', 5);
  assert.ok(result.documents.length > 0);
  assert.ok(result.documents.some((d) => d.document.institution === 'TEDAŞ'));
});

test('recommendDocuments: crossReference bonusu ile ilişkili standartlar da öneriye girer', () => {
  const result = recommendDocuments('xlpe kablo', 10);
  const ids = result.documents.map((d) => d.document.id);
  // ag-xlpe-kablo/og-xlpe-kablo'nun crossReferences'ında TS EN/IEC 60502 var (bkz. Sprint 6).
  assert.ok(ids.some((id) => id.includes('60502')), `crossReference ile gelen standart bulunamadı: [${ids.join(', ')}]`);
});

test('recommendRelated: bir trafo belgesi açıldığında ölçü trafosu/hücre gibi konu-yakın belgeler önerilir', () => {
  const result = recommendRelated('og-dagitim-trafo', 6);
  assert.ok(result.documents.length > 0);
  assert.ok(!result.documents.some((d) => d.document.id === 'og-dagitim-trafo'), 'belge kendini önermemeli');
});

test('recommendRelated: bilinmeyen id için boş sonuç döner', () => {
  const result = recommendRelated('olmayan-id', 5);
  assert.deepStrictEqual(result.documents, []);
});

test('performans: indeks yalnızca bir kez kurulur ve tekrar kullanılır', () => {
  const first = getIndex();
  const second = getIndex();
  assert.strictEqual(first, second, 'getIndex() her çağrıda aynı önbelleklenmiş nesneyi dönmeli');
});

test('performans: ardışık recommendDocuments çağrıları indeksi yeniden kurmaz', () => {
  const indexBefore = getIndex();
  recommendDocuments('trafo', 5);
  recommendDocuments('topraklama', 5);
  recommendDocuments('kablo', 5);
  const indexAfter = getIndex();
  assert.strictEqual(indexBefore, indexAfter);
});
