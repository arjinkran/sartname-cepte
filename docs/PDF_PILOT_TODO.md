# PDF Pilot — Eksik Dosyalar (Sprint 10)

Bu belge, Sprint 10'un "gerçek PDF pilot entegrasyonu" hedefinin şu an
**gerçekleştirilemediğini** kaydeder — proje deposunda (repo) ve bu
oturumda paylaşılan hiçbir yerde gerçek, doğrulanmış bir PDF dosyası
bulunmuyor. Bu, Sprint 10'un kendi kuralının doğrudan uygulanmasıdır:

> "Eğer bu PDF dosyaları projede yoksa: PDF ekleme. Sadece
> docs/PDF_PILOT_TODO.md dosyasında eksik olarak listele."

Aşağıdaki tabloda, öncelik sırasına göre 5 pilot doküman, her birinin
kütüphanedeki GERÇEK `documentId`'si (uydurulmadı — `getDocumentById()`
ile doğrulandı) ve beklenen hedef klasör listelenmiştir. **Hiçbiri için
`pdfAvailable` işaretlenmedi, `manifest.ts`'e kayıt eklenmedi** — bkz.
Sprint 10 kuralı "Gerçek PDF dosyası yoksa belgeyi PDF var gibi
işaretleme."

## Eksik PDF Listesi

| Öncelik | Belge | `documentId` | Kurum | Beklenen klasör | Beklenen dosya adı |
| --- | --- | --- | --- | --- | --- |
| 1 | Elektrik Kuvvetli Akım Tesisleri Yönetmeliği | `kuvvetli-akim` | Resmî Gazete | `src/assets/pdfs/resmiGazete/` | `resmi-gazete_elektrik-kuvvetli-akim_yonetmelik.pdf` |
| 2 | Elektrik İç Tesisleri Yönetmeliği | `ic-tesisler` | Resmî Gazete | `src/assets/pdfs/resmiGazete/` | `resmi-gazete_elektrik-ic-tesisleri_yonetmelik.pdf` |
| 3 | Elektrik Tesislerinde Topraklamalar Yönetmeliği | `topraklama-yonetmelik` | Resmî Gazete | `src/assets/pdfs/resmiGazete/` | `resmi-gazete_topraklamalar_yonetmelik.pdf` |
| 4 | AG Güç Kabloları (XLPE/PVC İzoleli) Teknik Şartnamesi | `ag-xlpe-kablo` | TEDAŞ | `src/assets/pdfs/tedas/` | `tedas_ag-guc-kablolari_rev.pdf` |
| 5 | Elektrik Dağıtımı Hizmet Kalitesi Yönetmeliği | `epdk-hizmet-kalitesi` | EPDK | `src/assets/pdfs/epdk/` | `epdk_hizmet-kalitesi_yonetmelik.pdf` |

Tüm 5 `documentId` değeri `src/data/library/repository.ts`'teki
`getDocumentById()` ile doğrulandı — bu id'ler kütüphanede GERÇEKTEN
mevcut (bkz. ilgili `resmiGazete/documents.ts`, `tedas/documents.ts`,
`epdk/documents.ts` kayıtları). Şu an hepsinde `pdfAvailable` alanı
`undefined`.

## Kullanıcıdan istenecek

Bu 5 dokümanın gerçek, resmî kaynaktan doğrulanmış PDF dosyaları temin
edilmelidir:

1. **Resmî Gazete yönetmelikleri** (öncelik 1-3) — `mevzuat.gov.tr`
   üzerinden resmî Resmî Gazete PDF'i indirilebilir (yönetmeliğin
   yürürlükteki en güncel/konsolide hâli tercih edilmelidir).
2. **TEDAŞ AG Güç Kabloları Teknik Şartnamesi** (öncelik 4) — TEDAŞ'ın
   kendi teknik şartname yayın kanalından (kurumsal web sitesi/ihale
   dokümanları) temin edilmelidir.
3. **EPDK Hizmet Kalitesi Yönetmeliği** (öncelik 5) — EPDK'nın resmî
   mevzuat sayfasından temin edilebilir.

Dosyalar sağlandığında bkz. [`docs/PDF_CONTENT_WORKFLOW.md`](./PDF_CONTENT_WORKFLOW.md)
— adım adım ekleme süreci, dosya adı standardı, `manifest.ts` kayıt
şeması ve yayın öncesi checklist orada tanımlıdır. PDF'ler eklendiğinde
bu dosyanın yerini `docs/PDF_PILOT_REPORT.md` (eklenen PDF'lerin
dökümü) alacaktır.

## Neden hiçbir PDF eklenmedi (uydurulmadı)

Sprint 10'un kuralları açıktı: *"Sahte PDF ekleme. Sahte URL yazma.
Gerçek PDF dosyası yoksa belgeyi PDF var gibi işaretleme."* Bu oturumda
hiçbir gerçek PDF dosyası sağlanmadığından (ne repoda, ne de
konuşmada), 5 pilot dokümanın hiçbiri için `manifest.ts`'e kayıt
eklenmedi, hiçbir `Document.pdfAvailable` alanı `true` yapılmadı.
Sprint 9'da kurulan mimari (bkz. `docs/PDF_ARCHITECTURE.md`,
`docs/PDF_CONTENT_WORKFLOW.md`) zaten boş manifest ile sorunsuz
çalışacak şekilde tasarlandığından, bu durum uygulamanın hiçbir
ekranını bozmaz — yalnızca "PDF Kütüphane Durumu" ekranındaki
sayılar 0 kalmaya devam eder.
