# Kullanıcı Onaylı Resmî PDF İndirme (Sprint 13)

Bu doküman, `src/offline/` altındaki gerçek PDF indirme mimarisini
açıklar. Sprint 12, resmî kaynaklarda doğrulanmış PDF adayları
bulabiliyordu; bu sprint, kullanıcının o adaylardan birini seçip
**cihaza gerçekten indirmesini** güvenli şekilde uyguladı.

## Kullanıcı onay akışı

1. Doküman Detay → "PDF Bulmayı Dene" → aday bulunursa "Resmî Kaynak
   Adayları" modalı açılır (Sprint 12).
2. Güçlü bir PDF adayında (skor ≥ 70) "Cihaza İndir" butonu görünür.
3. Butona basınca **önce** bir onay modalı açılır: "PDF indirilsin mi?"
   — belge adı, kurum, domain, tür gösterilir. Kullanıcı **açıkça**
   "İndir" demeden hiçbir ağ isteği/dosya yazma işlemi BAŞLAMAZ.
4. Onaylanırsa indirme `downloadQueue.ts` üzerinden kuyruğa alınır;
   Doküman Detay ekranı ilerlemeyi canlı gösterir ("İndiriliyor…").
5. Tamamlanınca PDF, Viewer'da doğrudan yerel dosyadan açılabilir ve
   "Çevrimdışı" rozeti gösterilir.

## Güvenli URL doğrulama (indirmeden hemen önce, tekrar)

`downloadManager.ts`, UI'dan gelen aday URL'sine **körü körüne
güvenmez** — Sprint 12'nin `isSafeRequestUrl`/`isRestrictedStandardProvider`
doğrulamalarını indirmeden hemen önce **yeniden** çalıştırır:

1. HTTPS zorunlu, resmî domain zorunlu (`isSafeRequestUrl`).
2. Sağlayıcı TSE/IEC/CENELEC/IEEE ise (`isRestrictedStandardProvider`)
   indirme **kesinlikle reddedilir** — bu kuruluşlar için tam metin PDF
   hiçbir zaman indirilmez.
3. Bir `HEAD` ön kontrolü (Sprint 12'nin `fetchHead`'i yeniden
   kullanılır) ile: redirect sonrası **gerçek** son URL'nin domaini
   tekrar doğrulanır, `Content-Length` 100 MB sınırına karşı kontrol
   edilir, `Content-Type` PDF/octet-stream olmalıdır.

## İndirme mimarisi

```
UI (DocumentDetailScreen)
  ↓
Download Queue (en fazla 2 eşzamanlı)
  ↓
Download Manager (downloadOfficialPdf — 18 adım)
  ↓
Download Repository (AsyncStorage) + Runtime Manifest (bellek-içi)
  ↓
FileSystem (yalnızca dinamik import ile, gerçekten indirilirken)
```

`downloadManager.ts`, `src/data/library/repository.ts`'i **import
etmez** — indirme için gereken belge bilgisi (`institution`, `title`)
`DownloadRequest` içinde doğrudan taşınır (bkz. madde 19).

### Neden `expo-file-system`/AsyncStorage hiçbir dosyanın en üstünde YOK?

İkisi de native modüldür; düz `node --test` ortamında (Metro/RN çalışma
zamanı olmadan) modülün en üstünde import edilirlerse ANINDA çökerler.
Bu yüzden:

- Gerçek dosya/depolama işlemleri yalnızca GERÇEKTEN çağrıldığında,
  fonksiyon içi dinamik `import()` ile yapılır.
- `downloadManager.ts`/`downloadRepository.ts`, testler için
  `DownloadFileOps`/`KeyValueStorage` arayüzlerini opsiyonel parametre
  olarak kabul eder — testler bellek-içi sahtelerini enjekte eder,
  gerçek native import HİÇ tetiklenmez.

## Dosya doğrulama (indirme SONRASI)

1. Yazılan dosyanın boyutu 0 olamaz; 100 MB üstü reddedilir.
2. Dosyanın **ilk 5 baytı** okunup `%PDF-` imzasıyla karşılaştırılır —
   sunucunun Content-Type'ı "PDF" dese bile, GERÇEK dosya içeriği HTML
   hata sayfası ise (imza uyuşmuyorsa) dosya silinir ve reddedilir.
3. Bu iki kontrolden biri başarısız olursa dosya **hemen silinir** —
   yarım/geçersiz bir dosya asla `completed` olarak işaretlenmez.

## Checksum (SHA-256)

Bugünkü React Native/Hermes ortamı, yeni bir paket eklemeden (bu sprint
yalnızca `expo-file-system`e izin verdi) gerçek bir SHA-256 API'si
SAĞLAMAZ. `checksum.ts`, `globalThis.crypto.subtle.digest` (Web Crypto)
kullanılabilir olup olmadığını ÇALIŞMA ZAMANINDA kontrol eder:

