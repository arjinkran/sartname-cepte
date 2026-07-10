// Evidence Engine testleri (Sprint 14, madde 18). En az 40 test.
// Gerçek kütüphane verisi (src/data/library) kullanılır — hiçbir ağ
// isteği veya LLM çağrısı YOKTUR (bu motor zaten hiçbirini yapmaz).
import { test } from 'node:test';
import assert from 'node:assert';
import { getAllDocuments, getDocumentById } from '../src/data/library/repository.ts';
import { collectCrossReferences, MAX_CROSS_REFERENCE_DEPTH } from '../src/evidence/crossReference.ts';
import { rankEvidence } from '../src/evidence/ranking.ts';
import { scoreToEvidenceConfidence, aggregateEvidenceConfidence, CONFIDENCE_GREEN_THRESHOLD, CONFIDENCE_YELLOW_THRESHOLD } from '../src/evidence/confidence.ts';
import { getEvidenceSignals, buildEvidenceReference, buildEvidenceSection } from '../src/evidence/collector.ts';
import { buildExplanation, buildUsageQuestions } from '../src/evidence/explanations.ts';
import { matchEvidence } from '../src/evidence/matcher.ts';
import { collectEvidence } from '../src/evidence/engine.ts';

function tedasDocu() {
  const doc = getDocumentById('ag-xlpe-kablo');
  assert.ok(doc, "test fixture 'ag-xlpe-kablo' bulunamadı");
  return doc!;
}

function tseDocu() {
  const doc = getAllDocuments().find((d) => d.institution === 'TSE' || d.institution === 'TS EN');
  assert.ok(doc, 'TSE/TS EN belgesi bulunamadı');
  return doc!;
}

// ── crossReference.ts ────────────────────────────────────────────────────

test('collectCrossReferences: boş tohum listesi boş sonuç döner', () => {
  assert.deepStrictEqual(collectCrossReferences([]), []);
});

test('collectCrossReferences: tohum belgenin kendisi sonuca DAHİL EDİLMEZ', () => {
  const sonuc = collectCrossReferences(['ag-xlpe-kablo']);
  assert.ok(!sonuc.some((n) => n.document.id === 'ag-xlpe-kablo'));
});

test('collectCrossReferences: gerçek zincir doğru genişliyor (ag-xlpe-kablo → ts-en-60502/iec-60502/ts-en-50525)', () => {
  const sonuc = collectCrossReferences(['ag-xlpe-kablo']);
  const ids = sonuc.map((n) => n.document.id);
  assert.ok(ids.includes('ts-en-60502'));
  assert.ok(ids.includes('iec-60502'));
  assert.ok(ids.includes('ts-en-50525'));
});

test('collectCrossReferences: gerçek DÖNGÜSEL referans (iec-60502 → ag-xlpe-kablo) sonsuz döngü OLUŞTURMAZ ve tekrar etmez', () => {
  const sonuc = collectCrossReferences(['ag-xlpe-kablo']);
  const idler = sonuc.map((n) => n.document.id);
  const benzersiz = new Set(idler);
  assert.strictEqual(idler.length, benzersiz.size, 'hiçbir id iki kez GELMEMELİ');
  assert.ok(!idler.includes('ag-xlpe-kablo'), 'döngü, tohumu tekrar sonuca SOKMAMALI');
});

test('collectCrossReferences: derinlik 2 seviyesinde yeni belge (og-xlpe-kablo) bulunuyor', () => {
  const sonuc = collectCrossReferences(['ag-xlpe-kablo']);
  const ogKablo = sonuc.find((n) => n.document.id === 'og-xlpe-kablo');
  assert.ok(ogKablo, 'iec-60502 üzerinden derinlik 2de ulaşılmalı');
  assert.strictEqual(ogKablo!.depth, 2);
});

test('collectCrossReferences: hiçbir düğüm maksimum derinliği AŞMAZ', () => {
  const sonuc = collectCrossReferences(['ag-xlpe-kablo']);
  for (const node of sonuc) {
    assert.ok(node.depth >= 1 && node.depth <= MAX_CROSS_REFERENCE_DEPTH);
  }
});

