// Template tabanlı açıklama üretimi (Sprint 14, madde 10).
//
// ⚠️ LLM KULLANILMAZ. Her açıklama, sabit Türkçe şablonların belge
// alanlarıyla (kategori/kurum/tür) VEYA tespit edilen intent etiketiyle
// doldurulmasından ibarettir — gerçek bir dil modeli muhakemesi DEĞİLDİR
// (bkz. src/ai/README.md'deki aynı dürüstlük ilkesi).
import type { Document, DocumentType } from '../data/library/types.ts';
import type { Intent } from '../ai/types.ts';

const INTENT_LABELS: Record<Intent, string> = {
  'branşman': 'branşman tesislerine',
  'trafo': 'trafo tesislerine',
  'kablo': 'kablo tesisatına',
  'og': 'orta gerilim (OG) tesislerine',
  'ag': 'alçak gerilim (AG) tesislerine',
  'ring': 'ring (halka) şebeke yapısına',
  'havai-hat': 'havai hat tesislerine',
  'yeraltı-kablosu': 'yeraltı kablo tesisatına',
  'topraklama': 'topraklama tesislerine',
  'parafudr': 'parafudr (aşırı gerilim koruması) uygulamalarına',
  'kesici': 'kesici cihazlara',
  'ayırıcı': 'ayırıcı cihazlara',
  'koruma': 'koruma sistemlerine',
  'sayaç': 'sayaç uygulamalarına',
  'kompanzasyon': 'reaktif güç kompanzasyonuna',
  'ölçü-trafosu': 'ölçü trafolarına',
  'direk': 'direk tesislerine',
  'travers': 'travers uygulamalarına',
  'izolatör': 'izolatör seçimine',
  'hizmet-kalitesi': 'hizmet kalitesine',
  'bağlantı': 'bağlantı ve sistem kullanım süreçlerine',
  'proje': 'projelendirme süreçlerine',
  'kabul': 'kabul süreçlerine',
  'işletme': 'işletmeye alma süreçlerine',
  'bakım': 'bakım süreçlerine',
  'arıza': 'arıza müdahale süreçlerine',
};

const DOCUMENT_TYPE_NOUN: Record<DocumentType, string> = {
  'Kanun': 'kanun',
  'Şartname': 'şartname',
  'Yönetmelik': 'yönetmelik',
  'Standart': 'standart',
  'Tebliğ': 'tebliğ',
  'Genelge': 'genelge',
  'Kılavuz': 'kılavuz',
  'Teknik Doküman': 'teknik doküman',
  'Rehber': 'rehber',
};

/**
 * Bir kanıt için kısa, tek cümlelik, template tabanlı açıklama üretir
 * (madde 10 örneği: "Bu belge branşman tesislerine ilişkin hükümler
 * içeriyor."). Cross-reference ile ulaşılan kanıtlar için ayrı, dürüst
 * bir şablon kullanılır (doğrudan bir intent eşleşmesi OLMADIĞI
 * belirtilir).
 */
export function buildExplanation(document: Document, intents: readonly Intent[], crossReferenceDepth: number): string {
  if (crossReferenceDepth > 0) {
    return `Bu belge, ${document.title} ile ilişkili (çapraz referanslı) bir kaynak olarak bulundu.`;
  }

  if (intents.length > 0) {
    const label = INTENT_LABELS[intents[0]!];
    return `Bu belge ${label} ilişkin hükümler içeriyor.`;
  }

  const tur = DOCUMENT_TYPE_NOUN[document.documentType];
  return `Bu belge ${document.category} kategorisinde, ${document.institution} kaynaklı bir ${tur}dir.`;
}

/**
 * Doküman Detay ekranındaki "Bu Belge Hangi Sorularda Kullanılır?"
 * kartı için template tabanlı örnek sorular üretir (madde 14) —
 * belgenin KENDİ anahtar kelime/kategori alanlarından türetilir, LLM
 * KULLANILMAZ.
 */
export function buildUsageQuestions(document: Document): readonly string[] {
  const kw = document.keywords.slice(0, 3);
  const sorular: string[] = [];

  if (kw[0]) sorular.push(`${kw[0]} ile ilgili hangi teknik şartlar geçerlidir?`);
  sorular.push(`${document.category} kapsamında ${document.institution} hangi kuralları uygular?`);
  if (kw[1]) sorular.push(`${kw[1]} konusunda hangi kaynağa bakılmalıdır?`);

  return sorular.slice(0, 3);
}