- Varsa: gerçek SHA-256 hesaplanır, `checksumStatus: 'available'`.
- Yoksa (bugünkü RN ortamının GERÇEK durumu): **uydurma bir checksum
  ÜRETİLMEZ** — `checksumStatus: 'unavailable'` olarak dürüstçe
  işaretlenir. Dosya bu yüzden REDDEDİLMEZ (checksum, PDF imza
  kontrolünden AYRI, ikincil bir bütünlük katmanıdır).

## Runtime PDF Manifest

Statik `src/assets/pdfs/manifest.ts` (Sprint 9) derleme zamanında
sabitlenmiş bir kayıt defteridir — bu sprint onu **çalışma anında
değiştirmez**. Bunun yerine `src/offline/runtimePdfManifest.ts`, tamamen
bellek-içi, senkron bir Map tutar. `src/data/library/repository.ts`
(`hasPdf`/`getPdfPath`) artık ÜÇ sinyali birleştirir:

1. `document.pdfAvailable === true` (Sprint 8)
2. Statik manifest kaydı (Sprint 9)
3. Runtime manifest kaydı — **gerçekten indirilmiş** dosya (Sprint 13,
   her zaman ÖNCELİKLİDİR — `getPdfPath()` varsa yerel URI'yi döner)

## Offline depolama (Download Repository)

`downloadRepository.ts`, AsyncStorage'da tek bir JSON blob'da
(`sartname-cepte:downloadRecords`) `documentId → DownloadRecord`
haritası tutar. Her kayıt: dosya yolu, kaynak URL, indirme/son açılma
tarihleri, boyut, checksum(+durumu), doğrulanmış domain bayrağı.

`pruneInvalidDownloadRecords()`, fiziksel dosyası artık cihazda olmayan
kayıtları (ör. kullanıcı dosya yöneticisinden elle sildiyse) temizler
ve runtime manifest'i senkron tutar — PDF Kütüphane Durumu ekranı bunu
her ziyarette çalıştırır (kendi kendini onaran, "self-healing" bir
tasarım).

## Kuyruk mantığı

`downloadQueue.ts`: en fazla **2 eşzamanlı** indirme. Aynı `documentId`
zaten kuyrukta/aktifse `enqueueDownload()` `false` döner ve HİÇBİR ŞEY
yapmaz. Her iş yalnızca **bir kez** `completed`/`failed`/`cancelled`
olur; bir işin hatası diğerlerini durdurmaz (`runQueueItem`'ın
`finally` bloğu `activeCount`'u her koşulda düşürür ve kuyruğu bir kez
daha kontrol eder — asla negatif olmaz, asla sonsuz döngüye girmez).

## İptal ve hata temizliği

- Her indirme bir zaman aşımına sahiptir (varsayılan 30s, en fazla
  60s) — `withTimeout` sarmalayıcısı, Sprint 12'deki AYNI desenle,
  `setTimeout`'u her koşulda `finally` ile temizler.
- Kullanıcı "İndirme iptal" derse `cancelActiveDownload()` gerçek
  indirme handle'ını (`DownloadResumable.pauseAsync()`) çağırır.
- Zaman aşımı VEYA iptal sonrası **yarım dosya her zaman silinir**.
- Kullanıcı Doküman Detay'dan ayrılırsa indirme OTOMATİK iptal EDİLMEZ
  (arka planda devam edebilir) — yalnızca aynı belge için YENİ bir
  indirme başlatılamaz (aktif kilit `documentId` bazlıdır).

## Dosya silme (Cihazdan Kaldır)

`deleteDownloadedPdf(documentId)`: dosyayı siler → runtime manifest
kaydını kaldırır → kalıcı download kaydını kaldırır. Kayıt zaten yoksa
idempotent olarak `true` döner. Doküman kütüphaneden SİLİNMEZ —
yalnızca cihazdaki kopya kaldırılır.

## Telifli kaynak kısıtları

TSE/IEC/CENELEC/IEEE için:

- Aday modalında "Cihaza İndir" butonu hiçbir zaman GÖRÜNMEZ (bu
  sağlayıcılar için `NetworkCandidate.isPdf` her zaman `false`'tur —
  bkz. Sprint 12 `restrictedAdapter.ts`).
- `downloadManager.ts`, `isRestrictedStandardProvider()` kontrolünü
  KENDİSİ de yapar — UI'daki gizleme atlatılsa bile indirme sunucu
  tarafında REDDEDİLİR.

## Gelecekte: arka plan indirme ve bulut senkronizasyonu

Bu sprintin KAPSAM DIŞI bıraktığı (bilinçli sınırlar):

- **Arka plan indirme**: uygulama kapalıyken devam eden indirme yok —
  Expo Go uyumluluğu ve basitlik gereği şimdilik ön planda kalınmalı.
- **Bulut senkronizasyonu**: indirilen PDF'ler yalnızca CİHAZDA durur,
  hesaplar arası senkronize edilmez.
- Her iki özellik de mevcut `DownloadRecord`/`RuntimeManifestItem`
  sözleşmeleri DEĞİŞTİRİLMEDEN eklenebilecek şekilde tasarlandı.
