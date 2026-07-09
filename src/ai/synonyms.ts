// Eşanlamlı terim sözlüğü (Sprint 7, madde 3).
// Saha personelinin kullandığı farklı isimlendirmeleri tek bir "kanonik"
// terime indirger — kütüphanedeki `keywords`/`title` alanlarıyla birebir
// aynı sözcüğü kullanmayan sorguların da doğru belgeleri bulmasını sağlar.
import { normallestir } from '../data/library/repository.ts';
import type { SynonymMatch } from './types.ts';

export interface SynonymGroup {
  /** Kanonik (normalleştirilmiş aramalarda kullanılacak) terim. */
  readonly canonical: string;
  /** Kanonik terimle eş anlamlı kabul edilen tüm varyantlar (kanonik dahil). */
  readonly terms: readonly string[];
}

export const SYNONYM_GROUPS: readonly SynonymGroup[] = [
  {
    canonical: 'og',
    terms: ['og', 'orta gerilim', 'yg altı', '34.5 kv', '34,5 kv', '15.8 kv', '15,8 kv', '25.8 kv', '25,8 kv', '36 kv'],
  },
  {
    canonical: 'ag',
    terms: ['ag', 'alçak gerilim', '0.4 kv', '0,4 kv', '400v', '230v', '0,4kv'],
  },
  {
    canonical: 'branşman',
    terms: ['branşman', 'hat ayrımı', 'hat çıkışı', 'çıkış hattı'],
  },
  {
    canonical: 'xlpe kablo',
    terms: ['xlpe', 'yeraltı kablosu', 'güç kablosu', 'pvc kablo', 'nyy', 'yvv'],
  },
  {
    canonical: 'topraklama',
    terms: [
      'topraklama', 'eşpotansiyel', 'pe hattı', 'koruma iletkeni', 'kaçak akım',
      'dokunma gerilimi', 'adım gerilimi', 'toprak direnci',
    ],
  },
  {
    canonical: 'trafo',
    terms: ['trafo', 'transformatör', 'dağıtım trafosu', 'güç trafosu', 'köşk', 'beton köşk'],
  },
  {
    canonical: 'ring',
    terms: ['ring', 'loop', 'kapalı ring', 'halka şebeke'],
  },
  {
    canonical: 'havai hat',
    terms: ['havai hat', 'enh', 'enerji nakil hattı', 'açık hat', 'üstten hat'],
  },
  {
    canonical: 'parafudr',
    terms: ['parafudr', 'surge arrester', 'aşırı gerilim koruması'],
  },
  {
    canonical: 'kesici',
    terms: ['kesici', 'devre kesici', 'güç kesicisi', 'vakumlu kesici', 'sf6 kesici'],
  },
  {
    canonical: 'ayırıcı',
    terms: ['ayırıcı', 'yük ayırıcı', 'seksiyoner'],
  },
  {
    canonical: 'sayaç',
    terms: ['sayaç', 'elektrik sayacı', 'endeks', 'sayaç panosu'],
  },
  {
    canonical: 'kompanzasyon',
    terms: ['kompanzasyon', 'reaktif güç', 'kondansatör grubu', 'kondansatör'],
  },
  {
    canonical: 'ölçü trafosu',
    terms: ['ölçü trafosu', 'akım trafosu', 'gerilim trafosu'],
  },
  {
    canonical: 'direk',
    terms: ['direk', 'beton direk', 'demir direk', 'çelik direk', 'santrifüj direk'],
  },
  {
    canonical: 'travers',
    terms: ['travers', 'çapraz kol'],
  },
  {
    canonical: 'izolatör',
    terms: ['izolatör', 'post izolatör', 'askı izolatör', 'zincir izolatör'],
  },
  {
    canonical: 'hizmet kalitesi',
    terms: ['hizmet kalitesi', 'kesinti süresi', 'oksure', 'oksayi', 'saidi', 'saifi'],
  },
  {
    canonical: 'bağlantı',
    terms: ['bağlantı anlaşması', 'sistem kullanım anlaşması', 'bağlantı görüşü', 'bağlantı'],
  },
  {
    canonical: 'kabul',
    terms: ['geçici kabul', 'kesin kabul', 'muayene'],
  },
];

/**
 * Sorgu metnini normalleştirip her eşanlamlı grubun terimlerinden biriyle
 * eşleşip eşleşmediğini kontrol eder. Bir gruptan yalnızca İLK eşleşen
 * terim raporlanır (aynı grup için tekrar tekrar eşleşme raporlanmaz).
 */
export function findSynonymMatches(query: string): SynonymMatch[] {
  const q = normallestir(query);
  if (q.length === 0) return [];

  const matches: SynonymMatch[] = [];
  for (const group of SYNONYM_GROUPS) {
    for (const term of group.terms) {
      if (q.includes(normallestir(term))) {
        matches.push({ canonical: group.canonical, matchedTerm: term });
        break;
      }
    }
  }
  return matches;
}
