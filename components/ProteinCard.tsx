import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { ProteinProduct } from '../types/protein';
import { getProgressMessage } from '../utils/calculations';
import { ActionButton } from './ActionButton';
import { AnimatedNumber } from './AnimatedNumber';
import { ConsumeButton } from './ConsumeButton';
import { ProgressIndicator } from './ProgressIndicator';

type Props = {
  product: ProteinProduct;
  remaining: number;
  total: number;
  consumedToday: boolean;
  onConsume: (proteinId: string) => void;
  onUndo: (proteinId: string) => void;
};

export const ProteinCard = memo(function ProteinCard({
  product,
  remaining,
  total,
  consumedToday,
  onConsume,
  onUndo,
}: Props) {
  const { colors, isDark } = useApp();
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const previousRemaining = useRef(remaining);

  const finished = remaining === 0;
  const consumed = total - remaining;
  const message = getProgressMessage(remaining, total, consumedToday);

  // Subtle "bump" whenever the remaining count changes.
  useEffect(() => {
    if (previousRemaining.current === remaining) return;
    previousRemaining.current = remaining;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.985, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [remaining, scale]);

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale }] },
        cardShadow(isDark),
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="nutrition" size={18} color={colors.accentStrong} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
      </View>

      <View style={styles.body}>
        <ProgressIndicator
          progress={total > 0 ? remaining / total : 0}
          color={colors.accent}
          trackColor={colors.track}
        >
          <AnimatedNumber value={remaining} style={{ fontSize: 42, fontWeight: '800', color: colors.text }} />
          <Text style={[styles.ringCaption, { color: colors.textSecondary }]}>left</Text>
        </ProgressIndicator>

        <View style={styles.info}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>servings remaining</Text>
          <Text style={[styles.infoStrong, { color: colors.text }]}>
            {consumed} / {total} consumed
          </Text>
          <Text style={[styles.message, { color: colors.accentStrong }]}>{message}</Text>
        </View>
      </View>

      {finished ? (
        <View style={styles.footer}>
          <View style={[styles.finishedBanner, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.finishedText, { color: colors.accentStrong }]}>Pack Finished 🎉</Text>
          </View>
          <ActionButton
            label="Start a new pack"
            icon="refresh"
            onPress={() => router.push('/settings')}
          />
        </View>
      ) : (
        <View style={styles.footer}>
          <ConsumeButton done={consumedToday} onPress={() => onConsume(product.id)} />
          {consumedToday ? (
            <Pressable
              onPress={() => onUndo(product.id)}
              accessibilityRole="button"
              accessibilityLabel={`Undo today's ${product.name} serving`}
              hitSlop={10}
              style={styles.undo}
            >
              <Text style={[styles.undoText, { color: colors.textSecondary }]}>Undo</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  body: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringCaption: { fontSize: 12, fontWeight: '600', marginTop: -2 },
  info: { flex: 1 },
  infoLabel: { fontSize: 14 },
  infoStrong: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  message: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  footer: { marginTop: 20, gap: 10 },
  finishedBanner: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishedText: { fontSize: 17, fontWeight: '800' },
  undo: { alignSelf: 'center', paddingVertical: 2 },
  undoText: { fontSize: 13, fontWeight: '600' },
});
