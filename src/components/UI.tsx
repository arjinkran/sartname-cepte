// Ortak arayüz bileşenleri — sade StyleSheet ile (NativeWind geçici olarak kaldırıldı).
import React from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  type StyleProp, type ViewStyle,
} from 'react-native';
import { colors, spacing, radius } from '../theme';

// Beyaz kart kutusu
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Etiketli sayı girişi ("12,5" gibi Türkçe ondalık virgülü kabul edilir)
export function NumberField({
  label,
  value,
  onChangeText,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.disabled}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

// Yatay seçim düğmeleri (segmented control)
export function Secim<T extends string | number>({
  label,
  secenekler,
  secili,
  onSec,
}: {
  label?: string;
  secenekler: readonly { deger: T; etiket: string }[];
  secili: T;
  onSec: (d: T) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.segmentRow}>
        {secenekler.map((s) => {
          const aktif = s.deger === secili;
          return (
            <Pressable
              key={String(s.deger)}
              onPress={() => onSec(s.deger)}
              style={[styles.segment, aktif && styles.segmentAktif]}
            >
              <Text style={[styles.segmentText, aktif && styles.segmentTextAktif]}>
                {s.etiket}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Kaydırılabilir yonga (chip) listesi — kesit serisi gibi uzun seçenekler için
export function YongaSecimi({
  label,
  degerler,
  secili,
  onSec,
  bicim = (d: number) => String(d),
}: {
  label: string;
  degerler: readonly number[];
  secili: number;
  onSec: (d: number) => void;
  bicim?: (d: number) => string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {degerler.map((d) => {
          const aktif = d === secili;
          return (
            <Pressable
              key={d}
              onPress={() => onSec(d)}
              style={[styles.chip, aktif && styles.chipAktif]}
            >
              <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>{bicim(d)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Sonuç satırı: sol etiket, sağ değer
export function SonucSatiri({
  etiket,
  deger,
  vurgulu,
  renk,
}: {
  etiket: string;
  deger: string;
  vurgulu?: boolean;
  renk?: string;
}) {
  return (
    <View style={styles.sonucRow}>
      <Text style={styles.sonucEtiket}>{etiket}</Text>
      <Text
        style={[
          styles.sonucDeger,
          vurgulu && styles.sonucDegerVurgulu,
          renk ? { color: renk } : null,
        ]}
      >
        {deger}
      </Text>
    </View>
  );
}

// Sayıyı Türkçe biçimde yaz: 1234.567 → "1.234,57"
export function tr(sayi: number, basamak = 2): string {
  if (!Number.isFinite(sayi)) return '—';
  return sayi.toLocaleString('tr-TR', {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldWrap: { marginBottom: spacing.m },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.s,
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.m,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 17, color: colors.text },
  suffix: { fontSize: 15, color: colors.textMuted, marginLeft: spacing.s },
  segmentRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.s,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.inputBg,
  },
  segmentAktif: { backgroundColor: colors.primary },
  segmentText: { fontSize: 14, color: colors.text },
  segmentTextAktif: { color: '#FFFFFF', fontWeight: '700' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    marginRight: spacing.s,
  },
  chipAktif: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text },
  chipTextAktif: { color: '#FFFFFF', fontWeight: '700' },
  sonucRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sonucEtiket: { fontSize: 14, color: colors.textMuted },
  sonucDeger: { fontSize: 15, fontWeight: '600', color: colors.text },
  sonucDegerVurgulu: { fontSize: 20, fontWeight: '800' },
});
