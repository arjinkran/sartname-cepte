# İçerik Kapsamı (Sprint 6)

Bu belge, Sprint 6 — "Gerçek Elektrik Dağıtım Mevzuatı İçerik
Genişletme" sonunda kütüphanenin **kurum bazlı içerik dökümünü**,
**doğrulanmamış belgelerin listesini** ve **kapsam dışı bırakılan
alanları** kaydeder. Mimari değişmedi (bkz.
[`LIBRARY_ARCHITECTURE.md`](./LIBRARY_ARCHITECTURE.md)); bu belge yalnızca
**içerik envanteri**dir ve içerik büyüdükçe güncellenmelidir.

## 1. Toplam sayılar

| Kurum | Belge sayısı | `sourceVerified: true` | `sourceVerified: false` |
| --- | --- | --- | --- |
| TEDAŞ | 30 | 7 | 23 |
| EPDK | 15 | 3 | 12 |
| Resmî Gazete | 15 | 4 | 11 |
| TEİAŞ | 8 | 0 | 8 |
| Enerji Bakanlığı | 5 | 0 | 5 |
| TSE (+ TS EN) | 20 | 0 | 20 |
| IEC | 15 | 0 | 15 |
| CENELEC | 8 | 0 | 8 |
| IEEE | 5 | 0 | 5 |
| Diğer | 0 | 0 | 0 |
| **Toplam** | **121** | **14** | **107** |

14 `sourceVerified: true` belge, Sprint 5'ten (taşıma sırasında resmî
süreçten geçirilerek eklendi — bkz. LIBRARY_ARCHITECTURE.md §8) miras
kalan orijinal içeriktir. Sprint 6'da eklenen **107 belgenin tamamı**
`sourceVerified: false` — bu bilinçli bir tercih, hata değildir (bkz. §3).

## 2. Kapsanan alanlar

**TEDAŞ** — AG/OG güç kabloları, kablo ek/başlık, dağıtım trafoları
(yağlı tip), beton köşk, OG modüler hücreler, AG/sayaç panoları, ölçü
transformatörleri, elektronik sayaç, OG parafudr, AG/OG kesiciler ve
ayırıcılar, AG/OG sigortalar, topraklama elektrot/bağlantı malzemeleri,
aydınlatma direkleri, beton/demir direkler, traversler, AG/OG
izolatörler, ACSR/AAAC iletkenler, hat bağlantı donanımı, SCADA/uzaktan
kumanda, reaktif güç kompanzasyonu, dağıtım merkezi genel teçhizatı.

**EPDK** — lisanslama, bağlantı ve sistem kullanımı, dağıtım
yönetmeliği, tüketici hizmetleri, hizmet kalitesi, dengeleme ve
uzlaştırma, yan hizmetler, ölçüm sistemleri, tarifeler, kayıp-kaçak,
kesinti bildirimi, sayaç tebliği, bağlantı görüşü, denetim.

**Resmî Gazete** — kuvvetli akım tesisleri, iç tesisler, topraklama,
proje yönetmeliği, Elektrik Piyasası Kanunu, enerji verimliliği
mevzuatı (kanun + bina enerji performansı), İSG mevzuatı (kanun +
elektrik işyerlerinde İSG), yapı denetimi kanunu, enerji kimlik belgesi,
elektromanyetik alan yönetmeliği, tesis kabul yönetmeliği, genel
aydınlatma uygulama esasları.

**TEİAŞ** — şebeke yönetmeliği, iletim bağlantı SKU, OG/YG bağlantı
kriterleri, trafo merkezi bağlantı, koruma-koordinasyon, reaktif güç/güç
kalitesi, ölçüm noktaları, işletme-bakım.

**Enerji Bakanlığı** — ulusal enerji verimliliği eylem planı, Türkiye
ulusal enerji planı, YEK Kanunu, milli enerji politikası, enerji
verimliliği strateji belgesi.

**TSE / TS EN** — HD 60364 (AG tesisler), EN 50522/61936-1 (topraklama/YG
tesis), EN 62271 (hücreler), EN 60529 (IP), EN 61439 (panolar), EN 60076
(trafo), EN 60269/60898/60947 (koruma/kesici), EN 60502 (güç kablosu),
EN 62305 (yıldırımdan korunma), EN 50160 (gerilim kalitesi), EN 61557
(ölçüm), EN 60228 (iletken), EN 61140 (elektrik çarpması koruması), EN
60204-1, EN 50525, EN 62262 (IK), EN 50110-1 (işletme emniyeti).

