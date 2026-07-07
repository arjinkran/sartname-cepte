// ─────────────────────────────────────────────────────────────
// ŞARTNAME / MEVZUAT VERİ TABANI (yerel mock veri)
//
// ⚠️ ÖRNEK İÇERİK UYARISI:
// Buradaki özet, madde ve tarihler uygulama geliştirme için hazırlanmış
// TASLAK örneklerdir. Yayın öncesi her kartın içeriği, doküman numarası,
// tarihleri ve kaynak bağlantısı resmî kaynaktan (TEDAŞ şartname listesi,
// mevzuat.gov.tr, EPDK) birebir doğrulanacaktır. `ornek: true` işareti
// kalkmadan hiçbir kart "doğrulanmış" sayılmaz; arayüzde uyarı gösterilir.
// ─────────────────────────────────────────────────────────────

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

export const KATEGORILER: readonly Kategori[] = [
  { id: 'ag-sebeke', ad: 'AG Şebeke ve Kablolar', ikon: '🔌', aciklama: 'AG kablolar, ekler, panolar, bağlantılar' },
  { id: 'og-trafo', ad: 'OG / Trafo ve Hücreler', ikon: '⚡', aciklama: 'Dağıtım trafoları, modüler hücreler, ayırıcılar' },
  { id: 'topraklama', ad: 'Topraklama', ikon: '🌍', aciklama: 'Topraklama tesisleri, ölçüm, koruma' },
  { id: 'sayac-olcu', ad: 'Sayaç ve Ölçü', ikon: '📊', aciklama: 'Sayaçlar, ölçü trafoları, bağlantı' },
  { id: 'hizmet-kalitesi', ad: 'Hizmet Kalitesi (EPDK)', ikon: '📈', aciklama: 'Kesinti süreleri, tazminatlar, kalite göstergeleri' },
  { id: 'isg-mevzuat', ad: 'İSG ve Emniyet Mevzuatı', ikon: '🦺', aciklama: 'Kuvvetli akım, yaklaşma mesafeleri, iş güvenliği' },
];

export const KURUMLAR: readonly Kurum[] = ['TEDAŞ', 'EPDK', 'Resmî Gazete'];

export const DURUM_ETIKETLERI: Record<DokumanDurumu, string> = {
  guncel: 'Güncel',
  mulga: 'Mülga',
  taslak: 'Taslak',
};

