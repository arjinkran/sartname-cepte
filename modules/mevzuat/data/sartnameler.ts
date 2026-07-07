// ─────────────────────────────────────────────────────────────
// ŞARTNAME / MEVZUAT VERİ TABANI (yerel mock veri)
//
// ⚠️ ÖRNEK İÇERİK UYARISI:
// Buradaki özet, madde ve tarihler uygulama geliştirme için hazırlanmış
// TASLAK örneklerdir. Yayın öncesi her kartın içeriği, doküman numarası,
// tarihleri ve kaynak bağlantısı resmî kaynaktan (TEDAŞ şartname listesi,
// mevzuat.gov.tr, EPDK) birebir doğrulanacaktır.
// ─────────────────────────────────────────────────────────────

import type { Document, DocumentStatus, Institution, Kategori } from '../types';

export const KATEGORILER: readonly Kategori[] = [
  { id: 'ag-sebeke', ad: 'AG Şebeke ve Kablolar', ikon: '🔌', aciklama: 'AG kablolar, ekler, panolar, bağlantılar' },
  { id: 'og-trafo', ad: 'OG / Trafo ve Hücreler', ikon: '⚡', aciklama: 'Dağıtım trafoları, modüler hücreler, ayırıcılar' },
  { id: 'topraklama', ad: 'Topraklama', ikon: '🌍', aciklama: 'Topraklama tesisleri, ölçüm, koruma' },
  { id: 'sayac-olcu', ad: 'Sayaç ve Ölçü', ikon: '📊', aciklama: 'Sayaçlar, ölçü trafoları, bağlantı' },
  { id: 'hizmet-kalitesi', ad: 'Hizmet Kalitesi (EPDK)', ikon: '📈', aciklama: 'Kesinti süreleri, tazminatlar, kalite göstergeleri' },
  { id: 'isg-mevzuat', ad: 'İSG ve Emniyet Mevzuatı', ikon: '🦺', aciklama: 'Kuvvetli akım, yaklaşma mesafeleri, iş güvenliği' },
];

export const KURUMLAR: readonly Institution[] = ['TEDAŞ', 'EPDK', 'Resmî Gazete'];

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  active: 'Güncel',
  deprecated: 'Mülga',
  draft: 'Taslak',
};

