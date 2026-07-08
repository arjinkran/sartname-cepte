// Ana sekmeler (Ana Sayfa/Ara/AI/Profil) — 4 tab-kök ekranın tümünde aynı
// BottomNavigation görünümünü ve doğru aktif sekme tespitini paylaşmak için
// (Sprint UI-1B, rule 6/7 "aynı ... kullanılsın"). Yeni bir servis/iş
// mantığı DEĞİL — yalnızca gezinme/UI yardımcısıdır.
import { usePathname, useRouter } from 'expo-router';
import type { BottomNavTab } from '../components/ui/BottomNavigation.tsx';

interface RootTab extends BottomNavTab {
  route: string;
}

export const ROOT_TABS: readonly RootTab[] = [
  { id: 'home', label: 'Ana Sayfa', icon: '🏠', route: '/' },
  { id: 'search', label: 'Ara', icon: '🔍', route: '/sartname' },
  { id: 'ai', label: 'AI', icon: '✨', emphasized: true, route: '/ai' },
  { id: 'profile', label: 'Profil', icon: '👤', route: '/profil' },
];

function tabIdForPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/sartname')) return 'search';
  if (pathname.startsWith('/ai')) return 'ai';
  if (pathname.startsWith('/profil')) return 'profile';
  return '';
}

/** Home/Arama/AI/Profil ekranlarının tümünde aynı alt gezinmeyi verir. */
export function useRootTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeId = tabIdForPath(pathname);

  const onChange = (id: string) => {
    if (id === activeId) return;
    const tab = ROOT_TABS.find((t) => t.id === id);
    // `replace` (push değil): sekme geçişleri yığını büyütmemeli — geri tuşu
    // yalnızca gerçek içerik gezinmelerinde (arama sonucu, detay vb.) anlamlı
    // olmalı, sekme sekme dolaşma geçmişinde değil.
    if (tab) router.replace(tab.route);
  };

  return { tabs: ROOT_TABS, activeId, onChange };
}
