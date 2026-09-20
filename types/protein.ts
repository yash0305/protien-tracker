export type ProteinProduct = {
  id: string;
  name: string;
  shortName: string;
  totalServings: number;
};

/**
 * A physical pack. Remaining servings are NOT stored here; they are derived
 * from `totalServings` minus this pack's consumption records, so the two can
 * never disagree.
 */
export type ProteinPack = {
  id: string;
  proteinId: string;
  totalServings: number;
  startedAt: string; // ISO timestamp
  endedAt?: string; // ISO timestamp, set when the pack is archived
};

export type ConsumptionRecord = {
  id: string;
  proteinId: string;
  packId: string;
  date: string; // local calendar day, YYYY-MM-DD
  servings: number;
  createdAt: string; // ISO timestamp, used for ordering within a day
};

export type TrackerData = {
  packs: ProteinPack[];
  records: ConsumptionRecord[];
};

export type ThemePreference = 'light' | 'dark' | 'system';

export type AppSettings = {
  theme: ThemePreference;
};
