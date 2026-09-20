import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { cardShadow } from '../constants/theme';
import { formatServings } from '../utils/calculations';

type Props = { todayIntake: number; totalRemaining: number };

export function DailySummary({ todayIntake, totalRemaining }: Props) {
  const { colors, isDark } = useApp();
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.card, borderColor: colors.border },
        cardShadow(isDark),
      ]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>TODAY'S INTAKE</Text>
      <Text style={[styles.value, { color: colors.text }]}>{formatServings(todayIntake)}</Text>
      <Text style={[styles.caption, { color: colors.textSecondary }]}>
        {formatServings(totalRemaining)} remaining across your packs
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
  },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  value: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  caption: { fontSize: 14, marginTop: 2 },
});
