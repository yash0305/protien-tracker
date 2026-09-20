import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { SegmentedControl } from '../components/SegmentedControl';
import { getProtein } from '../constants/proteins';
import { cardShadow } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { ProteinPack } from '../types/protein';
import {
  formatServings,
  getPackConsumed,
  groupHistory,
  type HistoryDay,
} from '../utils/calculations';
import { formatDayLabel, formatShortDate } from '../utils/date';

type HistoryTab = 'timeline' | 'packs';

const TABS = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'packs', label: 'Packs' },
] as const;

function DayCard({ day, today }: { day: HistoryDay; today: string }) {
  const { colors, isDark } = useApp();
  const { title, tag } = formatDayLabel(day.date, today);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        cardShadow(isDark),
      ]}
    >
      <View style={styles.dayHeader}>
        <View>
          <Text style={[styles.dayTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.dayTag, { color: colors.textSecondary }]}>{tag}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.pillText, { color: colors.accentStrong }]}>
            {formatServings(day.total)}
          </Text>
        </View>
      </View>

      {day.records.map((record, index) => (
        <View
          key={record.id}
          style={[
            styles.row,
            index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.rowName, { color: colors.text }]}>
            {getProtein(record.proteinId)?.name ?? 'Protein'}
          </Text>
          <Text style={[styles.rowAmount, { color: colors.textSecondary }]}>
            {formatServings(record.servings)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function PackRow({ pack }: { pack: ProteinPack }) {
  const { data, colors, isDark } = useApp();
  const consumed = getPackConsumed(data, pack.id);
  const finished = consumed >= pack.totalServings;
  const status = pack.endedAt ? 'Archived' : finished ? 'Finished' : 'In use';
  const percent = pack.totalServings > 0 ? Math.min(100, (consumed / pack.totalServings) * 100) : 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        cardShadow(isDark),
      ]}
    >
      <View style={styles.dayHeader}>
        <Text style={[styles.dayTitle, { color: colors.text }]}>
          {getProtein(pack.proteinId)?.name ?? 'Protein'}
        </Text>
        <View style={[styles.pill, { backgroundColor: status === 'In use' ? colors.accentSoft : colors.track }]}>
          <Text
            style={[
              styles.pillText,
              { color: status === 'In use' ? colors.accentStrong : colors.textSecondary },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      <View style={[styles.barTrack, { backgroundColor: colors.track }]}>
        <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: colors.accent }]} />
      </View>

      <Text style={[styles.packMeta, { color: colors.textSecondary }]}>
        {consumed} / {pack.totalServings} servings consumed
      </Text>
      <Text style={[styles.packMeta, { color: colors.textSecondary }]}>
        Started {formatShortDate(pack.startedAt)}
        {pack.endedAt ? ` · Ended ${formatShortDate(pack.endedAt)}` : ''}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { data, today, colors } = useApp();
  const [tab, setTab] = useState<HistoryTab>('timeline');

  const days = useMemo(() => groupHistory(data), [data]);
  const packs = useMemo(
    () => [...data.packs].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)),
    [data.packs],
  );

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>History</Text>
      <SegmentedControl options={TABS} value={tab} onChange={setTab} />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      {tab === 'timeline' ? (
        <FlatList
          data={days}
          keyExtractor={(day) => day.date}
          renderItem={({ item }) => <DayCard day={item} today={today} />}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No servings recorded yet"
              message="Tap “I had 1 serving today” on the Home screen and it will show up here."
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={packs}
          keyExtractor={(pack) => pack.id}
          renderItem={({ item }) => <PackRow pack={item} />}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 18, gap: 16 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  dayTag: { fontSize: 13, marginTop: 1 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowName: { flex: 1, fontSize: 15, fontWeight: '600' },
  rowAmount: { fontSize: 14 },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
  barFill: { height: '100%', borderRadius: 4 },
  packMeta: { fontSize: 13, marginTop: 2 },
});
