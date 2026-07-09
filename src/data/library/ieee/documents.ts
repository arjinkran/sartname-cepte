// IEEE (Institute of Electrical and Electronics Engineers) standart
// REFERANSLARI.
//
// ⚠️ YALNIZCA METADATA/REFERANS — telifli standartların tam metni
// EKLENMEDİ. Standart numaraları elektrik mühendisliği literatüründe
// yaygın bilinen numaralardır; güncel baskı/yıl doğrulanmadığından tümü
// `sourceVerified: false` — bkz. docs/CONTENT_COVERAGE.md.
// Sprint 6 — madde 9: en az 5 referans hedefi (topraklama/koruma/güç
// kalitesi ile ilişkili standartlar önceliklidir).
import type { Document } from '../types.ts';
import { referansGirdisi } from '../referenceEntry.ts';

export const DOCUMENTS: readonly Document[] = [
  referansGirdisi({
    id: 'ieee-80',
    no: 'IEEE 80',
    title: 'Guide for Safety in AC Substation Grounding',
    institution: 'IEEE',
    category: 'Topraklama',
    summary: 'AA trafo merkezlerinde topraklama sisteminin güvenli tasarımı için dokunma/adım gerilimi hesap yöntemlerini tanımlayan kılavuz standarttır.',
    keywords: ['ieee 80', 'substation grounding', 'trafo merkezi topraklaması', 'dokunma gerilimi'],
    crossReferences: ['topraklama-elektrot', 'dagitim-merkezi'],
  }),
  referansGirdisi({
    id: 'ieee-1584',
    no: 'IEEE 1584',
    title: 'Guide for Arc-Flash Hazard Calculations',
    institution: 'IEEE',
    category: 'İSG',
    summary: 'Elektrik panoları ve hücrelerinde ark patlaması (arc-flash) risk hesaplama yöntemlerini tanımlayan kılavuz standarttır.',
    keywords: ['ieee 1584', 'arc flash', 'ark patlaması', 'arc flash hesabı'],
    crossReferences: ['og-moduler-hucre', 'ag-pano-kofra'],
  }),
  referansGirdisi({
    id: 'ieee-519',
    no: 'IEEE 519',
    title: 'Recommended Practice and Requirements for Harmonic Control in Electric Power Systems',
    institution: 'IEEE',
    category: 'Hizmet Kalitesi',
    summary: 'Elektrik güç sistemlerinde harmonik distorsiyon sınırlarını ve kontrol yöntemlerini tanımlayan tavsiye edilen uygulama standardıdır.',
    keywords: ['ieee 519', 'harmonic control', 'harmonik distorsiyon', 'güç kalitesi'],
    crossReferences: ['kompanzasyon', 'ts-en-50160'],
  }),
  referansGirdisi({
    id: 'ieee-c57-12-00',
    no: 'IEEE C57.12.00',
    title: 'General Requirements for Liquid-Immersed Distribution, Power, and Regulating Transformers',
    institution: 'IEEE',
    category: 'Trafo',
    summary: 'Sıvı izoleli dağıtım ve güç transformatörlerinin genel tasarım ve deney gereklerini tanımlayan standarttır.',
    keywords: ['ieee c57.12.00', 'transformer standard', 'yağlı trafo', 'dağıtım trafosu'],
    crossReferences: ['og-dagitim-trafo', 'iec-60076'],
  }),
  referansGirdisi({
    id: 'ieee-1547',
    no: 'IEEE 1547',
    title: 'Standard for Interconnecting Distributed Energy Resources with Electric Power Systems',
    institution: 'IEEE',
    category: 'Enerji Piyasası',
    summary: 'Dağıtık enerji kaynaklarının (güneş, rüzgâr vb.) elektrik dağıtım şebekesine bağlanma teknik kriterlerini tanımlayan standarttır.',
    keywords: ['ieee 1547', 'distributed energy resources', 'dağıtık üretim bağlantısı', 'şebeke bağlantı kriteri'],
    crossReferences: ['teias-og-yg-baglanti-kriterleri', 'epdk-baglanti-sku'],
  }),
];
