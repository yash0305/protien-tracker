import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
};

export function EmptyState({ icon, title, message }: Props) {
  const { colors } = useApp();
  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name={icon} size={30} color={colors.accentStrong} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  message: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
});
