// Standart REFERANS girdileri için ortak fabrika fonksiyonu — TSE/IEC/
// CENELEC/IEEE klasörlerinin her biri kendi belge dizisini bu fonksiyonla
// kurar (kod tekrarını azaltır). Hâlâ ortak `Document` tipini üretir —
// "hiçbir kurum kendi tipini oluşturmasın" kuralını ihlal etmez, yalnızca
// tekrarlayan alan değerlerini (documentType/legalHierarchy/status/
// sourceVerified/pdfPath vb.) tek yerden doldurur.
//
// ⚠️ YALNIZCA METADATA/REFERANS amaçlıdır — telifli standartların tam
// metni eklenmez, bu yüzden `pdfPath`/`sourceUrl` bilinçli olarak boş
// bırakılır (bkz. Sprint 6 kuralları, docs/CONTENT_COVERAGE.md).
import type { Document, Institution } from './types.ts';

export interface ReferenceEntryInput {
  id: string;
  /** Standardın resmî numarası (ör. "IEC 60502", "TS EN 60502"). */
  no: string;
  title: string;
  institution: Institution;
  category: string;
  summary: string;
  keywords: readonly string[];
  relatedDocuments?: readonly string[];
  crossReferences?: readonly string[];
}

export function referansGirdisi(input: ReferenceEntryInput): Document {
  return {
    id: input.id,
    title: `${input.no} — ${input.title}`,
    shortTitle: input.no,
    institution: input.institution,
    documentType: 'Standart',
    legalHierarchy: 'Standart',
    category: input.category,
    summary: input.summary,
    keywords: input.keywords,
    tags: ['Standart', input.institution],
    aliases: [input.no],
    status: 'active',
    revision: `${input.no} (baskı/yıl doğrulanacak)`,
    publishDate: 'Doğrulanacak',
    effectiveDate: 'Doğrulanacak',
    relatedDocuments: input.relatedDocuments ?? [],
    crossReferences: input.crossReferences ?? [],
    pdfPath: '',
    sourceUrl: '',
    sourceVerified: false,
    version: '1.0',
    language: 'TR',
    lastChecked: '2026-07-09',
    searchWeight: 1,
    priority: 10,
    deprecated: false,
    favorite: false,
    featured: false,
    updatedAt: '2026-07-09',
  };
}
