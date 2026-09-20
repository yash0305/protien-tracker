import type { ProteinProduct } from '../types/protein';

/** Add a product here and it appears everywhere (Home, Settings, History). */
export const PROTEINS: readonly ProteinProduct[] = [
  { id: 'amul', name: 'Amul Protein', shortName: 'Amul', totalServings: 30 },
  { id: 'avvatar', name: 'Avvatar Protein', shortName: 'Avvatar', totalServings: 25 },
];

/** Change this to allow more than one serving per product per day. */
export const SERVINGS_PER_DAY_LIMIT = 1;

export function getProtein(id: string): ProteinProduct | undefined {
  return PROTEINS.find((p) => p.id === id);
}
