// AI Mevzuat Asistanı — /ai
//
// ⚠️ Gerçek bir LLM/AI motoru YOK ve bu sprintte eklenmedi. "Önerileri
// Getir", modules/mevzuat/services/arama.ts içindeki MEVCUT `ara()`
// anahtar-kelime arama fonksiyonunu (değiştirmeden) DOCUMENTS üzerinde
// çalıştırır — bu servise yalnızca tüketici olarak bağlanılır, servis
// dosyasına dokunulmadı. "Neden önerildi?" satırı gerçek bir AI
// gerekçelendirmesi DEĞİLDİR, yalnızca eşleşme skoruna dayanır.
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, BottomNavigation, Button, Card, Chip, EmptyState } from '@/components/ui';
import { useRootTabBar } from '@/navigation/tabs';
import { colors, radius, spacing, typography } from '@/theme';
import { DOCUMENTS } from '../../mevzuat/data/sartnameler';
import { ara, type AramaSonucu } from '../../mevzuat/services/arama';

const ORNEK_SORULAR = [
  'Branşman ile köye enerji',
  'OG kablo başlığı',
  'Hizmet kalitesi',
  'AG yeraltı kablo arızası',
  'Bağlantı görüşü',
] as const;

export default function AiDestekScreen() {
  const router = useRouter();
  const tabBar = useRootTabBar();
  const [soru, setSoru] = useState('');
  const [sonuclar, setSonuclar] = useState<AramaSonucu[] | null>(null);

  const oneriGetir = (metin: string) => {
    setSonuclar(ara(metin, DOCUMENTS));
  };

  const ornekSec = (ornek: string) => {
    setSoru(ornek);
    oneriGetir(ornek);
  };

  return (
    <View style={styles.root}>
      <AppBar title="AI Mevzuat Asistanı" onBack={router.canGoBack() ? () => router.back() : undefined} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.altAciklama}>
          Durumunu yaz, ilgili şartname ve yönetmelikleri birlikte bulalım.
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {ORNEK_SORULAR.map((ornek) => (
            <Chip key={ornek} label={ornek} onPress={() => ornekSec(ornek)} />
          ))}
        </ScrollView>

        {sonuclar !== null && (
          <>
            <Text style={styles.bolumBaslik}>
              {sonuclar.length > 0 ? `${sonuclar.length} öneri` : 'Öneri'}
            </Text>
            {sonuclar.length > 0 ? (
              sonuclar.slice(0, 10).map((s) => (
                <Card key={s.document.id} style={styles.card}>
                  <Text style={styles.sonucBaslik} numberOfLines={2}>{s.document.title}</Text>
                  <Text style={styles.sonucAlt}>
                    {s.document.institution} · {s.document.category}
                  </Text>
                  <Text style={styles.nedenText}>
                    Neden önerildi? Yazdığın ifadeyle başlık/anahtar kelime eşleşmesi (skor: {s.puan}).
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
      </ScrollView>
      <BottomNavigation tabs={tabBar.tabs} activeId={tabBar.activeId} onChange={tabBar.onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  scrollContent: { padding: spacing.m, paddingBottom: spacing.xl },
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
  chipRow: { marginBottom: spacing.m },
  sonucBaslik: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  sonucAlt: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 3 },
  nedenText: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 16 },
});
