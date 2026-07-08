// Doküman liste satırı — arama sonuçları, kategori listesi ve favorilerde ortak.
// Premium kart görünümü: radius xl, hafif gölge. Kurum, kategori, revizyon,
// özet, favori ve sağ ok bir arada. Sprint 4: veri artık birleşik
// src/data/documents modelinden (Document, STATUS_LABELS, Institution).
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { colors, radius, spacing, shadow, typography } from '@/theme';
import { STATUS_LABELS, type Document, type DocumentStatus, type Institution } from '@/data/documents';

// Record<Institution,...> tamlığı için 11 kurumun tamamı renklendirilmiş
// olmalı — bazılarında (Enerji Bakanlığı, CENELEC, TS EN, IEEE, Diğer)
// henüz örnek doküman olmasa da rozet rengi tanımlı olmak zorunda.
const INSTITUTION_RENKLERI: Record<Institution, string> = {
  'TEDAŞ': '#1D4E7E',
  'TEİAŞ': '#0F766E',
  'EPDK': '#7B3FA0',
  'Enerji Bakanlığı': '#9F1239',
  'Resmî Gazete': '#8C6D1F',
  'TSE': '#B45309',
  'IEC': '#334155',
  'CENELEC': '#1E3A8A',
  'TS EN': '#92400E',
  'IEEE': '#4C1D95',
  'Diğer': '#4B5563',
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
          {document.pdfPath ? (
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
