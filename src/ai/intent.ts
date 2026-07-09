// Kullanıcı niyeti (intent) tespiti (Sprint 7, madde 2).
// Bir soru BİRDEN FAZLA niyet içerebilir — tüm eşleşen niyetler döner,
// ilk eşleşmede durulmaz.
import { normallestir } from '../data/library/repository.ts';
import type { Intent } from './types.ts';

interface IntentDefinition {
  readonly intent: Intent;
  /** Sorguda GEÇMESİ aranan, normalleştirilmiş tetikleyici ifadeler. */
  readonly triggers: readonly string[];
  /** Bu niyetle örtüşen kütüphane `category` alan değerleri (varsa). */
  readonly categoryHints?: readonly string[];
}

const INTENT_DEFINITIONS: readonly IntentDefinition[] = [
  { intent: 'branşman', triggers: ['branşman', 'hat ayrımı', 'hat çıkışı', 'çıkış hattı'] },
  { intent: 'trafo', triggers: ['trafo', 'transformatör', 'köşk', 'beton köşk', 'dağıtım trafosu', 'güç trafosu'], categoryHints: ['Trafo'] },
  { intent: 'kablo', triggers: ['kablo', 'xlpe', 'kablo eki', 'ek mufu', 'kablo başlığı', 'mufl'], categoryHints: ['Kablolar'] },
  { intent: 'og', triggers: ['og', 'orta gerilim'] },
  { intent: 'ag', triggers: ['ag', 'alçak gerilim'] },
  { intent: 'ring', triggers: ['ring', 'loop', 'halka şebeke', 'kapalı ring'] },
  { intent: 'havai-hat', triggers: ['havai hat', 'enh', 'enerji nakil hattı', 'açık hat'] },
  { intent: 'yeraltı-kablosu', triggers: ['yeraltı kablosu', 'yeraltı', 'gömme kablo'] },
  { intent: 'topraklama', triggers: ['topraklama', 'toprak direnci', 'eşpotansiyel', 'dokunma gerilimi', 'adım gerilimi'], categoryHints: ['Topraklama'] },
  { intent: 'parafudr', triggers: ['parafudr', 'surge arrester', 'aşırı gerilim'], categoryHints: ['Parafudr'] },
  { intent: 'kesici', triggers: ['kesici', 'devre kesici', 'güç kesici', 'vakumlu kesici', 'sf6 kesici'], categoryHints: ['Kesiciler'] },
  { intent: 'ayırıcı', triggers: ['ayırıcı', 'yük ayırıcı', 'seksiyoner'], categoryHints: ['Ayırıcılar'] },
  { intent: 'koruma', triggers: ['koruma', 'sigorta', 'röle'], categoryHints: ['Koruma'] },
  { intent: 'sayaç', triggers: ['sayaç', 'sayaç panosu', 'endeks'], categoryHints: ['Sayaç'] },
  { intent: 'kompanzasyon', triggers: ['kompanzasyon', 'reaktif güç', 'kondansatör'], categoryHints: ['Kompanzasyon'] },
  { intent: 'ölçü-trafosu', triggers: ['ölçü trafosu', 'akım trafosu', 'gerilim trafosu'], categoryHints: ['Ölçü'] },
  { intent: 'direk', triggers: ['direk', 'beton direk', 'demir direk', 'çelik direk'], categoryHints: ['Direkler'] },
  { intent: 'travers', triggers: ['travers', 'çapraz kol'], categoryHints: ['Direkler'] },
  { intent: 'izolatör', triggers: ['izolatör', 'post izolatör', 'askı izolatör'], categoryHints: ['İzolatörler'] },
  { intent: 'hizmet-kalitesi', triggers: ['hizmet kalitesi', 'kesinti', 'oksure', 'oksayi'], categoryHints: ['Hizmet Kalitesi'] },
  { intent: 'bağlantı', triggers: ['bağlantı anlaşması', 'sistem kullanım', 'bağlantı görüşü', 'bağlantı'], categoryHints: ['Enerji Piyasası'] },
  { intent: 'proje', triggers: ['proje', 'projelendirme'] },
  { intent: 'kabul', triggers: ['kabul', 'geçici kabul', 'kesin kabul'] },
  { intent: 'işletme', triggers: ['işletme', 'işletmeye alma'] },
  { intent: 'bakım', triggers: ['bakım', 'periyodik bakım'] },
  { intent: 'arıza', triggers: ['arıza', 'arıza müdahale'] },
];

/** Sorgu metninden eşleşen TÜM niyetleri döner (tek niyetle sınırlı değil). */
export function detectIntents(query: string): Intent[] {
  const q = normallestir(query);
  if (q.length === 0) return [];

  const found: Intent[] = [];
  for (const def of INTENT_DEFINITIONS) {
    const hit = def.triggers.some((t) => q.includes(normallestir(t)));
    if (hit) found.push(def.intent);
  }
  return found;
}

/** Bir niyetle örtüşen kütüphane kategori adlarını döner (yoksa boş dizi). */
export function intentToCategoryHints(intent: Intent): readonly string[] {
  return INTENT_DEFINITIONS.find((d) => d.intent === intent)?.categoryHints ?? [];
}
