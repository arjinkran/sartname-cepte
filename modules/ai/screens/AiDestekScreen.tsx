// AI Mevzuat Asistanı — /ai
//
// ⚠️ Gerçek bir LLM/AI motoru YOK. Sprint 7'den itibaren "Önerileri
// Getir", src/ai/engine.ts'teki `recommendDocuments()` — kural tabanlı
// bir "Mevzuat Tavsiye Motoru" — çağırır: niyet tespiti + eşanlamlı
// terim normalizasyonu + çok alanlı ağırlıklı puanlama (bkz.
// src/ai/README.md). Hâlâ LLM/RAG/API/internet KULLANMAZ. "Neden
// önerildi?" satırları gerçek bir AI gerekçelendirmesi DEĞİLDİR —
// `reasons` dizisinden gelen, hangi kuralların eşleştiğinin okunabilir
// bir dökümüdür.
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, BottomNavigation, Button, Card, EmptyState, ListItem, Logo } from '@/components/ui';
import { useRootTabBar } from '@/navigation/tabs';
import { colors, radius, spacing, typography } from '@/theme';
import { recommendDocuments } from '@/ai/engine';
import type { DocumentRecommendation } from '@/ai/types';
import { EXAMPLE_QUESTIONS } from '@/ai/examples';
import { hasPdf } from '@/data/library';
import { collectEvidence } from '@/evidence/engine';
import type { EvidenceConfidenceBand, EvidenceResult } from '@/evidence/types';

const ONERI_LIMIT = 10;
const ORNEK_SORU_SAYISI = 8;

// src/ai/examples.ts, 50+ gerçek saha sorusunun TEK kaynağıdır (Sprint 7,
// madde 10) — burada yalnızca ilk 8'i "Örnek Sorular" kartında gösterilir.
const ORNEK_SORULAR = EXAMPLE_QUESTIONS.slice(0, ORNEK_SORU_SAYISI);

/** confidence (0-100) → 5 üzerinden yıldız gösterimi, ör. 92 → ★★★★★. */
function guvenYildizlari(confidence: number): string {
  const doluYildiz = Math.round(confidence / 20);
  return '★★★★★'.slice(0, doluYildiz) + '☆☆☆☆☆'.slice(0, 5 - doluYildiz);
}

const KANIT_BANT_RENK: Record<EvidenceConfidenceBand, string> = {
  green: colors.success,
  yellow: colors.warning,
  red: colors.danger,
};

