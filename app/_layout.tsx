// Kök yerleşim: Expo Router yığını + splash + ilk açılış sorumluluk reddi.
// Not: React Query, Supabase ve RevenueCat, Expo Go'da hatasız açılış
// hedefi için geçici olarak devre dışı (bkz. src/lib/*.ts stub'ları).
import React, { useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavorilerProvider } from '../src/lib/favoriler';
import { SonSayfaProvider } from '../src/lib/sonSayfa.tsx';
import { AppSplash, useAppSplash } from '../src/components/AppSplash.tsx';
import { colors, spacing } from '../src/theme/index.ts';

export default function RootLayout() {
  const [onayVerildi, setOnayVerildi] = useState(false);
  const { splashVisible, splashOpacity, contentOpacity } = useAppSplash();

  return (
    <FavorilerProvider>
      <SonSayfaProvider>
        <StatusBar style="light" />
        <View style={styles.root}>
          <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '800' },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="sartname/index" options={{ headerShown: false }} />
              <Stack.Screen name="sartname/kategoriler" options={{ title: 'Kategoriler' }} />
              <Stack.Screen name="sartname/kategori/[kid]" options={{ title: 'Kategori' }} />
              <Stack.Screen name="sartname/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="pdf/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="ai" options={{ headerShown: false }} />
              <Stack.Screen name="profil" options={{ headerShown: false }} />
              <Stack.Screen name="favoriler" options={{ headerShown: false }} />
              <Stack.Screen name="veri-kaynaklari" options={{ headerShown: false }} />
              <Stack.Screen name="pdf-kapsam" options={{ headerShown: false }} />
              <Stack.Screen name="offline-kutuphane" options={{ headerShown: false }} />
              <Stack.Screen name="hakkinda" options={{ headerShown: false }} />
              {/*
                Aşağıdaki hesaplayicilar/* ve enh-bilgi/* rotaları V3 mevzuat
                dönüşümünde UI'dan (Ana Sayfa dahil hiçbir ekrandan) bağlantı
                verilmeyecek şekilde kaldırıldı — bkz. app/index.tsx üst yorumu
                ve KURULUM.md "Ürün Tanımı". Kod SİLİNMEDİ, yalnızca erişilemez
                hale getirildi; "navigation yapısı korunacak" kuralı gereği bu
                kayıtlar da kaldırılmadı.
              */}
              <Stack.Screen name="hesaplayicilar/index" options={{ title: 'Cep Hesaplayıcılar' }} />
              <Stack.Screen name="hesaplayicilar/gerilim-dusumu" options={{ title: 'Gerilim Düşümü' }} />
              <Stack.Screen name="hesaplayicilar/og-akim-tasima" options={{ title: 'OG Akım Taşıma Kapasitesi' }} />
              <Stack.Screen name="hesaplayicilar/enh-mekanik" options={{ title: 'ENH Mekanik Hesapları' }} />
              <Stack.Screen name="hesaplayicilar/beton-direk" options={{ title: 'Beton Direk Seçimi' }} />
              <Stack.Screen name="hesaplayicilar/direk-kuvvet" options={{ title: 'Direk Kuvvet Hesabı' }} />
              <Stack.Screen name="hesaplayicilar/buz-yuku" options={{ title: 'Buz Yükü Hesabı' }} />
              <Stack.Screen name="hesaplayicilar/sehim" options={{ title: 'Sehim Hesabı' }} />
              <Stack.Screen name="enh-bilgi/index" options={{ title: 'ENH Bilgi Bankası' }} />
              <Stack.Screen name="enh-bilgi/iletkenler" options={{ title: 'İletkenler' }} />
              <Stack.Screen name="enh-bilgi/iletken/[id]" options={{ title: 'İletken Detayı' }} />
              <Stack.Screen name="enh-bilgi/direk-siniflari" options={{ title: 'Direk Sınıfları' }} />
              <Stack.Screen name="enh-bilgi/direk-sinifi/[id]" options={{ title: 'Direk Sınıfı Detayı' }} />
              <Stack.Screen name="enh-bilgi/direk-malzemeleri" options={{ title: 'Direk Malzemeleri' }} />
              <Stack.Screen name="enh-bilgi/direk-malzemesi/[id]" options={{ title: 'Direk Malzemesi Detayı' }} />
              <Stack.Screen name="enh-bilgi/direk-devre-tipleri" options={{ title: 'Direk Devre Tipleri' }} />
              <Stack.Screen name="enh-bilgi/devre-tipi/[id]" options={{ title: 'Devre Tipi Detayı' }} />
              <Stack.Screen name="enh-bilgi/izolatorler" options={{ title: 'İzolatörler' }} />
              <Stack.Screen name="enh-bilgi/izolator/[id]" options={{ title: 'İzolatör Detayı' }} />
            </Stack>

            {/* İlk açılış sorumluluk reddi — splash bitmeden gösterilmez. */}
            <Modal visible={!onayVerildi && !splashVisible} transparent animationType="fade">
              <View style={styles.modalArka}>
                <View style={styles.modalKutu}>
                  <Text style={styles.modalBaslik}>Önemli Uyarı</Text>
                  <Text style={styles.modalMetin}>
                    Bu uygulamadaki şartname, yönetmelik, standart ve AI asistanı önerileri
                    yalnızca bilgilendirme ve saha pratiğine destek amaçlıdır; resmî hukuki
                    görüş niteliği taşımaz.
                    {'\n\n'}Kesin tasarım, işletme ve iş güvenliği kararlarında ilgili
                    yönetmelikler, TEDAŞ/dağıtım şirketi şartnameleri ve işvereninizin
                    talimatları esastır. Elektrik tesislerinde çalışma yetkinlik ve
                    yetkilendirme gerektirir.
                  </Text>
                  <Pressable style={styles.modalBtn} onPress={() => setOnayVerildi(true)}>
                    <Text style={styles.modalBtnText}>Okudum, anladım</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </Animated.View>

          {splashVisible && <AppSplash opacity={splashOpacity} />}
        </View>
      </SonSayfaProvider>
    </FavorilerProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  content: { flex: 1 },
  modalArka: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 35, 0.75)',
    justifyContent: 'center',
    padding: spacing.l,
  },
  modalKutu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.l,
  },
  modalBaslik: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: spacing.s },
  modalMetin: { fontSize: 14, color: colors.text, lineHeight: 21 },
  modalBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.l,
  },
  modalBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
