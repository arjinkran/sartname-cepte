// Doküman detay ekranı — /sartname/:id
// Premium kart tasarımı (Sprint UI-1B) — iş mantığı DEĞİŞMEDİ: aynı
// favoriler context'i, aynı PDF Aç stub'ı. "AI ile Özetle" artık gerçek
// /ai ekranına yönlendiriyor (yeni bir servis çağrısı YOK).
// Kartlar: Başlık, Künye, Anahtar Kelimeler, Özet, İlgili Dokümanlar, Aksiyonlar.
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { AppBar, Button, Card, PressableScale } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { DOCUMENTS, STATUS_LABELS } from '../data/sartnameler';
import { InstitutionBadge, StatusBadge } from '../components/DocumentRow';

function KunyeSatiri({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <View style={styles.kunyeSatir}>
      <Text style={styles.kunyeEtiket}>{etiket}</Text>
      <Text style={styles.kunyeDeger}>{deger}</Text>
    </View>
  );
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const document = DOCUMENTS.find((d) => d.id === id);
  const { favoriMi, favoriDegistir } = useFavoriler();

  if (!document) {
    return (
      <View style={styles.root}>
        <AppBar title="Doküman Detayı" onBack={router.canGoBack() ? () => router.back() : undefined} />
        <View style={styles.bosKap}>
          <Text style={styles.bosText}>Doküman bulunamadı.</Text>
        </View>
      </View>
    );
  }

  const favori = favoriMi(document.id);
  const ilgiliDokumanlar = document.relatedDocuments
    .map((relId) => DOCUMENTS.find((d) => d.id === relId))
    .filter((d): d is (typeof DOCUMENTS)[number] => d != null);

  const pdfAc = () => {
    Alert.alert('PDF Görüntüleyici', 'Bu özellik yakında eklenecek.');
  };

  return (
    <View style={styles.root}>
      <AppBar
        title={document.title.length > 28 ? `${document.title.slice(0, 28)}…` : document.title}
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
        </Card>

        {/* Künye kartı */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Künye</Text>
          <KunyeSatiri etiket="Kurum" deger={document.institution} />
          <KunyeSatiri etiket="Kategori" deger={document.category} />
          <KunyeSatiri etiket="Revizyon" deger={document.revision} />
          <KunyeSatiri etiket="Durum" deger={STATUS_LABELS[document.status]} />
          <KunyeSatiri etiket="Yayın tarihi" deger={document.publishDate} />
          <KunyeSatiri etiket="Yürürlük tarihi" deger={document.effectiveDate} />
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

        {/* Aksiyonlar */}
        <Card style={styles.card}>
          <Text style={styles.bolumBaslik}>Aksiyonlar</Text>
          <View style={styles.aksiyonlar}>
            <Button label="📄 PDF Aç" variant="primary" onPress={pdfAc} style={{ flex: 1 }} />
            <Button
              label={favori ? '★ Favoride' : '☆ Favorilere Ekle'}
              variant={favori ? 'primary' : 'secondary'}
              onPress={() => favoriDegistir(document.id)}
              style={{ flex: 1 }}
            />
          </View>
          <Button
            label="✨ AI ile Özetle"
            variant="secondary"
            onPress={() => router.push('/ai')}
            style={{ marginTop: spacing.s }}
          />
          <Text style={styles.kaynakNot}>
            PDF görüntüleme özelliği geliştirme aşamasındadır; bu buton şimdilik stub'tır.
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
  ilgiliBos: { fontSize: 14, color: colors.textSecondary },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.m },
  aksiyonlar: { flexDirection: 'row', gap: spacing.s },
  kaynakNot: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 17 },
});
