// Offline Kütüphane ekranı — /offline-kutuphane
// Henüz indirme YOK (V3 mevzuat dönüşümü, madde 19) — yalnızca "yakında"
// mesajı gösterir, yeni bir servis/depolama eklenmedi.
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, EmptyState } from '@/components/ui';
import { colors } from '@/theme';

export default function OfflineKutuphaneScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.secondaryBackground }}>
      <AppBar title="Offline Kütüphane" onBack={router.canGoBack() ? () => router.back() : undefined} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon="📥"
          title="Yakında"
          description="Favori şartnamelerini cihazına indirerek internetsiz kullanabileceksin."
        />
      </View>
    </View>
  );
}
