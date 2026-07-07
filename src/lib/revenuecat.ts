// RevenueCat — GEÇİCİ OLARAK TAM MOCK (paket projeden kaldırıldı).
//
// Neden: react-native-purchases NATIVE bir modüldür ve Expo Go'da çalışamaz.
// Ayrıca Metro, "dinamik" import edilse bile paketi JS demetine (bundle)
// dahil eder; eski Hermes motorları demeti çözümlerken modern sözdizimine
// takılabilir. Expo Go'da hatasız açılış hedefi için paket tamamen çıkarıldı.
//
// Yayın öncesi (EAS development build aşamasında) yeniden eklenecek:
//   npx expo install react-native-purchases
// ve bu mock, gerçek sarmalayıcıyla değiştirilecek. Ekranlar bu modülün
// arayüzünü kullandığı sürece hiçbir ekran kodu değişmeyecek.

export const expoGoIcinde = true;

/** Mock: satın alma altyapısı bu sürümde devre dışı. */
export async function revenueCatBaslat(): Promise<boolean> {
  return false;
}

/** Mock: aktif satın alma bilgisi bilinmiyor (null). */
export async function aktifSatinAlmaVarMi(): Promise<boolean | null> {
  return null;
}
