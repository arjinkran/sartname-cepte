// Cross Reference zinciri çıkarımı (Sprint 14, madde 8).
//
// Mevcut `Document.crossReferences`/`relatedDocuments` alanlarını
// kullanır — yeni bir veri kaynağı EKLEMEZ. BFS (genişlik-öncelikli)
// tarama ile çalışır; `visited` kümesi sayesinde AYNI belge asla ikinci
// kez sonuca girmez ve döngüsel referanslar (A→B→A gibi) SONSUZ DÖNGÜ
// oluşturmaz. Maksimum derinlik sabit 3'tür (madde 8) — 4. seviyeye
// asla geçilmez.
import { getDocumentById } from '../data/library/repository.ts';
import type { Document } from '../data/library/types.ts';

export const MAX_CROSS_REFERENCE_DEPTH = 3;

export interface CrossReferenceNode {
  document: Document;
  /** 1 = tohum belgeye doğrudan bağlı, 2-3 = zincirin daha derin halkaları. */
  depth: number;
}

/**
 * Verilen tohum (seed) belge id'lerinden başlayarak `crossReferences` +
 * `relatedDocuments` alanlarını BFS ile genişletir. `seedIds`in kendisi
 * sonuca DAHİL EDİLMEZ (yalnızca onlardan ULAŞILAN belgeler döner).
 *
 * Döngü güvenliği: `visited` kümesi tohumları da İÇERİR (böylece bir
 * kanıt kendi kendine referans verse bile sonsuz döngü oluşmaz); her
 * belge id'si en fazla BİR KEZ işlenir; `while` döngüsü yalnızca
 * `maxDepth` derinliğine kadar veya keşfedilecek yeni düğüm kalmayınca
 * durur — özyinelemeli (recursive) bir çağrı YOKTUR.
 */
export function collectCrossReferences(
  seedIds: readonly string[],
  maxDepth: number = MAX_CROSS_REFERENCE_DEPTH
): readonly CrossReferenceNode[] {
  const visited = new Set<string>(seedIds);
  const result: CrossReferenceNode[] = [];
  let frontier: readonly string[] = seedIds;
  let depth = 1;

  while (frontier.length > 0 && depth <= maxDepth) {
    const nextFrontier: string[] = [];

    for (const id of frontier) {
      const document = getDocumentById(id);
      if (!document) continue;

      const referencedIds = [...document.crossReferences, ...document.relatedDocuments];
      for (const refId of referencedIds) {
        if (visited.has(refId)) continue; // aynı belge ikinci kez GELMEZ
        visited.add(refId);

        const refDocument = getDocumentById(refId);
        if (!refDocument) continue; // bozuk/olmayan referans sessizce atlanır

        result.push({ document: refDocument, depth });
        nextFrontier.push(refId);
      }
    }

    frontier = nextFrontier;
    depth += 1;
  }

  return result;
}
