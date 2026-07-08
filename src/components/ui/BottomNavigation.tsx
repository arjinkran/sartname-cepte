// Sabit alt gezinme çubuğu — beyaz, üstte ince gri çizgi. AI sekmesi
// `emphasized` ile diğerlerinden biraz daha dikkat çekici gösterilir.
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/index.ts';

export interface BottomNavTab {
  id: string;
  label: string;
  icon: string;
  emphasized?: boolean;
}

export function BottomNavigation({
  tabs,
  activeId,
  onChange,
}: {
  tabs: readonly BottomNavTab[];
  activeId: string;
  onChange?: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.s) }]}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const labelColor = active ? colors.primary : colors.textSecondary;
        return (
          <Pressable key={tab.id} style={styles.tab} onPress={() => onChange?.(tab.id)} hitSlop={6}>
            <View style={[styles.iconWrap, tab.emphasized && styles.iconWrapEmphasized]}>
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
            <Text
              style={[
                styles.label,
                { color: labelColor, fontWeight: active ? typography.weight.bold : typography.weight.medium },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
    paddingHorizontal: spacing.s,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  iconWrapEmphasized: { backgroundColor: colors.accent },
  icon: { fontSize: 17 },
  label: { fontSize: typography.size.xs, fontFamily: typography.fontFamily },
});
