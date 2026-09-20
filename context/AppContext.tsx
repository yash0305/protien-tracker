import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, useColorScheme } from 'react-native';

import { getProtein } from '../constants/proteins';
import { darkColors, lightColors, type ThemeColors } from '../constants/theme';
import {
  DEFAULT_SETTINGS,
  clearAllData,
  loadData,
  loadSettings,
  saveData,
  saveSettings,
} from '../storage/proteinStorage';
import type { AppSettings, ThemePreference, TrackerData } from '../types/protein';
import * as tracker from '../utils/calculations';
import { toDateKey } from '../utils/date';

type AppContextValue = {
  isLoading: boolean;
  data: TrackerData;
  settings: AppSettings;
  today: string;
  colors: ThemeColors;
  isDark: boolean;
  consumeServing: (proteinId: string) => void;
  undoTodaysServing: (proteinId: string) => void;
  startNewPack: (proteinId: string) => void;
  resetAllData: () => Promise<void>;
  setThemePreference: (theme: ThemePreference) => void;
};

const EMPTY_DATA: TrackerData = { packs: [], records: [] };

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TrackerData>(EMPTY_DATA);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [today, setToday] = useState<string>(() => toDateKey());

  // Latest data for handlers (avoids stale closures) and a queue so disk writes
  // happen strictly in the order the user made changes.
  const dataRef = useRef<TrackerData>(EMPTY_DATA);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const enqueue = useCallback((task: () => Promise<void>): Promise<void> => {
    writeQueue.current = writeQueue.current
      .then(task)
      .catch((error) => console.warn('[storage] write failed', error));
    return writeQueue.current;
  }, []);

  const commit = useCallback(
    (next: TrackerData) => {
      dataRef.current = next;
      setData(next);
      void enqueue(() => saveData(next));
    },
    [enqueue],
  );

  // Initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      const [loadedData, loadedSettings] = await Promise.all([loadData(), loadSettings()]);
      if (!alive) return;
      dataRef.current = loadedData;
      setData(loadedData);
      setSettings(loadedSettings);
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Keep "today" correct across midnight and when returning to the app.
  useEffect(() => {
    const refresh = () => setToday(toDateKey());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const interval = setInterval(refresh, 60_000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const consumeServing = useCallback(
    (proteinId: string) => {
      const next = tracker.consumeServing(dataRef.current, proteinId, toDateKey());
      if (next !== dataRef.current) commit(next);
    },
    [commit],
  );

  const undoTodaysServing = useCallback(
    (proteinId: string) => {
      const next = tracker.undoServing(dataRef.current, proteinId, toDateKey());
      if (next !== dataRef.current) commit(next);
    },
    [commit],
  );

  const startNewPack = useCallback(
    (proteinId: string) => {
      const product = getProtein(proteinId);
      if (!product) return;
      commit(tracker.startNewPack(dataRef.current, product));
    },
    [commit],
  );

  const resetAllData = useCallback(async () => {
    try {
      await writeQueue.current; // let pending writes finish so they can't resurrect data
      await clearAllData();
    } catch (error) {
      console.warn('[storage] reset failed', error);
    }
    const fresh = tracker.createInitialData();
    dataRef.current = fresh;
    setData(fresh);
    setSettings(DEFAULT_SETTINGS);
    setToday(toDateKey());
  }, []);

  const setThemePreference = useCallback(
    (theme: ThemePreference) => {
      const next: AppSettings = { theme };
      setSettings(next);
      void enqueue(() => saveSettings(next));
    },
    [enqueue],
  );

  const isDark = settings.theme === 'system' ? systemScheme === 'dark' : settings.theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo<AppContextValue>(
    () => ({
      isLoading,
      data,
      settings,
      today,
      colors,
      isDark,
      consumeServing,
      undoTodaysServing,
      startNewPack,
      resetAllData,
      setThemePreference,
    }),
    [
      isLoading,
      data,
      settings,
      today,
      colors,
      isDark,
      consumeServing,
      undoTodaysServing,
      startNewPack,
      resetAllData,
      setThemePreference,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside <AppProvider>');
  return context;
}
