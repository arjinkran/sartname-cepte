// Kategori GÖRÜNÜM zenginleştirmesi — bu dosya kategori LİSTESİNİN kaynağı
// DEĞİLDİR (o listeyi repository.getCategories() gerçek belgeleri tarayarak
// otomatik üretir, bkz. Sprint 5 madde 7). Bu dosya yalnızca zaten var olan
// bir kategori adına ikon/açıklama eşler — ekranlarda (Kategoriler listesi)
// kart görünümü için kullanılır. Burada TANIMLI OLMAYAN bir kategori
// ortaya çıkarsa (yeni bir kurum/belge eklendiğinde), repository yine de
// onu listeye ekler; ekran genel bir 📁 ikonuyla gösterir (bkz. repository.ts
// getCategories()).
export const CATEGORY_PRESENTATION: Record<string, { ikon: string; aciklama: string }> = {
  'AG Şebeke': { ikon: '🔌', aciklama: 'Alçak gerilim dağıtım şebekesi ve iç tesisler' },
  'OG Şebeke': { ikon: '⚡', aciklama: 'Orta gerilim dağıtım şebekesi' },
  'YG': { ikon: '🗼', aciklama: 'Yüksek gerilim iletim hatları ve tesisleri' },
  'Kablolar': { ikon: '🧵', aciklama: 'Güç kabloları, ekler, başlıklar' },
  'Trafo': { ikon: '🔋', aciklama: 'Dağıtım ve güç transformatörleri' },
  'Dağıtım Panoları': { ikon: '🗄️', aciklama: 'AG dağıtım panoları ve kofralar' },
  'Hücreler': { ikon: '🧰', aciklama: 'OG modüler/metal mahfazalı hücreler' },
  'Topraklama': { ikon: '🌍', aciklama: 'Topraklama tesisleri, ölçüm, koruma' },
  'Koruma': { ikon: '🛡️', aciklama: 'Röle koruma, selektivite, koruma koordinasyonu' },
  'Sayaç': { ikon: '📟', aciklama: 'Elektronik/elektromekanik sayaçlar' },
  'Ölçü': { ikon: '📊', aciklama: 'Ölçü trafoları, akım/gerilim trafoları' },
  'Direkler': { ikon: '🗼', aciklama: 'Beton, demir, ahşap direkler' },
  'İletkenler': { ikon: '➰', aciklama: 'ACSR iletkenler ve donanımları' },
  'İSG': { ikon: '🦺', aciklama: 'İş sağlığı ve güvenliği, emniyet mevzuatı' },
  'Hizmet Kalitesi': { ikon: '📈', aciklama: 'Kesinti süreleri, tazminatlar, kalite göstergeleri' },
  'Enerji Piyasası': { ikon: '💹', aciklama: 'Piyasa, tüketici ve bağlantı mevzuatı' },
  'SCADA': { ikon: '🖥️', aciklama: 'Uzaktan izleme ve kontrol sistemleri' },
  'Aydınlatma': { ikon: '💡', aciklama: 'Genel aydınlatma, armatürler' },
  'Parafudr': { ikon: '⚡', aciklama: 'Aşırı gerilim koruma cihazları' },
  'Kesiciler': { ikon: '🔀', aciklama: 'Güç kesicileri' },
  'Ayırıcılar': { ikon: '🔓', aciklama: 'Yük ayırıcıları, seksiyonerler' },
  'Kompanzasyon': { ikon: '🧮', aciklama: 'Reaktif güç kompanzasyonu' },
  'Genel': { ikon: '📁', aciklama: 'Yukarıdaki kategorilere girmeyen genel dokümanlar' },
};

export const VARSAYILAN_KATEGORI_GORUNUMU = { ikon: '📁', aciklama: '' };

export function kategoriGorunumu(kategoriAdi: string): { ikon: string; aciklama: string } {
  return CATEGORY_PRESENTATION[kategoriAdi] ?? VARSAYILAN_KATEGORI_GORUNUMU;
}
