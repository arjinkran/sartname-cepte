// enhBilgi modülü — ENH Bilgi Bankası ana ekranındaki başlık listesi.
// Şimdilik yalnızca İletkenler ve Direk Sınıfları aktif; diğerleri
// "Yakında" olarak görünür (aktif: false, rota: '').
import type { EnhBilgiBaslik } from '../types';

export const ENH_BILGI_BASLIKLARI: readonly EnhBilgiBaslik[] = [
  {
    id: 'iletkenler',
    ad: 'İletkenler',
    ikon: '🔌',
    aciklama: 'ACSR iletken tipleri: kesit, çap, ağırlık, kopma dayanımı',
    aktif: true,
    rota: '/enh-bilgi/iletkenler',
  },
  {
    id: 'direk-siniflari',
    ad: 'Direk Sınıfları',
    ikon: '🗼',
    aciklama: 'Taşıyıcı, durdurucu, nihayet ve branşman direk tipleri',
    aktif: true,
    rota: '/enh-bilgi/direk-siniflari',
  },
  {
    id: 'direk-malzemeleri',
    ad: 'Direk Malzemeleri',
    ikon: '🧱',
    aciklama: 'Beton, demir ve ağaç direk',
    aktif: false,
    rota: '',
  },
  {
    id: 'direk-devre-tipleri',
    ad: 'Direk Devre Tipleri',
    ikon: '🔀',
    aciklama: 'Tek devre, çift devre, çok devre',
    aktif: false,
    rota: '',
  },
  {
    id: 'izolatorler',
    ad: 'İzolatörler',
    ikon: '🧿',
    aciklama: 'İzolatör tipleri ve seçim kriterleri',
    aktif: false,
    rota: '',
  },
  {
    id: 'traversler',
    ad: 'Traversler',
    ikon: '📐',
    aciklama: 'Travers tipleri ve donanım ağırlıkları',
    aktif: false,
    rota: '',
  },
  {
    id: 'tip-proje-notlari',
    ad: 'Tip Proje Notları',
    ikon: '📋',
    aciklama: 'Standart tip proje uygulama notları',
    aktif: false,
    rota: '',
  },
];
