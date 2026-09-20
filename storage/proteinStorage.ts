import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppSettings, ThemePreference, TrackerData } from '../types/protein';
import { createInitialData, ensureActivePacks } from '../utils/calculations';

const KEY_PREFIX = '@protein-tracker/';
const DATA_KEY = `${KEY_PREFIX}data`;
const SETTINGS_KEY = `${KEY_PREFIX}settings`;

export const DEFAULT_SETTINGS: AppSettings = { theme: 'system' };

const THEMES: readonly ThemePreference[] = ['light', 'dark', 'system'];

function isTrackerData(value: unknown): value is TrackerData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TrackerData>;
  return Array.isArray(candidate.packs) && Array.isArray(candidate.records);
}

export async function saveData(data: TrackerData): Promise<void> {
  await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
}

/**
 * Never throws. First launch (no stored data) creates and saves the default packs.
 * If the disk read itself fails we return defaults WITHOUT saving, so a transient
 * read error can't wipe real data.
 */
export async function loadData(): Promise<TrackerData> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(DATA_KEY);
  } catch (error) {
    console.warn('[storage] could not read data', error);
    return createInitialData();
  }

  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isTrackerData(parsed)) {
        const data = ensureActivePacks(parsed);
        if (data !== parsed) await saveData(data);
        return data;
      }
    } catch (error) {
      console.warn('[storage] stored data was unreadable, starting fresh', error);
    }
  }

  const initial = createInitialData();
  try {
    await saveData(initial);
  } catch (error) {
    console.warn('[storage] could not save initial data', error);
  }
  return initial;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      if (parsed.theme && THEMES.includes(parsed.theme)) return { theme: parsed.theme };
    }
  } catch (error) {
    console.warn('[storage] could not read settings', error);
  }
  return DEFAULT_SETTINGS;
}

/** Deletes every key this app owns. */
export async function clearAllData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((key) => key.startsWith(KEY_PREFIX));
  if (ours.length > 0) await AsyncStorage.multiRemove(ours);
}
