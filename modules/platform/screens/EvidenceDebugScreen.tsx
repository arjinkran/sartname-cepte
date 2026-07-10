// Evidence Debug — /evidence-debug (Sprint 14, madde 15).
// ⚠️ Yalnızca GELİŞTİRME ortamında kullanılabilir — `__DEV__` (Expo/RN'in
// yerleşik global'i, production build'de her zaman `false`) kontrolü hem
// bu ekranda hem de Profil'deki menü satırında YAPILIR (çift kilit).
// `src/evidence/engine.ts`'in ham çıktısını (score breakdown, gruplar,
// confidence) inceleme amaçlıdır — kullanıcıya yönelik bir özellik DEĞİLDİR.
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Button, Card } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { collectEvidence } from '@/evidence/engine';
import { EVIDENCE_EXAMPLE_QUESTIONS } from '@/evidence/examples';
import type { EvidenceResult } from '@/evidence/types';

export default function EvidenceDebugScreen() {
  const router = useRouter();
  const [soru, setSoru] = useState(EVIDENCE_EXAMPLE_QUESTIONS[0] ?? '');
  const [sonuc, setSonuc] = useState<EvidenceResult | null>(null);

  if (!__DEV__) {
    return (
      <View style={styles.root}>
        <AppBar title="Evidence Debug" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
        <View style={styles.bosKap}>
          <Text style={styles.bosText}>Bu ekran yalnızca geliştirme ortamında kullanılabilir.</Text>
        </View>
      </View>
    );
  }

  const calistir = () => setSonuc(collectEvidence(soru));

  return (
    <View style={styles.root}>
      <AppBar title="Evidence Debug" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <TextInput
            style={styles.giris}
            value={soru}
            onChangeText={setSoru}
            multiline
            numberOfLines={3}
            placeholder="Test sorusu…"
            placeholderTextColor={colors.disabled}
          />
          <Button label="Kanıt Topla" onPress={calistir} style={{ marginTop: spacing.s }} />
        </Card>

        {sonuc && (
          <>
            <Card style={styles.card}>
              <Text style={styles.kartBaslik}>Özet</Text>
              <Text style={styles.satir}>{sonuc.summary}</Text>
              <Text style={styles.satir}>Toplu confidence: {sonuc.confidence.score} ({sonuc.confidence.band})</Text>
              <Text style={styles.satir}>Toplam kanıt: {sonuc.collection.evidences.length}</Text>
              <Text style={styles.satir}>
                En iyi: {sonuc.bestDocuments.length} · İlgili: {sonuc.relatedDocuments.length} · Cross-ref: {sonuc.crossReferenceDocuments.length}
              </Text>
            </Card>

            <Text style={styles.bolumBaslik}>Gruplar</Text>
            {sonuc.collection.groups.map((grup) => (
              <Card key={grup.name} style={styles.card}>
                <Text style={styles.kartBaslik}>{grup.name} ({grup.evidences.length})</Text>
                {grup.evidences.map((e) => (
                  <Text key={e.reference.documentId} style={styles.satir}>
                    {e.reference.title} — {e.confidence.score} ({e.confidence.band}) — derinlik {e.crossReferenceDepth}
                  </Text>
                ))}
              </Card>
            ))}

            <Text style={styles.bolumBaslik}>Ham Puan Dökümü (En İyi 5)</Text>
            {sonuc.bestDocuments.slice(0, 5).map((c) => (
              <Card key={c.document.id} style={styles.card}>
                <Text style={styles.kartBaslik}>{c.document.title}</Text>
                <Text style={styles.satirMono}>
                  total={c.score.total} intent={c.score.breakdown.intentMatch} ai={c.score.breakdown.aiRecommendation} docPri={c.score.breakdown.documentPriority} kurumPri={c.score.breakdown.institutionPriority} kategori={c.score.breakdown.categoryMatch} crossRef={c.score.breakdown.crossReference} pdf={c.score.breakdown.pdfAvailable} resmi={c.score.breakdown.officialSource} revizyon={c.score.breakdown.revision}
                </Text>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: 48 },
  bosKap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.l },
  bosText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  card: { marginBottom: spacing.m },
  giris: {
    minHeight: 70,
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.m,
    padding: spacing.m,
    textAlignVertical: 'top',
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
  kartBaslik: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs },
  satir: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  satirMono: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
});