**IEC** — 60364, 60502, 60076, 62271, 61439, 60529, 60947, 60269, 60898,
62305, 61850 (SCADA), 60099 (parafudr), 61557, 60228, 60071 (yalıtım
koordinasyonu).

**CENELEC** — EN 50341/50423 (havai hatlar), HD 60364, EN 50522, EN
62271, EN 61439, EN 50160, EN 62305.

**IEEE** — 80 (trafo merkezi topraklaması), 1584 (arc-flash), 519
(harmonik kontrol), C57.12.00 (trafo), 1547 (dağıtık üretim bağlantısı).

## 3. `sourceVerified: false` — neden ve ne anlama gelir

Sprint 6'nın en katı kuralı **"belge uydurma"** idi: kurumların
gerçekten yayınladığı bilinen kategori/başlık/standart numaraları
kataloglandı (ör. "TEDAŞ beton direk şartnamesi yayınlar" veya "IEC
60502 var" — bunlar mühendislik literatüründe yaygın bilinen, tartışmasız
gerçeklerdir), ANCAK şu bilgiler **doğrulanmadan** uydurulmadı:

- Tam resmî doküman/şartname numarası
- Yayın/yürürlük tarihi (`publishDate`/`effectiveDate` → `"Doğrulanacak"`)
- Doğrudan PDF/kaynak bağlantısı (`sourceUrl`/`pdfPath` → boş veya kurumun
  genel ana sayfası, asla uydurma bir derin bağlantı DEĞİL)

Bu yüzden 107 belgenin tümü `sourceVerified: false` işaretlidir.
`tests/libraryContent.test.ts`, bu durumun **test hatası sayılmadığını**
açıkça doğrular — `sourceVerified: false`, kütüphanenin dürüstlük
ilkesinin (bkz. "Kaynak doğrulaması gerekli" — LIBRARY_ARCHITECTURE.md)
çalıştığının kanıtıdır, bir eksiklik değildir.

### Doğrulanmamış belgelerin tam listesi

Aşağıdaki id'ler `sourceVerified: false` taşır (kurum klasörüne göre
gruplu). Yayın öncesi her biri ilgili kurumun resmî yayın kanalından tek
tek doğrulanmalıdır:

**TEDAŞ (23):** og-xlpe-kablo, beton-kosk, sayac-panosu, og-parafudr,
og-kesici, ag-kesici, og-ayirici, ag-ayirici, og-sigorta, ag-sigorta,
topraklama-elektrot, topraklama-baglanti, aydinlatma-diregi, beton-direk,
demir-direk, travers, og-izolator, ag-izolator, iletken,
baglanti-elemanlari, scada-ekipman, kompanzasyon, dagitim-merkezi.

**EPDK (12):** epdk-lisans, epdk-baglanti-sku, epdk-dagitim,
epdk-dengeleme-uzlastirma, epdk-yan-hizmetler, epdk-olcum-sistemleri,
epdk-tarifeler, epdk-kayip-kacak, epdk-kesinti-bildirim,
epdk-sayac-teblig, epdk-baglanti-gorusu, epdk-denetim.

**Resmî Gazete (11):** elektrik-tesisleri-proje-yonetmelik,
elektrik-piyasasi-kanunu, enerji-verimliligi-kanunu,
bina-enerji-performansi-yonetmelik, isg-kanunu,
elektrik-isyerlerinde-isg-yonetmelik, yapi-denetimi-kanunu,
enerji-kimlik-belgesi-yonetmelik, elektromanyetik-alan-yonetmelik,
elektrik-tesisleri-kabul-yonetmelik, genel-aydinlatma-uygulama-esaslari.

**TEİAŞ (8, tümü):** teias-sebeke-yonetmelik, teias-iletim-baglanti-sku,
teias-og-yg-baglanti-kriterleri, teias-trafo-merkezi-baglanti,
teias-koruma-koordinasyon, teias-reaktif-guc-kalite,
teias-olcum-noktalari, teias-isletme-bakim.

**Enerji Bakanlığı (5, tümü):** ulusal-enerji-verimliligi-eylem-plani,
turkiye-ulusal-enerji-plani, yek-kanunu, milli-enerji-politikasi,
enerji-verimliligi-strateji-belgesi.

**TSE / TS EN (20, tümü):** ts-hd-60364, ts-en-50522, ts-en-61936-1,
ts-en-62271, ts-en-60529, ts-en-61439, ts-en-60076, ts-en-60269,
ts-en-60898, ts-en-60947, ts-en-60502, ts-en-62305, ts-en-50160,
ts-en-61557, ts-en-60228, ts-en-61140, ts-en-60204-1, ts-en-50525,
ts-en-62262, ts-en-50110-1.

