// enhBilgi modülü — Direk Malzemeleri bilgi bankası verisi.
// İçerik docs/ENH_DIREK_SECIMI_ANALIZ.md (bölüm 2) ile TUTARLI tutulmuştur.
// Bu modül bir hesap motoru DEĞİLDİR; yalnızca anlatım metni içerir.
import type { DirekMalzemesiBilgi } from '../types';

export const DIREK_MALZEMELERI: readonly DirekMalzemesiBilgi[] = [
  {
    id: 'beton',
    ad: 'Beton Direk',
    tanim:
      'Prefabrik betonarme gövdeli direk; içi çelik donatı ile güçlendirilmiştir. Türkiye\'de OG/YG dağıtım hatlarında en yaygın kullanılan direk malzemesidir.',
    kullanimAlani: 'OG (34,5 kV) ve YG (154 kV) hava hattı dağıtım şebekeleri.',
    avantaj: 'Standart üretim, uzun servis ömrü, düşük bakım ihtiyacı, yangına dayanıklı.',
    dikkatNotu:
      'Nakliye ve montaj sırasında darbeye karşı hassastır (çatlama riski); doğru gömme derinliği ve zemin sınıfı seçimi kritiktir.',
  },
  {
    id: 'demir',
    ad: 'Demir Direk',
    tanim: 'Çelik profil/kafes (lattice) veya monoblok galvanizli çelik gövdeli direk.',
    kullanimAlani:
      'Daha yüksek gerilim seviyeleri, daha uzun açıklıklar veya ağır yük koşulları (yoğun buz/rüzgar bölgesi) gerektiren hatlar.',
    avantaj: 'Yüksek mekanik dayanım/ağırlık oranı, uzun açıklık ve ağır donanım taşıma kapasitesi.',
    dikkatNotu:
      'Korozyona karşı düzenli galvaniz/boya bakımı gerekir. Bu projede henüz katalog verisi ve hesap motoru yoktur (bkz. docs/ENH_DIREK_SECIMI_ANALIZ.md, önerilen SteelPoleSelectionEngine).',
  },
  {
    id: 'agac',
    ad: 'Ağaç Direk',
    tanim: 'Emprenye edilmiş (kimyasal koruyucu işlem görmüş) ahşap gövdeli direk.',
    kullanimAlani:
      'Geleneksel olarak düşük gerilim/kısa açıklıklı hatlarda; günümüz yeni OG/YG tesislerinde kullanımı sınırlıdır.',
    avantaj: 'Hafif, kolay montaj, düşük ilk maliyet.',
    dikkatNotu:
      'Çürüme/böcek riski, sınırlı mekanik dayanım ve servis ömrü. Bu projenin OG/YG kapsamında güncel kullanım durumu netleştirilecek (bkz. docs/ENH_DIREK_SECIMI_ANALIZ.md).',
  },
];