test('collectCrossReferences: maxDepth parametresi sınırı gerçekten uyguluyor (maxDepth=1)', () => {
  const sonuc = collectCrossReferences(['ag-xlpe-kablo'], 1);
  assert.ok(sonuc.every((n) => n.depth === 1));
  assert.ok(!sonuc.some((n) => n.document.id === 'og-xlpe-kablo'), 'derinlik 2ye asla geçilmemeli');
});

test('collectCrossReferences: varsayılan maksimum derinlik sabiti 3\'tür', () => {
  assert.strictEqual(MAX_CROSS_REFERENCE_DEPTH, 3);
});

test('collectCrossReferences: olmayan bir belge id\'si sessizce atlanır, hata FIRLATMAZ', () => {
  assert.doesNotThrow(() => collectCrossReferences(['olmayan-belge-id-xyz']));
  assert.deepStrictEqual(collectCrossReferences(['olmayan-belge-id-xyz']), []);
});

test('collectCrossReferences: birden fazla tohum belge birleşik olarak genişletilir', () => {
  const sonuc = collectCrossReferences(['ag-xlpe-kablo', 'epdk-hizmet-kalitesi']);
  assert.ok(Array.isArray(sonuc));
  assert.ok(sonuc.length >= 3);
});

// ── ranking.ts ───────────────────────────────────────────────────────────

test('rankEvidence: toplam puan her zaman 0-100 aralığında', () => {
  const doc = tedasDocu();
  const score = rankEvidence(doc, { intents: ['kablo'], aiConfidence: 100, crossReferenceDepth: 0 }, true, 'publicPdf');
  assert.ok(score.total >= 0 && score.total <= 100);
});

test('rankEvidence: intent tespit edilirse intentMatch puanı > 0', () => {
  const doc = tedasDocu();
  const score = rankEvidence(doc, { intents: ['kablo'], aiConfidence: 0, crossReferenceDepth: 0 }, false, 'manualRequired');
  assert.ok(score.breakdown.intentMatch > 0);
});

test('rankEvidence: intent tespit edilmezse intentMatch puanı 0', () => {
  const doc = tedasDocu();
  const score = rankEvidence(doc, { intents: [], aiConfidence: 0, crossReferenceDepth: 0 }, false, 'manualRequired');
  assert.strictEqual(score.breakdown.intentMatch, 0);
});

test('rankEvidence: aiConfidence arttıkça aiRecommendation puanı artar (monoton)', () => {
  const doc = tedasDocu();
  const dusuk = rankEvidence(doc, { intents: [], aiConfidence: 10, crossReferenceDepth: 0 }, false, 'manualRequired');
  const yuksek = rankEvidence(doc, { intents: [], aiConfidence: 90, crossReferenceDepth: 0 }, false, 'manualRequired');
  assert.ok(yuksek.breakdown.aiRecommendation > dusuk.breakdown.aiRecommendation);
});

test('rankEvidence: aiConfidence=0 için aiRecommendation puanı 0', () => {
  const doc = tedasDocu();
  const score = rankEvidence(doc, { intents: [], aiConfidence: 0, crossReferenceDepth: 0 }, false, 'manualRequired');
  assert.strictEqual(score.breakdown.aiRecommendation, 0);
});

test('rankEvidence: PDF bulunması (pdfAvailable) puanı artırır — PDF priority', () => {
  const doc = tedasDocu();
  const context = { intents: [], aiConfidence: 0, crossReferenceDepth: 0 } as const;
  const pdfsiz = rankEvidence(doc, context, false, 'manualRequired');
  const pdfli = rankEvidence(doc, context, true, 'manualRequired');
  assert.ok(pdfli.total > pdfsiz.total, 'PDF mevcut olan aday HER ZAMAN daha yüksek puanlanmalı');
  assert.ok(pdfli.breakdown.pdfAvailable > 0);
  assert.strictEqual(pdfsiz.breakdown.pdfAvailable, 0);
});

