// Tek tip Doküman Modeli — Ulusal Elektrik Mevzuat Kütüphanesi (Sprint 5).
// Her kurum klasöründeki documents.ts BU dosyadaki `Document` tipini
// kullanır; hiçbir kurum kendi tipini tanımlamaz (bkz. Sprint 5, madde 4).
// Gerçek veri kurum klasörlerinde, erişim fonksiyonları repository.ts'te —
// hiçbir ekran bu dosyanın dışındaki bir veri kaynağına doğrudan erişmez.

/**
 * Kurum / standart kaynağı. src/data/library/ altındaki 10 klasörle
 * (tedas, teias, epdk, enerjiBakanligi, resmiGazete, tse, iec, cenelec,
 * ieee, other) eşleşir — 'TS EN' etiketli dokümanlar da `tse/` klasöründe
 * yaşar (TSE'nin uyumlaştırdığı Avrupa standartları olduğu için ayrı bir
 * klasörü yoktur, bkz. tse/README.md).
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

/**
 * Dokümanın türü — kategoriden bağımsız, resmî doküman sınıfı. `Kanun`,
 * Sprint 6'da eklendi (ör. Elektrik Piyasası Kanunu) — additive bir
 * genişletme, mevcut hiçbir değeri değiştirmez/kaldırmaz.
 */
export type DocumentType =
  | 'Kanun'
  | 'Şartname'
  | 'Yönetmelik'
  | 'Standart'
  | 'Tebliğ'
  | 'Genelge'
  | 'Kılavuz'
  | 'Teknik Doküman'
  | 'Rehber';

/** Dokümanın yürürlük durumu (rozet/renk için — bkz. DocumentRow). */
export type DocumentStatus = 'active' | 'deprecated' | 'draft';

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  active: 'Güncel',
  deprecated: 'Mülga',
  draft: 'Taslak',
};

/** Belgenin hukuki/normatif hiyerarşideki konumu (documentType'tan bağımsız alan). */
export type LegalHierarchyLevel = 'Kanun' | 'Yönetmelik' | 'Tebliğ' | 'Şartname' | 'Standart' | 'Genelge';

/** Dil kodu — şimdilik yalnızca TR/EN belgeler kataloglanıyor. */
export type DocumentLanguage = 'TR' | 'EN';

/**
 * Bir kurum klasörünün kendini tanıttığı meta veri (bkz. `<kurum>/metadata.ts`).
 * Kurum listesi ELLE YAZILMAZ — repository.ts, her klasörün METADATA'sını
 * okuyarak listeyi otomatik kurar (Sprint 5, madde 8).
 */
export interface InstitutionMeta {
  institution: Institution;
  ad: string;
  aciklama: string;
}

export interface Document {
  id: string;
  title: string;
  /** Kısa başlık — AppBar/liste satırı gibi dar alanlarda kullanılır. */
  shortTitle: string;
  /** Kategori adı — serbest metin; repository.getCategories() gerçek verideki
   * dağılımı tarayarak otomatik çıkarır (elle yazılan bir kategori listesi yok). */
  category: string;
  institution: Institution;
  documentType: DocumentType;
  legalHierarchy: LegalHierarchyLevel;
  /** Resmî referans/revizyon bilgisi (doküman no, RG sayısı vb.) */
  revision: string;
  publishDate: string;
  effectiveDate: string;
  status: DocumentStatus;
  keywords: readonly string[];
  summary: string;
  /** İlişkili diğer belgelerin id'leri (aynı kütüphane içi) — boş bırakılmaz. */
  relatedDocuments: readonly string[];
  /** PDF kaynağı (şimdilik uzak URL; gerçek/yerel PDF ingestion sonraki sürümde). */
  pdfPath: string;
  /** Kapak görseli — gerçek görsel eklenene kadar tanımsız kalır (mock asset üretilmez). */
  coverImage?: string;
  /**
   * Statik/seed alan — her zaman `false`. Gerçek zamanlı favori durumu hâlâ
   * FavorilerProvider (src/lib/favoriler.tsx, React context, kalıcı
   * saklama yok) üzerinden okunur/yazılır — bkz. docs/LIBRARY_ARCHITECTURE.md
   * "favorite alanı" notu.
   */
  favorite: boolean;
  /** true ise Ana Sayfa "Son Şartnameler" alanında gösterilmeye adaydır. */
  featured: boolean;
  /** ISO tarih (YYYY-MM-DD) — Son Şartnameler bu alana göre sıralanır. */
  updatedAt: string;

