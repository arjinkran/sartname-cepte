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
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { AppBar, Button, Card, Logo, PressableScale } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { STATUS_LABELS, getDocumentById, getRelatedDocuments, hasPdf } from '@/data/library';
import { recommendRelated } from '@/ai/engine';
import { getSourceStatus } from '@/sourceResolver/resolver';
import type { SourceAccessType } from '@/sourceResolver/types';
import { InstitutionBadge, StatusBadge } from '../components/DocumentRow';

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

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const document = id ? getDocumentById(id) : undefined;
  const { favoriMi, favoriDegistir } = useFavoriler();

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
  const pdfVar = hasPdf(document);
  const kaynakDurumu = getSourceStatus(document);

  const pdfAc = () => {
    if (pdfVar) {
      router.push(`/pdf/${document.id}`);
      return;
    }
    Alert.alert(
      'PDF henüz eklenmedi.',
      'Bu dokümanın resmi PDF dosyası doğrulandıktan sonra kütüphaneye eklenecektir.'
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

  const pdfBulmayiDene = () => {
    Alert.alert(
      'PDF Bulmayı Dene',
      'Resmî kaynak arama altyapısı hazırlandı. Otomatik arama sonraki sürümde aktif edilecektir.'
    );
  };

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
          <View style={[styles.aksiyonlar, { marginTop: spacing.s }]}>
            <Button label="Resmî Kaynağı Aç" variant="secondary" onPress={resmiKaynagiAc} style={{ flex: 1 }} />
            <Button label="PDF Bulmayı Dene" variant="secondary" onPress={pdfBulmayiDene} style={{ flex: 1 }} />
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
              label={pdfVar ? "📄 PDF'yi Aç" : 'PDF Yakında'}
              variant={pdfVar ? 'primary' : 'secondary'}
              onPress={pdfAc}
              style={{ flex: 1 }}
            />
            <Button
              label={favori ? '★ Favoride' : '☆ Favorilere Ekle'}
              variant={favori ? 'primary' : 'secondary'}
              onPress={() => favoriDegistir(document.id)}
              style={{ flex: 1 }}
            />
          </View>
          <Button
            label="✨ AI ile Açıkla"
            variant="secondary"
            onPress={() => router.push('/ai')}
            style={{ marginTop: spacing.s }}
          />
          <Text style={styles.kaynakNot}>
            {pdfVar
              ? 'PDF görüntüleyici, doküman için sağlanan kaynağı açar.'
              : 'PDF henüz eklenmedi. Bu dokümanın resmi PDF dosyası doğrulandıktan sonra kütüphaneye eklenecektir.'}
          </Text>
        </Card>
      </ScrollView>
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
});
