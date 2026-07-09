// Uygulama içi splash ekranı — app.json'daki native/statik splash'tan
// AYRIDIR; JS yüklendikten sonra bir kez gösterilir: 3 sn sabit lacivert
// zemin + resmi logo + "Şartname Cepte" yazısı, ardından 350ms fade out →
// fade in ile ana içeriğe geçer. Yalnızca React Native Animated API
// kullanılır. `useAppSplash`, kök layout'ta (app/_layout.tsx) bir kez
// çağrılır; route değişimlerinde RootLayout yeniden mount edilmediği için
// splash tekrar görünmez.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Logo } from './ui/Logo.tsx';
import { colors, durations, typography } from '../theme/index.ts';

export function useAppSplash() {
  const [splashVisible, setSplashVisible] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: durations.splashFade,
        useNativeDriver: true,
      }).start(() => {
        setSplashVisible(false);
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: durations.splashFade,
          useNativeDriver: true,
        }).start();
      });
    }, durations.splashHold);

    return () => clearTimeout(holdTimer);
  }, [splashOpacity, contentOpacity]);

  return { splashVisible, splashOpacity, contentOpacity };
}

export function AppSplash({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity }]} pointerEvents="none">
      <Logo size={116} variant="splash" style={styles.logo} />
      <Text style={styles.text}>Şartname Cepte</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { marginBottom: 24 },
  text: {
    color: '#FFFFFF',
    fontSize: typography.size.display,
    fontWeight: typography.weight.extrabold,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.2,
  },
});
