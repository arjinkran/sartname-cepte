// Runtime PDF Manifest — indirilen PDF'lerin ÇALIŞMA ZAMANI kaydı
// (Sprint 13, madde 9).
//
// Statik `src/assets/pdfs/manifest.ts` (Sprint 9) DERLEME ZAMANINDA
// sabitlenmiş, elle küratörlüğü yapılan bir kayıt defteridir — bu sprint
// ONU çalışma anında DEĞİŞTİRMEZ. Bunun yerine, kullanıcının GERÇEKTEN
// indirdiği dosyalar için ayrı, bellek-içi bir katman tutulur. Bu katman:
// - TAMAMEN SAF/senkron bir Map'tir — hiçbir FileSystem/AsyncStorage
//   bağımlılığı YOKTUR (bu yüzden `node --test` altında sorunsuz çalışır).
// - Uygulama oturumu boyunca yaşar; KALICI değildir — kalıcılık zaten
//   `downloadRepository.ts` (AsyncStorage) tarafından sağlanır. Uygulama
//   başlangıcında bu iki katmanı senkronize etmek çağıran tarafın
//   (downloadManager.ts / app başlangıç kancası) sorumluluğundadır —
//   bkz. `hydrateRuntimeManifestFromRecords()`.
//
// Bağımlılık yönü (madde 9, 19): bu dosya yalnızca `PDF_MANIFEST` (statik,
// leaf) ve `Institution` TİPİNİ import eder — `repository.ts`'i ASLA
// import ETMEZ. `repository.ts` bu dosyayı salt-okunur (read-only) olarak
// import eder (tersi asla olmaz) — döngüsel bağımlılık YOKTUR.
import type { Institution } from '../data/library/types.ts';
import { PDF_MANIFEST } from '../assets/pdfs/manifest.ts';
import type { PDFManifestItem } from '../assets/pdfs/types.ts';

/** Bir belgenin GERÇEKTEN indirilmiş, cihazda duran dosyasının runtime kaydı. */
export interface RuntimeManifestItem {
  documentId: string;
  institution: Institution;
  fileName: string;
  /** Cihazdaki GERÇEK mutlak dosya URI'si (`file://...`) — statik manifest'in repo-göreli `relativePath`inden FARKLI olarak zaten tam/açılabilir bir yoldur. */
  localUri: string;
  fileSize?: number;
  checksum?: string;
  addedAt: string;
}

/** `repository.ts`'in `getPdfPath()` gibi fonksiyonlarının tükettiği, statik+runtime BİRLEŞİK görünüm. */
export interface MergedPdfEntry {
  documentId: string;
  institution: Institution;
  fileName: string;
  /** Statik kayıt için repo-göreli yol, runtime kayıt için mutlak cihaz URI'si. */
  uri: string;
  /** `true` yalnızca GERÇEKTEN indirilmiş (runtime) bir kayıt için. */
  isLocal: boolean;
  checksum?: string;
  fileSize?: number;
}

const runtimeManifest = new Map<string, RuntimeManifestItem>();

export function getRuntimeManifest(): readonly RuntimeManifestItem[] {
  return Array.from(runtimeManifest.values());
}

export function addRuntimeManifestItem(item: RuntimeManifestItem): void {
  runtimeManifest.set(item.documentId, item);
}

export function removeRuntimeManifestItem(documentId: string): void {
  runtimeManifest.delete(documentId);
}

export function findRuntimePdfByDocumentId(documentId: string): RuntimeManifestItem | undefined {
  return runtimeManifest.get(documentId);
}

/**
 * Statik manifest + runtime (indirilen) manifest'i TEK bir listede
 * birleştirir. Bir belge için HER İKİSİ de varsa runtime kaydı (gerçekten
 * indirilmiş, cihazda duran dosya) ÖNCELİKLİDİR — statik kaydı EZER.
 */
export function mergeStaticAndRuntimeManifest(staticManifest: readonly PDFManifestItem[] = PDF_MANIFEST): readonly MergedPdfEntry[] {
  const merged = new Map<string, MergedPdfEntry>();

  for (const item of staticManifest) {
    merged.set(item.documentId, {
      documentId: item.documentId,
      institution: item.institution,
      fileName: item.fileName,
      uri: item.relativePath,
      isLocal: false,
      checksum: item.checksum,
      fileSize: item.fileSize,
    });
  }

  for (const item of runtimeManifest.values()) {
    merged.set(item.documentId, {
      documentId: item.documentId,
      institution: item.institution,
      fileName: item.fileName,
      uri: item.localUri,
      isLocal: true,
      checksum: item.checksum,
      fileSize: item.fileSize,
    });
  }

  return Array.from(merged.values());
}

/**
 * Kalıcı indirme kayıtlarından (downloadRepository) runtime manifest'i
 * doldurur — uygulama başlangıcında BİR KEZ çağrılması amaçlanır.
 * Bu fonksiyon downloadRepository'yi İMPORT ETMEZ (döngü olmasın diye) —
 * çağıran taraf kayıtları kendisi getirip BURAYA verir.
 */
export function hydrateRuntimeManifestFromRecords(
  records: readonly { documentId: string; institution: Institution; fileName: string; localUri: string; fileSize?: number; checksum?: string; downloadedAt: string }[]
): void {
  for (const record of records) {
    addRuntimeManifestItem({
      documentId: record.documentId,
      institution: record.institution,
      fileName: record.fileName,
      localUri: record.localUri,
      fileSize: record.fileSize,
      checksum: record.checksum,
      addedAt: record.downloadedAt,
    });
  }
}

/** Test/tanılama amaçlı: runtime manifest'i tamamen boşaltır. Üretim kodunda kullanılmaz. */
export function clearRuntimeManifestForTests(): void {
  runtimeManifest.clear();
}
