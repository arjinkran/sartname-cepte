# Offline / İndirme Katmanı

Bu klasör iki nesli bir arada barındırır:

## Sprint 8 — `offlineTypes.ts` / `offlineManager.ts` / `offlineRepository.ts`

Bunlar hâlâ mevcuttur ve **silinmedi**, ama artık kullanımda değildir —
Sprint 8'de "gelecekte gerçek indirme" için tasarlanmış, tamamen **inert**
(hiçbir gerçek ağ/dosya işlemi yapmayan) bir iskeletti. Sprint 13, gerçek
indirmeyi bu iskeletin İÇİNİ doldurarak DEĞİL, YANINA yeni bir katman
ekleyerek uyguladı (bkz. aşağıdaki bölüm) — bu iki eski dosyanın API
yüzeyi hâlâ derlenir ama uygulama tarafından çağrılmaz.

## Sprint 13 — Gerçek, kullanıcı onaylı PDF indirme

| Dosya | Sorumluluk |
|---|---|
| `downloadTypes.ts` | İndirme sisteminin tüm tipleri (`DownloadRequest/Result/Record`, `DownloadStatus`, `DownloadFailureReason`) |
| `filePaths.ts` | SAF (native bağımsız) göreli yol üretimi + gerçek cihaz yoluna çevrim (yalnızca çağrıldığında, dinamik import) |
| `checksum.ts` | SHA-256 (Web Crypto varsa) veya dürüst `unavailable` durumu — uydurma checksum ASLA üretilmez |
| `downloadRepository.ts` | AsyncStorage tabanlı kalıcı indirme kayıtları |
| `runtimePdfManifest.ts` | Bellek-içi, senkron "indirilen PDF" katmanı — statik `assets/pdfs/manifest.ts`'i ÇALIŞMA ANINDA değiştirmez |
| `downloadManager.ts` | `downloadOfficialPdf()` — ana, 18 adımlı güvenli indirme akışı |
| `downloadQueue.ts` | En fazla 2 eşzamanlı indirme, duplicate engelleme, hata izolasyonu |

### ⚠️ Native modül güvenliği (`node --test` uyumluluğu)

`expo-file-system` ve `@react-native-async-storage/async-storage`
**hiçbir dosyanın ÜSTÜNDE statik olarak import edilmez** — ikisi de
native modüllerdir ve düz Node ortamında (Metro/RN çalışma zamanı
olmadan) import anında çökerler. Bunun yerine:

- Gerçek dosya/depolama işlemleri yalnızca GERÇEKTEN çağrıldığında,
  fonksiyon içi dinamik `import()` ile yapılır.
- `downloadManager.ts`/`downloadRepository.ts`, test edilebilirlik için
  `DownloadFileOps`/`KeyValueStorage` arayüzlerini opsiyonel parametre
  olarak kabul eder — testler kendi bellek-içi sahtelerini enjekte eder
  ve bu dinamik import'lar hiçbir zaman tetiklenmez.

### Bağımlılık yönü (madde 19)

```
UI
  ↓
Download Queue / Download Manager
  ↓
Download Repository + Runtime Manifest
  ↓
FileSystem (yalnızca dinamik import ile)

Document Repository (src/data/library/repository.ts)
  ↓ (salt-okunur)
Runtime Manifest
```

- `downloadManager.ts`, `src/data/library/repository.ts`'i **import
  etmez** — indirme için gereken belge bilgisi (`institution`, `title`)
  `DownloadRequest` içinde doğrudan taşınır.
- `runtimePdfManifest.ts`, `downloadRepository.ts`'i import etmez —
  ikisi arasındaki senkronizasyon (`hydrateRuntimeManifestFromRecords`)
  çağıran taraf tarafından yapılır.
- `src/data/library/repository.ts`, `runtimePdfManifest.ts`'i salt-okunur
  olarak import eder (`mergeStaticAndRuntimeManifest`) — tersi asla olmaz.

Ayrıntılı güvenlik/doğrulama politikası için bkz.
[`docs/OFFICIAL_PDF_DOWNLOAD.md`](../../docs/OFFICIAL_PDF_DOWNLOAD.md).