export const DOCUMENTS: readonly Document[] = [
  {
    id: 'ag-xlpe-kablo',
    title: 'AG Güç Kabloları (XLPE/PVC İzoleli) Teknik Şartnamesi',
    institution: 'TEDAŞ',
    category: 'AG Şebeke ve Kablolar',
    summary:
      'Alçak gerilim dağıtım şebekelerinde kullanılan 0,6/1 kV XLPE veya PVC izoleli güç kablolarının yapım, deney ve kabul koşullarını tanımlar. Kablo seçimi, damar renkleri ve işaretleme kuralları sahada en sık başvurulan bölümlerdir.',
    keywords: ['ag kablo', 'xlpe', 'pvc', 'yvv', 'nyy', '0,6/1 kv', 'güç kablosu', 'damar', 'kesit'],
    status: 'active',
    revision: 'TEDAŞ AG Güç Kabloları Şartnamesi (no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['ag-kablo-ek', 'ic-tesisler'],
    pdfUrl: 'https://www.tedas.gov.tr',
    tags: ['AG', 'Kablo', 'Teknik Şartname'],
  },
  {
    id: 'ag-kablo-ek',
    title: 'AG Kablo Ek ve Başlık (Ek Muflari) Malzemeleri',
    institution: 'TEDAŞ',
    category: 'AG Şebeke ve Kablolar',
    summary:
      'AG kablolarında ek (mufl) ve başlık yapımında kullanılan malzemelerin ve uygulama yönteminin gereklerini tanımlar. Isı büzüşmeli ve döküm reçineli ek tipleri, iletken birleştirme ve yalıtım koşulları bu kapsamdadır.',
    keywords: ['kablo eki', 'mufl', 'ek mufu', 'başlık', 'ısı büzüşmeli', 'reçineli ek', 'pres', 'kovan'],
    status: 'active',
    revision: 'TEDAŞ AG Kablo Aksesuarları Şartnamesi (no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['ag-xlpe-kablo'],
    pdfUrl: 'https://www.tedas.gov.tr',
    tags: ['AG', 'Kablo', 'Ek', 'Mufl'],
  },
  {
    id: 'ag-pano-kofra',
    title: 'AG Dağıtım Panoları ve Kofralar',
    institution: 'TEDAŞ',
    category: 'AG Şebeke ve Kablolar',
    summary:
      'Direk tipi ve yer tipi AG dağıtım panoları ile sayaç kofralarının yapım, koruma sınıfı (IP) ve donanım gereklerini tanımlar. Bara düzeni, sigorta grupları ve etiketleme sahada kontrol edilen başlıca unsurlardır.',
    keywords: ['pano', 'kofra', 'sayaç kofrası', 'ip44', 'nh sigorta', 'bara', 'direk tipi pano'],
    status: 'active',
    revision: 'TEDAŞ AG Pano/Kofra Şartnamesi (no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['ag-xlpe-kablo', 'topraklama-yonetmelik'],
    pdfUrl: 'https://www.tedas.gov.tr',
    tags: ['AG', 'Pano', 'Kofra'],
  },
  {
    id: 'og-dagitim-trafo',
    title: 'OG/AG Dağıtım Transformatörleri Teknik Şartnamesi',
    institution: 'TEDAŞ',
    category: 'OG / Trafo ve Hücreler',
    summary:
      'Dağıtım şebekelerinde kullanılan yağlı tip OG/AG transformatörlerinin (tipik 33/0,4 kV) anma değerleri, kayıp sınıfları, kademe değiştirici ve koruma donanımı gereklerini tanımlar.',
    keywords: ['trafo', 'transformatör', 'dyn11', 'kademe', 'buchholz', 'yağlı tip', '33 kv', 'og trafo'],
    status: 'active',
    revision: 'TEDAŞ Dağıtım Trafoları Şartnamesi (no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['og-moduler-hucre', 'olcu-trafolari'],
    pdfUrl: 'https://www.tedas.gov.tr',
    tags: ['OG', 'Trafo', 'Teknik Şartname'],
  },
  {
    id: 'og-moduler-hucre',
    title: 'OG Modüler Hücreler (Metal Mahfazalı) Şartnamesi',
    institution: 'TEDAŞ',
    category: 'OG / Trafo ve Hücreler',
    summary:
      'Trafo merkezlerinde kullanılan metal mahfazalı modüler OG hücrelerinin (giriş-çıkış, trafo koruma, ölçü) yapı, kilitleme (interlock) ve deney gereklerini tanımlar.',
    keywords: ['hücre', 'modüler hücre', 'interlock', 'kilitleme', 'topraklama ayırıcısı', 'sf6', 'ring', 'tmş'],
    status: 'active',
    revision: 'TEDAŞ OG Modüler Hücre Şartnamesi (no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['og-dagitim-trafo'],
    pdfUrl: 'https://www.tedas.gov.tr',
    tags: ['OG', 'Hücre', 'Teknik Şartname'],
  },
  {
    id: 'topraklama-yonetmelik',
    title: 'Elektrik Tesislerinde Topraklamalar Yönetmeliği',
    institution: 'Resmî Gazete',
    category: 'Topraklama',
    summary:
      'AG ve YG tesislerinde topraklama tesislerinin boyutlandırılması, yapımı ve ölçme-muayene esaslarını belirler. Dokunma-adım gerilimi sınırları ve periyodik ölçüm gereklilikleri saha denetimlerinin temelidir.',
    keywords: ['topraklama', 'toprak direnci', 'dokunma gerilimi', 'adım gerilimi', 'meger', 'ölçüm', 'periyodik'],
    status: 'active',
    revision: 'RG 21.08.2001 / 24500',
    publishDate: '21.08.2001',
    effectiveDate: '21.08.2001',
    relatedDocuments: ['kuvvetli-akim', 'ic-tesisler'],
    pdfUrl: 'https://www.mevzuat.gov.tr',
    tags: ['Topraklama', 'Yönetmelik', 'Emniyet'],
  },
  {
    id: 'kuvvetli-akim',
    title: 'Elektrik Kuvvetli Akım Tesisleri Yönetmeliği',
    institution: 'Resmî Gazete',
    category: 'İSG ve Emniyet Mevzuatı',
    summary:
      'Kuvvetli akım tesislerinin kurulması ve işletilmesine ilişkin emniyet kurallarını belirler. Gerilim altındaki bölümlere YAKLAŞMA MESAFELERİ ve çalışma koşulları saha ekibi için en kritik bölümdür.',
    keywords: ['yaklaşma mesafesi', 'kuvvetli akım', 'emniyet', 'beş altın kural', 'gerilim yokluğu', 'enerjili çalışma'],
    status: 'active',
    revision: 'RG 30.11.2000 / 24246',
    publishDate: '30.11.2000',
    effectiveDate: '30.11.2000',
    relatedDocuments: ['topraklama-yonetmelik'],
    pdfUrl: 'https://www.mevzuat.gov.tr',
    tags: ['İSG', 'Emniyet', 'Yönetmelik'],
  },
  {
    id: 'ic-tesisler',
    title: 'Elektrik İç Tesisleri Yönetmeliği',
    institution: 'Resmî Gazete',
    category: 'AG Şebeke ve Kablolar',
    summary:
      'Yapı içi elektrik tesislerinin projelendirme ve yapım kurallarını belirler. Gerilim düşümü sınırları, iletken kesit seçimi ve koruma düzenleri uygulamadaki temel referanstır.',
    keywords: ['iç tesis', 'gerilim düşümü', 'kesit', 'kaçak akım', '30 ma', 'tn-s', 'koruma iletkeni'],
    status: 'active',
    revision: 'RG 04.11.1984 / 18565',
    publishDate: '04.11.1984',
    effectiveDate: '04.11.1984',
    relatedDocuments: ['topraklama-yonetmelik', 'ag-xlpe-kablo'],
    pdfUrl: 'https://www.mevzuat.gov.tr',
    tags: ['İç Tesis', 'Yönetmelik', 'Gerilim Düşümü'],
  },
  {
    id: 'epdk-hizmet-kalitesi',
    title: 'Elektrik Dağıtımı Hizmet Kalitesi Yönetmeliği',
    institution: 'EPDK',
    category: 'Hizmet Kalitesi (EPDK)',
    summary:
      'Dağıtım şirketlerinin sağlamakla yükümlü olduğu tedarik sürekliliği, ticari ve teknik kaliteyi düzenler. Kesinti sayısı/süresi göstergeleri (OKSÜRE-OKSAYI benzeri) ve tazminat koşulları bu yönetmeliğin konusudur.',
    keywords: ['kesinti', 'hizmet kalitesi', 'tazminat', 'oksure', 'oksayi', 'saidi', 'saifi', 'tedarik sürekliliği', 'epdk'],
    status: 'active',
    revision: 'EPDK Hizmet Kalitesi Yönetmeliği (RG no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['epdk-tuketici'],
    pdfUrl: 'https://www.epdk.gov.tr',
    tags: ['EPDK', 'Hizmet Kalitesi', 'Yönetmelik'],
  },
  {
    id: 'epdk-tuketici',
    title: 'Elektrik Piyasası Tüketici Hizmetleri Yönetmeliği',
    institution: 'EPDK',
    category: 'Hizmet Kalitesi (EPDK)',
    summary:
      'Bağlantı başvurusu, sözleşmeler, sayaç okuma-fatura, kesme-bağlama ve kaçak/usulsüz elektrik işlemlerine ilişkin usul ve esasları düzenler. Saha ekiplerinin kesme-bağlama işlemlerinin hukuki dayanağıdır.',
    keywords: ['tüketici', 'kesme bağlama', 'kaçak', 'usulsüz', 'tutanak', 'bağlantı', 'abonelik', 'fatura'],
    status: 'active',
    revision: 'EPDK Tüketici Hizmetleri Yönetmeliği (RG no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['epdk-hizmet-kalitesi', 'epdk-musteri-mulga'],
    pdfUrl: 'https://www.epdk.gov.tr',
    tags: ['EPDK', 'Tüketici', 'Yönetmelik'],
  },
  {
    id: 'epdk-musteri-mulga',
    title: 'Elektrik Piyasası Müşteri Hizmetleri Yönetmeliği (MÜLGA)',
    institution: 'EPDK',
    category: 'Hizmet Kalitesi (EPDK)',
    summary:
      'Elektrik piyasasında müşteri hizmetlerini düzenleyen eski yönetmeliktir; yürürlükten kaldırılmıştır. Eski tarihli tutanak ve işlemlerin dayanağını ararken karşınıza çıkabilir — güncel işlemlerde Tüketici Hizmetleri Yönetmeliği esas alınır.',
    keywords: ['müşteri hizmetleri', 'mülga', 'eski yönetmelik', 'abonelik'],
    status: 'deprecated',
    revision: 'Mülga — yerine Tüketici Hizmetleri Yönetmeliği geçti (tarih doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['epdk-tuketici'],
    pdfUrl: 'https://www.epdk.gov.tr',
    tags: ['EPDK', 'Mülga', 'Yönetmelik'],
  },
  {
    id: 'elektronik-sayac',
    title: 'Elektronik Elektrik Sayaçları Teknik Şartnamesi',
    institution: 'TEDAŞ',
    category: 'Sayaç ve Ölçü',
    summary:
      'Aktif/reaktif elektronik sayaçların doğruluk sınıfı, ekran bilgileri, haberleşme (optik port/modem) ve damga gereklerini tanımlar. Sayaç sökme-takma işlemlerinde damga ve endeks kaydı kritik noktadır.',
    keywords: ['sayaç', 'elektronik sayaç', 'endeks', 'damga', 'mühür', 'demand', 'reaktif', 'çarpan', 'x5'],
    status: 'active',
    revision: 'TEDAŞ Elektronik Sayaç Şartnamesi (no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['olcu-trafolari'],
    pdfUrl: 'https://www.tedas.gov.tr',
    tags: ['Sayaç', 'Ölçüm', 'Teknik Şartname'],
  },
  {
    id: 'olcu-trafolari',
    title: 'Ölçü Transformatörleri (Akım/Gerilim) Şartnamesi',
    institution: 'TEDAŞ',
    category: 'Sayaç ve Ölçü',
    summary:
      'Ölçme ve koruma amaçlı akım ve gerilim transformatörlerinin doğruluk sınıfı, anma yükü (burden) ve bağlantı gereklerini tanımlar. Sekonder devre emniyeti sahada hayati önemdedir.',
    keywords: ['akım trafosu', 'gerilim trafosu', 'ct', 'vt', 'burden', 'sekonder', 'ölçü trafosu'],
    status: 'active',
    revision: 'TEDAŞ Ölçü Trafoları Şartnamesi (no doğrulanacak)',
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: ['elektronik-sayac', 'og-dagitim-trafo'],
    pdfUrl: 'https://www.tedas.gov.tr',
    tags: ['Ölçü Trafosu', 'Akım', 'Gerilim'],
  },
  {
    id: 'genel-aydinlatma',
    title: 'Genel Aydınlatma Yönetmeliği',
    institution: 'Resmî Gazete',
    category: 'AG Şebeke ve Kablolar',
    summary:
      'Yol, cadde, park gibi kamusal alanların genel aydınlatmasının kurulum, işletme ve ödeme esaslarını düzenler. Armatür arızaları, direk tipleri ve aydınlatma ölçütleri dağıtım şirketinin sorumluluk alanındadır.',
    keywords: ['aydınlatma', 'genel aydınlatma', 'armatür', 'led', 'direk', 'sokak lambası'],
    status: 'active',
    revision: 'RG 27.07.2013 / 28720',
    publishDate: '27.07.2013',
    effectiveDate: '27.07.2013',
    relatedDocuments: ['ic-tesisler'],
    pdfUrl: 'https://www.mevzuat.gov.tr',
    tags: ['Aydınlatma', 'Yönetmelik', 'LED'],
  },
];

/** Kategoriye göre doküman sayısı (kategori ekranındaki rozetler için) */
export function kategoriDokumanSayisi(kategoriId: string): number {
  const kategori = KATEGORILER.find((k) => k.id === kategoriId);
  if (!kategori) return 0;
  return DOCUMENTS.filter((d) => d.category === kategori.ad).length;
}
