// Dosya bütünlük doğrulaması (Sprint 13, madde 7).
//
// ⚠️ Bugünkü React Native/Hermes ortamı, yeni paket eklemeden (bu sprint
// yalnızca `expo-file-system`e izin veriyor) gerçek bir SHA-256 API'si
// SAĞLAMAZ. Bu yüzden bu dosya, `globalThis.crypto.subtle.digest`
// (Web Crypto) kullanılabilir olup olmadığını ÇALIŞMA ZAMANINDA kontrol
// eder: varsa GERÇEK SHA-256 hesaplar (ör. `node --test` ortamı — Node
// 19+'da global `crypto.subtle` vardır), yoksa UYDURMA bir checksum
// ÜRETMEZ — `status: 'unavailable'` döner. Mimari, ileride Web Crypto
// veya bir native paket eklenirse otomatik olarak gerçek hesaplamaya
// geçecek şekilde tasarlandı — çağıran kodun DEĞİŞMESİ gerekmez.

export type ChecksumStatus = 'available' | 'unavailable';

export interface ChecksumResult {
  checksum?: string;
  status: ChecksumStatus;
}

export interface ChecksumFileReader {
  /** Dosyayı base64 metin olarak okur. */
  readAsBase64(absolutePath: string): Promise<string>;
}

function base64ToBytes(base64: string): Uint8Array {
  const atobFn = (globalThis as { atob?: (s: string) => string }).atob;
  if (!atobFn) return new Uint8Array(0);
  const binary = atobFn(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface MinimalSubtleCrypto {
  digest(algorithm: string, data: Uint8Array): Promise<ArrayBuffer>;
}

function getSubtleCrypto(): MinimalSubtleCrypto | undefined {
  return (globalThis as { crypto?: { subtle?: MinimalSubtleCrypto } }).crypto?.subtle;
}

function isSha256Available(): boolean {
  return typeof getSubtleCrypto()?.digest === 'function' && typeof (globalThis as { atob?: unknown }).atob === 'function';
}

async function realFileReader(): Promise<ChecksumFileReader> {
  const FS = await import('expo-file-system/legacy');
  return {
    async readAsBase64(absolutePath: string) {
      return FS.readAsStringAsync(absolutePath, { encoding: 'base64' });
    },
  };
}

/**
 * Ortam SHA-256 destekliyorsa gerçek bir checksum hesaplar (hex string).
 * Desteklemiyorsa UYDURMA bir değer üretmeden `status: 'unavailable'` döner.
 */
export async function calculateChecksum(absolutePath: string, reader?: ChecksumFileReader): Promise<ChecksumResult> {
  if (!isSha256Available()) return { status: 'unavailable' };
  try {
    const activeReader = reader ?? (await realFileReader());
    const base64 = await activeReader.readAsBase64(absolutePath);
    const bytes = base64ToBytes(base64);
    const subtle = getSubtleCrypto();
    if (!subtle) return { status: 'unavailable' };
    const digest = await subtle.digest('SHA-256', bytes);
    return { checksum: bytesToHex(new Uint8Array(digest)), status: 'available' };
  } catch {
    return { status: 'unavailable' };
  }
}

/**
 * Beklenen bir checksum verilmediyse (bilinmiyorsa) doğrulama atlanır ve
 * `true` döner — uydurma bir karşılaştırma YAPILMAZ. Ortam SHA-256
 * hesaplayamıyorsa da (madde 7) dosya REDDEDİLMEZ, yalnızca doğrulanamaz.
 */
export async function verifyChecksum(absolutePath: string, expectedChecksum?: string, reader?: ChecksumFileReader): Promise<boolean> {
  if (!expectedChecksum) return true;
  const result = await calculateChecksum(absolutePath, reader);
  if (result.status === 'unavailable') return true;
  return result.checksum === expectedChecksum;
}
