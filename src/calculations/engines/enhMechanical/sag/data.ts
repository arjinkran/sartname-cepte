// sag alt motoru — doğrulama listeleri.
//
// ⚠️ İletken ve buz yükü verisi BURADA TUTULMUYOR. Bu motor kendi
// iletken kataloğuna veya buz yükü formülüne erişmez; her ikisi de
// IceLoadEngine.calculate() çağrısı üzerinden dolaylı olarak merkezi
// kataloğa (src/catalogs/conductors) bağlanır — bkz. README.md ve
// ../iceLoad/README.md.
import type { LoadCase } from './types.ts';

export { ICE_LOAD_CONDUCTOR_TYPES as SAG_CONDUCTOR_TYPES, ICE_LOAD_ICE_REGIONS as SAG_ICE_REGIONS } from '../iceLoad/data.ts';

export const SAG_LOAD_CASES: readonly LoadCase[] = ['noIce', 'oneIce', 'doubleIce'];
