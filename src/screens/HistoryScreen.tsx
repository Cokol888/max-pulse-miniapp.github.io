import { useEffect, useMemo, useState } from 'react';
import { Panel, Container, Grid, Typography, Button } from '@maxhub/max-ui';
import type { PulseEntry } from '../domain/pulse';
import { parseStartParam } from '../domain/pulse';
import { clearEntries, loadEntries } from '../lib/storage';
import { getStartParam, isInMax, shareText } from '../lib/max';

const formatTimestamp = (ts: number): string => new Date(ts).toLocaleString();

const buildSummary = (entries: PulseEntry[]): string => {
  const recent = entries.slice(0, 5);
  if (recent.length === 0) {
    return 'Pulse: пока нет записей.';
  }
  const counts = recent.reduce(
    (acc, entry) => {
      acc[entry.mood] += 1;
      return acc;
    },
    { good: 0, ok: 0, bad: 0 },
  );
  return `Pulse: 🙂 ${counts.good}, 😐 ${counts.ok}, 😫 ${counts.bad} (последние ${recent.length})`;
};

const HistoryScreen = () => {
  const [startParam, setStartParam] = useState<string | undefined>(() => getStartParam());
  const [entries, setEntries] = useState<PulseEntry[]>([]);
  const [status, setStatus] = useState<string>('');

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

  const handleExport = async () => {
    const payload = {
      context,
      exportedAt: new Date().toISOString(),
      entries,
    };
    const json = JSON.stringify(payload, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      setStatus('JSON скопирован в буфер обмена.');
    } catch {
      setStatus('Не удалось скопировать JSON.');
    }
  };

  const handleClear = () => {
    clearEntries(storageKey);
    setEntries([]);
    setStatus('История очищена.');
  };

  const handleShareSummary = async () => {
    const result = await shareText(buildSummary(entries));
    setStatus(result === 'shared' ? 'Сводка отправлена.' : 'Не удалось поделиться.');
  };

  return (
    <Panel>
      <Container>
        <Grid>
          <Typography.Title variant="large-strong">История</Typography.Title>
          <Typography.Body variant="medium">
            Контекст: {context.label}
            {context.details ? ` — ${context.details}` : ''}
          </Typography.Body>
          <Typography.Body variant="small">raw: {context.raw || '(пусто)'}</Typography.Body>

          <Grid>
            <Button onClick={handleExport}>Экспорт JSON</Button>
            <Button onClick={handleClear}>Очистить историю</Button>
            {isInMax() && <Button onClick={handleShareSummary}>Поделиться сводкой</Button>}
            {status && <Typography.Body variant="small">{status}</Typography.Body>}
          </Grid>

          <Grid>
            {entries.length === 0 && (
              <Typography.Body variant="small">История пуста.</Typography.Body>
            )}
            {entries.map((entry) => (
              <Typography.Body key={entry.id} variant="small">
                {formatTimestamp(entry.ts)} • {entry.mood.toUpperCase()} • {entry.comment}
              </Typography.Body>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Panel>
  );
};

export default HistoryScreen;