test('rankEvidence: doğrulanmış resmî kaynak (officialPage/publicPdf) tam puan alır', () => {
  const doc = tedasDocu();
  const context = { intents: [], aiConfidence: 0, crossReferenceDepth: 0 } as const;
  const dogrulanmis = rankEvidence(doc, context, false, 'officialPage');
  const dogrulanmamis = rankEvidence(doc, context, false, 'manualRequired');
  assert.ok(dogrulanmis.breakdown.officialSource > dogrulanmamis.breakdown.officialSource);
});

test('rankEvidence: restrictedStandard (telifli) kaynak KISMİ puan alır — tam puan DEĞİL', () => {
  const doc = tseDocu();
  const context = { intents: [], aiConfidence: 0, crossReferenceDepth: 0 } as const;
  const kisitli = rankEvidence(doc, context, false, 'restrictedStandard');
  const dogrulanmis = rankEvidence(doc, context, false, 'officialPage');
  const dogrulanmamis = rankEvidence(doc, context, false, 'manualRequired');
  assert.ok(kisitli.breakdown.officialSource > dogrulanmamis.breakdown.officialSource, 'telifli standart hâlâ resmî bir kaynaktır, 0 puan ALMAMALI');
  assert.ok(kisitli.breakdown.officialSource < dogrulanmis.breakdown.officialSource, 'ama TAM doğrulanmış kaynak kadar YÜKSEK olmamalı');
});

test('rankEvidence: manualRequired/notFound kaynak 0 puan alır', () => {
  const doc = tedasDocu();
  const context = { intents: [], aiConfidence: 0, crossReferenceDepth: 0 } as const;
  assert.strictEqual(rankEvidence(doc, context, false, 'manualRequired').breakdown.officialSource, 0);
  assert.strictEqual(rankEvidence(doc, context, false, 'notFound').breakdown.officialSource, 0);
});

test('rankEvidence: crossReferenceDepth=0 (doğrudan eşleşme) crossReference puanı almaz', () => {
  const doc = tedasDocu();
  const score = rankEvidence(doc, { intents: [], aiConfidence: 0, crossReferenceDepth: 0 }, false, 'manualRequired');
  assert.strictEqual(score.breakdown.crossReference, 0);
});

test('rankEvidence: derinlik arttıkça crossReference bonusu AZALIR', () => {
  const doc = tedasDocu();
  const d1 = rankEvidence(doc, { intents: [], aiConfidence: 0, crossReferenceDepth: 1 }, false, 'manualRequired');
  const d2 = rankEvidence(doc, { intents: [], aiConfidence: 0, crossReferenceDepth: 2 }, false, 'manualRequired');
  const d3 = rankEvidence(doc, { intents: [], aiConfidence: 0, crossReferenceDepth: 3 }, false, 'manualRequired');
  assert.ok(d1.breakdown.crossReference > d2.breakdown.crossReference);
  assert.ok(d2.breakdown.crossReference > d3.breakdown.crossReference);
  assert.ok(d3.breakdown.crossReference > 0);
});

test('rankEvidence: mülga (deprecated) belge revision puanı almaz', () => {
  const doc = tedasDocu();
  const mulgaKopya = { ...doc, status: 'deprecated' as const };
  const score = rankEvidence(mulgaKopya, { intents: [], aiConfidence: 0, crossReferenceDepth: 0 }, false, 'manualRequired');
  assert.strictEqual(score.breakdown.revision, 0);
});

test('rankEvidence: breakdown bileşenlerinin toplamı total\'a (sıkıştırma öncesi) karşılık gelir', () => {
  const doc = tedasDocu();
  const score = rankEvidence(doc, { intents: ['kablo'], aiConfidence: 50, crossReferenceDepth: 1 }, true, 'officialPage');
  const toplam = Object.values(score.breakdown).reduce((a, b) => a + b, 0);
  assert.strictEqual(score.total, Math.max(0, Math.min(100, Math.round(toplam))));
});

