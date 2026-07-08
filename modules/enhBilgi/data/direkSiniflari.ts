// enhBilgi modülü — Direk Sınıfları bilgi bankası verisi.
//
// İçerik, docs/ENH_DIREK_SECIMI_ANALIZ.md (bölüm 1 ve 5) ile TUTARLI
// tutulmuştur. O belgede belirtildiği gibi bu sınıflandırma genel ENH
// (havai hat) mühendisliği pratiğine dayanır; Enerji Nakil Hatları
// Cilt 1'deki tam adlandırma ve kesin eşik değerleri henüz doğrulanmadı
// (bkz. docs/ENH_DIREK_SECIMI_ANALIZ.md "Kaynak erişimi hakkında önemli
// not"). Bu modül bir hesap motoru DEĞİLDİR; yalnızca anlatım metni içerir.
import type { DirekSinifBilgi } from '../types';

const ILGILI_HESAPLAR = [
  { baslik: 'Beton Direk Seçimi', rota: '/hesaplayicilar/beton-direk' },
  { baslik: 'ENH Mekanik Hesapları', rota: '/hesaplayicilar/enh-mekanik' },
] as const;

export const DIREK_SINIFLARI: readonly DirekSinifBilgi[] = [
  {
    id: 'tasiyici',
    ad: 'Taşıyıcı Direk',
    tanim:
      'Düz hat kesiminde iletkeni asılı (süspansiyon) olarak taşır; iki komşu açıklık arasındaki gerilim farkı normalde küçüktür.',
    kullanimYeri: 'Düz hat, sapma açısı olmayan bölümler.',
    gosterim: 'T',
    dikkatNotu: 'Ağırlıklı olarak düşey yük taşır; yatay yük görece küçüktür.',
    onemliKuvvetler: ['Düşey yük (iletken + donanım ağırlığı, buz eklenmiş)', 'Rüzgar kuvveti'],
    ilgiliHesaplar: ILGILI_HESAPLAR,
  },
  {
    id: 'kose-tasiyici',
    ad: 'Köşe Taşıyıcı Direk',
    tanim:
      'Hat küçük bir sapma açısı yaptığında, hâlâ taşıyıcı (asma) tipte kalarak bu açıdan doğan bileşke yatay kuvveti de karşılar.',
    kullanimYeri: 'Küçük açılı hat sapmaları (eşik değeri: netleştirilecek).',
    gosterim: 'KT',
    dikkatNotu: 'Düşey yüke ek olarak sapma açısından doğan yatay bileşke kuvvet dikkate alınmalıdır.',
    onemliKuvvetler: ['Düşey yük', 'Rüzgar kuvveti', 'Sapma açısından doğan yatay bileşke kuvvet'],
    ilgiliHesaplar: ILGILI_HESAPLAR,
  },
  {
    id: 'durdurucu',
    ad: 'Durdurucu Direk',
    tanim:
      'Hat gerilimini (mekanik çekme kuvvetini) tam olarak keser/durdurur; germe (strain) izolatörleriyle bağlanır.',
    kullanimYeri: 'Uzun düz hat kesimlerinde belirli aralıklarla, gerilimin bölümlere ayrılması gereken noktalar.',
    gosterim: 'D',
    dikkatNotu: 'İki taraflı tam çekme kuvveti (dengeli) veya bakım/arıza senaryosunda tek taraflı tam çekme oluşabilir.',
    onemliKuvvetler: ['İletken çekme kuvveti (çift/tek taraflı)', 'Rüzgar kuvveti'],
    ilgiliHesaplar: ILGILI_HESAPLAR,
  },
  {
    id: 'kose-durdurucu',
    ad: 'Köşe Durdurucu Direk',
    tanim:
      'Aynı anda hem sapma açısı hem de gerilim kesme görevi taşır — en ağır yüklenen direk sınıflarından biridir.',
    kullanimYeri: 'Gerilimin kesilmesi gereken bir noktada, hattın aynı zamanda açı yaptığı yerler.',
    gosterim: 'KD',
    dikkatNotu: 'Açıdan doğan bileşke kuvvet ile tam çekme kuvvetinin birleşimi en kritik yük senaryolarından biridir.',
    onemliKuvvetler: ['Sapma açısı bileşkesi', 'Tam çekme kuvveti', 'Rüzgar kuvveti'],
    ilgiliHesaplar: ILGILI_HESAPLAR,
  },
  {
    id: 'nihayet',
    ad: 'Nihayet Direği',
    tanim: 'Hattın başlangıç/bitiş noktasında bulunur; yalnızca tek taraftan iletken çekme kuvveti alır (asimetrik).',
    kullanimYeri: 'Hattın en başı ve en sonu (trafo merkezi/dağıtım noktası bağlantısı).',
    gosterim: 'N',
    dikkatNotu: 'Tam tek taraflı çekme kuvveti genellikle en kritik yük durumudur; zorunlu bir direk sınıfıdır.',
    onemliKuvvetler: ['Tam tek taraflı iletken çekme kuvveti', 'Rüzgar kuvveti'],
    ilgiliHesaplar: ILGILI_HESAPLAR,
  },
  {
    id: 'bransman',
    ad: 'Branşman Direği',
    tanim:
      'Ana hattan bir kolun (branşmanın) ayrıldığı noktadadır; ana hat + branşman yönlerinden gelen asimetrik kuvvetleri taşır.',
    kullanimYeri: 'Ana hattan yeni bir kol/branşman hattının ayrıldığı noktalar.',
    gosterim: 'B',
    dikkatNotu: 'Çok yönlü/asimetrik bileşke kuvvet; branşman açısına ve iletken tipine bağlı olarak değişir.',
    onemliKuvvetler: ['Çok yönlü/asimetrik bileşke kuvvet', 'Rüzgar kuvveti'],
    ilgiliHesaplar: ILGILI_HESAPLAR,
  },
];
