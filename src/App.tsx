import { useMemo, useState, useEffect } from 'react';
import { Panel, Container, Grid, Typography, Button } from '@maxhub/max-ui';

const simulationOptions = [
  { label: 'ретро', param: 'retro_sprint12' },
  { label: 'дейли', param: 'daily_standup' },
  { label: 'инцидент', param: 'incident_42' },
];

const readStartParam = () => window.WebApp?.initDataUnsafe.start_param;

const formatValue = (value?: string) => value ?? '(нет)';

const App = () => {
  const webApp = window.WebApp;
  const [startParam, setStartParam] = useState<string | undefined>(() => readStartParam());
  const [message, setMessage] = useState<string>('');
  const [simulationIndex, setSimulationIndex] = useState<number>(0);

  useEffect(() => {
    webApp?.ready();
  }, [webApp]);

  const platform = webApp?.platform ?? 'unknown';
  const version = webApp?.version ?? 'unknown';
  const isMock = webApp?.isMock === true;

  const diagnostics = useMemo(
    () => [
      { label: 'start_param', value: formatValue(startParam) },
      { label: 'platform', value: platform },
      { label: 'version', value: version },
    ],
    [platform, startParam, version],
  );

  const handleSimulate = () => {
    if (!webApp) {
      setMessage('WebApp не инициализирован.');
      return;
    }

    if (!isMock) {
      setMessage('Открывайте через диплинк.');
      return;
    }

    const nextIndex = (simulationIndex + 1) % simulationOptions.length;
    const nextOption = simulationOptions[nextIndex];
    const url = new URL(window.location.href);
    url.searchParams.set('startapp', nextOption.param);
    window.history.replaceState({}, '', url);

    webApp.initDataUnsafe.start_param = nextOption.param;
    setStartParam(nextOption.param);
    setSimulationIndex(nextIndex);
    setMessage(`Симуляция: ${nextOption.label} (${nextOption.param}).`);
  };

  return (
    <Panel>
      <Container>
        <Grid>
          <Typography.Title variant="large-strong">
            Pulse — диагностика запуска
          </Typography.Title>
          <Typography.Body variant="medium">
            Проверяем параметры запуска мини-аппа MAX.
          </Typography.Body>
          <Grid>
            {diagnostics.map((item) => (
              <Grid key={item.label}>
                <Typography.Label variant="small-strong">{item.label}</Typography.Label>
                <Typography.Body variant="medium">{item.value}</Typography.Body>
              </Grid>
            ))}
          </Grid>
          <Grid>
            <Button onClick={handleSimulate}>
              Сымитировать ретро/дейли/инцидент
            </Button>
            {message && (
              <Typography.Body variant="small">{message}</Typography.Body>
            )}
            {isMock && (
              <Typography.Body variant="small">
                Мок-режим активен: start_param берётся из ?startapp=...
              </Typography.Body>
            )}
          </Grid>
        </Grid>
      </Container>
    </Panel>
  );
};

export default App;