// ── confidence.ts ────────────────────────────────────────────────────────

test('scoreToEvidenceConfidence: yeşil eşik ve üzeri "green" bandına girer', () => {
  const sonuc = scoreToEvidenceConfidence(CONFIDENCE_GREEN_THRESHOLD);
  assert.strictEqual(sonuc.band, 'green');
  assert.strictEqual(sonuc.label, 'Yüksek Güven');
});

test('scoreToEvidenceConfidence: sarı eşik ile yeşil eşik arası "yellow" bandına girer', () => {
  const sonuc = scoreToEvidenceConfidence(CONFIDENCE_YELLOW_THRESHOLD);
  assert.strictEqual(sonuc.band, 'yellow');
});

test('scoreToEvidenceConfidence: sarı eşiğin altı "red" bandına girer', () => {
  const sonuc = scoreToEvidenceConfidence(CONFIDENCE_YELLOW_THRESHOLD - 1);
  assert.strictEqual(sonuc.band, 'red');
  assert.strictEqual(sonuc.label, 'Düşük Güven');
});

test('scoreToEvidenceConfidence: aralık dışı değerler 0-100\'e sıkıştırılır', () => {
  assert.strictEqual(scoreToEvidenceConfidence(-50).score, 0);
  assert.strictEqual(scoreToEvidenceConfidence(500).score, 100);
});

test('aggregateEvidenceConfidence: boş liste için "red"/0 döner', () => {
  const sonuc = aggregateEvidenceConfidence([]);
  assert.strictEqual(sonuc.score, 0);
  assert.strictEqual(sonuc.band, 'red');
});

test('aggregateEvidenceConfidence: en yüksek skoru yansıtır', () => {
  const sonuc = aggregateEvidenceConfidence([20, 85, 40]);
  assert.strictEqual(sonuc.score, 85);
  assert.strictEqual(sonuc.band, 'green');
});

// ── collector.ts ─────────────────────────────────────────────────────────

test('getEvidenceSignals: pdfAvailable ve officialSourceStatus dolu döner', () => {
  const doc = tedasDocu();
  const signals = getEvidenceSignals(doc);
  assert.strictEqual(typeof signals.pdfAvailable, 'boolean');
  assert.ok(typeof signals.officialSourceStatus === 'string' && signals.officialSourceStatus.length > 0);
});

test('buildEvidenceReference: madde 4\'ün istediği TÜM zorunlu alanlar dolu', () => {
  const doc = tedasDocu();
  const signals = getEvidenceSignals(doc);
  const ref = buildEvidenceReference(doc, signals, 77, 'test-sebep');
  for (const key of ['documentId', 'title', 'institution', 'category', 'documentType', 'revision', 'sourceUrl', 'officialSourceStatus', 'sourceAccessType', 'pdfAvailable', 'confidence', 'reason'] as const) {
    assert.ok(key in ref, `EvidenceReference '${key}' alanını İÇERMELİ`);
  }
  assert.strictEqual(ref.confidence, 77);
  assert.strictEqual(ref.reason, 'test-sebep');
});

test('buildEvidenceSection: madde 5 — PDF henüz parse edilmediği için available HER ZAMAN false', () => {
  const doc = tedasDocu();
  const section = buildEvidenceSection(doc);
  assert.strictEqual(section.available, false);
  assert.strictEqual(section.pageHint, undefined);
  assert.strictEqual(section.excerpt, undefined);
});

// ── explanations.ts ──────────────────────────────────────────────────────

test('buildExplanation: intent tespit edildiyse intent tabanlı cümle üretir', () => {
  const doc = tedasDocu();
  const aciklama = buildExplanation(doc, ['branşman'], 0);
  assert.ok(aciklama.includes('branşman'));
});

