/**
 * Safe local-storage helpers. All reads/writes are wrapped so the app keeps
 * working in private browsing or when storage is full/unavailable.
 */

export const STORAGE_KEYS = {
  selections: 'byomp.selections.v1',
  targets: 'byomp.targets.v1',
  savedPlans: 'byomp.savedPlans.v1',
  favourites: 'byomp.favourites.v1',
  pcosMode: 'byomp.pcosMode.v1', // legacy — migrated to activeCondition
  activeCondition: 'byomp.activeCondition.v1',
  betaUnlocked: 'byomp.betaUnlocked.v1',
} as const;

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