  // ── Sprint 5'te eklenen alanlar ──────────────────────────────────────
  /** Bu kaydın resmî kaynaktan (madde numarası, tarih, bağlantı) doğrulanıp
   * doğrulanmadığı. Mevcut 14 belge `true`; yeni eklenecek belgeler
   * doğrulama yapılana kadar `false` kullanmalıdır. */
  sourceVerified: boolean;
  /** Belgenin resmî kaynağı (kurum sayfası/mevzuat.gov.tr vb.). Bilinmiyorsa boş string. */
  sourceUrl: string;
  /** Sürüm/revizyon numarası (ör. "1.0", "2.3", "Rev.5"). */
  version: string;
  language: DocumentLanguage;
  /** Dosya boyutu (ör. "2.4 MB") — gerçek dosya ingestion'ı olmadan bilinmez, tanımsız kalır. */
  fileSize?: string;
  /** Sayfa sayısı — gerçek dosya ingestion'ı olmadan bilinmez, tanımsız kalır. */
  pageCount?: number;
  /** Bu kaydın en son ne zaman gözden geçirildiği (YYYY-MM-DD). */
  lastChecked: string;
  /** keywords'ten BAĞIMSIZ çalışır — arama değil, sınıflandırma/filtreleme amaçlıdır. */
  tags: readonly string[];
  /** Alternatif arama adları/kısaltmaları (ör. "EKAT"). Yoksa boş dizi — uydurulmaz. */
  aliases: readonly string[];
  /** AI arama puanlamasında çarpan olarak kullanılır (varsayılan 1). */
  searchWeight: number;
  /** Ana sayfada gösterim önceliği — düşük sayı = daha öncelikli. Şu an UI'da
   * kullanılmıyor (mevcut sıralama updatedAt'e göre korunuyor), ileride devreye alınabilir. */
  priority: number;
  /** `status === 'deprecated'` ile senkron tutulan ayrı bir bayrak — ileride
   * "yürürlükte ama yakında kaldırılacak" gibi ara durumlar için ayrışabilir. */
  deprecated: boolean;
  /** `deprecated: true` ise, yerine geçen belgenin id'si. */
  replacementDocumentId?: string;
  /** İlişkili standart/mevzuatların Document id'leri (bu dizinin başka bir
   * yerinde kayıtlı olmalı — serbest metin DEĞİL). Sprint 6'dan itibaren
   * TSE/IEC/CENELEC/IEEE gibi kurumlar da kendi Document kaydına sahip
   * olduğundan artık gerçek id referansı taşır; testlerde tüm id'lerin
   * mevcut olduğu doğrulanır. Kaynak doğrulaması gerekli — bkz.
   * LIBRARY_ARCHITECTURE.md. */
  crossReferences: readonly string[];

  // ── Sprint 8'de eklenen PDF alanları ─────────────────────────────────
  // Hepsi OPSİYONEL: kütüphanedeki 121 belgenin HİÇBİRİNDE şu an gerçek bir
  // PDF yok (bkz. docs/PDF_ARCHITECTURE.md) — bu yüzden mevcut hiçbir
  // belge kaydı bu alanları elle doldurmak ZORUNDA değil. `pdfAvailable`
  // alanı tanımsız (undefined) olan bir belge, `hasPdf()` tarafından
  // `false` ile aynı muamele görür (bkz. repository.ts) — "belirtilmemiş
  // PDF" ile "PDF yok" arasında UI açısından fark yoktur, ikisi de aynı
  // "PDF Yakında" durumunu üretir.
  /** `src/assets/pdfs/<kurum>/` altındaki hedef/görünen dosya adı (ör.
   * "ag-xlpe-kablo.pdf") — organizasyonel; gerçek bir bundle referansı
   * DEĞİLDİR (Metro `require()` dinamik yol kabul etmez, bkz. `localAsset`). */
  pdfFile?: string;
  /** Gerçek, doğrulanmış uzak PDF bağlantısı. Bilinmiyorsa TANIMSIZ
   * bırakılır — asla uydurma bir URL yazılmaz (bkz. Sprint 8 kuralları). */
  pdfUrl?: string;
  /** Bu belgenin ŞU AN gerçekten açılıp görüntülenebilir bir PDF'i olup
   * olmadığının TEK doğruluk kaynağı — `localAsset` veya `pdfUrl`'den
   * biri gerçekten mevcut olduğunda `true` yapılır. UI'daki tüm PDF
   * rozeti/buton mantığı bu alana (repository.hasPdf() üzerinden) bakar,
   * eski `pdfPath` alanına ASLA bakmaz (pdfPath her belgede dolu bir
   * kurum ana sayfası yer tutucusudur, gerçek PDF varlığını göstermez). */
  pdfAvailable?: boolean;
  /** `src/assets/pdfs/<kurum>/` içinde GERÇEKTEN bulunan, Metro'nun
   * bundle'layabileceği bir dosyaya göreli yol (ör. "tedas/ag-xlpe-kablo.pdf").
   * Gerçek dosya eklenmeden bu alan doldurulmaz. */
  localAsset?: string;
  /** Uzak PDF'in hangi revizyonuna karşılık geldiğini işaretleyen sürüm/
   * hash bilgisi — ileride indirme yöneticisinin "kaynak değişti, yeniden
   * indir" kararını vermesi için (bkz. src/offline/). Şimdilik kullanılmaz. */
  remoteVersion?: string;
  /** İndirilen dosyanın bütünlük doğrulaması için hash (ör. SHA-256).
   * Gerçek dosya indirilmeden hesaplanamayacağından şimdilik tanımsızdır. */
  checksum?: string;
}