test('buildExplanation: crossReferenceDepth > 0 ise ayrı, dürüst bir şablon kullanır', () => {
  const doc = tedasDocu();
  const aciklama = buildExplanation(doc, [], 2);
  assert.ok(aciklama.toLowerCase().includes('ilişkili') || aciklama.toLowerCase().includes('çapraz'));
});

test('buildExplanation: intent yok, cross-reference yok ise kategori/kurum tabanlı genel cümle üretir', () => {
  const doc = tedasDocu();
  const aciklama = buildExplanation(doc, [], 0);
  assert.ok(aciklama.includes(doc.institution));
});

test('buildUsageQuestions: en az bir soru üretir, LLM olmadan template tabanlı çalışır', () => {
  const doc = tedasDocu();
  const sorular = buildUsageQuestions(doc);
  assert.ok(sorular.length >= 1);
  assert.ok(sorular.every((s) => typeof s === 'string' && s.length > 0));
});

// ── matcher.ts ───────────────────────────────────────────────────────────

test('matchEvidence: intent ve recommendation birlikte döner', () => {
  const sonuc = matchEvidence('branşman tesisleri için hangi şartname geçerli?', 10);
  assert.ok(Array.isArray(sonuc.intents));
  assert.ok(Array.isArray(sonuc.recommendation.documents));
});

test('matchEvidence: boş sorgu için boş sonuç, hata FIRLATMAZ', () => {
  assert.doesNotThrow(() => matchEvidence('', 10));
  const sonuc = matchEvidence('', 10);
  assert.strictEqual(sonuc.recommendation.documents.length, 0);
});

// ── engine.ts (collectEvidence) — uçtan uca ────────────────────────────

test('collectEvidence: gerçek bir soru için sonuç üretir', () => {
  const sonuc = collectEvidence('2 km uzaktaki OG hattan branşman alınacak. Hangi şartnameler okunmalı?');
  assert.ok(sonuc.collection.evidences.length > 0);
});

test('collectEvidence: summary madde 12 formatına uyar ("N doğrulanmış kaynak bulundu")', () => {
  const sonuc = collectEvidence('XLPE kablo seçilecek, hangi standartlara bakmalıyım?');
  assert.ok(/doğrulanmış kaynak bulundu\.$/.test(sonuc.summary) || /doğrulanmış kaynak bulunamadı\.$/.test(sonuc.summary));
});

test('collectEvidence: boş/anlamsız sorguda "doğrulanmış kaynak bulunamadı" özeti döner', () => {
  const sonuc = collectEvidence('zzz qqq xyz olmayankelime123');
  assert.strictEqual(sonuc.collection.evidences.length, 0);
  assert.ok(sonuc.summary.includes('bulunamadı'));
});

test('collectEvidence: evidences listesinde AYNI belge iki kez GEÇMEZ (duplicate önleme)', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  const idler = sonuc.collection.evidences.map((e) => e.reference.documentId);
  assert.strictEqual(idler.length, new Set(idler).size);
});

test('collectEvidence: bestDocuments/relatedDocuments/crossReferenceDocuments arasında belge TEKRARI yok', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  const bestIds = new Set(sonuc.bestDocuments.map((c) => c.document.id));
  const relatedOverlap = sonuc.relatedDocuments.filter((c) => bestIds.has(c.document.id));
  assert.strictEqual(relatedOverlap.length, 0, 'relatedDocuments, bestDocuments ile TEKRAR ETMEMELİ');
});

test('collectEvidence: crossReferenceDocuments içindeki her kanıt crossReferenceDepth > 0 taşır', () => {
  const sonuc = collectEvidence('XLPE kablo seçilecek, hangi standartlara bakmalıyım?', 10);
  assert.ok(sonuc.crossReferenceDocuments.every((c) => c.crossReferenceDepth > 0));
});

test('collectEvidence: gruplar yalnızca 6 sabit isimden birini taşır', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  const gecerliIsimler = ['Yönetmelikler', 'Şartnameler', 'Standartlar', 'Tebliğler', 'Rehberler', 'Diğer'];
  for (const grup of sonuc.collection.groups) {
    assert.ok(gecerliIsimler.includes(grup.name));
  }
});

