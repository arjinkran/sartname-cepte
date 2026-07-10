// Tüm sağlayıcı arama adaptörlerinin toplandığı tek nokta (Sprint 12, madde 7).
import type { Document } from '../../../data/library/types.ts';
import type { ProviderSearchAdapter } from '../types.ts';
import { tedasAdapter } from './tedasAdapter.ts';
import { epdkAdapter } from './epdkAdapter.ts';
import { resmiGazeteAdapter } from './resmiGazeteAdapter.ts';
import { teiasAdapter } from './teiasAdapter.ts';
import { mevzuatGovAdapter } from './mevzuatGovAdapter.ts';
import { tseAdapter, iecAdapter, cenelecAdapter, ieeeAdapter } from './restrictedAdapter.ts';

export const PROVIDER_ADAPTERS: readonly ProviderSearchAdapter[] = [
  tedasAdapter,
  epdkAdapter,
  resmiGazeteAdapter,
  teiasAdapter,
  mevzuatGovAdapter,
  tseAdapter,
  iecAdapter,
  cenelecAdapter,
  ieeeAdapter,
];

export function getAdaptersForDocument(document: Document): ProviderSearchAdapter[] {
  return PROVIDER_ADAPTERS.filter((adapter) => adapter.canSearch(document));
}

export {
  tedasAdapter,
  epdkAdapter,
  resmiGazeteAdapter,
  teiasAdapter,
  mevzuatGovAdapter,
  tseAdapter,
  iecAdapter,
  cenelecAdapter,
  ieeeAdapter,
};
