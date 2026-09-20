import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailySummary } from '../components/DailySummary';
import { ProteinCard } from '../components/ProteinCard';
import { PROTEINS, SERVINGS_PER_DAY_LIMIT } from '../constants/proteins';
import { useApp } from '../context/AppContext';
import {
  getActivePack,
  getRemaining,
  getServingsOnDate,
  getTodayIntake,
  getTotalRemaining,
} from '../utils/calculations';

export default function HomeScreen() {
  const { data, today, colors, consumeServing, undoTodaysServing } = useApp();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Protein Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Keep track of your daily protein servings.
        </Text>

        <DailySummary
          todayIntake={getTodayIntake(data, today)}
          totalRemaining={getTotalRemaining(data)}
        />

        {PROTEINS.map((product) => {
          const pack = getActivePack(data, product.id);
          if (!pack) return null;
          return (
            <ProteinCard
              key={product.id}
              product={product}
              remaining={getRemaining(data, pack)}
              total={pack.totalServings}
              consumedToday={getServingsOnDate(data, product.id, today) >= SERVINGS_PER_DAY_LIMIT}
              onConsume={consumeServing}
              onUndo={undoTodaysServing}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { fontSize: 15, marginTop: 4, marginBottom: 22 },
});
