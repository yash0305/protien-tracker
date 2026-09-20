import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useApp } from '../context/AppContext';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
};

export function ActionButton({ label, onPress, variant = 'secondary', icon }: Props) {
  const { colors } = useApp();
  const palette =
    variant === 'danger'
      ? { bg: colors.dangerSoft, fg: colors.danger }
      : variant === 'primary'
        ? { bg: colors.accent, fg: colors.onAccent }
        : { bg: colors.accentSoft, fg: colors.accentStrong };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={palette.fg} /> : null}
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { fontSize: 15, fontWeight: '700' },
});
