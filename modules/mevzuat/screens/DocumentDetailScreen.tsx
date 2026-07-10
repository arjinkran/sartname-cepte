// Doküman detay ekranı — /sartname/:id
// Premium kart tasarımı — iş mantığı DEĞİŞMEDİ: aynı favoriler context'i,
// aynı PDF Aç stub'ı. "AI ile Açıkla" gerçek /ai ekranına yönlendirir (yeni
// bir servis çağrısı YOK). Sprint 5: veri ulusal mevzuat kütüphanesi
// Repository'sinden okunur (getDocumentById/getRelatedDocuments) — hiçbir
// JSON'a doğrudan erişim yok. "İlgili Yönetmelikler ve Standartlar" artık
// dokümana özel `crossReferences` alanından gelir (önceki sürümde tüm
// dokümanlarda aynı gösterilen TEMSİLİ statik liste kaldırıldı).
// Kartlar: Başlık, Künye, Anahtar Kelimeler, Özet, İlgili Dokümanlar,
// İlgili Yönetmelikler ve Standartlar, Revizyon Bilgisi, Aksiyonlar.
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { AppBar, Button, Card, Logo, PressableScale } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { STATUS_LABELS, getDocumentById, getRelatedDocuments, hasPdf, isPdfDownloadedLocally } from '@/data/library';
import { recommendRelated } from '@/ai/engine';
import {
  clearSourceSearchState,
  findOfficialSourceCandidates,
  getSourceStatus,
  isCandidateUrlSafeToOpen,
} from '@/sourceResolver/resolver';
import type { SourceAccessType } from '@/sourceResolver/types';
import type { NetworkCandidate, NetworkSearchResponse } from '@/sourceResolver/network/types';
import { deleteDownloadedPdf } from '@/offline/downloadManager';
import { enqueueDownload, getQueueState, subscribeToQueue, type QueueItem } from '@/offline/downloadQueue';
import { buildUsageQuestions } from '@/evidence/explanations';
import { InstitutionBadge, StatusBadge } from '../components/DocumentRow';

/** `candidateParser.ts`'in STRONG_SCORE_THRESHOLD'ü ile AYNI değer — UI, network katmanını doğrudan import ETMEZ, bu yüzden burada yalnızca görüntüleme eşiği olarak tekrarlanır. */
const GUCLU_ADAY_ESIGI = 70;

function KunyeSatiri({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <View style={styles.kunyeSatir}>
      <Text style={styles.kunyeEtiket}>{etiket}</Text>
      <Text style={styles.kunyeDeger}>{deger}</Text>
    </View>
  );
}

const ERISIM_TIPI_ETIKETLERI: Record<SourceAccessType, string> = {
  publicPdf: 'Kamuya Açık PDF',
  officialPage: 'Resmî Sayfa',
  restrictedStandard: 'Kısıtlı / Telifli Standart',
  manualRequired: 'Manuel Doğrulama Gerekli',
  notFound: 'Bulunamadı',
};