**IEC (15, tümü):** iec-60364, iec-60502, iec-60076, iec-62271,
iec-61439, iec-60529, iec-60947, iec-60269, iec-60898, iec-62305,
iec-61850, iec-60099, iec-61557, iec-60228, iec-60071.

**CENELEC (8, tümü):** cenelec-en-50341, cenelec-en-50423,
cenelec-hd-60364, cenelec-en-50522, cenelec-en-62271, cenelec-en-61439,
cenelec-en-50160, cenelec-en-62305.

**IEEE (5, tümü):** ieee-80, ieee-1584, ieee-519, ieee-c57-12-00,
ieee-1547.

## 4. Telifli standartlar hakkında not

TSE, IEC, CENELEC ve IEEE **telif hakkıyla korunan** standart
kuruluşlarıdır — bu kütüphane, satın alınması gereken bu standartların
**tam metnini asla içermez ve içermeyecektir**. Bu kurumların tüm
kayıtları kasıtlı olarak yalnızca **metadata/referans** amaçlıdır:

- `pdfPath` ve `sourceUrl` her zaman boş bırakılır (`referenceEntry.ts`
  → `referansGirdisi()` fabrika fonksiyonu bunu zorunlu kılar).
- `summary` alanı yalnızca standardın **konusunu/kapsamını** anlatır,
  standardın kendi metnini alıntılamaz.
- Standart numarası ve İngilizce başlığı (ör. "IEC 60502 — Power Cables
  with Extruded Insulation") kamuya açık, telifsiz bilgidir; bu nedenle
  serbestçe kataloglanabilir.

Bu yaklaşım, sprint spesifikasyonunun "Telifli standartların tam metnini
ekleme" / "PDF içeriği ekleme" / "PDF dosyası indirme" kısıtlarını
doğrudan uygular.

## 5. Kapsam dışı / eksik alanlar

Aşağıdaki alanlar bu sprintte **bilinçli olarak** kapsam dışı bırakıldı
(gerçekliğinden emin olunamadığı ya da sprint kapsamına girmediği için):

- **`Diğer` (Other) klasörü** — hâlâ boş; yukarıdaki 9 kuruma girmeyen
  kaynaklar için ayrılmış ama şu an gerçek bir içerik atanmadı.
- **Belediye/il özel idaresi düzeyinde yerel yönetmelikler** — kapsam
  dışı, ulusal mevzuata odaklanıldı.
- **TEDAŞ'ın bölge müdürlüğü bazlı yerel ek şartnameleri** — yalnızca
  merkezi/ulusal TEDAŞ şartnameleri kataloglandı.
- **Tam doküman numaraları, revizyon tarihleri, resmî PDF bağlantıları**
  — bkz. §3, tüm Sprint 6 belgelerinde "Doğrulanacak" olarak işaretli.
- **Deprem/yapısal yük yönetmelikleri** (elektrik dışı yapı mevzuatı) —
  yalnızca elektrik tesisleriyle doğrudan kesişen yapı denetimi kanunu
  kataloglandı, genel deprem yönetmeliği kapsam dışı.

## 6. Gelecek: PDF bağlama planı

Bu kütüphane şu an yalnızca **metadata** taşır — hiçbir belgenin gerçek
PDF içeriği eklenmedi (`pdfPath` ya kurumun genel ana sayfasına ya da
boşa işaret eder). İleride gerçek doküman bağlama şu şekilde
düşünülüyor:

1. **Telifsiz kurumlar** (TEDAŞ, TEİAŞ, EPDK, Resmî Gazete, Enerji
   Bakanlığı) için: doğrulama sürecinde her belgenin gerçek PDF
   bağlantısı `sourceUrl`'e yazılır, `sourceVerified: true` yapılır.
   Gerçek PDF dosyası uygulamaya **gömülmez** — yalnızca dış bağlantı
   olarak tutulur (mevcut "PDF Aç" davranışıyla tutarlı).
2. **Telifli kurumlar** (TSE, IEC, CENELEC, IEEE) için: PDF içeriği hiçbir
   zaman eklenmez; yalnızca satın alma/erişim sayfasına dış bağlantı
   (`sourceUrl`) eklenebilir — bu da yalnızca kurumun resmi mağaza/katalog
   sayfası doğrulandıktan sonra.
3. Bu Repository katmanının 15 fonksiyonluk dar arayüzü sayesinde (bkz.
   LIBRARY_ARCHITECTURE.md §4/§10), PDF bağlama veya RAG entegrasyonu
   yalnızca `repository.ts`'in içini değiştirecek — ekranlarda hiçbir
   değişiklik gerekmeyecek.