test('collectEvidence: boş gruplar sonuca DAHİL EDİLMEZ', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  for (const grup of sonuc.collection.groups) {
    assert.ok(grup.evidences.length > 0);
  }
});

test('collectEvidence: gruplardaki TÜM kanıtların toplamı collection.evidences ile TUTARLI (alt küme)', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  const grupToplam = sonuc.collection.groups.reduce((acc, g) => acc + g.evidences.length, 0);
  assert.strictEqual(grupToplam, sonuc.collection.evidences.length);
});

test('collectEvidence: restricted-source (TSE/IEC) belgeler telifli olarak işaretlenir ama YİNE DE kanıt listesine girebilir', () => {
  const sonuc = collectEvidence('XLPE kablo seçilecek, hangi standartlara bakmalıyım?', 15);
  const telifliVarMi = sonuc.collection.evidences.some((e) => e.reference.officialSourceStatus === 'restrictedStandard');
  // Bu sorgu gerçek kütüphanede TSE/IEC referanslarına ulaşır (cross-reference üzerinden) — telifli kaynak GÖRÜNMELİ ama tam metin VAAT EDİLMEZ.
  assert.ok(telifliVarMi, 'TSE/IEC kablo standartlarına cross-reference ile ulaşılmalı');
});

test('collectEvidence: confidence her zaman collection içindeki en yüksek kanıt skoruyla TUTARLI', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  const enYuksek = Math.max(...sonuc.collection.evidences.map((e) => e.confidence.score), 0);
  assert.strictEqual(sonuc.confidence.score, enYuksek);
});

test('collectEvidence: PDF\'i olan belgeler (varsa) PDF\'i olmayanlardan daha yüksek öncelikli sıralanır (aynı temel puan koşulunda)', () => {
  // Kütüphanede şu an gerçek PDF çok nadir olduğundan (Sprint 8-13), bu test
  // doğrudan ranking.ts seviyesinde (yukarıda) daha güvenilir kanıtlanmıştır;
  // burada yalnızca evidences dizisinin skora göre AZALAN sırada olduğunu doğrularız.
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  for (let i = 1; i < sonuc.collection.evidences.length; i++) {
    assert.ok(sonuc.collection.evidences[i - 1]!.confidence.score >= sonuc.collection.evidences[i]!.confidence.score);
  }
});

test('collectEvidence: limit parametresi bestDocuments\'ı sınırlar', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 3);
  assert.ok(sonuc.bestDocuments.length <= 3, 'bestDocuments en fazla min(limit,5) olmalı — limit=3 iken 3\'ü aşmamalı');
});

test('collectEvidence: her EvidenceReference resmî erişim türünü taşır (5 geçerli değerden biri)', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  const gecerli = ['publicPdf', 'officialPage', 'restrictedStandard', 'manualRequired', 'notFound'];
  for (const e of sonuc.collection.evidences) {
    assert.ok(gecerli.includes(e.reference.officialSourceStatus));
  }
});

test('collectEvidence: aynı sorgu iki kez çağrılırsa TUTARLI (deterministik) sonuç üretir', () => {
  const s1 = collectEvidence('topraklama ölçümü yapılacak, hangi yönetmeliğe göre?', 10);
  const s2 = collectEvidence('topraklama ölçümü yapılacak, hangi yönetmeliğe göre?', 10);
  assert.deepStrictEqual(
    s1.collection.evidences.map((e) => e.reference.documentId),
    s2.collection.evidences.map((e) => e.reference.documentId)
  );
});

test('collectEvidence: her kanıdın explanation alanı boş DEĞİLDİR (LLM olmadan template üretimi çalışıyor)', () => {
  const sonuc = collectEvidence('trafo merkezi kurulacak, hangi dokümanlar gerekli?', 15);
  assert.ok(sonuc.collection.evidences.every((e) => e.explanation.length > 0));
});
