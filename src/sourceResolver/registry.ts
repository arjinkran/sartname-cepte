// Resolver Registry — tüm kaynak sağlayıcılarını (source provider) tek
// listede toplar (Sprint 11, madde 4). Yeni bir kaynak eklerken tek
// yapılması gereken: `sources/` altına bir dosya + buraya bir satır
// eklemek (src/data/library/repository.ts'teki kurum-klasörü ekleme
// deseniyle AYNI ilke).
import { TEDAS_PROVIDER } from './sources/tedas.ts';
import { EPDK_PROVIDER } from './sources/epdk.ts';
import { RESMI_GAZETE_PROVIDER } from './sources/resmiGazete.ts';
import { MEVZUAT_GOV_PROVIDER } from './sources/mevzuatGov.ts';
import { TEIAS_PROVIDER } from './sources/teias.ts';
import { TSE_PROVIDER } from './sources/tse.ts';
import { IEC_PROVIDER } from './sources/iec.ts';
import { CENELEC_PROVIDER } from './sources/cenelec.ts';
import { IEEE_PROVIDER } from './sources/ieee.ts';
import type { SourceProvider } from './types.ts';

const SOURCE_PROVIDERS: readonly SourceProvider[] = [
  TEDAS_PROVIDER,
  EPDK_PROVIDER,
  RESMI_GAZETE_PROVIDER,
  MEVZUAT_GOV_PROVIDER,
  TEIAS_PROVIDER,
  TSE_PROVIDER,
  IEC_PROVIDER,
  CENELEC_PROVIDER,
  IEEE_PROVIDER,
];

export function getSourceProviders(): readonly SourceProvider[] {
  return SOURCE_PROVIDERS;
}

export function getSourceProviderById(id: string): SourceProvider | undefined {
  return SOURCE_PROVIDERS.find((p) => p.id === id);
}

/** `restrictedStandard` OLMAYAN (kamuya açık PDF/sayfa sağlayabilen) sağlayıcılar. */
export function getPublicPdfProviders(): readonly SourceProvider[] {
  return SOURCE_PROVIDERS.filter((p) => p.accessType !== 'restrictedStandard');
}

/** Telifli standart kuruluşları (TSE/IEC/CENELEC/IEEE). */
export function getRestrictedProviders(): readonly SourceProvider[] {
  return SOURCE_PROVIDERS.filter((p) => p.accessType === 'restrictedStandard');
}
