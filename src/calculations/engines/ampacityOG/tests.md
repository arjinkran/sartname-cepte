# ampacityOG — Test Senaryoları

Bu dosya, `ampacityOG` motorunun beklenen davranışını belgeler.
Çalıştırılabilir otomatik testler
[`tests/calculations/ampacityOG.test.ts`](../../../../tests/calculations/ampacityOG.test.ts)
içindedir.

⚠️ Bu bir "formül" motoru değildir — kullanıcının seçtiği iletken + çalışma
koşulu + gerilim seviyesine göre `data.ts` içindeki tablodan doğrudan arama
(lookup) yapar. Kaynak/kalibrasyon notu için `data.ts` başlığına bakın.

## Doğrulanmış (Excel'den birebir) referans noktalar

| Senaryo | Beklenen |
| --- | --- |
| HAWK, Koşul 3 → `ampacityCondition3A` | **740 A** |
| SWALLOW, Koşul 1 → `ampacityCondition1A` | **120 A** |
| RAVEN, 35 kV → `reactance35kVOhmPerKm` | **0,387 Ω/km** |

## Senaryo 1 — Yalnızca kapasite (expectedCurrentA verilmez)

Girdi: `{ conductorId: 'hawk', conditionId: 'condition3', voltageLevel: '35kV' }`

Beklenen: `ok: true`, `ampacityA: 740`, `isSuitable: null`,
`utilizationPercent: null`, `remainingCapacityA: null`.

## Senaryo 2 — Beklenen akım kapasitenin altında (uygun)

Girdi: `{ conductorId: 'swallow', conditionId: 'condition1', voltageLevel: '10kV', expectedCurrentA: 100 }`

Beklenen: `ampacityA: 120`, `isSuitable: true`,
`utilizationPercent ≈ 83,33`, `remainingCapacityA: 20`, uyarı yok.

## Senaryo 3 — Beklenen akım kapasitenin üstünde (uygun değil)

Girdi: `{ conductorId: 'raven', conditionId: 'condition2', voltageLevel: '35kV', expectedCurrentA: 300 }`

Beklenen: `ampacityA: 254`, `isSuitable: false`,
`utilizationPercent ≈ 118,11`, `remainingCapacityA: -46`,
`warnings` içinde `code: 'AMPACITY_EXCEEDED'`.

## Senaryo 4 — Eksik `conductorId`

Girdi: `conductorId` alanı olmadan çağrılır. Beklenen: `ok: false`,
`output: null`, `errors` içinde `field: 'conductorId'`.

## Senaryo 5 — Eksik `conditionId`

Girdi: `conditionId` alanı olmadan çağrılır. Beklenen: `ok: false`,
`output: null`, `errors` içinde `field: 'conditionId'`.

## Senaryo 6 — Bilinmeyen iletken/koşul id'si

Girdi: `conductorId: 'bilinmeyen-iletken'` gibi tabloda olmayan bir id.
Beklenen: `ok: false`, `errors` içinde `field: 'conductorId'` (`FIELD_INVALID`).
