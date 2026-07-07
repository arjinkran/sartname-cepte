// Şartname / Mevzuat modülü — paylaşılan tipler.

export interface Kategori {
  id: string;
  ad: string;
  ikon: string;
  aciklama: string;
}

/** Belgenin sahibi kurum. */
export type Institution = 'TEDAŞ' | 'EPDK' | 'Resmî Gazete';

/** Belgenin yürürlük durumu. */
export type DocumentStatus = 'active' | 'deprecated' | 'draft';

export interface Document {
  id: string;
  title: string;
  institution: Institution;
  /** Kategori adı (KATEGORILER listesindeki `ad` ile birebir eşleşir) */
  category: string;
  summary: string;
  keywords: string[];
  status: DocumentStatus;
  /** Belgenin resmî referans/revizyon bilgisi (doküman no, RG sayısı vb.) */
  revision: string;
  publishDate: string;
  effectiveDate: string;
  /** İlişkili diğer belgelerin id'leri */
  relatedDocuments: string[];
  /** PDF kaynağı (şimdilik stub — gerçek PDF görüntüleme sonraki sürümde) */
  pdfUrl: string;
  tags: string[];
}
