// İndeksleme ve aday belge seçimi (Sprint 7, madde 13 — "Performans").
//
// `getAllDocuments()` yalnızca BİR KEZ okunur; ters indeks (inverted
// index) ilk çağrıda kurulur ve modül ömrü boyunca bellekte tutulur
// (`cachedIndex`). Kütüphane verisi uygulama ömrü boyunca değişmeyen
// statik bir import olduğundan (bkz. src/data/library/repository.ts),
// önbelleği geçersiz kılmaya gerek yoktur. Bu, `recommendDocuments()`
// her çağrıldığında TÜM belgelerin (100/500/1000 fark etmeksizin)
// yeniden taranmasını önler — yalnızca sorgu terimleriyle eşleşen aday
// id'ler O(1) map bakışıyla toplanır.
import { getAllDocuments, normallestir } from '../data/library/repository.ts';
import type { Document } from '../data/library/types.ts';

interface DocumentIndex {
  readonly documents: readonly Document[];
  readonly byId: ReadonlyMap<string, Document>;
  /** Tek kelimelik normalleştirilmiş token → o token'ı içeren belge id'leri. */
  readonly invertedIndex: ReadonlyMap<string, ReadonlySet<string>>;
  /** Normalleştirilmiş kategori adı → o kategorideki belge id'leri. */
  readonly byCategory: ReadonlyMap<string, ReadonlySet<string>>;
  /** Normalleştirilmiş kurum adı → o kurumdaki belge id'leri. */
  readonly byInstitution: ReadonlyMap<string, ReadonlySet<string>>;
}

let cachedIndex: DocumentIndex | null = null;

function tokenize(text: string): string[] {
  return normallestir(text)
    .split(/[^a-z0-9çğıöşü]+/)
    .filter((t) => t.length >= 2);
}

function addToSetMap(map: Map<string, Set<string>>, key: string, id: string): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(id);
}

function buildIndex(): DocumentIndex {
  const documents = getAllDocuments();
  const byId = new Map<string, Document>();
  const invertedIndex = new Map<string, Set<string>>();
  const byCategory = new Map<string, Set<string>>();
  const byInstitution = new Map<string, Set<string>>();

  for (const doc of documents) {
    byId.set(doc.id, doc);

    const indexedText = [
      doc.title,
      doc.shortTitle,
      ...doc.keywords,
      ...doc.aliases,
      ...doc.tags,
      doc.category,
      doc.institution,
      doc.summary,
    ].join(' ');
    for (const token of tokenize(indexedText)) {
      addToSetMap(invertedIndex, token, doc.id);
    }

    addToSetMap(byCategory, normallestir(doc.category), doc.id);
    addToSetMap(byInstitution, normallestir(doc.institution), doc.id);
  }

  return { documents, byId, invertedIndex, byCategory, byInstitution };
}

/** Ters indeksi döner — ilk çağrıda kurar, sonrasında önbellekten okur. */
export function getIndex(): DocumentIndex {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

/**
 * Sorgu terimlerinden aday belge id kümesini toplar. Tek kelimelik
 * terimler ters indeksten O(1) okunur. Birden çok kelimeli terimler
 * (ör. eşanlamlı grup kanonik adları — "ölçü trafosu") ters indekste tek
 * bir token olarak bulunamayacağından, YALNIZCA bu durumda kelime
 * dağarcığı (vocabulary) üzerinde bir alt-dize taraması yapılır — bu,
 * belge listesini DEĞİL, önceden kurulmuş token kümesini tarar ve
 * pratikte kelime dağarcığı büyüklüğü belge sayısından çok daha yavaş
 * büyür (bkz. docs/AI_ENGINE.md "Performans").
 */
export function getCandidateIds(terms: readonly string[]): Set<string> {
  const index = getIndex();
  const candidates = new Set<string>();

  for (const rawTerm of terms) {
    const term = normallestir(rawTerm);
    if (term.length < 2) continue;

    const exact = index.invertedIndex.get(term);
    if (exact) {
      for (const id of exact) candidates.add(id);
      continue;
    }

    if (term.includes(' ')) {
      for (const [token, ids] of index.invertedIndex) {
        if (token.includes(term) || term.includes(token)) {
          for (const id of ids) candidates.add(id);
        }
      }
    }
  }

  return candidates;
}

/** Bir kategori adıyla eşleşen belge id'lerini döner (case/aksan-duyarsız). */
export function getIdsByCategory(category: string): ReadonlySet<string> {
  return getIndex().byCategory.get(normallestir(category)) ?? new Set();
}

/** Bir terimi içeren belge sayısı — IDF ağırlıklandırması için (bkz. scoring.ts). */
export function getDocumentFrequency(term: string): number {
  return getIndex().invertedIndex.get(normallestir(term))?.size ?? 0;
}

/** Kütüphanedeki toplam belge sayısı — IDF ağırlıklandırması için. */
export function getTotalDocumentCount(): number {
  return getIndex().documents.length;
}

/** Test/tanılama amaçlı: indeksi zorla yeniden kurar. Üretim kodunda kullanılmaz. */
export function resetIndexForTests(): void {
  cachedIndex = null;
}
