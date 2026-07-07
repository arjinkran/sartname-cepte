// Favori dokümanlar — yerel (in-memory) durum yönetimi.
// Şimdilik uygulama açık kaldığı sürece korunur; kalıcı saklama
// (AsyncStorage) sonraki sürümde eklenecek — arayüz değişmeyecek.
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface FavorilerDurumu {
  favoriIdler: ReadonlySet<string>;
  favoriMi: (id: string) => boolean;
  favoriDegistir: (id: string) => void;
}

const FavorilerContext = createContext<FavorilerDurumu | null>(null);

export function FavorilerProvider({ children }: { children: React.ReactNode }) {
  const [idler, setIdler] = useState<ReadonlySet<string>>(new Set());

  const favoriDegistir = useCallback((id: string) => {
    setIdler((eski) => {
      const yeni = new Set(eski);
      if (yeni.has(id)) {
        yeni.delete(id);
      } else {
        yeni.add(id);
      }
      return yeni;
    });
  }, []);

  const deger = useMemo<FavorilerDurumu>(
    () => ({
      favoriIdler: idler,
      favoriMi: (id: string) => idler.has(id),
      favoriDegistir,
    }),
    [idler, favoriDegistir]
  );

  return <FavorilerContext.Provider value={deger}>{children}</FavorilerContext.Provider>;
}

export function useFavoriler(): FavorilerDurumu {
  const ctx = useContext(FavorilerContext);
  if (!ctx) throw new Error('useFavoriler, FavorilerProvider içinde kullanılmalı');
  return ctx;
}
