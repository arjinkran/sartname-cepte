// Tek tip Doküman Modeli (Sprint 4 — Mevzuat Kütüphanesi Altyapısı).
// Bundan sonra uygulamadaki tüm şartname/yönetmelik/standart içerikleri bu
// modeli kullanır. Bu dosya yalnızca TİP tanımlarını içerir; gerçek veri
// documents.ts'te, erişim fonksiyonları repository.ts'tedir — hiçbir ekran
// bu dosyanın dışındaki bir veri kaynağına doğrudan erişmemelidir.

/**
 * Kurum / standart kaynağı.
 * 'Diğer', yukarıdaki 10 değerin hiçbirine uymayan kaynaklar içindir
 * (ör. belediye, dağıtım şirketi özel şartnamesi).
 */
export type Institution =
  | 'TEDAŞ'
  | 'TEİAŞ'
  | 'EPDK'
  | 'Enerji Bakanlığı'
  | 'Resmî Gazete'
  | 'TSE'
  | 'IEC'
  | 'CENELEC'
  | 'TS EN'
  | 'IEEE'
  | 'Diğer';

/** Dokümanın türü — kategoriden bağımsız, resmî doküman sınıfı. */
export type DocumentType =
  | 'Şartname'
  | 'Yönetmelik'
  | 'Standart'
  | 'Tebliğ'
  | 'Genelge'
  | 'Kılavuz'
  | 'Teknik Doküman'
  | 'Rehber';

/** Dokümanın yürürlük durumu. */
export type DocumentStatus = 'active' | 'deprecated' | 'draft';

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  active: 'Güncel',
  deprecated: 'Mülga',
  draft: 'Taslak',
};

/** Kategori tanımı — bkz. categories.ts (CATEGORIES). */
export interface Category {
  id: string;
  ad: string;
  ikon: string;
  aciklama: string;
}

export interface Document {
  id: string;
  title: string;
  /** Kısa başlık — AppBar/liste satırı gibi dar alanlarda kullanılır. */
  shortTitle: string;
  /** Kategori adı — CATEGORIES listesindeki `ad` ile birebir eşleşir. */
  category: string;
  institution: Institution;
  documentType: DocumentType;
  /** Resmî referans/revizyon bilgisi (doküman no, RG sayısı vb.) */
  revision: string;
  publishDate: string;
  effectiveDate: string;
  status: DocumentStatus;
  keywords: readonly string[];
  summary: string;
  /** İlişkili diğer belgelerin id'leri — boş bırakılmaz (bkz. documents.ts). */
  relatedDocuments: readonly string[];
  /** PDF kaynağı (şimdilik uzak URL; gerçek/yerel PDF ingestion sonraki sürümde). */
  pdfPath: string;
  /** Kapak görseli — gerçek görsel eklenene kadar tanımsız kalır (mock asset üretilmez). */
  coverImage?: string;
  /**
   * Statik/seed alan — her zaman `false`. Gerçek zamanlı favori durumu hâlâ
   * FavorilerProvider (src/lib/favoriler.tsx, React context, kalıcı
   * saklama yok) üzerinden okunur/yazılır. Bkz. docs/DOCUMENT_ARCHITECTURE.md
   * "favorite alanı" notu.
   */
  favorite: boolean;
  /** true ise Ana Sayfa "Son Şartnameler" alanında gösterilmeye adaydır. */
  featured: boolean;
  /** ISO tarih (YYYY-MM-DD) — Son Şartnameler bu alana göre sıralanır. */
  updatedAt: string;
}