export const DOKUMANLAR: readonly Dokuman[] = [
  {
    id: 'ag-xlpe-kablo',
    baslik: 'AG Güç Kabloları (XLPE/PVC İzoleli) Teknik Şartnamesi',
    kurum: 'TEDAŞ',
    dokumanTuru: 'Teknik Şartname',
    kaynakNo: 'TEDAŞ AG Güç Kabloları Şartnamesi (no doğrulanacak)',
    kategoriId: 'ag-sebeke',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Alçak gerilim dağıtım şebekelerinde kullanılan 0,6/1 kV XLPE veya PVC izoleli güç kablolarının yapım, deney ve kabul koşullarını tanımlar. Kablo seçimi, damar renkleri ve işaretleme kuralları sahada en sık başvurulan bölümlerdir.',
    onemliNoktalar: [
      'Anma gerilimi 0,6/1 kV; damar renk kodlaması ve faz sıralaması şartnameye uygun olmalıdır.',
      'Kablo dış kılıfında üretici, kesit, tip ve yıl işaretlemesi okunur olmalıdır.',
      'Sevkiyat ve serim sırasında izin verilen minimum bükülme yarıçapına uyulmalıdır.',
      'Kabul deneyleri: iletken direnci, izolasyon ve gerilim dayanım deneyleri.',
    ],
    ilgiliMaddeler: [
      { no: 'Kapsam', aciklama: '0,6/1 kV AG güç kablolarının tip ve kesit aralığı' },
      { no: 'Yapım Özellikleri', aciklama: 'İletken sınıfı, izolasyon ve dış kılıf gerekleri' },
      { no: 'Deneyler', aciklama: 'Rutin, tip ve kabul deneylerinin listesi' },
      { no: 'İşaretleme', aciklama: 'Kılıf üzeri işaretleme ve makara etiketi' },
    ],
    kaynakBaglanti: 'https://www.tedas.gov.tr',
    anahtarKelimeler: ['ag kablo', 'xlpe', 'pvc', 'yvv', 'nyy', '0,6/1 kv', 'güç kablosu', 'damar', 'kesit'],
    ornek: true,
  },
  {
    id: 'ag-kablo-ek',
    baslik: 'AG Kablo Ek ve Başlık (Ek Muflari) Malzemeleri',
    kurum: 'TEDAŞ',
    dokumanTuru: 'Teknik Şartname',
    kaynakNo: 'TEDAŞ AG Kablo Aksesuarları Şartnamesi (no doğrulanacak)',
    kategoriId: 'ag-sebeke',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'AG kablolarında ek (mufl) ve başlık yapımında kullanılan malzemelerin ve uygulama yönteminin gereklerini tanımlar. Isı büzüşmeli ve döküm reçineli ek tipleri, iletken birleştirme ve yalıtım koşulları bu kapsamdadır.',
    onemliNoktalar: [
      'Ek yapılan noktada iletken birleştirme, uygun pres hidroliği ve kovanla yapılmalıdır.',
      'Isı büzüşmeli eklerde alev ayarı ve büzüşme sırası üretici talimatına uygun olmalıdır.',
      'Ek bölgesi mekanik darbe ve nem girişine karşı korunmalı; gömülü eklerde işaret bandı kullanılmalıdır.',
      'Farklı kesitlerin eklenmesinde redüksiyon kovanı kullanılır.',
    ],
    ilgiliMaddeler: [
      { no: 'Malzeme Gerekleri', aciklama: 'Ek gövdesi, kovan ve yalıtım malzemeleri' },
      { no: 'Uygulama', aciklama: 'Ek yapım sırası ve işçilik koşulları' },
      { no: 'Deneyler', aciklama: 'Ek bölgesinin gerilim ve sızdırmazlık deneyleri' },
    ],
    kaynakBaglanti: 'https://www.tedas.gov.tr',
    anahtarKelimeler: ['kablo eki', 'mufl', 'ek mufu', 'başlık', 'ısı büzüşmeli', 'reçineli ek', 'pres', 'kovan'],
    ornek: true,
  },
  {
    id: 'ag-pano-kofra',
    baslik: 'AG Dağıtım Panoları ve Kofralar',
    kurum: 'TEDAŞ',
    dokumanTuru: 'Teknik Şartname',
    kaynakNo: 'TEDAŞ AG Pano/Kofra Şartnamesi (no doğrulanacak)',
    kategoriId: 'ag-sebeke',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Direk tipi ve yer tipi AG dağıtım panoları ile sayaç kofralarının yapım, koruma sınıfı (IP) ve donanım gereklerini tanımlar. Bara düzeni, sigorta grupları ve etiketleme sahada kontrol edilen başlıca unsurlardır.',
    onemliNoktalar: [
      'Dış tip panolarda koruma sınıfı en az IP44 olmalıdır (şartnamedeki değere göre doğrulanır).',
      'Pano gövdesi topraklanmalı, kapak ile gövde arasında süreklilik iletkeni bulunmalıdır.',
      'NH sigorta altlıkları ve bıçaklı sigortalarda anma akımı etiketle uyumlu olmalıdır.',
      'Kablo giriş-çıkışlarında rakor/körtapa kullanılmalı, kemirgen girişi önlenmelidir.',
    ],
    ilgiliMaddeler: [
      { no: 'Gövde ve Koruma', aciklama: 'Sac kalınlığı, boya, IP koruma sınıfı' },
      { no: 'Elektriksel Donanım', aciklama: 'Bara, sigorta altlığı, klemens gerekleri' },
      { no: 'Topraklama', aciklama: 'Gövde topraklaması ve süreklilik' },
    ],
    kaynakBaglanti: 'https://www.tedas.gov.tr',
    anahtarKelimeler: ['pano', 'kofra', 'sayaç kofrası', 'ip44', 'nh sigorta', 'bara', 'direk tipi pano'],
    ornek: true,
  },
  {
    id: 'og-dagitim-trafo',
    baslik: 'OG/AG Dağıtım Transformatörleri Teknik Şartnamesi',
    kurum: 'TEDAŞ',
    dokumanTuru: 'Teknik Şartname',
    kaynakNo: 'TEDAŞ Dağıtım Trafoları Şartnamesi (no doğrulanacak)',
    kategoriId: 'og-trafo',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Dağıtım şebekelerinde kullanılan yağlı tip OG/AG transformatörlerinin (tipik 33/0,4 kV) anma değerleri, kayıp sınıfları, kademe değiştirici ve koruma donanımı gereklerini tanımlar.',
    onemliNoktalar: [
      'Bağlantı grubu dağıtım trafolarında tipik olarak Dyn11 olur (etiketten doğrulayın).',
      'Kademe değiştirici yalnızca trafo ENERJİSİZKEN kullanılır (gerilim altında kademe değiştirilmez).',
      'Yağ seviyesi, silikajel rengi ve sızıntı kontrolü periyodik bakım maddesidir.',
      'Buchholz rölesi ve termometre kontakları koruma devresine bağlı olmalıdır.',
    ],
    ilgiliMaddeler: [
      { no: 'Anma Değerleri', aciklama: 'Güç kademeleri, gerilim oranı, bağlantı grubu' },
      { no: 'Kayıplar', aciklama: 'Boşta ve yükte kayıp sınırları (verim sınıfı)' },
      { no: 'Donanım', aciklama: 'Kademe değiştirici, Buchholz, termometre, tekerlek' },
      { no: 'Deneyler', aciklama: 'Rutin ve tip deneyleri' },
    ],
    kaynakBaglanti: 'https://www.tedas.gov.tr',
    anahtarKelimeler: ['trafo', 'transformatör', 'dyn11', 'kademe', 'buchholz', 'yağlı tip', '33 kv', 'og trafo'],
    ornek: true,
  },
  {
    id: 'og-moduler-hucre',
    baslik: 'OG Modüler Hücreler (Metal Mahfazalı) Şartnamesi',
    kurum: 'TEDAŞ',
    dokumanTuru: 'Teknik Şartname',
    kaynakNo: 'TEDAŞ OG Modüler Hücre Şartnamesi (no doğrulanacak)',
    kategoriId: 'og-trafo',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Trafo merkezlerinde kullanılan metal mahfazalı modüler OG hücrelerinin (giriş-çıkış, trafo koruma, ölçü) yapı, kilitleme (interlock) ve deney gereklerini tanımlar.',
    onemliNoktalar: [
      'Hücre kilitleme sistemi (interlock) yanlış manevrayı mekanik olarak engellemelidir.',
      'Topraklama ayırıcısı kapatılmadan kablo bölmesi kapağı açılamamalıdır.',
      'Gerilim varlığı göstergeleri (kapasitif bölücü) çalışır durumda olmalıdır.',
      'SF6 gazlı hücrelerde gaz basınç göstergesi periyodik kontrol edilir.',
    ],
    ilgiliMaddeler: [
      { no: 'Hücre Tipleri', aciklama: 'Giriş-çıkış, trafo koruma, ölçü hücreleri' },
      { no: 'Kilitleme', aciklama: 'Mekanik interlock zinciri ve manevra sırası' },
      { no: 'Göstergeler', aciklama: 'Gerilim varlığı ve konum göstergeleri' },
    ],
    kaynakBaglanti: 'https://www.tedas.gov.tr',
    anahtarKelimeler: ['hücre', 'modüler hücre', 'interlock', 'kilitleme', 'topraklama ayırıcısı', 'sf6', 'ring', 'tmş'],
    ornek: true,
  },
  {
    id: 'topraklama-yonetmelik',
    baslik: 'Elektrik Tesislerinde Topraklamalar Yönetmeliği',
    kurum: 'Resmî Gazete',
    dokumanTuru: 'Yönetmelik',
    kaynakNo: 'RG 21.08.2001 / 24500',
    kategoriId: 'topraklama',
    yayinTarihi: '21.08.2001',
    yururlukTarihi: '21.08.2001',
    durum: 'guncel',
    ozet:
      'AG ve YG tesislerinde topraklama tesislerinin boyutlandırılması, yapımı ve ölçme-muayene esaslarını belirler. Dokunma-adım gerilimi sınırları ve periyodik ölçüm gereklilikleri saha denetimlerinin temelidir.',
    onemliNoktalar: [
      'Topraklama direnci hedefi tesis tipine ve koruma düzenine göre belirlenir; "her yerde 5 ohm" doğru değildir — hesapla doğrulanır.',
      'Periyodik ölçüm: dağıtım şebekesi elemanları için düzenli topraklama ölçümü ve kayıt gerekir.',
      'İşletme topraklaması ile koruma topraklaması ayrımına dikkat edilmelidir.',
      'Ölçümler kalibre edilmiş toprak megeri ile ve uygun sonda düzeniyle yapılır.',
    ],
    ilgiliMaddeler: [
      { no: 'Madde 5-6', aciklama: 'Topraklama çeşitleri ve tanımlar (koruma/işletme)' },
      { no: 'Madde 7-8', aciklama: 'Boyutlandırma: dokunma ve adım gerilimi koşulları' },
      { no: 'Ek-P', aciklama: 'Periyodik ölçüm/denetim aralıkları (tesis tipine göre)' },
    ],
    kaynakBaglanti: 'https://www.mevzuat.gov.tr',
    anahtarKelimeler: ['topraklama', 'toprak direnci', 'dokunma gerilimi', 'adım gerilimi', 'meger', 'ölçüm', 'periyodik'],
    ornek: true,
  },
  {
    id: 'kuvvetli-akim',
    baslik: 'Elektrik Kuvvetli Akım Tesisleri Yönetmeliği',
    kurum: 'Resmî Gazete',
    dokumanTuru: 'Yönetmelik',
    kaynakNo: 'RG 30.11.2000 / 24246',
    kategoriId: 'isg-mevzuat',
    yayinTarihi: '30.11.2000',
    yururlukTarihi: '30.11.2000',
    durum: 'guncel',
    ozet:
      'Kuvvetli akım tesislerinin kurulması ve işletilmesine ilişkin emniyet kurallarını belirler. Gerilim altındaki bölümlere YAKLAŞMA MESAFELERİ ve çalışma koşulları saha ekibi için en kritik bölümdür.',
    onemliNoktalar: [
      'Gerilim seviyesine göre asgari yaklaşma mesafeleri tanımlıdır — çalışma öncesi yönetmelik tablosundan doğrulayın.',
      'Gerilim yokluğu tespit edilmeden ve topraklama yapılmadan tesise dokunulamaz (beş altın kural).',
      'Yetkisiz kişilerin kuvvetli akım tesislerine girmesi engellenmelidir.',
      'Enerjili çalışma ancak özel yetkilendirme ve uygun donanımla yapılabilir.',
    ],
    ilgiliMaddeler: [
      { no: 'Madde 46', aciklama: 'Gerilim altındaki tesis bölümlerine yaklaşma mesafeleri' },
      { no: 'Madde 60', aciklama: 'Tesiste çalışma koşulları ve emniyet önlemleri' },
      { no: 'Ek Tablolar', aciklama: 'Gerilim kademesine göre mesafe tabloları' },
    ],
    kaynakBaglanti: 'https://www.mevzuat.gov.tr',
    anahtarKelimeler: ['yaklaşma mesafesi', 'kuvvetli akım', 'emniyet', 'beş altın kural', 'gerilim yokluğu', 'enerjili çalışma'],
    ornek: true,
  },
  {
    id: 'ic-tesisler',
    baslik: 'Elektrik İç Tesisleri Yönetmeliği',
    kurum: 'Resmî Gazete',
    dokumanTuru: 'Yönetmelik',
    kaynakNo: 'RG 04.11.1984 / 18565',
    kategoriId: 'ag-sebeke',
    yayinTarihi: '04.11.1984',
    yururlukTarihi: '04.11.1984',
    durum: 'guncel',
    ozet:
      'Yapı içi elektrik tesislerinin projelendirme ve yapım kurallarını belirler. Gerilim düşümü sınırları, iletken kesit seçimi ve koruma düzenleri uygulamadaki temel referanstır.',
    onemliNoktalar: [
      'Gerilim düşümü pratiği: aydınlatmada %1,5, motor/priz devrelerinde %3 sınır değer olarak uygulanır (uygulamadaki hesap pratiği).',
      'Kaçak akım koruma düzenleri (30 mA insan koruması) ilgili devrelerde zorunludur.',
      'Nötr ve koruma iletkeni ayrımı (TN-S/TN-C) tesise göre doğru uygulanmalıdır.',
      'İletken kesitleri hem akım taşıma hem gerilim düşümü koşulunu birlikte sağlamalıdır.',
    ],
    ilgiliMaddeler: [
      { no: 'Madde 52-56', aciklama: 'İletken seçimi, kesitler ve gerilim düşümü' },
      { no: 'Madde 18', aciklama: 'Koruma düzenleri ve kaçak akım koruması' },
      { no: 'Tablolar', aciklama: 'Kesit ve sigorta koordinasyon tabloları' },
    ],
    kaynakBaglanti: 'https://www.mevzuat.gov.tr',
    anahtarKelimeler: ['iç tesis', 'gerilim düşümü', 'kesit', 'kaçak akım', '30 ma', 'tn-s', 'koruma iletkeni'],
    ornek: true,
  },
  {
    id: 'epdk-hizmet-kalitesi',
    baslik: 'Elektrik Dağıtımı Hizmet Kalitesi Yönetmeliği',
    kurum: 'EPDK',
    dokumanTuru: 'Yönetmelik',
    kaynakNo: 'EPDK Hizmet Kalitesi Yönetmeliği (RG no doğrulanacak)',
    kategoriId: 'hizmet-kalitesi',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Dağıtım şirketlerinin sağlamakla yükümlü olduğu tedarik sürekliliği, ticari ve teknik kaliteyi düzenler. Kesinti sayısı/süresi göstergeleri (OKSÜRE-OKSAYI benzeri) ve tazminat koşulları bu yönetmeliğin konusudur.',
    onemliNoktalar: [
      'Bildirimli kesintiler tüketiciye önceden duyurulmalıdır (kanal ve süre şartları yönetmelikte).',
      'Uzun süreli/sık kesintilerde tüketicinin tazminat hakkı doğabilir; eşik değerler bölge ve yıl bazlıdır.',
      'Kesinti kayıtlarının doğru sınıflandırılması (mücbir sebep, güvenlik, planlı) şirket yükümlülüğüdür.',
      'Gerilim kalitesi şikâyetlerinde ölçüm ve süre şartları tanımlıdır.',
    ],
    ilgiliMaddeler: [
      { no: 'Tedarik Sürekliliği', aciklama: 'Kesinti göstergeleri ve eşik değerler' },
      { no: 'Ticari Kalite', aciklama: 'Başvuru/işlem süreleri ve tazminatlar' },
      { no: 'Teknik Kalite', aciklama: 'Gerilim kalitesi ölçüm esasları' },
    ],
    kaynakBaglanti: 'https://www.epdk.gov.tr',
    anahtarKelimeler: ['kesinti', 'hizmet kalitesi', 'tazminat', 'oksure', 'oksayi', 'saidi', 'saifi', 'tedarik sürekliliği', 'epdk'],
    ornek: true,
  },
  {
    id: 'epdk-tuketici',
    baslik: 'Elektrik Piyasası Tüketici Hizmetleri Yönetmeliği',
    kurum: 'EPDK',
    dokumanTuru: 'Yönetmelik',
    kaynakNo: 'EPDK Tüketici Hizmetleri Yönetmeliği (RG no doğrulanacak)',
    kategoriId: 'hizmet-kalitesi',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Bağlantı başvurusu, sözleşmeler, sayaç okuma-fatura, kesme-bağlama ve kaçak/usulsüz elektrik işlemlerine ilişkin usul ve esasları düzenler. Saha ekiplerinin kesme-bağlama işlemlerinin hukuki dayanağıdır.',
    onemliNoktalar: [
      'Kesme ve yeniden bağlama işlemlerinde bildirim ve süre şartlarına uyulur.',
      'Kaçak elektrik tespitinde tutanak düzeni ve fotoğraf/delil kaydı esastır.',
      'Sayaç değişiminde eski-yeni sayaç endeksleri tutanakla kayıt altına alınır.',
      'Bağlantı görüşü ve enerji müsaadesi süreçleri başvuru sırasına ve sürelere tabidir.',
    ],
    ilgiliMaddeler: [
      { no: 'Bağlantı', aciklama: 'Başvuru, bağlantı görüşü ve süreler' },
      { no: 'Kesme-Bağlama', aciklama: 'Bildirim, süre ve yeniden bağlama koşulları' },
      { no: 'Kaçak/Usulsüz', aciklama: 'Tespit, tutanak ve tahakkuk esasları' },
    ],
    kaynakBaglanti: 'https://www.epdk.gov.tr',
    anahtarKelimeler: ['tüketici', 'kesme bağlama', 'kaçak', 'usulsüz', 'tutanak', 'bağlantı', 'abonelik', 'fatura'],
    ornek: true,
  },
  {
    id: 'epdk-musteri-mulga',
    baslik: 'Elektrik Piyasası Müşteri Hizmetleri Yönetmeliği (MÜLGA)',
    kurum: 'EPDK',
    dokumanTuru: 'Yönetmelik',
    kaynakNo: 'Mülga — yerine Tüketici Hizmetleri Yönetmeliği geçti (tarih doğrulanacak)',
    kategoriId: 'hizmet-kalitesi',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'mulga',
    ozet:
      'Elektrik piyasasında müşteri hizmetlerini düzenleyen eski yönetmeliktir; yürürlükten kaldırılmıştır. Eski tarihli tutanak ve işlemlerin dayanağını ararken karşınıza çıkabilir — güncel işlemlerde Tüketici Hizmetleri Yönetmeliği esas alınır.',
    onemliNoktalar: [
      'Bu yönetmelik MÜLGADIR; güncel işlemlerde kullanılmaz.',
      'Eski tarihli işlem/tutanak incelemelerinde tarihsel referans olarak gerekebilir.',
      'Güncel karşılığı: Elektrik Piyasası Tüketici Hizmetleri Yönetmeliği.',
    ],
    ilgiliMaddeler: [
      { no: 'Tümü', aciklama: 'Tarihsel referans — güncel işlemlerde kullanılmaz' },
    ],
    kaynakBaglanti: 'https://www.epdk.gov.tr',
    anahtarKelimeler: ['müşteri hizmetleri', 'mülga', 'eski yönetmelik', 'abonelik'],
    ornek: true,
  },
  {
    id: 'elektronik-sayac',
    baslik: 'Elektronik Elektrik Sayaçları Teknik Şartnamesi',
    kurum: 'TEDAŞ',
    dokumanTuru: 'Teknik Şartname',
    kaynakNo: 'TEDAŞ Elektronik Sayaç Şartnamesi (no doğrulanacak)',
    kategoriId: 'sayac-olcu',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Aktif/reaktif elektronik sayaçların doğruluk sınıfı, ekran bilgileri, haberleşme (optik port/modem) ve damga gereklerini tanımlar. Sayaç sökme-takma işlemlerinde damga ve endeks kaydı kritik noktadır.',
    onemliNoktalar: [
      'Sayaç doğruluk sınıfı kullanım yerine göre belirlenir (aktif için tipik sınıf 1-2).',
      'Damga (mühür) bütünlüğü bozulmuş sayaç tutanakla kayıt altına alınır.',
      'Kombine sayaçlarda demanda ve reaktif endekslerin okunması faturalandırma için gereklidir.',
      'Akım trafolu ölçümde çarpan (CT oranı) sayaç kaydıyla uyumlu olmalıdır.',
    ],
    ilgiliMaddeler: [
      { no: 'Doğruluk', aciklama: 'Sınıf gerekleri ve deney koşulları' },
      { no: 'Ekran/Endeks', aciklama: 'Gösterge sırası ve okunacak değerler' },
      { no: 'Haberleşme', aciklama: 'Optik port ve uzaktan okuma gerekleri' },
      { no: 'Damga', aciklama: 'Mühürleme noktaları ve bütünlük' },
    ],
    kaynakBaglanti: 'https://www.tedas.gov.tr',
    anahtarKelimeler: ['sayaç', 'elektronik sayaç', 'endeks', 'damga', 'mühür', 'demand', 'reaktif', 'çarpan', 'x5'],
    ornek: true,
  },
  {
    id: 'olcu-trafolari',
    baslik: 'Ölçü Transformatörleri (Akım/Gerilim) Şartnamesi',
    kurum: 'TEDAŞ',
    dokumanTuru: 'Teknik Şartname',
    kaynakNo: 'TEDAŞ Ölçü Trafoları Şartnamesi (no doğrulanacak)',
    kategoriId: 'sayac-olcu',
    yayinTarihi: 'Doğrulanacak',
    yururlukTarihi: 'Doğrulanacak',
    durum: 'guncel',
    ozet:
      'Ölçme ve koruma amaçlı akım ve gerilim transformatörlerinin doğruluk sınıfı, anma yükü (burden) ve bağlantı gereklerini tanımlar. Sekonder devre emniyeti sahada hayati önemdedir.',
    onemliNoktalar: [
      'AKIM TRAFOSUNUN SEKONDERİ YÜK ALTINDA ASLA AÇIK BIRAKILMAZ — ölümcül gerilim oluşur.',
      'Gerilim trafosu sekonderi kısa devre edilmez; akım trafosu sekonderi açık bırakılmaz.',
      'Ölçü devresinde doğruluk sınıfı ve burden değeri sayaç/röle yüküyle uyumlu olmalıdır.',
      'Sekonder devre tek noktadan topraklanır.',
    ],
    ilgiliMaddeler: [
      { no: 'Anma Değerleri', aciklama: 'Oranlar, doğruluk sınıfı, burden' },
      { no: 'Bağlantı', aciklama: 'Sekonder devre, topraklama, klemens' },
      { no: 'Emniyet', aciklama: 'Açık sekonder/kısa devre yasakları' },
    ],
    kaynakBaglanti: 'https://www.tedas.gov.tr',
    anahtarKelimeler: ['akım trafosu', 'gerilim trafosu', 'ct', 'vt', 'burden', 'sekonder', 'ölçü trafosu'],
    ornek: true,
  },
  {
    id: 'genel-aydinlatma',
    baslik: 'Genel Aydınlatma Yönetmeliği',
    kurum: 'Resmî Gazete',
    dokumanTuru: 'Yönetmelik',
    kaynakNo: 'RG 27.07.2013 / 28720',
    kategoriId: 'ag-sebeke',
    yayinTarihi: '27.07.2013',
    yururlukTarihi: '27.07.2013',
    durum: 'guncel',
    ozet:
      'Yol, cadde, park gibi kamusal alanların genel aydınlatmasının kurulum, işletme ve ödeme esaslarını düzenler. Armatür arızaları, direk tipleri ve aydınlatma ölçütleri dağıtım şirketinin sorumluluk alanındadır.',
    onemliNoktalar: [
      'Genel aydınlatma tüketiminin ödemesi kamu kaynağından yapılır; ölçüm ayrı sayaçla izlenir.',
      'Arızalı armatürlerin belirlenen sürede giderilmesi dağıtım şirketi yükümlülüğüdür.',
      'Yeni tesislerde enerji verimli (LED) armatür kullanımı esastır.',
      'Aydınlatma direklerinde kapak/klemens güvenliği ve topraklama kontrol edilmelidir.',
    ],
    ilgiliMaddeler: [
      { no: 'Kapsam', aciklama: 'Genel aydınlatma sayılan yerler' },
      { no: 'İşletme', aciklama: 'Arıza giderme süreleri ve bakım yükümlülüğü' },
      { no: 'Ödeme', aciklama: 'Tüketim bedellerinin karşılanması' },
    ],
    kaynakBaglanti: 'https://www.mevzuat.gov.tr',
    anahtarKelimeler: ['aydınlatma', 'genel aydınlatma', 'armatür', 'led', 'direk', 'sokak lambası'],
    ornek: true,
  },
];

/** Kategoriye göre doküman sayısı (kategori ekranındaki rozetler için) */
export function kategoriDokumanSayisi(kategoriId: string): number {
  return DOKUMANLAR.filter((d) => d.kategoriId === kategoriId).length;
}
