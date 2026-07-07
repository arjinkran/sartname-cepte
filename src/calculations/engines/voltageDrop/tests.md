# voltageDrop — Demo Test Senaryoları

Bu dosya, `voltageDrop` motorunun **demo** sürümü için beklenen davranışı
belgeler. Çalıştırılabilir otomatik testler
[`tests/calculations/voltageDrop.test.ts`](../../../../tests/calculations/voltageDrop.test.ts)
içindedir; bu dosya yalnızca senaryoların insan tarafından okunabilir özetidir.

⚠️ Buradaki formül gerçek bir mühendislik hesabı değildir — yalnızca
calculation engine altyapısının doğrulama → hesap → sonuç akışını
göstermek için basitleştirilmiş bir demo formülüdür (bkz. `engine.ts`).

## Formül (demo)

```
faz faktörü = mono → 2 , tri → √3
voltageDropVolt   = fazFaktörü × current × (resistancePerKm ÷ 1000) × length
voltageDropPercent = (voltageDropVolt ÷ voltage) × 100
isWithinLimit      = voltageDropPercent ≤ limitPercent (varsayılan %5)
```

## Senaryo 1 — Trifaze, limit içinde

| Girdi | Değer |
| --- | --- |
| voltage | 400 V |
| current | 30 A |
| length | 100 m |
| resistancePerKm | 1,5 Ω/km |
| phaseType | tri |

Beklenen: `ok: true`, `voltageDropVolt ≈ 7,79 V`, `voltageDropPercent ≈ 1,95`,
`isWithinLimit: true`, uyarı yok.

## Senaryo 2 — Monofaze, limit içinde

| Girdi | Değer |
| --- | --- |
| voltage | 230 V |
| current | 15 A |
| length | 40 m |
| resistancePerKm | 3,5 Ω/km |
| phaseType | mono |

Beklenen: `ok: true`, `voltageDropVolt = 4,2 V`, `voltageDropPercent ≈ 1,83`.

## Senaryo 3 — Eksik girdi

`current` alanı gönderilmezse: `ok: false`, `output: null`,
`errors` içinde `field: 'current'` olan en az bir hata (`FIELD_REQUIRED`).

## Senaryo 4 — Limit aşımı

| Girdi | Değer |
| --- | --- |
| voltage | 230 V |
| current | 50 A |
| length | 500 m |
| resistancePerKm | 5 Ω/km |
| phaseType | mono |

Beklenen: `ok: true`, `isWithinLimit: false`, `warnings` içinde
`code: 'LIMIT_EXCEEDED'` uyarısı.
