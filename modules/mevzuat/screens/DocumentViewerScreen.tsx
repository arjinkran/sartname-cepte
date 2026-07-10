// PDF Doküman Okuyucu — /pdf/:id (Sprint 8).
//
// Gerçek bir PDF görüntüleyicidir (react-native-webview üzerinden native
// PDF render'ı) — Expo Go uyumluluğu korunduğundan react-native-pdf gibi
// özel native modül GEREKTİREN paketler kullanılmadı (bkz.
// docs/PDF_ARCHITECTURE.md "Viewer mimarisi").
//
// ⚠️ Sayfa numarası TAKİBİ, WebView'ın PDF render'ı üzerinde gerçek bir
// scroll/sayfa olayı YAYINLAMAMASI nedeniyle (Expo Go'da native bir PDF.js
// entegrasyonu olmadan bu mümkün değil) MANUEL bir "kaldığım sayfa" imleci
// olarak çalışır — kullanıcı ileri/geri okları veya sayfa numarasıyla
// kendi ilerlemesini işaretler, bu numara `useSonSayfa()` (AsyncStorage)
// ile kalıcı olarak saklanır. Otomatik scroll-senkronize sayfa takibi,
// gelecekte gerçek bir native PDF renderer eklendiğinde mümkün olacaktır.
//
// Lazy: WebView yalnızca gerçek bir PDF kaynağı (`pdfKaynagi`) varken
// mount edilir; ekran kapandığında (route'tan çıkıldığında) WebView de
// unmount olur — PDF içeriği bellekte gereksiz tutulmaz (madde 17).
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavoriler } from '@/lib/favoriler';
import { useSonSayfa } from '@/lib/sonSayfa';
import { getDocumentById, getPdfPath, hasPdf, isPdfDownloadedLocally } from '@/data/library';
import { updateLastOpenedAt } from '@/offline/downloadRepository';
import { colors, radius, spacing, typography } from '@/theme';

