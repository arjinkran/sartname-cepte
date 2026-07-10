// İndirilen PDF kayıtlarının kalıcı deposu (Sprint 13, madde 8).
// AsyncStorage kullanır (Sprint 8'in `sonSayfa.tsx`'te kurduğu desenle
// AYNI — tek bir JSON blob, key'e göre kayıt haritası).
//
// ⚠️ TASARIM NOTU: `@react-native-async-storage/async-storage` bu
// dosyanın ÜSTÜNDE statik olarak import EDİLMEZ — native bir modül
// olduğundan `node --test` altında (Metro/RN çalışma zamanı olmadan)
// güvenilir şekilde yüklenemeyebilir. Bunun yerine yalnızca GERÇEKTEN
// ÇAĞRILDIĞINDA dinamik `import()` ile alınır; testler kendi bellek-içi
// `KeyValueStorage` sahtesini enjekte eder ve bu dinamik import HİÇ
// tetiklenmez (bkz. src/offline/filePaths.ts'teki aynı desen).
import type { DownloadRecord } from './downloadTypes.ts';

const STORAGE_KEY = 'sartname-cepte:downloadRecords';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

let cachedRealStorage: KeyValueStorage | undefined;

async function realStorage(): Promise<KeyValueStorage> {
  if (!cachedRealStorage) {
    const mod = await import('@react-native-async-storage/async-storage');
    cachedRealStorage = mod.default;
  }
  return cachedRealStorage;
}

async function readAll(storage?: KeyValueStorage): Promise<Record<string, DownloadRecord>> {
  const active = storage ?? (await realStorage());
  const raw = await active.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, DownloadRecord>) : {};
  } catch {
    return {};
  }
}

async function writeAll(records: Record<string, DownloadRecord>, storage?: KeyValueStorage): Promise<void> {
  const active = storage ?? (await realStorage());
  await active.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function saveDownloadRecord(record: DownloadRecord, storage?: KeyValueStorage): Promise<void> {
  const all = await readAll(storage);
  all[record.documentId] = record;
  await writeAll(all, storage);
}

export async function getDownloadRecord(documentId: string, storage?: KeyValueStorage): Promise<DownloadRecord | undefined> {
  const all = await readAll(storage);
  return all[documentId];
}

export async function getAllDownloadRecords(storage?: KeyValueStorage): Promise<readonly DownloadRecord[]> {
  const all = await readAll(storage);
  return Object.values(all);
}

export async function removeDownloadRecord(documentId: string, storage?: KeyValueStorage): Promise<void> {
  const all = await readAll(storage);
  if (documentId in all) {
    delete all[documentId];
    await writeAll(all, storage);
  }
}

export async function isDocumentDownloaded(documentId: string, storage?: KeyValueStorage): Promise<boolean> {
  const record = await getDownloadRecord(documentId, storage);
  return record !== undefined;
}

export async function getDownloadedDocumentUri(documentId: string, storage?: KeyValueStorage): Promise<string | undefined> {
  const record = await getDownloadRecord(documentId, storage);
  return record?.localUri;
}

export async function updateLastOpenedAt(documentId: string, storage?: KeyValueStorage, now: string = new Date().toISOString()): Promise<void> {
  const all = await readAll(storage);
  const record = all[documentId];
  if (!record) return;
  all[documentId] = { ...record, lastOpenedAt: now };
  await writeAll(all, storage);
}

export async function getDownloadedCountByInstitution(storage?: KeyValueStorage): Promise<Record<string, number>> {
  const all = await readAll(storage);
  const counts: Record<string, number> = {};
  for (const record of Object.values(all)) {
    counts[record.institution] = (counts[record.institution] ?? 0) + 1;
  }
  return counts;
}

/**
 * Fiziksel dosyası artık cihazda olmayan kayıtları temizler. Dosya
 * varlığı kontrolü BURADA yapılmaz (bu depo hiçbir FileSystem bağımlılığı
 * taşımaz) — çağıran taraf (downloadManager) her kaydın `localUri`'sini
 * kontrol eden bir `fileExists` fonksiyonu enjekte eder. `documentId`
 * ikinci argüman olarak da verilir — çağıran taraf başka depoları (ör.
 * runtime manifest) senkron tutmak için kullanabilir.
 */
export async function clearInvalidRecords(
  fileExists: (localUri: string, documentId: string) => Promise<boolean>,
  storage?: KeyValueStorage
): Promise<number> {
  const all = await readAll(storage);
  let removed = 0;
  for (const [documentId, record] of Object.entries(all)) {
    const exists = await fileExists(record.localUri, documentId);
    if (!exists) {
      delete all[documentId];
      removed += 1;
    }
  }
  if (removed > 0) await writeAll(all, storage);
  return removed;
}
