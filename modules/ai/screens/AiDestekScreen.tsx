// AI Mevzuat Asistanı — /ai
//
// ⚠️ Gerçek bir LLM/AI motoru YOK. "Önerileri Getir", Repository'deki
// `searchKeywords()` fonksiyonunu çağırır — yalnızca her dokümanın
// `keywords`/`tags`/`aliases` alanlarında eşleşme arar (title/summary
// hariç), skor `searchWeight` ile çarpılır (Sprint 5, madde 12/24).
// "Neden önerildi?" satırı gerçek bir AI gerekçelendirmesi DEĞİLDİR,
// yalnızca eşleşme skoruna dayanır.
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, BottomNavigation, Button, Card, EmptyState, ListItem } from '@/components/ui';
import { useRootTabBar } from '@/navigation/tabs';
import { colors, radius, spacing, typography } from '@/theme';
import { searchKeywords, type SearchResult } from '@/data/library';

const ONERI_LIMIT = 10;

// V3 mevzuat dönüşümü, madde 13-14: en az 8 örnek soru, yalnızca mevzuat
// türü doküman önerir (Şartname/Yönetmelik/Standart/Tebliğ/Resmi Gazete/
// TEDAŞ/TEİAŞ/EPDK/TS/IEC) — hesap önerisi YOK.
const ORNEK_SORULAR = [
  '2 km uzaktaki OG hattan branşman alınacak. Hangi şartnameler okunmalı?',
  'Yeni trafo tesisi kurulacak. Hangi TEDAŞ şartnameleri gerekir?',
  'XLPE kablo seçerken hangi standartlar kullanılmalı?',
  'Parafudr seçimi için hangi dokümanlara bakılır?',
  'Beton köşk kurulumu için hangi teknik şartnameler geçerlidir?',
  'Topraklama ölçümü hangi yönetmeliğe göre yapılır?',
  'OG ring şebekede hangi mevzuatlar uygulanır?',
  'Yeni dağıtım hattı yapılacak. Hangi yönetmelikler birlikte okunmalıdır?',
] as const;

export default function AiDestekScreen() {
  const router = useRouter();
  const tabBar = useRootTabBar();
  const [soru, setSoru] = useState('');
  const [sonuclar, setSonuclar] = useState<SearchResult[] | null>(null);

  const oneriGetir = (metin: string) => {
    setSonuclar(searchKeywords(metin));
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
                  <Text style={styles.sonucBaslik} numberOfLines={2}>{s.document.title}</Text>
                  <Text style={styles.sonucAlt}>
                    {s.document.institution} · {s.document.category}
                  </Text>
                  <Text style={styles.nedenText}>
                    Neden önerildi? Yazdığın ifadeyle anahtar kelime/etiket eşleşmesi (skor: {s.score}).
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
  ornekRow: { paddingHorizontal: spacing.m },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.m },
  chevron: { fontSize: 20, color: colors.textSecondary, marginLeft: 2 },
  sonucBaslik: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  sonucAlt: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 3 },
  nedenText: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 16 },
});
