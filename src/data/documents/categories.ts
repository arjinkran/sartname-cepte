// Kategori sistemi (Sprint 4, madde 4) — eski dar kategori listesinin
// (AG Şebeke ve Kablolar, OG / Trafo ve Hücreler, ...) yerine geçen, daha
// ayrıntılı ve genişleyebilir taksonomi. `Document.category` bu listedeki
// `ad` alanlarından biriyle birebir eşleşmelidir.
import type { Category } from './types.ts';

export const CATEGORIES: readonly Category[] = [
  { id: 'ag-sebeke', ad: 'AG Şebeke', ikon: '🔌', aciklama: 'Alçak gerilim dağıtım şebekesi ve iç tesisler' },
  { id: 'og-sebeke', ad: 'OG Şebeke', ikon: '⚡', aciklama: 'Orta gerilim dağıtım şebekesi' },
  { id: 'yg', ad: 'YG', ikon: '🗼', aciklama: 'Yüksek gerilim iletim hatları ve tesisleri' },
  { id: 'kablolar', ad: 'Kablolar', ikon: '🧵', aciklama: 'Güç kabloları, ekler, başlıklar' },
  { id: 'trafo', ad: 'Trafo', ikon: '🔋', aciklama: 'Dağıtım ve güç transformatörleri' },
  { id: 'dagitim-panolari', ad: 'Dağıtım Panoları', ikon: '🗄️', aciklama: 'AG dağıtım panoları ve kofralar' },
  { id: 'hucreler', ad: 'Hücreler', ikon: '🧰', aciklama: 'OG modüler/metal mahfazalı hücreler' },
  { id: 'topraklama', ad: 'Topraklama', ikon: '🌍', aciklama: 'Topraklama tesisleri, ölçüm, koruma' },
  { id: 'koruma', ad: 'Koruma', ikon: '🛡️', aciklama: 'Röle koruma, selektivite, koruma koordinasyonu' },
  { id: 'sayac', ad: 'Sayaç', ikon: '📟', aciklama: 'Elektronik/elektromekanik sayaçlar' },
  { id: 'olcu', ad: 'Ölçü', ikon: '📊', aciklama: 'Ölçü trafoları, akım/gerilim trafoları' },
  { id: 'direkler', ad: 'Direkler', ikon: '🗼', aciklama: 'Beton, demir, ahşap direkler' },
  { id: 'iletkenler', ad: 'İletkenler', ikon: '➰', aciklama: 'ACSR iletkenler ve donanımları' },
  { id: 'isg', ad: 'İSG', ikon: '🦺', aciklama: 'İş sağlığı ve güvenliği, emniyet mevzuatı' },
  { id: 'hizmet-kalitesi', ad: 'Hizmet Kalitesi', ikon: '📈', aciklama: 'Kesinti süreleri, tazminatlar, kalite göstergeleri' },
  { id: 'enerji-piyasasi', ad: 'Enerji Piyasası', ikon: '💹', aciklama: 'Piyasa, tüketici ve bağlantı mevzuatı' },
  { id: 'scada', ad: 'SCADA', ikon: '🖥️', aciklama: 'Uzaktan izleme ve kontrol sistemleri' },
  { id: 'aydinlatma', ad: 'Aydınlatma', ikon: '💡', aciklama: 'Genel aydınlatma, armatürler' },
  { id: 'parafudr', ad: 'Parafudr', ikon: '⚡', aciklama: 'Aşırı gerilim koruma cihazları' },
  { id: 'kesiciler', ad: 'Kesiciler', ikon: '🔀', aciklama: 'Güç kesicileri' },
  { id: 'ayiricilar', ad: 'Ayırıcılar', ikon: '🔓', aciklama: 'Yük ayırıcıları, seksiyonerler' },
  { id: 'kompanzasyon', ad: 'Kompanzasyon', ikon: '🧮', aciklama: 'Reaktif güç kompanzasyonu' },
  { id: 'genel', ad: 'Genel', ikon: '📁', aciklama: 'Yukarıdaki kategorilere girmeyen genel dokümanlar' },
] as const;
