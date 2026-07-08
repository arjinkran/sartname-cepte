// enhBilgi modülü — Direk Devre Tipleri bilgi bankası verisi.
// İçerik docs/ENH_DIREK_SECIMI_ANALIZ.md (bölüm 3) ile TUTARLI tutulmuştur
// (o bölümdeki "model tutarsızlığı" notuna burada da atıf yapılır).
// Bu modül bir hesap motoru DEĞİLDİR; yalnızca anlatım metni içerir.
import type { DevreTipiBilgi } from '../types';

export const DIREK_DEVRE_TIPLERI: readonly DevreTipiBilgi[] = [
  {
    id: 'tek-devre',
    ad: 'Tek Devre',
    tanim: 'Direk üzerinde yalnızca bir enerji hattı (bir set faz iletkeni) taşınır.',
    neredeKullanilir: 'Düşük-orta yük yoğunluğu olan dağıtım hatları, kırsal/az yoğun güzergahlar.',
    direkYukuneEtkisi: 'En düşük düşey/yatay yük; direk gövdesi ve travers boyutu görece küçük tutulabilir.',
    projeNotu:
      'Mevcut Beton Direk Seçimi kataloğunda "tek-devre" kategorisiyle eşleşir (ör. Swallow/Raven ile kısa-orta açıklık örnekleri).',
  },
  {
    id: 'cift-devre',
    ad: 'Çift Devre',
    tanim: 'Aynı direk üzerinde iki ayrı enerji hattı (iki set faz iletkeni) taşınır.',
    neredeKullanilir:
      'Güzergah/arazi kısıtı nedeniyle iki hattın aynı güzergahtan geçirilmesi gereken durumlar; şehir içi/yoğun bölgeler.',
    direkYukuneEtkisi:
      'Travers sayısı ve donanım ağırlığı iki katına yakın artar; direk moment kapasitesi buna göre yükseltilmelidir.',
    projeNotu:
      'Mevcut kod tabanında "cift-devre-cam" ve "cift-devre-fici" olarak iki alt kategori var (bkz. docs/ENH_DIREK_SECIMI_ANALIZ.md bölüm 3 — bu ayrımın devre sayısı mı yoksa direk ailesi/malzemesi mi olduğu netleştirilecek).',
  },
  {
    id: 'cok-devre',
    ad: 'Çok Devre',
    tanim: 'Direk üzerinde ikiden fazla enerji hattı taşınan genel kategori (3, 4 veya daha fazla devre).',
    neredeKullanilir: 'Çok kısıtlı güzergah koridorları, ana besleme/toplama noktaları.',
    direkYukuneEtkisi: 'En yüksek düşey/yatay yük ve travers karmaşıklığı; genellikle demir direk gerektirir.',
    projeNotu:
      'Bu proje şu an yalnızca dört devreyi ("Dört Devre") somut olarak modelliyor; üç devre veya beş+ devre için ayrı bir kategori henüz yok — netleştirilecek.',
  },
  {
    id: 'dort-devre',
    ad: 'Dört Devre',
    tanim: 'Çok devre kategorisinin bu projede somut olarak modellenen özel hali: direk üzerinde dört ayrı enerji hattı taşınır.',
    neredeKullanilir: 'Yüksek yoğunluklu iletim koridorları, birden fazla hattın aynı güzergahta birleştiği noktalar.',
    direkYukuneEtkisi: 'Çok yüksek düşey/yatay yük; genellikle demir direk veya güçlendirilmiş beton direk gerektirir.',
    projeNotu:
      'Mevcut Beton Direk Seçimi kataloğunda "dort-devre" kategorisiyle eşleşir (ör. Partridge/Hawk ile uzun açıklık örnekleri, yalnızca 154 kV).',
  },
];
