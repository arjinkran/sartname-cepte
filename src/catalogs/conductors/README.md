# src/catalogs/conductors — Merkezi ACSR İletken Kataloğu

## Bu katalog uygulamanın TEK iletken veri kaynağıdır

`ACSR_CONDUCTORS` ([`acsr.ts`](./acsr.ts)), uygulamadaki **tüm** ENH
hesap motorlarının ve bilgi ekranlarının kullanması gereken tek iletken
veri kümesidir. Kesit, çap, ağırlık, kopma dayanımı, direnç/reaktans ve
akım taşıma kapasitesi değerleri **yalnızca burada** tanımlıdır.

**Hesap motorları kendi ayrı iletken verisi tutamaz.** Bir motorun
iletken bilgisine ihtiyacı varsa, bu kataloğu import eder (doğrudan veya
`data.ts` içinde ince bir re-export/köprü fonksiyonuyla) — asla kendi
kopyasını oluşturmaz.

## Şu an bu kataloğu kullanan modüller

| Modül | Nasıl kullanıyor |
| --- | --- |
| `src/calculations/engines/ampacityOG` | `data.ts` içinde `AMPACITY_CONDUCTORS = ACSR_CONDUCTORS` (doğrudan aynı dizi referansı). |
| `src/calculations/engines/enhMechanical/poleForce` | `data.ts` içindeki `iletkenVerisiGetir()` fonksiyonu, `conductorType` (AWG/MCM kimliği) → katalog `id`'sine (kuş adı) eşleyip `ACSR_CONDUCTORS`'tan arar. |
| `modules/enhBilgi` (İletkenler ekranı) | `data/iletkenler.ts`, `ACSR_CONDUCTORS`'u UI'a özgü Türkçe alan adlarına (`IletkenBilgi`) eşler; yalnızca `kisaAciklama`/`kullanimAlani` anlatım metni bu dosyaya özeldir. |

## Yeni iletken eklemek için

1. Önce bu kataloğu (`acsr.ts`) güncelleyin — yeni `ACSRConductor` kaydı
   ekleyin.
2. Gerekliyse `ampacityOG`, `poleForce`, `enhBilgi` içindeki kimlik
   eşleme tablolarını (`id`/`conductorType` haritaları) güncelleyin.
3. Yeni sayısal değerleri **başka hiçbir dosyaya elle kopyalamayın** —
   tüketen motorlar kataloğu import ederek otomatik olarak günceli görür.

## `sourceStatus` alanı

Her kayıt bir doğrulama durumu taşır:

- `verifiedFromExcel` — kullanıcının sağladığı Excel'den birebir doğrulanmıştır.
- `pendingBookVerification` — gerçek ACSR üretici tablolarından türetilmiştir
  (bkz. [`acsr.ts`](./acsr.ts) başlık notu), ama kaynak kitap (Enerji Nakil
  Hatları Cilt 1/2) veya kullanıcının Excel'i ile henüz birebir
  doğrulanmamıştır. **Şu an kataloğun tamamı bu durumdadır.**
- `mock` — tamamen yer tutucu/tahmini değer, gerçek kaynağa dayanmaz.

**Kitap/Excel doğrulaması tamamlandıkça, ilgili kaydın `sourceStatus`
alanı güncellenmelidir** (ör. bir iletkenin tüm alanları Excel'den
doğrulandığında `'pendingBookVerification'` → `'verifiedFromExcel'`
olarak değiştirilir). `notes` alanı, o kayıt için hangi belirli
değerlerin zaten doğrulandığını belgeler.

## Alan referansı

Bkz. [`types.ts`](./types.ts) → `ACSRConductor`. Kısa notlar:

- `standardName` = `name` + `awgMcm` birleşimi (ör. "Swallow — 3 AWG") —
  eski birleşik görünen ad ile geriye dönük uyumluluk için.
- `notes` — o kayıt için kaynak/doğrulama notu (serbest metin).
- `ampacityCondition1A/2A/3A` — `src/calculations/engines/ampacityOG`
  içindeki 3 standart çalışma koşuluna karşılık gelir.
