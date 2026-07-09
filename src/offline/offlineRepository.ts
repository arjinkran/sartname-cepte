// Offline depolanan belgelerin sorgulanması (Sprint 8, madde 11).
//
// ⚠️ Gerçek indirme henüz yapılmadığından bu fonksiyonlar HER ZAMAN boş/
// `false` döner — bu bir hata değil, kasıtlı ve dürüst bir başlangıç
// durumudur ("Henüz gerçek indirme yapılmayacak. Yalnızca mimari
// kurulacak."). İleride expo-file-system tabanlı gerçek bir yerel
// önbellek sorgusuyla değiştirilecek; dışa açılan imzalar şimdiden
// sabitlendi (bkz. docs/PDF_ARCHITECTURE.md "Offline hazırlığı").
import type { OfflineDocumentRecord } from './offlineTypes.ts';

export function getOfflineDocuments(): readonly OfflineDocumentRecord[] {
  return [];
}

export function isAvailableOffline(_documentId: string): boolean {
  return false;
}

export function getOfflineDocumentRecord(_documentId: string): OfflineDocumentRecord | undefined {
  return undefined;
}
