// Offline Kütüphane ekranı — /offline-kutuphane (Sprint 13, madde 15).
// Kullanıcının cihaza GERÇEKTEN indirdiği PDF'leri listeler — veriler
// download repository'den (AsyncStorage) gelir, elle yazılan bir liste
// YOKTUR.
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Button, Card, EmptyState } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { getDocumentById } from '@/data/library';
import { getAllDownloadRecords } from '@/offline/downloadRepository';
import { deleteDownloadedPdf } from '@/offline/downloadManager';
import { subscribeToQueue } from '@/offline/downloadQueue';
import type { DownloadRecord } from '@/offline/downloadTypes';

function boyutGoster(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tarihGoster(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('tr-TR');
  } catch {
    return iso;
  }
}

export default function OfflineKutuphaneScreen() {
  const router = useRouter();
  const [kayitlar, setKayitlar] = useState<DownloadRecord[] | null>(null);

  const yukle = useCallback(() => {
    getAllDownloadRecords()
      .then((liste) => setKayitlar([...liste].sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt))))
      .catch(() => setKayitlar([]));
  }, []);

  useEffect(() => {
    yukle();
    // Bu ekran açıkken bir indirme tamamlanırsa liste otomatik güncellenir.
    const unsubscribe = subscribeToQueue((state) => {
      if (state.items.some((i) => i.status === 'completed' || i.status === 'failed' || i.status === 'cancelled')) yukle();
    });
    return unsubscribe;
  }, [yukle]);

  const kaldir = (kayit: DownloadRecord) => {
    const doc = getDocumentById(kayit.documentId);
    Alert.alert(
      'PDF cihazdan kaldırılsın mı?',
      `${doc?.title ?? kayit.documentId} dokümanının indirilmiş dosyası cihazdan kaldırılacak.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            await deleteDownloadedPdf(kayit.documentId);
            yukle();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <AppBar title="Offline Kütüphane" logo onBack={router.canGoBack() ? () => router.back() : undefined} />
      {kayitlar === null ? (
        <View style={styles.yukleniyorKap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : kayitlar.length === 0 ? (
        <View style={styles.bosKap}>
          <EmptyState
            logo
            title="Henüz indirilen PDF yok"
            description="Bir dokümanın 'Resmî Kaynak Durumu' bölümünden 'PDF Bulmayı Dene' ile arayıp doğrulanmış bir kaynak bulursan cihazına indirebilirsin."
          />
        </View>
      ) : (
        <FlatList
          data={kayitlar}
          keyExtractor={(k) => k.documentId}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => {
            const doc = getDocumentById(item.documentId);
            return (
              <Card style={styles.kart}>
                <Text style={styles.baslik} numberOfLines={2}>{doc?.title ?? item.documentId}</Text>
                <Text style={styles.altSatir}>{item.institution} · {boyutGoster(item.fileSize)}</Text>
                <Text style={styles.altSatir}>İndirilme: {tarihGoster(item.downloadedAt)} · Son açılma: {tarihGoster(item.lastOpenedAt)}</Text>
                <View style={styles.etiketSatiri}>
                  <View style={styles.etiket}>
                    <Text style={styles.etiketText}>Çevrimdışı</Text>
                  </View>
                  {item.checksumStatus === 'available' && (
                    <View style={styles.etiket}>
                      <Text style={styles.etiketText}>Bütünlük doğrulandı</Text>
                    </View>
                  )}
                </View>
                <View style={styles.aksiyonlar}>
                  <Button label="Aç" variant="primary" onPress={() => router.push(`/pdf/${item.documentId}`)} style={{ flex: 1 }} />
                  <Button label="Cihazdan Kaldır" variant="secondary" onPress={() => kaldir(item)} style={{ flex: 1 }} />
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondaryBackground },
  yukleniyorKap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bosKap: { flex: 1, justifyContent: 'center' },
  liste: { padding: spacing.m, paddingBottom: 48 },
  kart: { marginBottom: spacing.m },
  baslik: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  altSatir: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  etiketSatiri: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.s },
  etiket: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  etiketText: { fontSize: 11, fontWeight: '700', color: colors.primaryLight },
  aksiyonlar: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.m },
});
