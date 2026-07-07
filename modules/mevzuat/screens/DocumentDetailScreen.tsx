// Doküman detay ekranı — /sartname/:id
// Kartlar: Başlık, Kurum, Kategori, Revizyon, Durum, Yayın tarihi,
// Yürürlük tarihi, Anahtar Kelimeler, Özet, İlgili Dokümanlar,
// PDF Aç (stub), Favorilere Ekle (local state).
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { Card } from '@/common/components/UI';
import { colors, spacing, radius } from '@/theme';
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
      <View style={styles.bosKap}>
        <Text style={styles.bosText}>Doküman bulunamadı.</Text>
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
    <>
      <Stack.Screen options={{ title: 'Bilgi Kartı' }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
        {/* Başlık + Kurum + Durum + Favorilere Ekle */}
        <Card>
          <View style={styles.ustSatir}>
            <InstitutionBadge institution={document.institution} />
            <StatusBadge status={document.status} />
          </View>
          <Text style={styles.baslik}>{document.title}</Text>

          <Pressable
            onPress={() => favoriDegistir(document.id)}
            style={({ pressed }) => [
              styles.favoriBtn,
              favori && styles.favoriBtnAktif,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.favoriBtnText, favori && styles.favoriBtnTextAktif]}>
              {favori ? '★ Favorilerde' : '☆ Favorilere Ekle'}
            </Text>
          </Pressable>
        </Card>

        {/* Kurum, Kategori, Revizyon, Durum, Yayın tarihi, Yürürlük tarihi */}
        <Card>
          <Text style={styles.bolumBaslik}>Künye</Text>
          <KunyeSatiri etiket="Kurum" deger={document.institution} />
          <KunyeSatiri etiket="Kategori" deger={document.category} />
          <KunyeSatiri etiket="Revizyon" deger={document.revision} />
          <KunyeSatiri etiket="Durum" deger={STATUS_LABELS[document.status]} />
          <KunyeSatiri etiket="Yayın tarihi" deger={document.publishDate} />
          <KunyeSatiri etiket="Yürürlük tarihi" deger={document.effectiveDate} />
        </Card>

        {/* Anahtar Kelimeler */}
        <Card>
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
        <Card>
          <Text style={styles.bolumBaslik}>Özet</Text>
          <Text style={styles.ozet}>{document.summary}</Text>
        </Card>

        {/* İlgili Dokümanlar */}
        <Card>
          <Text style={styles.bolumBaslik}>İlgili Dokümanlar</Text>
          {ilgiliDokumanlar.length > 0 ? (
            ilgiliDokumanlar.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => router.push(`/sartname/${d.id}`)}
                style={({ pressed }) => [styles.ilgiliSatir, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ilgiliText} numberOfLines={1}>{d.title}</Text>
                <Text style={styles.ilgiliOk}>›</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.ilgiliBos}>İlgili doküman bulunmuyor.</Text>
          )}
        </Card>

        {/* PDF Aç (stub) */}
        <Card>
          <Text style={styles.bolumBaslik}>Kaynak</Text>
          <Pressable
            onPress={pdfAc}
            style={({ pressed }) => [styles.kaynakBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.kaynakBtnText}>📄 PDF Aç</Text>
          </Pressable>
          <Text style={styles.kaynakNot}>
            PDF görüntüleme özelliği geliştirme aşamasındadır; bu buton şimdilik stub'tır.
          </Text>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  bosKap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bosText: { fontSize: 15, color: colors.textMuted },
  ustSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  baslik: { fontSize: 19, fontWeight: '800', color: colors.text, lineHeight: 26 },
  favoriBtn: {
    marginTop: spacing.m,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radius.s,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  favoriBtnAktif: { backgroundColor: colors.accent, borderColor: colors.accent },
  favoriBtnText: { fontSize: 15, fontWeight: '700', color: '#B07A0E' },
  favoriBtnTextAktif: { color: '#FFFFFF' },
  bolumBaslik: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
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
  kunyeEtiket: { width: 118, fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  kunyeDeger: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },
  etiketSatiri: { flexDirection: 'row', flexWrap: 'wrap' },
  etiket: {
    backgroundColor: '#E8EEF5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  etiketText: { fontSize: 13, fontWeight: '600', color: colors.primaryLight },
  ozet: { fontSize: 15, color: colors.text, lineHeight: 23 },
  ilgiliSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ilgiliText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  ilgiliOk: { fontSize: 20, color: colors.textMuted, paddingLeft: spacing.s },
  ilgiliBos: { fontSize: 14, color: colors.textMuted },
  kaynakBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    padding: spacing.m,
    alignItems: 'center',
  },
  kaynakBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  kaynakNot: { fontSize: 12, color: colors.textMuted, marginTop: spacing.s, lineHeight: 17 },
});
