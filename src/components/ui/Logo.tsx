// Resmi marka logosu (Sprint 6.5 — yeni kurumsal logo) — TEK marka kaynağı:
// assets/branding/logo-*.png. Bu bileşen dışında hiçbir yerde farklı bir
// logo/ikon/emoji marka temsili olarak kullanılmamalıdır (bkz.
// docs/BRANDING.md "Yasak kullanımlar").
//
// `variant`, aynı logonun hangi önceden-render edilmiş çözünürlükte
// yükleneceğini seçer — component API'si (size/style) DEĞİŞMEDİ, yalnızca
// hangi dosyanın kullanılacağı eklendi:
// - navbar      : AppBar'daki küçük logo (30-32px kullanım) — HER ZAMAN lacivert
//                 (colors.primary) zemin üzerinde, bu yüzden BEYAZ/negatif logo.
// - splash      : Splash ekranı (110-120px kullanım) — HER ZAMAN lacivert zemin,
//                 BEYAZ/negatif logo.
// - small       : Açık zeminler üzerindeki küçük kullanımlar (kart ikonu, boş
//                 durum, Hakkında hero, vb.) — orijinal koyu lacivert logo.
// - smallReverse: Lacivert (colors.primary) ZEMİNLİ küçük kart kullanımları
//                 (ör. AI kartı ikonu, Profil Pro kartı) — BEYAZ/negatif logo.
//
// ⚠️ Logonun kendi koyu rengi (#081D3A) uygulamanın lacivert marka rengiyle
// (colors.primary, #0B1F3A) neredeyse özdeştir — orijinal logo lacivert
// zemin üzerinde GÖRÜNMEZ olur. Bu yüzden navbar/splash/smallReverse için
// tüm opak pikselleri beyaza çeviren bir "reverse" varyant üretildi (bkz.
// docs/BRANDING.md "Zemine göre logo seçimi"). Bu bir efekt/gölge/gradient
// DEĞİLDİR — standart marka kılavuzu uygulamasıdır (ters/mono logo).
//
// Kasıtlı olarak eklenmeyenler: borderRadius/clip, shadow, tint, gradient
// — logo zaten kendi köşeleri/arka planıyla birlikte tek parça bir
// görseldir; üzerine efekt eklemek "Logo efekti ekleme" yasağını ihlal eder.
import React from 'react';
import { Image, type StyleProp, type ImageStyle } from 'react-native';

const LOGO_SOURCES = {
  navbar: require('../../../assets/branding/logo-navbar.png'),
  splash: require('../../../assets/branding/logo-splash.png'),
  small: require('../../../assets/branding/logo-small.png'),
  smallReverse: require('../../../assets/branding/logo-small-reverse.png'),
} as const;

export type LogoVariant = keyof typeof LOGO_SOURCES;

export function Logo({
  size = 28,
  variant = 'small',
  style,
}: {
  size?: number;
  variant?: LogoVariant;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={LOGO_SOURCES[variant]}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
      accessibilityLabel="Şartname Cepte"
    />
  );
}
