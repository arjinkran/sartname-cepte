// enhMechanical motoru — Excel'den görülen örnek seçenek listeleri.
// Bu değerler "DEK Haller ve Sehim Hesapları" Excel dosyasındaki açılır
// listelerden/aralıklardan görülmüştür; gerçek hesaplar henüz yazılmadığı
// için burada yalnızca SEÇENEK KÜMESİ (doğrulama için) olarak tutulur.
import type { ConductorType, IceRegion, PoleType, VoltageLevelKv } from './types.ts';

export const ENH_CONDUCTOR_TYPES: readonly { id: ConductorType; label: string }[] = [
  { id: '3-awg', label: '3 AWG' },
  { id: '1-0-awg', label: '1/0 AWG' },
  { id: '3-0-awg', label: '3/0 AWG' },
  { id: '266-8-mcm', label: '266.8 MCM' },
  { id: '477-mcm-hawk', label: '477 MCM HAWK' },
];

export const ENH_ICE_REGIONS: readonly IceRegion[] = [1, 2, 3, 4, 5];

export const ENH_VOLTAGE_LEVELS_KV: readonly VoltageLevelKv[] = [34.5, 154];

export const ENH_POLE_TYPES: readonly { id: PoleType; label: string }[] = [
  { id: 'tek-devre', label: 'Tek Devre' },
  { id: 'cift-devre-cam', label: 'Çift Devre ÇAM tipi' },
  { id: 'cift-devre-fici', label: 'Çift Devre FIÇI tipi' },
  { id: 'dort-devre', label: '4 Devre' },
  { id: 'sek-d', label: 'SEK-D' },
  { id: 'demir', label: 'DEMIR' },
];
