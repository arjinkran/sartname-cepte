// Şartname / Mevzuat modülü — paylaşılan tipler.

export interface Kategori {
  id: string;
  ad: string;
  ikon: string;
  aciklama: string;
}

export type Kurum = 'TEDAŞ' | 'EPDK' | 'Resmî Gazete';
export type DokumanDurumu = 'guncel' | 'mulga' | 'taslak';

export interface IlgiliMadde {
  /** Madde/bölüm numarası (ör. "Madde 8", "Bölüm 4.2") */
  no: string;
  /** Maddenin saha diliyle kısa açıklaması */
  aciklama: string;
}

export interface Dokuman {
  id: string;
  baslik: string;
  /** Dokümanın sahibi kurum */
  kurum: Kurum;
  /** Doküman türü: Teknik Şartname, Yönetmelik, Tebliğ... */
  dokumanTuru: string;
  /** Şartname/mevzuat numarası veya resmî adı */
  kaynakNo: string;
  kategoriId: string;
  /** Yayın tarihi (GG.AA.YYYY) — örnek verilerde doğrulanacak */
  yayinTarihi: string;
  /** Yürürlük tarihi (GG.AA.YYYY) — örnek verilerde doğrulanacak */
  yururlukTarihi: string;
  durum: DokumanDurumu;
  /** 2-3 cümlelik saha odaklı özet */
  ozet: string;
  /** Sahada en çok lazım olan noktalar */
  onemliNoktalar: string[];
  /** İlgili madde/bölüm referansları */
  ilgiliMaddeler: IlgiliMadde[];
  /** Resmî kaynağa bağlantı (doğrulamada birebir doküman linkiyle değişecek) */
  kaynakBaglanti: string;
  /** Arama için ek anahtar kelimeler */
  anahtarKelimeler: string[];
  /** true → içerik taslak, resmî kaynaktan doğrulanmadı */
  ornek: boolean;
}
