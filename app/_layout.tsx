// Kök yerleşim: Expo Router yığını + ilk açılış sorumluluk reddi.
// Not: React Query, Supabase ve RevenueCat, Expo Go'da hatasız açılış
// hedefi için geçici olarak devre dışı (bkz. src/lib/*.ts stub'ları).
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavorilerProvider } from '../src/lib/favoriler';
import { colors, spacing } from '../src/theme';

export default function RootLayout() {
  const [onayVerildi, setOnayVerildi] = useState(false);

  return (
    <FavorilerProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Şartname Cepte' }} />
        <Stack.Screen name="sartname/index" options={{ title: 'Şartname / Mevzuat' }} />
        <Stack.Screen name="sartname/kategoriler" options={{ title: 'Kategoriler' }} />
        <Stack.Screen name="sartname/kategori/[kid]" options={{ title: 'Kategori' }} />
        <Stack.Screen name="sartname/[id]" options={{ title: 'Bilgi Kartı' }} />
        <Stack.Screen name="hesaplayicilar/index" options={{ title: 'Cep Hesaplayıcılar' }} />
        <Stack.Screen name="hesaplayicilar/gerilim-dusumu" options={{ title: 'Gerilim Düşümü' }} />
      </Stack>

      {/* İlk açılış sorumluluk reddi */}
      <Modal visible={!onayVerildi} transparent animationType="fade">
        <View style={styles.modalArka}>
          <View style={styles.modalKutu}>
            <Text style={styles.modalBaslik}>Önemli Uyarı</Text>
            <Text style={styles.modalMetin}>
              Bu uygulamadaki hesaplar, kontrol listeleri ve İSG içerikleri yalnızca
              bilgilendirme ve saha pratiğine destek amaçlıdır.
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
    </FavorilerProvider>
  );
}

const styles = StyleSheet.create({
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
