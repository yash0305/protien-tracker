import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '../components/ActionButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { PROTEINS } from '../constants/proteins';
import { cardShadow } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { ProteinProduct, ThemePreference } from '../types/protein';
import { getActivePack, getRemaining } from '../utils/calculations';

const THEME_OPTIONS: readonly { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function SettingsScreen() {
  const { data, settings, colors, isDark, setThemePreference, startNewPack, resetAllData } =
    useApp();

  const confirmNewPack = (product: ProteinProduct) => {
    Alert.alert(
      `Start a new ${product.name} pack?`,
      `Your current pack will be archived and your new pack will start with ${product.totalServings} servings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start New Pack', onPress: () => startNewPack(product.id) },
      ],
    );
  };

  const confirmReset = () => {
    Alert.alert(
      'Are you sure?',
      'This will permanently delete all protein tracking data stored on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Everything', style: 'destructive', onPress: () => void resetAllData() },
      ],
    );
  };

  const card = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border },
    cardShadow(isDark),
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <Text style={[styles.section, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <View style={card}>
          <SegmentedControl
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={setThemePreference}
          />
        </View>

        <Text style={[styles.section, { color: colors.textSecondary }]}>PROTEIN PACKS</Text>
        {PROTEINS.map((product) => {
          const pack = getActivePack(data, product.id);
          const remaining = pack ? getRemaining(data, pack) : product.totalServings;
          const total = pack ? pack.totalServings : product.totalServings;
          return (
            <View key={product.id} style={card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{product.name}</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                {remaining} / {total} servings remaining
              </Text>
              <View style={styles.buttonWrap}>
                <ActionButton
                  label={`Start New ${product.shortName} Pack`}
                  icon="refresh"
                  onPress={() => confirmNewPack(product)}
                />
              </View>
            </View>
          );
        })}

        <Text style={[styles.section, { color: colors.danger }]}>DANGER ZONE</Text>
        <View style={[card, { borderColor: colors.danger + '40' }]}>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Deletes every pack, all history and your settings from this device.
          </Text>
          <View style={styles.buttonWrap}>
            <ActionButton
              label="Reset All Data"
              icon="trash-outline"
              variant="danger"
              onPress={confirmReset}
            />
          </View>
        </View>

        <View style={styles.privacy}>
          <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
          <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
            Everything stays on this device. No account, no network.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, marginBottom: 8 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 22, marginBottom: 10 },
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardSub: { fontSize: 14, marginTop: 3 },
  buttonWrap: { marginTop: 14 },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  privacyText: { fontSize: 13 },
});
