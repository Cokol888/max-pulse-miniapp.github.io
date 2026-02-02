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
  shareText,
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

const buildShareText = (entry: PulseEntry, label: string): string => {
  const moodEmoji = entry.mood === 'good' ? '🙂' : entry.mood === 'ok' ? '😐' : '😫';
  return `Pulse: ${moodEmoji} ${entry.mood} — “${getPreview(entry.comment)}” (${label})`;
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
  const storageKey = useMemo(() => `pulse:${context.raw || 'default'}`, [context.raw]);

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

  const handleShareLatest = async () => {
    const latest = entries[0];
    if (!latest) {
      return;
    }
    const result = await shareText(buildShareText(latest, context.label));
    setMessage(result === 'shared' ? 'Готово! Поделились.' : 'Не удалось поделиться.');
  };

  const latestEntry = entries[0];
  const recentEntries = entries.slice(0, 5);

  return (
    <Panel className="screen-panel">
      <Container className="screen-container">
        <Grid className="screen-stack">
          <div className="screen-header">
            <Typography.Title variant="large-strong">Pulse</Typography.Title>
            <Typography.Body variant="medium" className="muted-text">
              Режим: {context.label}
              {context.details ? ` — ${context.details}` : ''}
            </Typography.Body>
          </div>

          <Grid className="section-card">
            <Typography.Label variant="small-strong">Настроение команды</Typography.Label>
            <Grid className="button-row">
              {moodOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleMoodSelect(option.value)}
                  className={mood === option.value ? 'mood-button is-selected' : 'mood-button'}
                >
                  <span className="mood-emoji">{option.emoji}</span>
                  {option.label}
                  {mood === option.value ? ' ✓' : ''}
                </Button>
              ))}
            </Grid>
          </Grid>

          <Grid className="section-card">
            <Typography.Label variant="small-strong">Комментарий</Typography.Label>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={getPlaceholder(context.mode)}
              rows={4}
            />
          </Grid>

          <Grid className="section-card">
            <Grid className="button-row">
              <Button onClick={handleSubmit}>Отправить</Button>
              {latestEntry && <Button onClick={handleShareLatest}>Поделиться последним</Button>}
            </Grid>
            {message && (
              <Typography.Body variant="small" className="message-banner">
                {message}
              </Typography.Body>
            )}
          </Grid>

          {latestEntry && (
            <Grid className="section-card">
              <Typography.Label variant="small-strong">Последняя отправка</Typography.Label>
              <Typography.Body variant="small" className="entry-preview">
                {formatTimestamp(latestEntry.ts)} — {latestEntry.mood.toUpperCase()} —{' '}
                {getPreview(latestEntry.comment)}
              </Typography.Body>
            </Grid>
          )}

          {recentEntries.length > 0 && (
            <Grid className="section-card">
              <Typography.Label variant="small-strong">История</Typography.Label>
              <div className="entry-list">
                {recentEntries.map((entry) => (
                  <Typography.Body key={entry.id} variant="small" className="entry-preview">
                    {formatTimestamp(entry.ts)} • {entry.mood.toUpperCase()} •{' '}
                    {getPreview(entry.comment)}
                  </Typography.Body>
                ))}
              </div>
            </Grid>
          )}

          <Grid className="section-card">
            <Typography.Label variant="small-strong">Открыть режим</Typography.Label>
            <Grid className="button-row">
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
