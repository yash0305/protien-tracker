import { PROTEINS, SERVINGS_PER_DAY_LIMIT } from '../constants/proteins';
import type {
  ConsumptionRecord,
  ProteinPack,
  ProteinProduct,
  TrackerData,
} from '../types/protein';

/* ---------- factories ---------- */

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createPack(product: ProteinProduct, startedAt: Date = new Date()): ProteinPack {
  return {
    id: createId('pack'),
    proteinId: product.id,
    totalServings: product.totalServings,
    startedAt: startedAt.toISOString(),
  };
}

export function createInitialData(now: Date = new Date()): TrackerData {
  return { packs: PROTEINS.map((p) => createPack(p, now)), records: [] };
}

/** Guarantees every known product has an active pack (e.g. after adding a product). */
export function ensureActivePacks(data: TrackerData, now: Date = new Date()): TrackerData {
  const missing = PROTEINS.filter((p) => !getActivePack(data, p.id));
  if (missing.length === 0) return data;
  return { ...data, packs: [...data.packs, ...missing.map((p) => createPack(p, now))] };
}

/* ---------- selectors ---------- */

export function getActivePack(data: TrackerData, proteinId: string): ProteinPack | undefined {
  return data.packs.find((p) => p.proteinId === proteinId && !p.endedAt);
}

export function getPackConsumed(data: TrackerData, packId: string): number {
  return data.records.reduce((sum, r) => (r.packId === packId ? sum + r.servings : sum), 0);
}

export function getRemaining(data: TrackerData, pack: ProteinPack): number {
  return Math.max(0, pack.totalServings - getPackConsumed(data, pack.id));
}

export function getServingsOnDate(data: TrackerData, proteinId: string, dateKey: string): number {
  return data.records.reduce(
    (sum, r) => (r.proteinId === proteinId && r.date === dateKey ? sum + r.servings : sum),
    0,
  );
}

export function canConsume(data: TrackerData, proteinId: string, dateKey: string): boolean {
  const pack = getActivePack(data, proteinId);
  if (!pack) return false;
  return (
    getRemaining(data, pack) > 0 &&
    getServingsOnDate(data, proteinId, dateKey) < SERVINGS_PER_DAY_LIMIT
  );
}

export function getTodayIntake(data: TrackerData, dateKey: string): number {
  return data.records.reduce((sum, r) => (r.date === dateKey ? sum + r.servings : sum), 0);
}

export function getTotalRemaining(data: TrackerData): number {
  return PROTEINS.reduce((sum, product) => {
    const pack = getActivePack(data, product.id);
    return pack ? sum + getRemaining(data, pack) : sum;
  }, 0);
}

/* ---------- pure state transitions ---------- */

/** Returns the same object reference when nothing changed, so callers can skip saving. */
export function consumeServing(
  data: TrackerData,
  proteinId: string,
  dateKey: string,
  now: Date = new Date(),
): TrackerData {
  if (!canConsume(data, proteinId, dateKey)) return data;
  const pack = getActivePack(data, proteinId);
  if (!pack) return data;
  const record: ConsumptionRecord = {
    id: createId('rec'),
    proteinId,
    packId: pack.id,
    date: dateKey,
    servings: 1,
    createdAt: now.toISOString(),
  };
  return { ...data, records: [...data.records, record] };
}

/** Removes the most recent record for this protein on this day. */
export function undoServing(data: TrackerData, proteinId: string, dateKey: string): TrackerData {
  const matches = data.records
    .filter((r) => r.proteinId === proteinId && r.date === dateKey)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (matches.length === 0) return data;
  const targetId = matches[0].id;
  return { ...data, records: data.records.filter((r) => r.id !== targetId) };
}

/** Archives the active pack (keeps its records) and starts a fresh one. */
export function startNewPack(
  data: TrackerData,
  product: ProteinProduct,
  now: Date = new Date(),
): TrackerData {
  const active = getActivePack(data, product.id);
  const packs = data.packs.map((p) =>
    active && p.id === active.id ? { ...p, endedAt: now.toISOString() } : p,
  );
  return { ...data, packs: [...packs, createPack(product, now)] };
}

/* ---------- history ---------- */

export type HistoryDay = {
  date: string;
  records: ConsumptionRecord[];
  total: number;
};

export function groupHistory(data: TrackerData): HistoryDay[] {
  const byDate = new Map<string, ConsumptionRecord[]>();
  for (const record of data.records) {
    const list = byDate.get(record.date);
    if (list) list.push(record);
    else byDate.set(record.date, [record]);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, records]) => ({
      date,
      records: [...records].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
      total: records.reduce((sum, r) => sum + r.servings, 0),
    }));
}

/* ---------- copy ---------- */

export function formatServings(n: number): string {
  return `${n} serving${n === 1 ? '' : 's'}`;
}

export function getProgressMessage(
  remaining: number,
  total: number,
  consumedToday: boolean,
): string {
  if (remaining === 0) return 'Time for a new pack.';
  if (remaining <= Math.max(2, Math.ceil(total * 0.1))) return 'Pack almost finished!';
  if (consumedToday) {
    const options = ['One serving down.', "You're staying consistent.", 'Keep it up!'];
    return options[remaining % options.length];
  }
  if (remaining === total) return 'Fresh pack. Great start 💪';
  return "Ready for today's serving.";
}