export default function DocumentViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const document = id ? getDocumentById(id) : undefined;
  const { favoriMi, favoriDegistir } = useFavoriler();
  const { sonSayfaGetir, sonSayfaKaydet } = useSonSayfa();

  const [aramaAcik, setAramaAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [gecerliSayfa, setGecerliSayfa] = useState(() =>
    document ? sonSayfaGetir(document.id) ?? 1 : 1
  );

  // Sprint 13, madde 13: yerel (indirilmiş) bir dosya açılıyorsa son açılma
  // tarihi kalıcı kayda işlenir — Viewer, download MANAGER'ı ÇAĞIRMAZ,
  // yalnızca basit bir kayıt güncellemesi için repository'yi kullanır.
  useEffect(() => {
    if (document && isPdfDownloadedLocally(document.id)) {
      updateLastOpenedAt(document.id).catch(() => {});
    }
  }, [document?.id]);

  const geriDon = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!document || !hasPdf(document)) {
    return (
      <View style={styles.root}>
        <View style={[styles.ustCubuk, { paddingTop: insets.top + spacing.s }]}>
          <Pressable onPress={geriDon} hitSlop={10} style={styles.geriBtn}>
            <Text style={styles.geriIkon}>‹</Text>
          </Pressable>
          <Text style={styles.baslikText} numberOfLines={1}>Doküman bulunamadı</Text>
        </View>
        <View style={styles.bosKap}>
          <Text style={styles.bosText}>Bu doküman için PDF bulunamadı.</Text>
        </View>
      </View>
    );
  }

  const pdfKaynagi = getPdfPath(document.id);
  const toplamSayfa = document.pageCount;
  const favori = favoriMi(document.id);
  const cevrimdisi = isPdfDownloadedLocally(document.id);

  const sayfaDegistir = (yeniSayfa: number) => {
    const altSinir = Math.max(1, yeniSayfa);
    const sinirli = toplamSayfa ? Math.min(altSinir, toplamSayfa) : altSinir;
    setGecerliSayfa(sinirli);
    sonSayfaKaydet(document.id, sinirli);
  };

  return (
    <View style={styles.root}>
      {/* Üst çubuk — geri + doküman adı + PDF etiketi (madde 4) */}
      <View style={[styles.ustCubuk, { paddingTop: insets.top + spacing.s }]}>
        <Pressable onPress={geriDon} hitSlop={10} style={styles.geriBtn}>
          <Text style={styles.geriIkon}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.baslikText} numberOfLines={1}>{document.title}</Text>
        </View>
        {cevrimdisi && (
          <View style={[styles.pdfEtiket, styles.cevrimdisiEtiket]}>
            <Text style={styles.pdfEtiketText}>Çevrimdışı</Text>
          </View>
        )}
        <View style={styles.pdfEtiket}>
          <Text style={styles.pdfEtiketText}>PDF</Text>
        </View>
      </View>

      {/* Toolbar — geri (üstte), paylaş, favori, ara (madde 5) */}
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => Alert.alert('Paylaş', 'Bu özellik yakında eklenecek.')}
          style={styles.toolbarBtn}
          hitSlop={8}
        >
          <Text style={styles.toolbarIkon}>⇪</Text>
          <Text style={styles.toolbarLabel}>Paylaş</Text>
        </Pressable>
        <Pressable onPress={() => favoriDegistir(document.id)} style={styles.toolbarBtn} hitSlop={8}>
          <Text style={[styles.toolbarIkon, favori && styles.toolbarIkonAktif]}>{favori ? '★' : '☆'}</Text>
          <Text style={styles.toolbarLabel}>Favori</Text>
        </Pressable>
        <Pressable onPress={() => setAramaAcik((a) => !a)} style={styles.toolbarBtn} hitSlop={8}>
          <Text style={styles.toolbarIkon}>🔍</Text>
          <Text style={styles.toolbarLabel}>Ara</Text>
        </Pressable>
      </View>

      {/* PDF içi arama altyapısı — henüz OCR yok (madde 7) */}
      {aramaAcik && (
        <View style={styles.aramaKutu}>
          <TextInput
            style={styles.aramaInput}
            value={aramaMetni}
            onChangeText={setAramaMetni}
            placeholder="PDF içinde ara…"
            placeholderTextColor={colors.disabled}
          />
          <Text style={styles.aramaNot}>Bu PDF için metin araması henüz desteklenmiyor.</Text>
        </View>
      )}

      {/* Görüntüleyici */}
      <View style={styles.viewerKap}>
        {pdfKaynagi ? (
          <>
            {yukleniyor && (
              <View style={styles.yukleniyorKap}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            )}
            <WebView
              source={{ uri: pdfKaynagi }}
              style={styles.webview}
              onLoadEnd={() => setYukleniyor(false)}
              originWhitelist={['*']}
            />
          </>
        ) : (
          <View style={styles.bosKap}>
            <Text style={styles.bosText}>PDF kaynağı okunamadı.</Text>
          </View>
        )}
      </View>

      {/* Alt sayfa bilgisi — ileri/geri/sayfa numarası (madde 6) */}
      <View style={[styles.altCubuk, { paddingBottom: insets.bottom + spacing.s }]}>
        <Pressable onPress={() => sayfaDegistir(gecerliSayfa - 1)} hitSlop={10} disabled={gecerliSayfa <= 1}>
          <Text style={[styles.sayfaOk, gecerliSayfa <= 1 && styles.sayfaOkPasif]}>‹</Text>
        </Pressable>
        <Text style={styles.sayfaText}>
          Sayfa {gecerliSayfa}{toplamSayfa ? ` / ${toplamSayfa}` : ''}
        </Text>
        <Pressable
          onPress={() => sayfaDegistir(gecerliSayfa + 1)}
          hitSlop={10}
          disabled={toplamSayfa ? gecerliSayfa >= toplamSayfa : false}
        >
          <Text style={[styles.sayfaOk, toplamSayfa != null && gecerliSayfa >= toplamSayfa && styles.sayfaOkPasif]}>
            ›
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  ustCubuk: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
  },
  geriBtn: { paddingRight: spacing.xs, paddingVertical: 2 },
  geriIkon: { color: '#FFFFFF', fontSize: 28, fontWeight: '600', lineHeight: 28 },
  baslikText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
  },
  pdfEtiket: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.s,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: spacing.s,
  },
  pdfEtiketText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  cevrimdisiEtiket: { backgroundColor: 'rgba(46,204,113,0.35)' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.s,
  },
  toolbarBtn: { alignItems: 'center', gap: 2, paddingHorizontal: spacing.m },
  toolbarIkon: { fontSize: 18, color: colors.textSecondary },
  toolbarIkonAktif: { color: colors.accent },
  toolbarLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  aramaKutu: {
    padding: spacing.m,
    backgroundColor: colors.secondaryBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  aramaInput: {
    backgroundColor: colors.background,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  aramaNot: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: spacing.xs },
  viewerKap: { flex: 1 },
  webview: { flex: 1 },
  yukleniyorKap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  bosKap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.l },
  bosText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  altCubuk: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.l,
    paddingTop: spacing.s,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sayfaOk: { fontSize: 26, color: colors.primary, fontWeight: '700', paddingHorizontal: spacing.m },
  sayfaOkPasif: { color: colors.disabled },
  sayfaText: { fontSize: typography.size.sm, fontWeight: '700', color: colors.textPrimary, minWidth: 90, textAlign: 'center' },
});
