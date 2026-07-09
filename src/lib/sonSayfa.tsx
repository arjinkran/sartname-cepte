// Son okunan sayfa — PDF Viewer'da kaldığın sayfayı hatırlar (Sprint 8,
// madde 8: "Kullanıcı son kaldığı sayfa bilgisini saklayabilmeli. Document
// ID ↓ Last Page eşleşmesi tutulmalı. Henüz cloud sync yapılmayacak. Local
// storage yeterli."). `favoriler.tsx`'in aksine bu GERÇEKTEN kalıcıdır
// (AsyncStorage) — bu, "AsyncStorage sonraki sürümde eklenecek" notunun
// karşılığı olan ilk gerçek kalıcı depolama kullanımıdır.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sartname-cepte:son-sayfa';

interface SonSayfaDurumu {
  /** `documentId → son kalınan sayfa numarası` eşlemesi. */
  sayfalar: Readonly<Record<string, number>>;
  sonSayfaGetir: (documentId: string) => number | undefined;
  sonSayfaKaydet: (documentId: string, sayfa: number) => void;
  /** AsyncStorage'dan ilk okuma tamamlandı mı — yükleme sırasında `false`. */
  hazir: boolean;
}

const SonSayfaContext = createContext<SonSayfaDurumu | null>(null);

export function SonSayfaProvider({ children }: { children: React.ReactNode }) {
  const [sayfalar, setSayfalar] = useState<Record<string, number>>({});
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    let iptalEdildi = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((ham) => {
        if (iptalEdildi || !ham) return;
        try {
          const ayristirildi = JSON.parse(ham) as Record<string, number>;
          setSayfalar(ayristirildi);
        } catch {
          // Bozuk kayıt — sessizce sıfırdan başla, uygulamayı çökertme.
        }
      })
      .finally(() => {
        if (!iptalEdildi) setHazir(true);
      });
    return () => {
      iptalEdildi = true;
    };
  }, []);

  const sonSayfaKaydet = useCallback((documentId: string, sayfa: number) => {
    setSayfalar((eski) => {
      const yeni = { ...eski, [documentId]: sayfa };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(yeni)).catch(() => {
        // Yazma hatası kullanıcı deneyimini bozmasın — sessizce yut.
      });
      return yeni;
    });
  }, []);

  const sonSayfaGetir = useCallback((documentId: string) => sayfalar[documentId], [sayfalar]);

  const deger = useMemo<SonSayfaDurumu>(
    () => ({ sayfalar, sonSayfaGetir, sonSayfaKaydet, hazir }),
    [sayfalar, sonSayfaGetir, sonSayfaKaydet, hazir]
  );

  return <SonSayfaContext.Provider value={deger}>{children}</SonSayfaContext.Provider>;
}

export function useSonSayfa(): SonSayfaDurumu {
  const ctx = useContext(SonSayfaContext);
  if (!ctx) throw new Error('useSonSayfa, SonSayfaProvider içinde kullanılmalı');
  return ctx;
}
