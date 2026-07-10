// Dosya yolu yönetimi (Sprint 13, madde 3).
//
// ⚠️ TASARIM NOTU: `sanitizeFileName`, `getOfflineDocumentDirectory`,
// `getInstitutionDirectory`, `getDocumentFilePath` TAMAMEN SAF
// fonksiyonlardır ve GÖRECELİ (relative) yol üretirler — `expo-file-system`e
// hiçbir bağımlılıkları yoktur, bu yüzden `node --test` altında native
// modül YÜKLEMEDEN, hatasız çalışırlar. GERÇEK mutlak cihaz yoluna çevrim
// yalnızca `resolveAbsolutePath()`/`ensureDirectoryExists()` GERÇEKTEN
// çağrıldığında, DİNAMİK `import('expo-file-system/legacy')` ile yapılır.
// `expo-file-system` bu dosyanın en üstünde STATİK olarak import EDİLMEZ —
// edilseydi, native bir modül olduğundan dosya import edilir edilmez
// (fonksiyon hiç çağrılmasa bile) `node --test` altında çökerdi.

const ROOT_FOLDER = 'sartname-cepte-pdfs';
const MAX_FILE_NAME_LENGTH = 120;

/**
 * Dosya adından path traversal karakterlerini ve geçersiz/kontrol
 * karakterlerini temizler. `../`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`
 * kaldırılır/değiştirilir; sonuç en fazla 120 karakter olur.
 */
export function sanitizeFileName(fileName: string): string {
  const cleaned = fileName
    .replace(/\.\./g, '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim();
  const safe = cleaned.length > 0 ? cleaned : 'dosya';
  return safe.length > MAX_FILE_NAME_LENGTH ? safe.slice(0, MAX_FILE_NAME_LENGTH) : safe;
}

/** Uygulamanın tüm indirilen PDF'lerini tuttuğu göreceli kök klasör. */
export function getOfflineDocumentDirectory(): string {
  return `${ROOT_FOLDER}/`;
}

/** Bir kurumun indirilen dosyalarının bulunduğu göreceli klasör. */
export function getInstitutionDirectory(institution: string): string {
  return `${getOfflineDocumentDirectory()}${sanitizeFileName(institution)}/`;
}

/**
 * Bir belge için DETERMİNİSTİK göreceli dosya yolu üretir — aynı
 * documentId + fileName her zaman aynı yolu üretir (idempotent, çakışma
 * kontrolü için uygun).
 */
export function getDocumentFilePath(documentId: string, fileName: string, institution: string): string {
  const safeId = sanitizeFileName(documentId);
  const safeName = sanitizeFileName(fileName);
  return `${getInstitutionDirectory(institution)}${safeId}_${safeName}`;
}

// ── Gerçek cihaz dosya sistemine erişim (yalnızca ÇAĞRILDIĞINDA) ─────────

let cachedDeviceRoot: string | undefined;

/** GERÇEK cihaz kök dizinini (`documentDirectory`) yalnızca ÇAĞRILDIĞINDA, dinamik import ile alır ve önbelleğe alır. */
export async function getRealDeviceRoot(): Promise<string> {
  if (cachedDeviceRoot === undefined) {
    const FS = await import('expo-file-system/legacy');
    cachedDeviceRoot = FS.documentDirectory ?? '';
  }
  return cachedDeviceRoot;
}

/** Bu dosyanın ürettiği göreceli bir yolu GERÇEK mutlak cihaz yoluna çevirir. */
export async function resolveAbsolutePath(relativePath: string): Promise<string> {
  const root = await getRealDeviceRoot();
  return `${root}${relativePath}`;
}

export interface DirectoryEnsurer {
  ensureDirectoryExists(absolutePath: string): Promise<void>;
}

async function realEnsureDirectoryExists(absolutePath: string): Promise<void> {
  const FS = await import('expo-file-system/legacy');
  const info = await FS.getInfoAsync(absolutePath);
  if (!info.exists) {
    await FS.makeDirectoryAsync(absolutePath, { intermediates: true });
  }
}

/**
 * Verilen GÖRECELİ yolun (kurum) dizinini, yoksa oluşturur. `ensurer`
 * testlerde gerçek dosya sistemine dokunmadan enjekte edilebilir.
 */
export async function ensureDirectoryExists(relativePath: string, ensurer?: DirectoryEnsurer): Promise<void> {
  const absolute = await resolveAbsolutePath(relativePath);
  if (ensurer) {
    await ensurer.ensureDirectoryExists(absolute);
    return;
  }
  await realEnsureDirectoryExists(absolute);
}

/** Test/tanılama amaçlı: önbelleğe alınmış kök dizini sıfırlar. Üretim kodunda kullanılmaz. */
export function resetDeviceRootForTests(): void {
  cachedDeviceRoot = undefined;
}
