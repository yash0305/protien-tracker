import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const { colors } = useApp();

  return (
    <View style={[styles.track, { backgroundColor: colors.track }]} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && { backgroundColor: colors.card }]}
          >
            <Text
              style={[styles.label, { color: selected ? colors.text : colors.textSecondary }]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '600' },
});
