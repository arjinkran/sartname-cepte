// Sprint 6 — Gerçek Elektrik Dağıtım Mevzuatı İçerik Genişletme.
//
// Bu dosya, Sprint 6'da eklenen içeriğin ("Belge uydurma" yasağına uyularak
// katalogluğnan gerçek TEDAŞ/EPDK/Resmî Gazete/TEİAŞ/Enerji Bakanlığı/TSE/
// IEC/CENELEC/IEEE belge ve referansları) sprint spesifikasyonunun 12.
// maddesinde istenen tüm asgari sayı/bütünlük/arama testlerini kapsar.
// tests/libraryRepository.test.ts'teki Sprint 5 fonksiyon testlerinin
// YERİNE değil, YANINA eklenmiştir.
import { test } from 'node:test';
import assert from 'node:assert';
import {
  getAllDocuments,
  getDocumentsByInstitution,
  getStatistics,
  search,
  searchKeywords,
} from '../src/data/library/repository.ts';

const tumDokumanlar = getAllDocuments();
const idler = new Set(tumDokumanlar.map((d) => d.id));

test('içerik hacmi: toplam belge sayısı en az 100', () => {
  assert.ok(tumDokumanlar.length >= 100, `toplam ${tumDokumanlar.length}, en az 100 olmalı`);
});

test('içerik hacmi: TEDAŞ en az 30 belge içerir', () => {
  assert.ok(getDocumentsByInstitution('TEDAŞ').length >= 30);
});

test('içerik hacmi: EPDK en az 15 belge içerir', () => {
  assert.ok(getDocumentsByInstitution('EPDK').length >= 15);
});

test('içerik hacmi: Resmî Gazete en az 15 belge içerir', () => {
  assert.ok(getDocumentsByInstitution('Resmî Gazete').length >= 15);
});

test('içerik hacmi: TSE en az 20 referans içerir (TSE + TS EN, aynı klasör)', () => {
  // 'TS EN' ayrı bir kurum klasörü DEĞİL — Sprint 5 kararı gereği tse/
  // klasörü içinde institution:'TSE' ve institution:'TS EN' belgeleri
  // birlikte yaşar (bkz. LIBRARY_ARCHITECTURE.md).
  const tseAileToplam = getDocumentsByInstitution('TSE').length + getDocumentsByInstitution('TS EN').length;
  assert.ok(tseAileToplam >= 20, `TSE ailesi toplam ${tseAileToplam}, en az 20 olmalı`);
});

test('içerik hacmi: IEC en az 15 referans içerir', () => {
  assert.ok(getDocumentsByInstitution('IEC').length >= 15);
});

test('içerik hacmi: TEİAŞ en az 8, Enerji Bakanlığı en az 5, CENELEC en az 8, IEEE en az 5 içerir', () => {
  assert.ok(getDocumentsByInstitution('TEİAŞ').length >= 8);
  assert.ok(getDocumentsByInstitution('Enerji Bakanlığı').length >= 5);
  assert.ok(getDocumentsByInstitution('CENELEC').length >= 8);
  assert.ok(getDocumentsByInstitution('IEEE').length >= 5);
});

test('bütünlük: tüm id\'ler benzersiz', () => {
  const idListesi = tumDokumanlar.map((d) => d.id);
  assert.strictEqual(new Set(idListesi).size, idListesi.length);
});

test('bütünlük: hiçbir belgenin başlığı boş değil', () => {
  for (const d of tumDokumanlar) {
    assert.ok(d.title.trim().length > 0, `${d.id}: başlık boş`);
  }
});

test('bütünlük: hiçbir belgenin özeti boş değil', () => {
  for (const d of tumDokumanlar) {
    assert.ok(d.summary.trim().length > 0, `${d.id}: özet boş`);
  }
});

test('bütünlük: keywords alanı tüm belgelerde dolu', () => {
  for (const d of tumDokumanlar) {
    assert.ok(d.keywords.length > 0, `${d.id}: keywords boş`);
  }
});

test('bütünlük: aliases alanı tüm belgelerde tanımlı (boş dizi de olabilir)', () => {
  for (const d of tumDokumanlar) {
    assert.ok(Array.isArray(d.aliases), `${d.id}: aliases dizi olmalı`);
  }
});

test('ilişkilendirme: relatedDocuments içindeki tüm id\'ler kütüphanede mevcut', () => {
  for (const d of tumDokumanlar) {
    for (const relId of d.relatedDocuments) {
      assert.ok(idler.has(relId), `${d.id}: relatedDocuments içindeki '${relId}' bulunamadı`);
    }
  }
});

test('ilişkilendirme: crossReferences içindeki tüm id\'ler kütüphanede mevcut', () => {
  for (const d of tumDokumanlar) {
    for (const crossId of d.crossReferences) {
      assert.ok(idler.has(crossId), `${d.id}: crossReferences içindeki '${crossId}' bulunamadı`);
    }
  }
});