export default function AiDestekScreen() {
  const router = useRouter();
  const tabBar = useRootTabBar();
  const [soru, setSoru] = useState('');
  const [sonuclar, setSonuclar] = useState<readonly DocumentRecommendation[] | null>(null);
  const [kanitSonucu, setKanitSonucu] = useState<EvidenceResult | null>(null);

  const oneriGetir = (metin: string) => {
    setSonuclar(recommendDocuments(metin, ONERI_LIMIT).documents);
    // Sprint 14: Kanıt Toplama Motoru — AI HENÜZ bir cevap ÜRETMEZ,
    // yalnızca ilgili mevzuatı bulur/puanlar/gruplar (bkz. src/evidence/README.md).
    setKanitSonucu(collectEvidence(metin, ONERI_LIMIT));
  };

  const ornekSec = (ornek: string) => {
    setSoru(ornek);
    oneriGetir(ornek);
  };

  return (
    <View style={styles.root}>
      <AppBar title="AI Mevzuat Asistanı" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.markaSatiri}>
          <Logo size={36} variant="small" />
        </View>

        <Text style={styles.altAciklama}>
          Problemini yaz. Yapay zekâ sana ilgili şartname, yönetmelik, standart ve teknik
          dokümanları önersin.
        </Text>

        <View style={styles.uyariKart}>
          <Text style={styles.uyariText}>
            ⚠️ Bu asistan resmi hukuki görüş üretmez. Nihai karar için resmi mevzuat ve kurum
            görüşleri esas alınmalıdır.
          </Text>
        </View>

        <Card style={styles.card}>
          <TextInput
            style={styles.girisAlani}
            value={soru}
            onChangeText={setSoru}
            placeholder="Örn: 2 km uzaktaki dağıtım hattından branşman ile köye enerji verilecek…"
            placeholderTextColor={colors.disabled}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Button
            label="Önerileri Getir"
            onPress={() => oneriGetir(soru)}
            disabled={soru.trim().length < 2}
            style={{ marginTop: spacing.s }}
          />
        </Card>

        <Text style={styles.bolumBaslik}>Örnek Sorular</Text>
        <Card style={styles.card} padded={false}>
          {ORNEK_SORULAR.map((ornek, i) => (
            <View key={ornek}>
              <ListItem
                icon="💬"
                title={ornek}
                titleLines={2}
                onPress={() => ornekSec(ornek)}
                style={styles.ornekRow}
                right={<Text style={styles.chevron}>›</Text>}
              />
              {i < ORNEK_SORULAR.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {sonuclar !== null && (
          <>
            <Text style={styles.bolumBaslik}>
              {sonuclar.length > 0 ? `${sonuclar.length} öneri` : 'Öneri'}
            </Text>
            {sonuclar.length > 0 ? (
              sonuclar.slice(0, ONERI_LIMIT).map((s) => (
                <Card key={s.document.id} style={styles.card}>
                  <View style={styles.sonucUstSatir}>
                    <Text style={styles.sonucBaslik} numberOfLines={2}>{s.document.title}</Text>
                    <View style={styles.guvenRozeti}>
                      <Text style={styles.guvenYildiz}>{guvenYildizlari(s.confidence)}</Text>
                      <Text style={styles.guvenYuzde}>{s.confidence}%</Text>
                    </View>
                  </View>
                  <View style={styles.sonucAltSatir}>
                    <Text style={styles.sonucAlt}>
                      {s.document.institution} · {s.document.category}
                    </Text>
                    {hasPdf(s.document) ? (
                      <View style={styles.pdfEtiket}>
                        <Text style={styles.pdfEtiketText}>PDF</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.nedenText}>
                    {s.reasons.length > 0 ? `Neden önerildi? ${s.reasons.join(' ')}` : 'Neden önerildi? Genel eşleşme.'}
                  </Text>
                  <Button
                    label="Detaya Git"
                    variant="secondary"
                    onPress={() => router.push(`/sartname/${s.document.id}`)}
                    style={{ marginTop: spacing.s, alignSelf: 'flex-start' }}
                  />
                </Card>
              ))
            ) : (
              <EmptyState
                icon="🤔"
                title="Sonuç bulunamadı"
                description="Farklı anahtar kelimelerle tekrar deneyin."
              />
            )}
          </>
        )}

        {/* Kanıtlar — Sprint 14 Evidence Engine. AI henüz bir CEVAP
            üretmiyor; yalnızca ilgili mevzuatı bulup puanlıyor
            (bkz. src/evidence/README.md, PROJECT_CONSTITUTION.md). */}
        {kanitSonucu !== null && (
          <>
            <Text style={styles.bolumBaslik}>Kanıtlar</Text>
            <Card style={[styles.card, styles.kanitOzetKart]}>
              <Text style={styles.kanitOzetText}>{kanitSonucu.summary}</Text>
            </Card>
            {kanitSonucu.collection.evidences.length > 0 ? (
              kanitSonucu.collection.evidences.slice(0, ONERI_LIMIT).map((kanit) => (
                <Card key={kanit.reference.documentId} style={styles.card}>
                  <View style={styles.sonucUstSatir}>
                    <Text style={styles.sonucBaslik} numberOfLines={2}>{kanit.reference.title}</Text>
                    <View style={styles.guvenRozeti}>
                      <Text style={[styles.kanitGuvenNokta, { color: KANIT_BANT_RENK[kanit.confidence.band] }]}>●</Text>
                      <Text style={styles.guvenYuzde}>{kanit.confidence.score}%</Text>
                    </View>
                  </View>
                  <Text style={styles.sonucAlt}>{kanit.reference.institution} · {kanit.reference.category}</Text>
                  <View style={styles.kanitEtiketSatiri}>
                    <View style={styles.kanitEtiket}>
                      <Text style={styles.kanitEtiketText}>{kanit.confidence.label}</Text>
                    </View>
                    {kanit.reference.officialSourceStatus !== 'manualRequired' && kanit.reference.officialSourceStatus !== 'notFound' && (
                      <View style={styles.kanitEtiket}>
                        <Text style={styles.kanitEtiketText}>Resmî Kaynak</Text>
                      </View>
                    )}
                    {kanit.reference.pdfAvailable && (
                      <View style={styles.kanitEtiket}>
                        <Text style={styles.kanitEtiketText}>PDF</Text>
                      </View>
                    )}
                    {kanit.crossReferenceDepth > 0 && (
                      <View style={styles.kanitEtiket}>
                        <Text style={styles.kanitEtiketText}>Çapraz Referans</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.nedenText}>{kanit.explanation}</Text>
                  <Button
                    label="Detaya Git"
                    variant="secondary"
                    onPress={() => router.push(`/sartname/${kanit.reference.documentId}`)}
                    style={{ marginTop: spacing.s, alignSelf: 'flex-start' }}
                  />
                </Card>
              ))
            ) : (
              <EmptyState
                icon="📭"
                title="Kanıt bulunamadı"
                description="Bu soru için doğrulanmış bir kaynak bulunamadı."
              />
            )}
          </>
        )}
      </ScrollView>
      <BottomNavigation tabs={tabBar.tabs} activeId={tabBar.activeId} onChange={tabBar.onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: spacing.xl },
  markaSatiri: { alignItems: 'center', marginBottom: spacing.m },
  altAciklama: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily,
    color: colors.textSecondary,
    marginBottom: spacing.m,
    lineHeight: 21,
  },
  uyariKart: {
    backgroundColor: '#FEF3C7',
    borderRadius: radius.l,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  uyariText: { fontSize: typography.size.sm, color: '#8C6D1F', lineHeight: 19, fontWeight: '600' },
  card: { marginBottom: spacing.m },
  girisAlani: {
    minHeight: 110,
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.m,
    padding: spacing.m,
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
  ornekRow: { paddingHorizontal: spacing.m },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.m },
  chevron: { fontSize: 20, color: colors.textSecondary, marginLeft: 2 },
  sonucUstSatir: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.s },
  sonucBaslik: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  guvenRozeti: { alignItems: 'flex-end' },
  guvenYildiz: { fontSize: 12, color: colors.accent, letterSpacing: 1 },
  guvenYuzde: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: 1 },
  sonucAltSatir: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 3 },
  sonucAlt: { fontSize: typography.size.sm, color: colors.textSecondary },
  pdfEtiket: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.s,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pdfEtiketText: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  nedenText: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 16 },
  kanitOzetKart: { backgroundColor: colors.primary },
  kanitOzetText: { color: '#FFFFFF', fontSize: typography.size.sm, fontWeight: '700', lineHeight: 19 },
  kanitGuvenNokta: { fontSize: 14 },
  kanitEtiketSatiri: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  kanitEtiket: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kanitEtiketText: { fontSize: 11, fontWeight: '700', color: colors.primaryLight },
});
