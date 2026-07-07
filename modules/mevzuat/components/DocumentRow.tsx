// Doküman liste satırı — arama sonuçları, kategori listesi ve favorilerde ortak.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavoriler } from '@/lib/favoriler';
import { colors, spacing, radius } from '@/theme';
import { STATUS_LABELS } from '../data/sartnameler';
import type { Document, DocumentStatus, Institution } from '../types';

const INSTITUTION_RENKLERI: Record<Institution, string> = {
  'TEDAŞ': '#1D4E7E',
  'EPDK': '#7B3FA0',
  'Resmî Gazete': '#8C6D1F',
};

export function InstitutionBadge({ institution }: { institution: Institution }) {
  return (
    <View style={[styles.rozet, { backgroundColor: INSTITUTION_RENKLERI[institution] }]}>
      <Text style={styles.rozetText}>{institution}</Text>
    </View>
  );
}

const STATUS_RENKLERI: Record<DocumentStatus, { arka: string; yazi: string }> = {
  active: { arka: '#DCEFE1', yazi: '#1E8E3E' },
  deprecated: { arka: '#F8DCDA', yazi: '#C5221F' },
  draft: { arka: '#FBE9C9', yazi: '#8C6D1F' },
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
      <View style={{ flex: 1 }}>
        <View style={styles.ustSatir}>
          <InstitutionBadge institution={document.institution} />
          {document.status !== 'active' ? <StatusBadge status={document.status} /> : null}
        </View>
        <Text style={styles.baslik} numberOfLines={2}>{document.title}</Text>
        <Text style={styles.ozet} numberOfLines={2}>{document.summary}</Text>
      </View>
      <Pressable
        onPress={() => favoriDegistir(document.id)}
        hitSlop={10}
        style={styles.yildizAlani}
      >
        <Text style={[styles.yildiz, favori && styles.yildizAktif]}>{favori ? '★' : '☆'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  ustSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rozet: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing.s,
  },
  rozetText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  baslik: { fontSize: 15, fontWeight: '700', color: colors.text },
  ozet: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  yildizAlani: { paddingLeft: spacing.m, alignSelf: 'stretch', justifyContent: 'center' },
  yildiz: { fontSize: 26, color: colors.disabled },
  yildizAktif: { color: colors.accent },
});
