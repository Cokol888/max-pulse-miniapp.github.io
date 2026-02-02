export type PulseMode = 'daily' | 'retro' | 'incident' | 'unknown';
export type Mood = 'good' | 'ok' | 'bad';

export interface PulseContext {
  raw: string;
  mode: PulseMode;
  label: string;
  details?: string;
}

export interface PulseEntry {
  id: string;
  ts: number;
  context: string;
  mode: PulseMode;
  mood: Mood;
  comment: string;
}

const buildContext = (
  raw: string,
  mode: PulseMode,
  label: string,
  details?: string,
): PulseContext => ({
  raw,
  mode,
  label,
  details,
});

export const parseStartParam = (rawParam: string | undefined): PulseContext => {
  const raw = rawParam?.trim() ?? '';

  if (!raw) {
    return buildContext('', 'unknown', 'Неизвестный режим');
  }

  if (raw.startsWith('daily_')) {
    return buildContext(raw, 'daily', 'Daily check-in');
  }

  if (raw.startsWith('retro_')) {
    return buildContext(raw, 'retro', 'Ретро', raw.replace('retro_', '').replace(/_/g, ' '));
  }

  if (raw.startsWith('incident_')) {
    const details = raw.replace('incident_', '').replace(/_/g, ' ');
    return buildContext(raw, 'incident', 'Инцидент', details || undefined);
  }

  return buildContext(raw, 'unknown', 'Неизвестный режим');
};
