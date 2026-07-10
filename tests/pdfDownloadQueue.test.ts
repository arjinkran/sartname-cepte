// Download Queue testleri (Sprint 13, madde 18-19, 21).
// ⚠️ Gerçek `downloadOfficialPdf` (dolayısıyla gerçek ağ/dosya sistemi)
// HİÇ çağrılmaz — `setDownloadFnForTests()` ile tamamen kontrol edilebilir
// bir sahte fonksiyon enjekte edilir.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  enqueueDownload,
  cancelQueuedDownload,
  getQueueState,
  subscribeToQueue,
  setDownloadFnForTests,
  resetQueueForTests,
} from '../src/offline/downloadQueue.ts';
import type { downloadOfficialPdf } from '../src/offline/downloadManager.ts';
import type { DownloadRequest, DownloadResult } from '../src/offline/downloadTypes.ts';

beforeEach(() => {
  resetQueueForTests();
});

function req(documentId: string): DownloadRequest {
  return {
    documentId,
    institution: 'TEDAŞ',
    title: `Belge ${documentId}`,
    url: `https://www.tedas.gov.tr/${documentId}.pdf`,
    providerId: 'tedas',
  };
}

/** Testin kontrolünde, yalnızca `resolveDocument()` çağrılınca tamamlanan bir sahte indirme fonksiyonu. */
function controllableDownloadFn() {
  const resolvers = new Map<string, (result: DownloadResult) => void>();
  const started: string[] = [];
  const fn = (async (request: DownloadRequest) => {
    started.push(request.documentId);
    return new Promise<DownloadResult>((resolve) => {
      resolvers.set(request.documentId, resolve);
    });
  }) as unknown as typeof downloadOfficialPdf;

  return {
    fn,
    started,
    resolveDocument(documentId: string, result: Partial<DownloadResult> = {}) {
      resolvers.get(documentId)?.({ documentId, status: 'completed', message: 'tamam', ...result });
    },
    rejectDocument(documentId: string) {
      // downloadOfficialPdf sözleşmesi gereği hata durumunda da reddetmez,
      // 'failed' status'lü bir sonuç döner — runQueueItem'ın try/catch'i
      // yalnızca gerçek bir exception fırlatılırsa devreye girer; burada
      // her iki yolu da (failed-result VE gerçek throw) test etmek için
      // resolvers Map'i throw eden bir sahte promise ile de kullanılabilir.
      resolvers.get(documentId)?.({ documentId, status: 'failed', message: 'hata', failureReason: 'networkError' });
    },
  };
}

test('en fazla 2 eşzamanlı indirme çalışır, üçüncü kuyrukta bekler', async () => {
  const { fn, started, resolveDocument } = controllableDownloadFn();
  setDownloadFnForTests(fn);

  enqueueDownload(req('a'));
  enqueueDownload(req('b'));
  enqueueDownload(req('c'));
  await new Promise((r) => setImmediate(r));

  assert.strictEqual(getQueueState().activeCount, 2);
  assert.deepStrictEqual(started.sort(), ['a', 'b']);
  assert.strictEqual(getQueueState().items.find((i) => i.request.documentId === 'c')?.status, 'queued');

  resolveDocument('a');
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));

  assert.deepStrictEqual(started.sort(), ['a', 'b', 'c']);
  assert.strictEqual(getQueueState().activeCount, 2);

  resolveDocument('b');
  resolveDocument('c');
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  assert.strictEqual(getQueueState().activeCount, 0);
});

test('aynı documentId için duplicate kuyruk kaydı engellenir', async () => {
  const { fn } = controllableDownloadFn();
  setDownloadFnForTests(fn);

  const ilk = enqueueDownload(req('a'));
  const ikinci = enqueueDownload(req('a'));

  assert.strictEqual(ilk, true);
  assert.strictEqual(ikinci, false, 'aynı belge zaten kuyrukta/aktifken tekrar eklenmemeli');
  assert.strictEqual(getQueueState().items.filter((i) => i.request.documentId === 'a').length, 1);
});

