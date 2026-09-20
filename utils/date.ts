const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar day as YYYY-MM-DD (uses the device's timezone, not UTC). */
export function toDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + delta);
  return toDateKey(date);
}

export function formatDayLabel(key: string, today: string): { title: string; tag: string } {
  const date = fromDateKey(key);
  const title = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  let tag = date.toLocaleDateString(undefined, { weekday: 'long' });
  if (key === today) tag = 'Today';
  else if (key === addDays(today, -1)) tag = 'Yesterday';
  return { title, tag };
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
