// enhBilgi modülü — İzolatörler bilgi bankası verisi.
// "ilgiliDirekTipleri" alanı, direkSiniflari.ts içindeki DirekSinifId
// değerleriyle eşleşir (çapraz referans için) — bu modül bir hesap
// motoru DEĞİLDİR; yalnızca anlatım metni içerir.
import type { IzolatorBilgi } from '../types';

export const IZOLATORLER: readonly IzolatorBilgi[] = [
  {
    id: 'mesnet',
    ad: 'Mesnet İzolatörü',
    tanim: 'İletkeni doğrudan direk/travers üzerine sabitleyen, tek parçalı, sert bağlantılı izolatör tipi.',
    kullanimYeri: 'Düşük-orta gerilim, düz hat, taşıyıcı direk uygulamaları.',
    ilgiliDirekTipleri: ['tasiyici'],
    dikkatNotu: 'Yüksek gerilim veya büyük açı/çekme kuvveti gerektiren noktalarda kullanılmaz; esneklik sınırlıdır.',
  },
  {
    id: 'zincir',
    ad: 'Zincir İzolatör',
    tanim:
      'Birbirine seri bağlı disk (tabak) izolatör elemanlarından oluşan, asma (süspansiyon) tipte kullanılan izolatör grubu.',
    kullanimYeri: 'OG/YG taşıyıcı ve köşe taşıyıcı direklerde, iletkenin asılı taşındığı noktalarda.',
    ilgiliDirekTipleri: ['tasiyici', 'kose-tasiyici'],
    dikkatNotu:
      'Disk sayısı gerilim seviyesine göre artar; kirlenme/kaçak akım yolu uzunluğu ortam kirlilik sınıfına göre seçilmelidir.',
  },
  {
    id: 'gergi',
    ad: 'Gergi İzolatörü',
    tanim: 'İletkenin tam çekme (gerilme) kuvvetini yatay yönde karşılayan, germe uygulamalarına özel izolatör tipi.',
    kullanimYeri: 'Durdurucu, köşe durdurucu, nihayet ve branşman direklerinde, gerilimin kesildiği/yön değiştirdiği noktalarda.',
    ilgiliDirekTipleri: ['durdurucu', 'kose-durdurucu', 'nihayet', 'bransman'],
    dikkatNotu: 'Mekanik çekme dayanımı, iletkenin kopma dayanımına ve emniyet katsayısına göre seçilmelidir.',
  },
];