test('ilişkilendirme: örnek eşleşmeler gerçekten kurulu (madde 10)', () => {
  const agKablo = tumDokumanlar.find((d) => d.id === 'ag-xlpe-kablo');
  assert.ok(agKablo?.crossReferences.includes('ts-en-60502'));
  assert.ok(agKablo?.crossReferences.includes('iec-60502'));

  const topraklama = tumDokumanlar.find((d) => d.id === 'topraklama-yonetmelik');
  assert.ok(topraklama?.crossReferences.includes('ts-en-50522'));
  assert.ok(topraklama?.crossReferences.includes('iec-60364'));

  const ogHucre = tumDokumanlar.find((d) => d.id === 'og-moduler-hucre');
  assert.ok(ogHucre?.crossReferences.includes('iec-62271'));
  assert.ok(ogHucre?.crossReferences.includes('ts-en-62271'));

  const dagitimTrafo = tumDokumanlar.find((d) => d.id === 'og-dagitim-trafo');
  assert.ok(dagitimTrafo?.crossReferences.includes('iec-60076'));
  assert.ok(dagitimTrafo?.crossReferences.includes('ts-en-60076'));

  const agPano = tumDokumanlar.find((d) => d.id === 'ag-pano-kofra');
  assert.ok(agPano?.crossReferences.includes('iec-61439'));
  assert.ok(agPano?.crossReferences.includes('ts-en-61439'));

  const ogParafudr = tumDokumanlar.find((d) => d.id === 'og-parafudr');
  assert.ok(ogParafudr?.crossReferences.includes('iec-60099'));

  const epdkHizmetKalitesi = tumDokumanlar.find((d) => d.id === 'epdk-hizmet-kalitesi');
  assert.ok(epdkHizmetKalitesi?.crossReferences.includes('epdk-dagitim'));
});

test('deprecated belgelerin replacementDocumentId\'si mevcut bir id\'ye işaret eder', () => {
  for (const d of tumDokumanlar) {
    if (d.deprecated) {
      assert.ok(d.replacementDocumentId, `${d.id}: deprecated ama replacementDocumentId yok`);
      assert.ok(idler.has(d.replacementDocumentId!), `${d.id}: replacementDocumentId '${d.replacementDocumentId}' bulunamadı`);
    }
  }
});

test('sourceVerified: false olan belgeler test hatası SAYILMAZ — doğrulanmamış içerik kabul edilebilir bir durumdur', () => {
  const dogrulanmamis = tumDokumanlar.filter((d) => !d.sourceVerified);
  // Sprint 6 kuralı: emin olunmayan belgeler sourceVerified:false olarak
  // İŞARETLENMELİDİR (fabrikasyon değil, şeffaflık). Bu test yalnızca en az
  // bir tane var olduğunu (kuralın gerçekten uygulandığını) doğrular.
  assert.ok(dogrulanmamis.length > 0, 'Sprint 6 boyunca hiç sourceVerified:false işaretlenmemiş — kural uygulanmamış olabilir');
});

test('getStatistics(): toplam ve kurum bazlı kırılım tutarlı', () => {
  const istatistik = getStatistics();
  assert.strictEqual(istatistik.totalDocuments, tumDokumanlar.length);
  assert.ok(istatistik.totalDocuments >= 100);
  const tedasStat = istatistik.byInstitution.find((k) => k.institution === 'TEDAŞ');
  assert.ok((tedasStat?.count ?? 0) >= 30);
  const tseStat = istatistik.byInstitution.find((k) => k.institution === 'TSE');
  assert.ok((tseStat?.count ?? 0) >= 20);
});

test('arama: "xlpe" sonuç döner', () => {
  assert.ok(search('xlpe').length > 0);
});

test('arama: "topraklama" sonuç döner', () => {
  assert.ok(search('topraklama').length > 0);
});

test('arama: "trafo" sonuç döner', () => {
  assert.ok(search('trafo').length > 0);
});

test('arama: "parafudr" sonuç döner', () => {
  assert.ok(search('parafudr').length > 0);
});

test('arama: "branşman" sonuç döner', () => {
  assert.ok(search('branşman').length > 0);
});

test('AI önerileri (searchKeywords): Sprint 6 içeriğinden gelen belgeleri de bulur', () => {
  // AiDestekScreen.tsx searchKeywords() kullanır (yalnızca keywords/tags/
  // aliases alanlarına bakar, title/summary'ye bakmaz) — bu, ekranın
  // repository üzerinden otomatik olarak yeni içeriği de görebildiğini
  // doğrular; ayrı bir "AI servisi" veri kopyası YOKTUR.
  const parafudrSonuc = searchKeywords('parafudr');
  assert.ok(parafudrSonuc.some((s) => s.document.id === 'og-parafudr'));

  const izolatorSonuc = searchKeywords('izolatör');
  assert.ok(izolatorSonuc.length > 0);

  const tseSonuc = searchKeywords('topraklama');
  assert.ok(tseSonuc.some((s) => s.document.institution === 'TSE' || s.document.institution === 'TS EN'));
});
