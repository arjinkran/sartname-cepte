// CENELEC (European Committee for Electrotechnical Standardization) standart
// REFERANSLARI.
//
// ⚠️ YALNIZCA METADATA/REFERANS — telifli standartların tam metni
// EKLENMEDİ. EN/HD numaraları elektrik mühendisliği literatüründe yaygın
// bilinen numaralardır; güncel baskı/yıl doğrulanmadığından tümü
// `sourceVerified: false` — bkz. docs/CONTENT_COVERAGE.md.
// Sprint 6 — madde 8: en az 8 referans hedefi.
import type { Document } from '../types.ts';
import { referansGirdisi } from '../referenceEntry.ts';

export const DOCUMENTS: readonly Document[] = [
  referansGirdisi({
    id: 'cenelec-en-50341',
    no: 'EN 50341',
    title: 'Overhead Electrical Lines Exceeding AC 1 kV',
    institution: 'CENELEC',
    category: 'Havai Hatlar',
    summary: '1 kV AA üzeri havai elektrik hatlarının genel gerekler ve ulusal normatif hükümlerini tanımlayan Avrupa standardıdır.',
    keywords: ['en 50341', 'havai hat standardı', 'overhead line', '1kv üzeri havai hat'],
    crossReferences: ['travers', 'og-izolator'],
  }),
  referansGirdisi({
    id: 'cenelec-en-50423',
    no: 'EN 50423',
    title: 'Overhead Electrical Lines Exceeding AC 1 kV up to and including AC 45 kV',
    institution: 'CENELEC',
    category: 'Havai Hatlar',
    summary: '1-45 kV arası AA havai elektrik hatlarının tasarım ve güvenlik gereklerini tanımlayan Avrupa standardıdır — OG dağıtım havai hatları için temel referanstır.',
    keywords: ['en 50423', 'og havai hat', '1-45kv havai hat', 'overhead line 45kv'],
    crossReferences: ['travers', 'og-izolator', 'demir-direk', 'beton-direk'],
  }),
  referansGirdisi({
    id: 'cenelec-hd-60364',
    no: 'HD 60364',
    title: 'Low-Voltage Electrical Installations',
    institution: 'CENELEC',
    category: 'AG Şebeke',
    summary: 'IEC 60364 serisinin CENELEC uyumlaştırma dokümanı (Harmonization Document) hâlidir; TS HD 60364\'ün Avrupa düzeyindeki dayanağıdır.',
    keywords: ['hd 60364', 'harmonization document', 'ag tesis standardı'],
    crossReferences: ['ts-hd-60364', 'iec-60364'],
  }),
  referansGirdisi({
    id: 'cenelec-en-50522',
    no: 'EN 50522',
    title: 'Earthing of Power Installations Exceeding 1 kV AC',
    institution: 'CENELEC',
    category: 'Topraklama',
    summary: '1 kV üzeri AA güç tesislerinde topraklama sisteminin tasarım ve boyutlandırma esaslarını tanımlayan Avrupa standardıdır.',
    keywords: ['en 50522', 'topraklama', 'og yg topraklama'],
    crossReferences: ['ts-en-50522', 'topraklama-elektrot'],
  }),
  referansGirdisi({
    id: 'cenelec-en-62271',
    no: 'EN 62271',
    title: 'High-Voltage Switchgear and Controlgear',
    institution: 'CENELEC',
    category: 'Hücreler',
    summary: 'OG/YG anahtarlama ve kumanda cihazlarının Avrupa düzeyinde uyumlaştırılmış tip deney ve performans gereklerini tanımlar.',
    keywords: ['en 62271', 'switchgear', 'og hücre standardı'],
    crossReferences: ['ts-en-62271', 'iec-62271'],
  }),
  referansGirdisi({
    id: 'cenelec-en-61439',
    no: 'EN 61439',
    title: 'Low-Voltage Switchgear and Controlgear Assemblies',
    institution: 'CENELEC',
    category: 'Dağıtım Panoları',
    summary: 'AG anahtarlama ve kumanda düzenlerinin (panolar) Avrupa düzeyinde uyumlaştırılmış tasarım doğrulama ve deney gereklerini tanımlar.',
    keywords: ['en 61439', 'switchboard', 'ag pano standardı'],
    crossReferences: ['ts-en-61439', 'iec-61439'],
  }),
  referansGirdisi({
    id: 'cenelec-en-50160',
    no: 'EN 50160',
    title: 'Voltage Characteristics of Electricity Supplied by Public Distribution Networks',
    institution: 'CENELEC',
    category: 'Hizmet Kalitesi',
    summary: 'Kamu dağıtım şebekelerinden sağlanan elektriğin gerilim karakteristiklerini (frekans, genlik, harmonik) tanımlayan Avrupa standardıdır.',
    keywords: ['en 50160', 'gerilim kalitesi', 'şebeke gerilim karakteristiği'],
    crossReferences: ['ts-en-50160', 'epdk-hizmet-kalitesi'],
  }),
  referansGirdisi({
    id: 'cenelec-en-62305',
    no: 'EN 62305',
    title: 'Protection Against Lightning',
    institution: 'CENELEC',
    category: 'Topraklama',
    summary: 'Yapı ve tesislerin yıldırımdan korunması için risk değerlendirmesi ve yıldırımlık sistemi tasarım esaslarını tanımlayan Avrupa standardıdır.',
    keywords: ['en 62305', 'lightning protection', 'yıldırımdan korunma'],
    crossReferences: ['ts-en-62305', 'iec-62305'],
  }),
];
