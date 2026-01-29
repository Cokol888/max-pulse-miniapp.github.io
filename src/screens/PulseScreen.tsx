import { useEffect, useMemo, useState } from 'react';
import { Panel, Container, Grid, Typography, Button, Textarea } from '@maxhub/max-ui';
import type { Mood, PulseEntry } from '../domain/pulse';
import { parseStartParam } from '../domain/pulse';
import { addEntry, loadEntries } from '../lib/storage';
import {
  getStartParam,
  hapticResult,
  hapticSelect,
  openModeLink,
  setClosingProtection,
} from '../lib/max';

const moodOptions: Array<{ value: Mood; label: string; emoji: string }> = [
  { value: 'good', label: 'Хорошо', emoji: '🙂' },
  { value: 'ok', label: 'Нормально', emoji: '😐' },
  { value: 'bad', label: 'Сложно', emoji: '😫' },
];

const formatTimestamp = (ts: number): string => new Date(ts).toLocaleString();

const getPlaceholder = (mode: string): string => {
  switch (mode) {
    case 'daily':
      return 'Что мешает сегодня?';
    case 'retro':
      return 'Что улучшить / что болит?';
    case 'incident':
      return 'Что нужно прямо сейчас? Нужна помощь?';
    default:
      return 'Опишите состояние команды.';
  }
};

const getPreview = (comment: string): string => {
  const trimmed = comment.trim();
  if (trimmed.length <= 80) {
    return trimmed;
  }
  return `${trimmed.slice(0, 77)}...`;
};

const buildId = (): string => {
  if ('randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pulse-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const PulseScreen = () => {
  const [startParam, setStartParam] = useState<string | undefined>(() => getStartParam());
  const [mood, setMood] = useState<Mood | null>(null);
  const [comment, setComment] = useState<string>('');
  const [entries, setEntries] = useState<PulseEntry[]>([]);
  const [message, setMessage] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => setStartParam(getStartParam());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const context = useMemo(() => parseStartParam(startParam), [startParam]);
  const storageKey = useMemo(
    () => `pulse:${context.raw || 'default'}`,
    [context.raw],
  );

  useEffect(() => {
    setEntries(loadEntries(storageKey));
  }, [storageKey]);

  const dirty = comment.trim().length > 0 || (mood !== null && !hasSubmitted);

  useEffect(() => {
    setClosingProtection(dirty);
  }, [dirty]);

  useEffect(() => {
    return () => setClosingProtection(false);
  }, []);

  const handleMoodSelect = (nextMood: Mood) => {
    setMood(nextMood);
    setHasSubmitted(false);
    hapticSelect();
  };

  const handleSubmit = () => {
    setMessage('');

    if (!mood) {
      setMessage('Выберите настроение.');
      hapticResult('warning');
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 3) {
      setMessage('Комментарий должен быть не короче 3 символов.');
      hapticResult('warning');
      return;
    }

    const entry: PulseEntry = {
      id: buildId(),
      ts: Date.now(),
      context: context.raw || 'default',
      mode: context.mode,
      mood,
      comment: trimmedComment,
    };

    const updated = addEntry(storageKey, entry);
    setEntries(updated);
    setComment('');
    setHasSubmitted(true);
    setMessage('Спасибо, принято.');
    hapticResult('success');
  };

  const latestEntry = entries[0];
  const recentEntries = entries.slice(0, 5);

  return (
    <Panel>
      <Container>
        <Grid>
          <Typography.Title variant="large-strong">Pulse</Typography.Title>
          <Typography.Body variant="medium">
            Режим: {context.label}
            {context.details ? ` — ${context.details}` : ''}
          </Typography.Body>

          <Grid>
            <Typography.Label variant="small-strong">Настроение команды</Typography.Label>
            <Grid>
              {moodOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                >
                  {option.emoji} {option.label}
                  {mood === option.value ? ' ✓' : ''}
                </Button>
              ))}
            </Grid>
          </Grid>

          <Grid>
            <Typography.Label variant="small-strong">Комментарий</Typography.Label>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={getPlaceholder(context.mode)}
              rows={4}
            />
          </Grid>

          <Grid>
            <Button onClick={handleSubmit}>Отправить</Button>
            {message && <Typography.Body variant="small">{message}</Typography.Body>}
          </Grid>

          {latestEntry && (
            <Grid>
              <Typography.Label variant="small-strong">Последняя отправка</Typography.Label>
              <Typography.Body variant="small">
                {formatTimestamp(latestEntry.ts)} — {latestEntry.mood.toUpperCase()} —{' '}
                {getPreview(latestEntry.comment)}
              </Typography.Body>
            </Grid>
          )}

          {recentEntries.length > 0 && (
            <Grid>
              <Typography.Label variant="small-strong">История</Typography.Label>
              {recentEntries.map((entry) => (
                <Typography.Body key={entry.id} variant="small">
                  {formatTimestamp(entry.ts)} • {entry.mood.toUpperCase()} •{' '}
                  {getPreview(entry.comment)}
                </Typography.Body>
              ))}
            </Grid>
          )}

          <Grid>
            <Typography.Label variant="small-strong">Открыть режим</Typography.Label>
            <Grid>
              <Button onClick={() => openModeLink('daily_today')}>Daily</Button>
              <Button onClick={() => openModeLink('retro_sprint12')}>Retro</Button>
              <Button onClick={() => openModeLink('incident_INC-481')}>Incident</Button>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Panel>
  );
};

export default PulseScreen;
