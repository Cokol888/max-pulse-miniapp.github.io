import type { PulseEntry } from '../domain/pulse';

const parseEntries = (raw: string | null): PulseEntry[] => {
  if (!raw) {
    return [];
  }

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter((entry): entry is PulseEntry => {
      if (!entry || typeof entry !== 'object') {
        return false;
      }
      const candidate = entry as PulseEntry;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.ts === 'number' &&
        typeof candidate.context === 'string' &&
        typeof candidate.mode === 'string' &&
        typeof candidate.mood === 'string' &&
        typeof candidate.comment === 'string'
      );
    });
  } catch {
    return [];
  }
};

export const loadEntries = (storageKey: string): PulseEntry[] => {
  return parseEntries(window.localStorage.getItem(storageKey));
};

export const addEntry = (storageKey: string, entry: PulseEntry): PulseEntry[] => {
  const entries = [entry, ...loadEntries(storageKey)].slice(0, 20);
  window.localStorage.setItem(storageKey, JSON.stringify(entries));
  return entries;
};

export const clearEntries = (storageKey: string): void => {
  window.localStorage.removeItem(storageKey);
};
