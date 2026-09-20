import { Platform, type ViewStyle } from 'react-native';

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentStrong: string; // accent readable as text on the card colour
  accentSoft: string;
  onAccent: string;
  track: string;
  danger: string;
  dangerSoft: string;
};

export const lightColors: ThemeColors = {
  background: '#F4F5F2',
  card: '#FFFFFF',
  text: '#101410',
  textSecondary: '#6B7280',
  border: 'rgba(16,20,16,0.08)',
  accent: '#84CC16',
  accentStrong: '#4D7C0F',
  accentSoft: 'rgba(132,204,22,0.16)',
  onAccent: '#0B1204',
  track: 'rgba(16,20,16,0.07)',
  danger: '#DC2626',
  dangerSoft: 'rgba(220,38,38,0.09)',
};

export const darkColors: ThemeColors = {
  background: '#0E0F0D',
  card: '#181A17',
  text: '#F5F7F2',
  textSecondary: '#9AA093',
  border: 'rgba(255,255,255,0.08)',
  accent: '#A3E635',
  accentStrong: '#A3E635',
  accentSoft: 'rgba(163,230,53,0.14)',
  onAccent: '#10180A',
  track: 'rgba(255,255,255,0.10)',
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.14)',
};

/** Soft shadow in light mode; dark mode relies on the border instead. */
export function cardShadow(isDark: boolean): ViewStyle {
  if (isDark) return {};
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#0B1204',
        shadowOpacity: 0.07,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
    }) ?? {}
  );
}