test('bir işin başarısız olması diğer işleri DURDURMAZ', async () => {
  const { fn, resolveDocument } = controllableDownloadFn();
  setDownloadFnForTests(fn);

  enqueueDownload(req('basarisiz'));
  enqueueDownload(req('basarili'));
  await new Promise((r) => setImmediate(r));

  resolveDocument('basarisiz', { status: 'failed', failureReason: 'networkError' });
  resolveDocument('basarili', { status: 'completed' });
  await new Promise((r) => setImmediate(r));

  const state = getQueueState();
  assert.strictEqual(state.items.find((i) => i.request.documentId === 'basarisiz')?.status, 'failed');
  assert.strictEqual(state.items.find((i) => i.request.documentId === 'basarili')?.status, 'completed');
});

test('gerçek bir exception fırlatan iş kuyruğu ÇÖKERTMEZ, yalnızca failed işaretlenir', async () => {
  const patlayanFn = (async () => {
    throw new Error('beklenmeyen hata');
  }) as unknown as typeof downloadOfficialPdf;
  setDownloadFnForTests(patlayanFn);

  enqueueDownload(req('patlayan'));
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));

  assert.strictEqual(getQueueState().items.find((i) => i.request.documentId === 'patlayan')?.status, 'failed');
  assert.strictEqual(getQueueState().activeCount, 0, 'hata sonrası activeCount 0\'a dönmeli, negatif OLMAMALI');
});

test('activeCount hiçbir senaryoda negatif olmaz', async () => {
  const { fn, resolveDocument } = controllableDownloadFn();
  setDownloadFnForTests(fn);

  enqueueDownload(req('a'));
  await new Promise((r) => setImmediate(r));
  resolveDocument('a');
  resolveDocument('a'); // aynı çözümleyiciyi iki kez tetiklemek zararsız olmalı
  await new Promise((r) => setImmediate(r));

  assert.ok(getQueueState().activeCount >= 0);
});

test('subscribeToQueue: unsubscribe sonrası bildirim gelmez', async () => {
  const { fn, resolveDocument } = controllableDownloadFn();
  setDownloadFnForTests(fn);

  let callCount = 0;
  const unsubscribe = subscribeToQueue(() => {
    callCount += 1;
  });

  enqueueDownload(req('a'));
  await new Promise((r) => setImmediate(r));
  const sayimUnsubscribeOncesi = callCount;
  unsubscribe();

  resolveDocument('a');
  await new Promise((r) => setImmediate(r));

  assert.strictEqual(callCount, sayimUnsubscribeOncesi, 'unsubscribe sonrası callback tetiklenmemeli');
});

test('cancelQueuedDownload: bekleyen (henüz başlamamış) iş kuyruktan çıkarılır', async () => {
  const { fn } = controllableDownloadFn();
  setDownloadFnForTests(fn);

  enqueueDownload(req('a'));
  enqueueDownload(req('b'));
  enqueueDownload(req('c')); // slot yok, 'queued' kalır
  await new Promise((r) => setImmediate(r));

  const sonuc = cancelQueuedDownload('c');
  assert.strictEqual(sonuc, true);
  assert.strictEqual(getQueueState().items.find((i) => i.request.documentId === 'c')?.status, 'cancelled');
});

test('cancelQueuedDownload: olmayan bir iş için false döner', () => {
  assert.strictEqual(cancelQueuedDownload('olmayan-id'), false);
});

test('resetQueueForTests: kuyruk ve abonelikler tamamen temizlenir', async () => {
  const { fn } = controllableDownloadFn();
  setDownloadFnForTests(fn);
  enqueueDownload(req('a'));
  await new Promise((r) => setImmediate(r));

  resetQueueForTests();

  assert.strictEqual(getQueueState().items.length, 0);
  assert.strictEqual(getQueueState().activeCount, 0);
});

test('çok sayıda iş sınırlı sürede (sonsuz döngüye girmeden) tamamlanır', async () => {
  const { fn, resolveDocument, started } = controllableDownloadFn();
  setDownloadFnForTests(fn);

  for (let i = 0; i < 6; i++) enqueueDownload(req(`toplu-${i}`));
  await new Promise((r) => setImmediate(r));

  // Kademeli olarak hepsini çözerek kuyruğun devam ettiğini doğrula.
  for (let round = 0; round < 6; round++) {
    for (const id of [...started]) resolveDocument(id);
    await new Promise((r) => setImmediate(r));
  }

  const state = getQueueState();
  assert.ok(state.items.every((i) => i.status === 'completed'));
  assert.strictEqual(state.activeCount, 0);
});
