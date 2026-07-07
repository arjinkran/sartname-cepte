// Doküman detay ekranı — /sartname/:id
// Başlık, künye (kurum, kategori, tür, tarihler, durum), özet,
// ilgili maddeler, sahada önemli noktalar, kaynak bağlantısı, favori.
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { DOKUMANLAR, KATEGORILER, DURUM_ETIKETLERI } from '../../src/data/sartnameler';
import { KurumRozeti, DurumRozeti } from '../../src/components/DokumanSatiri';
import { useFavoriler } from '../../src/lib/favoriler';
import { Card } from '../../src/components/UI';
import { colors, spacing, radius } from '../../src/theme';

function KunyeSatiri({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <View style={styles.kunyeSatir}>
      <Text style={styles.kunyeEtiket}>{etiket}</Text>
      <Text style={styles.kunyeDeger}>{deger}</Text>
    </View>
  );
}

export default function DokumanDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dokuman = DOKUMANLAR.find((d) => d.id === id);
  const { favoriMi, favoriDegistir } = useFavoriler();

  if (!dokuman) {
    return (
      <View style={styles.bosKap}>
        <Text style={styles.bosText}>Doküman bulunamadı.</Text>
      </View>
    );
  }

  const kategori = KATEGORILER.find((k) => k.id === dokuman.kategoriId);
  const favori = favoriMi(dokuman.id);

  const kaynagiAc = () => {
    if (dokuman.kaynakBaglanti) {
      Linking.openURL(dokuman.kaynakBaglanti).catch(() => {
        // Bağlantı açılamazsa sessiz geç — çevrimdışı sahada normaldir.
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Bilgi Kartı' }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.m, paddingBottom: 48 }}>
        <Card>
          <View style={styles.ustSatir}>
            <KurumRozeti kurum={dokuman.kurum} />
            <DurumRozeti durum={dokuman.durum} />
          </View>
          <Text style={styles.baslik}>{dokuman.baslik}</Text>

          <Pressable
            onPress={() => favoriDegistir(dokuman.id)}
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

        {dokuman.ornek && (
          <View style={styles.ornekUyari}>
            <Text style={styles.ornekUyariText}>
              ⚠️ Örnek/taslak içerik: Bu kartın bilgileri henüz resmî kaynaktan birebir
              doğrulanmadı. Karar verirken resmî metni esas alın.
            </Text>
          </View>
        )}

        <Card>
          <Text style={styles.bolumBaslik}>Künye</Text>
          <KunyeSatiri etiket="Kurum" deger={dokuman.kurum} />
          <KunyeSatiri etiket="Kategori" deger={kategori ? `${kategori.ikon} ${kategori.ad}` : '—'} />
          <KunyeSatiri etiket="Doküman türü" deger={dokuman.dokumanTuru} />
          <KunyeSatiri etiket="Yayın tarihi" deger={dokuman.yayinTarihi} />
          <KunyeSatiri etiket="Yürürlük tarihi" deger={dokuman.yururlukTarihi} />
          <KunyeSatiri etiket="Durum" deger={DURUM_ETIKETLERI[dokuman.durum]} />
          <KunyeSatiri etiket="Doküman no" deger={dokuman.kaynakNo} />
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Kısa Özet</Text>
          <Text style={styles.ozet}>{dokuman.ozet}</Text>
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>İlgili Maddeler</Text>
          {dokuman.ilgiliMaddeler.map((m, i) => (
            <View key={i} style={styles.madde}>
              <View style={styles.maddeNoKutu}>
                <Text style={styles.maddeNo}>{m.no}</Text>
              </View>
              <Text style={styles.maddeText}>{m.aciklama}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Sahada Önemli Noktalar</Text>
          {dokuman.onemliNoktalar.map((n, i) => (
            <View key={i} style={styles.nokta}>
              <Text style={styles.noktaIsaret}>▸</Text>
              <Text style={styles.maddeText}>{n}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.bolumBaslik}>Kaynak</Text>
          <Text style={styles.kaynakText}>{dokuman.kaynakNo}</Text>
          {dokuman.kaynakBaglanti ? (
            <Pressable
              onPress={kaynagiAc}
              style={({ pressed }) => [styles.kaynakBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.kaynakBtnText}>🔗 Resmî kaynağı aç</Text>
              <Text style={styles.kaynakUrl} numberOfLines={1}>{dokuman.kaynakBaglanti}</Text>
            </Pressable>
          ) : (
            <Text style={styles.kaynakNot}>Bağlantı henüz eklenmedi.</Text>
          )}
          <Text style={styles.kaynakNot}>
            Bu kart bilgilendirme amaçlı bir özettir; bağlayıcı olan resmî metindir.
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
  ornekUyari: {
    backgroundColor: '#FBE9C9',
    borderRadius: radius.s,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  ornekUyariText: { fontSize: 13, color: '#8C6D1F', lineHeight: 19 },
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
  ozet: { fontSize: 15, color: colors.text, lineHeight: 23 },
  madde: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.s },
  maddeNoKutu: {
    backgroundColor: '#E8EEF5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: spacing.s,
    minWidth: 64,
    alignItems: 'center',
  },
  maddeNo: { fontSize: 12, fontWeight: '800', color: colors.primaryLight },
  maddeText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 22 },
  nokta: { flexDirection: 'row', marginBottom: spacing.s },
  noktaIsaret: { fontSize: 15, color: colors.accent, marginRight: spacing.s, lineHeight: 22 },
  kaynakText: { fontSize: 14, fontWeight: '600', color: colors.text },
  kaynakBtn: {
    marginTop: spacing.s,
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    padding: spacing.m,
  },
  kaynakBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  kaynakUrl: { color: '#B9C9DB', fontSize: 12, marginTop: 2 },
  kaynakNot: { fontSize: 12, color: colors.textMuted, marginTop: spacing.s, lineHeight: 17 },
});
