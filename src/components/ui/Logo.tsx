// Resmi marka logosu — TEK kaynak: assets/branding/logo.png (+ @2x/@3x,
// Metro'nun yoğunluk çözümlemesi otomatik seçer). Bu bileşen dışında
// hiçbir yerde farklı bir logo/ikon/emoji marka temsili olarak
// kullanılmamalıdır (bkz. docs/BRANDING.md "Yasak kullanımlar").
//
// Kasıtlı olarak eklenmeyenler: borderRadius/clip, shadow, tint, gradient
// — logo zaten kendi köşeleri/arka planıyla birlikte tek parça bir
// görseldir; üzerine efekt eklemek "Logo efekti ekleme" yasağını ihlal eder.
import React from 'react';
import { Image, type StyleProp, type ImageStyle } from 'react-native';

const LOGO_SOURCE = require('../../../assets/branding/logo.png');

export function Logo({
  size = 28,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={LOGO_SOURCE}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
      accessibilityLabel="Şartname Cepte"
    />
  );
}
