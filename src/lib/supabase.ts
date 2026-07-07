// Supabase — GEÇİCİ OLARAK DEVRE DIŞI (stub).
//
// Neden: Expo Go'da "private properties are not supported" hatasını
// çözmek için bağımlılıklar minimuma indirildi. @supabase/supabase-js
// modern sınıf sözdizimi (#private alanlar) içeren paketlerden biridir
// ve eski Hermes motorlarında paketin çözümlenmesi (parse) sırasında
// bu hatayı tetikleyebilir.
//
// Faz 3'te (şartname içeriği) yeniden etkinleştirilecek:
//   npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
// ve bu dosyadaki eski createClient kodu geri getirilecek (git geçmişinde mevcut).
//
// Uygulama şu an %100 çevrimdışı çalışır — saha uygulaması için ana ilkemiz.

export const supabase: null = null;

/** Supabase yapılandırılmış mı? (UI'da durum göstermek için) */
export const supabaseAktif = false;
