# Şartname Cepte — Proje Anayasası

Bu dosya, Sprint 14 ("Kanıt Tabanlı AI") ile birlikte projenin
**anayasası** olarak kabul edilir. Aşağıdaki 10 madde, bundan sonraki
her sprintte KORUNMASI zorunlu, geriye dönük olarak da geçerli
ilkelerdir. Herhangi bir gelecek sprint, özellik veya kod değişikliği
bu maddelerden herhangi biriyle çelişiyorsa, çelişen tarafın DEĞİL, bu
anayasanın esas alınması gerekir.

---

## 1. AI hiçbir zaman kaynağı olmayan bilgi üretmez.

Sistemdeki hiçbir AI/öneri/kanıt bileşeni, kütüphanede (`src/data/library/`)
gerçekten var olmayan bir belgeden, maddeden veya URL'den bahsedemez.
Uydurma (hallüsinasyon) içerik, bu projede bir hata değil, bir mimari
ihlaldir.

## 2. Kaynak yoksa cevap da yoktur.

Bir soru için doğrulanmış/izlenebilir hiçbir kanıt bulunamıyorsa,
sistem BOŞ bir sonuç döndürmelidir ("doğrulanmış kaynak bulunamadı")
— asla kaynaksız bir "genel bilgi" veya "muhtemelen" cevabı UYDURMAZ.

## 3. Her teknik cevap en az bir doğrulanmış kaynağa dayanır.

Gelecekte eklenecek her cevap üretme katmanı (LLM dahil), ürettiği
her teknik ifadeyi `EvidenceReference` ile eşleştirebilmelidir. Kaynağı
gösterilemeyen bir teknik iddia, bu sistemde YAYINLANAMAZ.

## 4. Her cevap izlenebilir olmalıdır.

Kullanıcı, herhangi bir öneri/kanıt/cevabın HANGİ belgeden,
HANGİ kurumdan, HANGİ güven düzeyiyle geldiğini her zaman görebilmelidir
(bkz. `EvidenceReference`, `EvidenceScore.breakdown`, `EvidenceReason`).
"Kara kutu" bir cevap üretme mekanizması bu projeye ASLA eklenmez.

## 5. AI karar vermez. Kararı kullanıcı verir.

Sistem hiçbir zaman kullanıcı adına bağlayıcı bir teknik/hukuki karar
vermez. AI/Evidence Engine yalnızca bilgiyi bulur, sıralar ve sunar —
nihai değerlendirme ve karar HER ZAMAN kullanıcıya (mühendise, saha
personeline) aittir.

## 6. Telifli standartların tam metni gösterilmez.

TSE/IEC/CENELEC/IEEE gibi telifli standart kuruluşlarının tam metni bu
uygulama içinde ASLA gösterilmez, indirilmez veya AI bağlamına dahil
edilmez — yalnızca resmî erişim/satış sayfasına yönlendirme yapılır
(bkz. `restrictedStandard` erişim türü, Sprint 11-13).

## 7. Resmî olmayan domainlerden veri alınmaz.

Hiçbir ağ isteği, arama, indirme veya kanıt toplama işlemi, kayıtlı
resmî kurum domain'i dışındaki bir kaynaktan veri ALAMAZ (bkz. Source
Resolver domain doğrulama kuralları, Sprint 11-12).

## 8. Her sprint bu anayasa korunarak geliştirilir.

Yeni bir sprint, yukarıdaki maddelerden herhangi birini ihlal eden bir
kısayol İÇEREMEZ — hız veya kapsam kaygısı bu ilkeleri geçersiz kılmaz.

## 9. Repository tek doğruluk kaynağıdır.

`src/data/library/repository.ts`, belge verisinin TEK doğruluk
kaynağıdır. Hiçbir katman (AI, Evidence Engine, Source Resolver, UI)
kendi paralel/gölge belge listesini TUTMAZ — hepsi Repository'yi okur.

## 10. Evidence Engine, gelecekteki tüm LLM entegrasyonlarının tek veri kaynağıdır.

Gelecekte eklenecek her OpenAI/LLM/RAG katmanı, `src/evidence/`'ın
ürettiği `EvidenceResult`'ı GİRDİ olarak almalıdır — belge listesini,
kaynak doğrulamasını veya güven skorlamasını KENDİ BAŞINA yeniden
icat edemez.
