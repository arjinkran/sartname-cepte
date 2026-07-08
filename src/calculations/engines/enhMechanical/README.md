# enhMechanical — Excel Analiz Haritası (Sprint 2C, İSKELET)

Bu motor henüz **iskelet** aşamasındadır. `calculate()` her zaman
`status: 'notImplemented'` döner; girdi doğrulaması çalışır ama gerçek
mühendislik formülü henüz yoktur. Genel mimari kuralları için bkz.
[`modules/calculations/README.md`](../../../../modules/calculations/README.md).

## Excel sekmesi → hesap modülü eşlemesi

| Excel sekmesi | Hesap modülü (`calcType`) | Not |
| --- | --- | --- |
| `BetonDirek` | `betonDirekSecimi` | `BetonDirek` VBA fonksiyonuyla aynı isimde |
| `DegisikHallerDenklemi` | `degisikHallerDenklemi` | Ana DHD hesabı |
| `DHD-Serbest` | `degisikHallerDenklemi` | Serbest açıklık varyantı — aynı modüle bağlanacak |
| `SehimSerbest` | `sehimSerbest` | |
| `SehimOzel` | `sehimOzel` | |
| `DfDs0` … `DfDs9` | `dfDsHesabi` | 10 sekme; muhtemelen buz bölgesi/durum bazlı varyantlar — tek modülde parametreleştirilecek |
| _(kendi sekmesi yok)_ | `amaxHesabi` | `maxgerilmehali` / `maxsehimhali` fonksiyonlarının türevi olarak değerlendiriliyor |

## Görülen özel Excel/VBA fonksiyonları

Bu fonksiyonlar Excel dosyasında tespit edilmiştir; her biri sonraki
sprintlerde tek tek çözümlenip TypeScript'e taşınacaktır. Anlamları henüz
**doğrulanmadı** — fonksiyon adından çıkarılan ilk izlenimdir, gerçek
formül çözümlenirken teyit edilmelidir.

| Fonksiyon | İlk izlenim (doğrulanacak) |
| --- | --- |
| `Tn` | Sıcaklık/gerilme durumu indeksi |
| `hatTIP` / `hattip` | Hat tipi seçimi (büyük/küçük harf iki ayrı fonksiyon olarak görünüyor — aynı mı farklı mı, çözümlerken netleşecek) |
| `maxgerilmehali` | Azami gerilme hali |
| `kesit` | İletken kesit seçimi/okuma |
| `tnmax` | Azami Tn değeri |
| `tnT1` | T1 durumu için Tn |
| `tnp1` | P1 durumu için Tn |
| `pntip` | PN tipi seçimi |
| `k` | Katsayı (bağlam doğrulanacak) |
| `E` | Elastisite modülü |
| `pn` | Anma yükü/durumu |
| `p0` | Başlangıç yükü/durumu |
| `maxsehimhali` | Azami sehim hali |
| `maxsehimpn` | Azami sehim — pn durumu |
| `maxsehimpntip` | Azami sehim — pn tipi |
| `maxsehimtn` | Azami sehim — Tn durumu |
| `liz` | İzolatör boyu (`insulatorLengthM`) |
| `BetonDirek` | Beton direk seçim fonksiyonu |

## Bir sonraki sprintte çözülecek öncelik sırası

1. `DegisikHallerDenklemi`
2. `SehimSerbest`
3. `SehimOzel`
4. `DfDs` hesapları (`DfDs0` … `DfDs9`)
5. `BetonDirek`

## Ortak girdi alanları

Bkz. [`types.ts`](./types.ts) → `EnhMechanicalCommonInput`. Tüm alanlar şu
an opsiyoneldir; yalnızca `calcType` zorunludur. `iceRegion`,
`conductorType`, `voltageLevelKv` ve `poleType` — verilirse — `data.ts`
içindeki desteklenen değer kümesine karşı doğrulanır. Gerçek formüller
eklendiğinde her `calcType` için hangi alanların zorunlu olduğu netleşecek
ve `EnhMechanicalInput` muhtemelen `calcType` bazlı ayrık birleşim
(discriminated union) tipine dönüştürülecektir.

## Test yazma kuralları

`modules/calculations/README.md` içindeki genel kurallar geçerlidir. Ek
olarak: gerçek formül eklenmeden önce mutlaka Excel'deki en az 2-3 satırı
`examples.ts`'e taşıyıp
[`tests/calculations/enhMechanical.test.ts`](../../../../tests/calculations/enhMechanical.test.ts)
içinde motorun gerçek çıktısıyla karşılaştırın (bkz. mevcut
"örnekler gerçek motor çıktısıyla senkron" testi — aynı desen korunmalı).
