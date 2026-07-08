// Doküman liste satırı — arama sonuçları, kategori listesi ve favorilerde ortak.
// Premium kart görünümü: radius xl, hafif gölge. Kurum, kategori, revizyon,
// özet, favori ve sağ ok bir arada (V3 mevzuat dönüşümü, madde 11).
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { colors, radius, spacing, shadow, typography } from '@/theme';
import { STATUS_LABELS } from '../data/sartnameler';
import type { Document, DocumentStatus, Institution } from '../types';

// ⚠️ TEİAŞ/TS/IEC için henüz örnek doküman yoktur (bkz. types/index.ts) ama
// rozet rengi burada tanımlı olmalı — Record<Institution,...> tamlığı için.
const INSTITUTION_RENKLERI: Record<Institution, string> = {
  'TEDAŞ': '#1D4E7E',
  'TEİAŞ': '#0F766E',
  'EPDK': '#7B3FA0',
  'Resmî Gazete': '#8C6D1F',
  'TS': '#B45309',
  'IEC': '#334155',
};

export function InstitutionBadge({ institution }: { institution: Institution }) {
  return (
    <View style={[styles.rozet, { backgroundColor: INSTITUTION_RENKLERI[institution] }]}>
      <Text style={styles.rozetText}>{institution}</Text>
    </View>
  );
}

// Güncel: yeşil, Taslak: sarı, Mülga: kırmızı — src/theme/colors.ts token'ları.
const STATUS_RENKLERI: Record<DocumentStatus, { arka: string; yazi: string }> = {
  active: { arka: '#DCFCE7', yazi: colors.success },
  deprecated: { arka: '#FEE2E2', yazi: colors.danger },
  draft: { arka: '#FEF3C7', yazi: colors.warning },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const r = STATUS_RENKLERI[status];
  return (
    <View style={[styles.rozet, { backgroundColor: r.arka }]}>
      <Text style={[styles.rozetText, { color: r.yazi }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

export function DocumentRow({ document }: { document: Document }) {
  const router = useRouter();
  const { favoriMi, favoriDegistir } = useFavoriler();
  const favori = favoriMi(document.id);

  return (
    <Pressable
      onPress={() => router.push(`/sartname/${document.id}`)}
      style={({ pressed }) => [styles.satir, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.ikonWrap}>
        <Text style={styles.ikon}>📄</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.ustSatir}>
          <InstitutionBadge institution={document.institution} />
          {document.status !== 'active' ? <StatusBadge status={document.status} /> : null}
          {document.pdfUrl ? (
            <View style={styles.pdfRozet}>
              <Text style={styles.pdfRozetText}>PDF</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.baslik} numberOfLines={2}>{document.title}</Text>
        <Text style={styles.kategoriRevizyon} numberOfLines={1}>
          {document.category} · {document.revision}
        </Text>
        <Text style={styles.ozet} numberOfLines={2}>{document.summary}</Text>
      </View>
      <View style={styles.sagAlan}>
        <Pressable onPress={() => favoriDegistir(document.id)} hitSlop={10}>
          <Text style={[styles.yildiz, favori && styles.yildizAktif]}>{favori ? '★' : '☆'}</Text>
        </Pressable>
        <Text style={styles.ok}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  satir: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadow.sm,
  },
  ikonWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.m,
    backgroundColor: colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  ikon: { fontSize: 17 },
  ustSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 },
  rozet: {
    borderRadius: radius.s,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rozetText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  pdfRozet: {
    borderRadius: radius.s,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pdfRozetText: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  baslik: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    fontFamily: typography.fontFamily,
    color: colors.textPrimary,
  },
  kategoriRevizyon: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 3, fontWeight: '600' },
  ozet: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 3 },
  sagAlan: { alignItems: 'center', justifyContent: 'space-between', paddingLeft: spacing.s, alignSelf: 'stretch' },
  yildiz: { fontSize: 24, color: colors.disabled },
  yildizAktif: { color: colors.accent },
  ok: { fontSize: 20, color: colors.textSecondary },
});