/** URL'den yalnızca host kısmını görüntüleme amaçlı çıkarır. */
function domainGoster(url: string): string {
  const eslesme = url.match(/^https?:\/\/([^/?#]+)/i);
  return eslesme ? eslesme[1]!.replace(/^www\./, '') : url;
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const document = id ? getDocumentById(id) : undefined;
  const { favoriMi, favoriDegistir } = useFavoriler();

  // Sprint 12, madde 13/16: ağ araması durumu — yalnızca kullanıcı "PDF
  // Bulmayı Dene" dediğinde tetiklenir, oturum içi bellek durumu.
  const [aramaDevamEdiyor, setAramaDevamEdiyor] = useState(false);
  const [aramaSonucu, setAramaSonucu] = useState<NetworkSearchResponse | null>(null);
  const [adayModalAcik, setAdayModalAcik] = useState(false);

  // Sprint 13: indirme onayı + kuyruk durumu.
  const [indirmeOnayAdayi, setIndirmeOnayAdayi] = useState<NetworkCandidate | null>(null);
  const [kuyrukOgesi, setKuyrukOgesi] = useState<QueueItem | null>(null);
  const [pdfDurumTick, setPdfDurumTick] = useState(0);

  // Sayfadan ayrılırken (veya belge değişirse) devam eden aramayı iptal et.
  useEffect(() => {
    return () => {
      if (id) clearSourceSearchState(id);
    };
  }, [id]);

  // Kuyruk durumunu dinle — bu belgeye ait iş varsa yerel state'e yansıt.
  // "Çevrimdışı Kullanılabilir" durumuna geçiş `hasPdf()`/`isPdfDownloadedLocally()`
  // gibi SAF fonksiyonların yeniden değerlendirilmesini gerektirdiğinden,
  // tamamlanma anında ayrı bir "tick" state'i re-render'ı tetikler.
  useEffect(() => {
    if (!id) return;
    const mevcut = getQueueState().items.find((i) => i.request.documentId === id) ?? null;
    setKuyrukOgesi(mevcut);
    const unsubscribe = subscribeToQueue((state) => {
      const item = state.items.find((i) => i.request.documentId === id) ?? null;
      setKuyrukOgesi(item);
      if (item?.status === 'completed') setPdfDurumTick((t) => t + 1);
    });
    return unsubscribe;
  }, [id]);

  if (!document) {
    return (
      <View style={styles.root}>
        <AppBar title="Doküman Detayı" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
        <View style={styles.bosKap}>
          <Text style={styles.bosText}>Doküman bulunamadı.</Text>
        </View>
      </View>
    );
  }

  const favori = favoriMi(document.id);
  const ilgiliDokumanlar = getRelatedDocuments(document.id);
  // Sprint 7, madde 9: "çapraz öneriler" artık yalnızca elle yazılmış
  // relatedDocuments/crossReferences alanlarıyla SINIRLI değil — AI
  // motoru, belgenin kendi başlık/kategori/anahtar kelimelerinden
  // türettiği bir sorguyla ek ilişkili belgeler de önerir.
  const aiOnerileri = recommendRelated(document.id, 5).documents;
  // Sprint 14: Evidence Engine — template tabanlı, LLM'siz örnek soru üretimi.
  const kullanimSorulari = buildUsageQuestions(document);
  const pdfVar = hasPdf(document);
  const kaynakDurumu = getSourceStatus(document);

  // Sprint 13, madde 14: PDF durumu artık 4 hâlden biridir.
  const cevrimdisiVar = isPdfDownloadedLocally(document.id);
  const indiriliyorMu = kuyrukOgesi?.status === 'queued' || kuyrukOgesi?.status === 'downloading';
  const pdfDurumu: 'cevrimdisi' | 'indiriliyor' | 'ac' | 'pdfBul' = cevrimdisiVar
    ? 'cevrimdisi'
    : indiriliyorMu
    ? 'indiriliyor'
    : pdfVar
    ? 'ac'
    : 'pdfBul';

  const pdfAc = () => {
    if (pdfVar) {
      router.push(`/pdf/${document.id}`);
      return;
    }
    Alert.alert(
      'Bu dokümanın PDF\'i henüz cihazda değil.',
      '"Resmî Kaynak Durumu" bölümündeki "PDF Bulmayı Dene" ile doğrulanmış resmî kaynaklarda arayabilirsiniz.'
    );
  };

  const pdfCihazdanKaldir = () => {
    Alert.alert(
      'PDF cihazdan kaldırılsın mı?',
      'Bu işlem yalnızca cihazınızdaki indirilmiş dosyayı kaldırır; doküman kütüphaneden silinmez.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            await deleteDownloadedPdf(document.id);
            setPdfDurumTick((t) => t + 1);
          },
        },
      ]
    );
  };

  const resmiKaynagiAc = () => {
    if (!kaynakDurumu.url) {
      Alert.alert('Kaynak bağlantısı yok', 'Bu doküman için henüz doğrulanmış bir resmî kaynak bağlantısı kayıtlı değil.');
      return;
    }
    Linking.openURL(kaynakDurumu.url).catch(() => {
      Alert.alert('Açılamadı', 'Bağlantı açılırken bir sorun oluştu.');
    });
  };

  const pdfBulmayiDene = async () => {
    if (aramaDevamEdiyor) return; // ikinci eşzamanlı arama başlatılmaz (madde 13)
    setAramaDevamEdiyor(true);
    setAramaSonucu(null);
    try {
      const sonuc = await findOfficialSourceCandidates(document);
      setAramaSonucu(sonuc);
      if (sonuc.candidates.length > 0) setAdayModalAcik(true);
    } finally {
      setAramaDevamEdiyor(false);
    }
  };

  const kaynagiAc = (aday: NetworkCandidate) => {
    if (!isCandidateUrlSafeToOpen(aday.url, aday.providerId)) {
      Alert.alert('Bağlantı doğrulanamadı', 'Bu bağlantı doğrulanmış resmî bir kaynağa ait değil.');
      return;
    }
    Linking.openURL(aday.url).catch(() => {
      Alert.alert('Açılamadı', 'Bağlantı açılırken bir sorun oluştu.');
    });
  };

  // Sprint 13, madde 10: kullanıcı adayın "Cihaza İndir" butonuna basınca
  // ÖNCE onay modalı açılır — gerçek indirme yalnızca `indirmeyiOnayla()`
  // ile, kullanıcı AÇIKÇA "İndir" dediğinde tetiklenir.
  const indirmeyiOnayla = () => {
    if (!indirmeOnayAdayi) return;
    const aday = indirmeOnayAdayi;
    setIndirmeOnayAdayi(null);
    setAdayModalAcik(false);
    enqueueDownload({
      documentId: document.id,
      institution: document.institution,
      title: document.title,
      url: aday.url,
      providerId: aday.providerId,
      suggestedFileName: `${document.id}.pdf`,
    });
  };

  const aramaDurumMesaji = aramaDevamEdiyor ? 'Resmî kaynaklarda aranıyor…' : aramaSonucu?.message ?? null;

  return (
    <View style={styles.root}>
      <AppBar
        title={document.title.length > 28 ? `${document.title.slice(0, 28)}…` : document.title}
        logo
        onBack={router.canGoBack() ? () => router.back() : undefined}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Başlık kartı */}
        <Card style={styles.card}>
          <View style={styles.ustSatir}>
            <InstitutionBadge institution={document.institution} />
            <StatusBadge status={document.status} />
          </View>
          <Text style={styles.baslik}>{document.title}</Text>
          <Logo size={22} variant="small" style={styles.baslikLogo} />
        </Card>

        {/* Künye kartı */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Künye</Text>
          <KunyeSatiri etiket="Kurum" deger={document.institution} />
          <KunyeSatiri etiket="Tür" deger={document.documentType} />
          <KunyeSatiri etiket="Kategori" deger={document.category} />
          <KunyeSatiri etiket="Durum" deger={STATUS_LABELS[document.status]} />
        </Card>

        {/* Anahtar Kelimeler */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Anahtar Kelimeler</Text>
          <View style={styles.etiketSatiri}>
            {document.keywords.map((k) => (
              <View key={k} style={styles.etiket}>
                <Text style={styles.etiketText}>{k}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Özet */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Özet</Text>
          <Text style={styles.ozet}>{document.summary}</Text>
        </Card>

        {/* İlgili Dokümanlar */}
        <Card style={styles.card} padded={false}>
          <Text style={[styles.bolumBaslik, { padding: spacing.m, paddingBottom: 0 }]}>İlgili Dokümanlar</Text>
          {ilgiliDokumanlar.length > 0 ? (
            ilgiliDokumanlar.map((d, i) => (
              <View key={d.id}>
                <PressableScale
                  onPress={() => router.push(`/sartname/${d.id}`)}
                  scaleTo={0.98}
                  style={styles.ilgiliSatir}
                >
                  <Text style={styles.ilgiliText} numberOfLines={1}>{d.title}</Text>
                  <Text style={styles.ilgiliOk}>›</Text>
                </PressableScale>
                {i < ilgiliDokumanlar.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={[styles.ilgiliBos, { padding: spacing.m }]}>İlgili doküman bulunmuyor.</Text>
          )}
        </Card>

        {/* İlgili Yönetmelikler ve Standartlar */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>İlgili Yönetmelikler ve Standartlar</Text>
          {document.crossReferences.length > 0 ? (
            document.crossReferences.map((id) => {
              const hedef = getDocumentById(id);
              return (
                <Text key={id} style={styles.mevzuatSatir}>↓ {hedef ? hedef.title : id}</Text>
              );
            })
          ) : (
            <Text style={styles.ilgiliBos}>Bu doküman için henüz ilişkili yönetmelik/standart girilmedi.</Text>
          )}
        </Card>

        {/* AI Önerileri — Sprint 7 madde 9, relatedDocuments/crossReferences'tan BAĞIMSIZ ek öneriler */}
        <Card style={styles.card} padded={false}>
          <Text style={[styles.bolumBaslik, { padding: spacing.m, paddingBottom: 0 }]}>AI Önerileri</Text>
          {aiOnerileri.length > 0 ? (
            aiOnerileri.map((oneri, i) => (
              <View key={oneri.document.id}>
                <PressableScale
                  onPress={() => router.push(`/sartname/${oneri.document.id}`)}
                  scaleTo={0.98}
                  style={styles.ilgiliSatir}
                >
                  <Text style={styles.ilgiliText} numberOfLines={1}>{oneri.document.title}</Text>
                  <Text style={styles.aiOneriYuzde}>{oneri.confidence}%</Text>
                  <Text style={styles.ilgiliOk}>›</Text>
                </PressableScale>
                {i < aiOnerileri.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={[styles.ilgiliBos, { padding: spacing.m }]}>Bu belge için AI önerisi bulunamadı.</Text>
          )}
        </Card>

        {/* Bu Belge Hangi Sorularda Kullanılır? — Sprint 14 Evidence Engine
            madde 14. Template tabanlı, LLM KULLANILMAZ. */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Bu Belge Hangi Sorularda Kullanılır?</Text>
          {kullanimSorulari.map((soru, i) => (
            <View key={soru}>
              <Text style={styles.kullanimSorusu}>💬 {soru}</Text>
              {i < kullanimSorulari.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Resmî Kaynak Durumu — Sprint 11 madde 9 */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Resmî Kaynak Durumu</Text>
          <KunyeSatiri etiket="Kaynak sağlayıcı" deger={kaynakDurumu.provider?.name ?? 'Kayıtlı değil'} />
          <KunyeSatiri etiket="Erişim tipi" deger={ERISIM_TIPI_ETIKETLERI[kaynakDurumu.status]} />
          <KunyeSatiri etiket="Doğrulama durumu" deger={kaynakDurumu.verified ? 'Doğrulandı' : 'Doğrulanmadı'} />
          <KunyeSatiri etiket="PDF uygunluğu" deger={kaynakDurumu.status === 'publicPdf' ? 'Uygun' : 'Uygun değil / bilinmiyor'} />
          <KunyeSatiri etiket="Telif durumu" deger={kaynakDurumu.copyrightRestricted ? 'Telifli / Kısıtlı' : 'Kısıtlama yok'} />
          <KunyeSatiri etiket="Manuel doğrulama gerekli mi?" deger={kaynakDurumu.requiresManualVerification ? 'Evet' : 'Hayır'} />
          <Text style={styles.kaynakDurumAciklama}>{kaynakDurumu.reason}</Text>
          {aramaDurumMesaji && (
            <View style={styles.aramaDurumSatiri}>
              {aramaDevamEdiyor && <ActivityIndicator color={colors.primary} size="small" />}
              <Text style={styles.aramaDurumText}>{aramaDurumMesaji}</Text>
            </View>
          )}
          <View style={[styles.aksiyonlar, { marginTop: spacing.s }]}>
            <Button label="Resmî Kaynağı Aç" variant="secondary" onPress={resmiKaynagiAc} style={{ flex: 1 }} />
            <Button
              label="PDF Bulmayı Dene"
              variant="secondary"
              onPress={pdfBulmayiDene}
              disabled={aramaDevamEdiyor}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Revizyon Bilgisi */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Revizyon Bilgisi</Text>
          <KunyeSatiri etiket="Revizyon" deger={document.revision} />
          <KunyeSatiri etiket="Yayın tarihi" deger={document.publishDate} />
          <KunyeSatiri etiket="Yürürlük tarihi" deger={document.effectiveDate} />
        </Card>

        {/* Aksiyonlar */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Aksiyonlar</Text>
          <View style={styles.aksiyonlar}>
            <Button
              label={
                pdfDurumu === 'indiriliyor'
                  ? kuyrukOgesi?.status === 'downloading'
                    ? 'İndiriliyor…'
                    : 'Kuyrukta…'
                  : pdfDurumu === 'pdfBul'
                  ? 'PDF Bul'
                  : "📄 PDF'yi Aç"
              }
              variant={pdfDurumu === 'cevrimdisi' || pdfDurumu === 'ac' ? 'primary' : 'secondary'}
              onPress={pdfAc}
              disabled={pdfDurumu === 'indiriliyor'}
              style={{ flex: 1 }}
            />
            <Button
              label={favori ? '★ Favoride' : '☆ Favorilere Ekle'}
              variant={favori ? 'primary' : 'secondary'}
              onPress={() => favoriDegistir(document.id)}
              style={{ flex: 1 }}
            />
          </View>
          {pdfDurumu === 'cevrimdisi' && (
            <Button label="Cihazdan Kaldır" variant="ghost" onPress={pdfCihazdanKaldir} style={{ marginTop: spacing.s }} />
          )}
          {pdfDurumu === 'indiriliyor' && (
            <View style={styles.indirmeIlerlemeSatir}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.indirmeIlerlemeText}>
                {kuyrukOgesi?.status === 'downloading' ? 'PDF cihaza indiriliyor…' : 'İndirme kuyrukta bekliyor…'}
              </Text>
            </View>
          )}
          <Button
            label="✨ AI ile Açıkla"
            variant="secondary"
            onPress={() => router.push('/ai')}
            style={{ marginTop: spacing.s }}
          />
          <Text style={styles.kaynakNot}>
            {pdfDurumu === 'cevrimdisi'
              ? 'Bu PDF cihazınıza indirildi — çevrimdışı da açılabilir.'
              : pdfDurumu === 'indiriliyor'
              ? 'İndirme tamamlanınca PDF çevrimdışı kullanılabilir olacak.'
              : pdfDurumu === 'ac'
              ? 'PDF görüntüleyici, doküman için sağlanan kaynağı açar.'
              : 'PDF henüz cihaza indirilmedi. "Resmî Kaynak Durumu" bölümünden arayabilir, doğrulanmış bir kaynak bulunursa indirebilirsiniz.'}
          </Text>
        </Card>
      </ScrollView>

      {/* Aday Kaynaklar Modalı — Sprint 12 madde 14 + Sprint 13 madde 10
          ("Cihaza İndir"). Yalnızca RN yerleşik Modal bileşeni kullanılır;
          yeni paket eklenmedi. */}
      <Modal
        visible={adayModalAcik}
        animationType="slide"
        transparent
        onRequestClose={() => setAdayModalAcik(false)}
      >
        <View style={styles.modalArkaPlan}>
          <View style={styles.modalKap}>
            <View style={styles.modalBaslikSatir}>
              <Text style={styles.modalBaslik}>Resmî Kaynak Adayları</Text>
              <PressableScale onPress={() => setAdayModalAcik(false)}>
                <Text style={styles.modalKapat}>Kapat</Text>
              </PressableScale>
            </View>
            <ScrollView style={styles.modalScroll}>
              {(aramaSonucu?.candidates ?? []).map((aday, i) => (
                <View key={`${aday.url}-${i}`} style={styles.adayKart}>
                  <Text style={styles.adayBaslik} numberOfLines={2}>{aday.title ?? document.title}</Text>
                  <Text style={styles.adayAltSatir}>{aday.provider.name} · {domainGoster(aday.url)}</Text>
                  <View style={styles.adayEtiketSatiri}>
                    <View style={styles.adayEtiket}>
                      <Text style={styles.adayEtiketText}>{aday.isPdf ? 'PDF' : 'Resmî Sayfa'}</Text>
                    </View>
                    <View style={styles.adayEtiket}>
                      <Text style={styles.adayEtiketText}>Güven: {aday.score}%</Text>
                    </View>
                  </View>
                  {aday.matchReasons.length > 0 && (
                    <Text style={styles.adayNedenler}>{aday.matchReasons.join(' · ')}</Text>
                  )}
                  <View style={[styles.aksiyonlar, { marginTop: spacing.s }]}>
                    <Button label="Kaynağı Aç" variant="secondary" onPress={() => kaynagiAc(aday)} style={{ flex: 1 }} />
                    {aday.isPdf && aday.score >= GUCLU_ADAY_ESIGI && (
                      <Button label="Cihaza İndir" variant="primary" onPress={() => setIndirmeOnayAdayi(aday)} style={{ flex: 1 }} />
                    )}
                  </View>
                </View>
              ))}
              {(aramaSonucu?.candidates.length ?? 0) === 0 && (
                <Text style={styles.ilgiliBos}>Aday bulunamadı.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* İndirme Onay Modalı — Sprint 13, madde 10. Kullanıcı AÇIKÇA "İndir"
          demeden hiçbir indirme başlamaz. */}
      <Modal
        visible={indirmeOnayAdayi !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setIndirmeOnayAdayi(null)}
      >
        <View style={styles.onayModalArkaPlan}>
          <View style={styles.onayModalKap}>
            <Text style={styles.modalBaslik}>PDF indirilsin mi?</Text>
            <Text style={styles.onayModalMetin}>
              Bu dosya doğrulanmış resmî kaynaktan cihazınıza indirilecek ve çevrimdışı kullanılabilecektir.
            </Text>
            {indirmeOnayAdayi && (
              <View style={styles.onayModalDetay}>
                <KunyeSatiri etiket="Belge" deger={document.title} />
                <KunyeSatiri etiket="Kurum" deger={document.institution} />
                <KunyeSatiri etiket="Domain" deger={domainGoster(indirmeOnayAdayi.url)} />
                <KunyeSatiri etiket="Tür" deger={indirmeOnayAdayi.isPdf ? 'PDF' : 'Resmî Sayfa'} />
              </View>
            )}
            <View style={[styles.aksiyonlar, { marginTop: spacing.m }]}>
              <Button label="Vazgeç" variant="secondary" onPress={() => setIndirmeOnayAdayi(null)} style={{ flex: 1 }} />
              <Button label="İndir" variant="primary" onPress={indirmeyiOnayla} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: 48 },
  card: { marginBottom: spacing.m },
  bosKap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bosText: { fontSize: 15, color: colors.textSecondary },
  ustSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.s },
  baslik: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    lineHeight: 27,
  },
  baslikLogo: { marginTop: spacing.s, opacity: 0.6 },
  bolumBaslik: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  kunyeSatir: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  kunyeEtiket: { width: 118, fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  kunyeDeger: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  etiketSatiri: { flexDirection: 'row', flexWrap: 'wrap' },
  etiket: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  etiketText: { fontSize: 13, fontWeight: '600', color: colors.primaryLight },
  ozet: { fontSize: 15, color: colors.textPrimary, lineHeight: 23 },
  kullanimSorusu: { fontSize: 14, color: colors.textPrimary, paddingVertical: spacing.s, lineHeight: 20 },
  ilgiliSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
  },
  ilgiliText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  ilgiliOk: { fontSize: 20, color: colors.textSecondary, paddingLeft: spacing.s },
  aiOneriYuzde: { fontSize: 12, fontWeight: '700', color: colors.accent },
  ilgiliBos: { fontSize: 14, color: colors.textSecondary },
  mevzuatSatir: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.m },
  aksiyonlar: { flexDirection: 'row', gap: spacing.s },
  kaynakDurumAciklama: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 17 },
  kaynakNot: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 17 },
  aramaDurumSatiri: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.s },
  aramaDurumText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  modalArkaPlan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  onayModalArkaPlan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  modalKap: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    maxHeight: '80%',
    padding: spacing.m,
  },
  modalBaslikSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  modalBaslik: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  modalKapat: { fontSize: 14, fontWeight: '700', color: colors.accent },
  modalScroll: { flexGrow: 0 },
  adayKart: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  adayBaslik: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  adayAltSatir: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  adayEtiketSatiri: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  adayEtiket: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  adayEtiketText: { fontSize: 11, fontWeight: '700', color: colors.primaryLight },
  adayNedenler: { fontSize: 11, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 15 },
  indirmeIlerlemeSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.s },
  indirmeIlerlemeText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  onayModalKap: {
    backgroundColor: colors.background,
    borderRadius: radius.l,
    padding: spacing.l,
    marginHorizontal: spacing.l,
  },
  onayModalMetin: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 20 },
  onayModalDetay: { marginTop: spacing.m },
});
