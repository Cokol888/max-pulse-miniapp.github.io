import { useCallback, useEffect, useState } from 'react';
import { Panel, Container, Grid, Typography, Button } from '@maxhub/max-ui';
import PulseScreen from './screens/PulseScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { getWebApp, isInMax } from './lib/max';

type Screen = 'pulse' | 'history' | 'settings';

const App = () => {
  const [screen, setScreen] = useState<Screen>('pulse');

  const navItems: Array<{ id: Screen; label: string; description: string }> = [
    { id: 'pulse', label: 'Pulse', description: 'Оценка настроения команды' },
    { id: 'history', label: 'History', description: 'История и экспорт' },
    { id: 'settings', label: 'Settings', description: 'Доступы и проверка' },
  ];

  const handleBack = useCallback(() => {
    setScreen('pulse');
  }, []);

  useEffect(() => {
    if (isInMax()) {
      getWebApp()?.ready();
    }
  }, []);

  useEffect(() => {
    const webApp = getWebApp();
    const backButton = webApp?.BackButton;
    if (!backButton) {
      return;
    }

    if (screen !== 'pulse') {
      backButton.show();
      backButton.onClick(handleBack);
    } else {
      backButton.hide();
      backButton.offClick(handleBack);
    }

    return () => {
      backButton.offClick(handleBack);
    };
  }, [handleBack, screen]);

  return (
    <Panel className="app-shell">
      <Container className="app-header">
        <Grid className="header-stack">
          <Typography.Title variant="large-strong">Pulse</Typography.Title>
          <Typography.Body variant="small" className="muted-text">
            Быстрый снимок состояния команды и удобный журнал изменений.
          </Typography.Body>
          <Grid className="app-nav">
            {navItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={screen === item.id ? 'tab-button is-active' : 'tab-button'}
              >
                <span className="tab-label">{item.label}</span>
                <span className="tab-description">{item.description}</span>
              </Button>
            ))}
          </Grid>
        </Grid>
      </Container>
      <Container className="app-content">
        {screen === 'pulse' && <PulseScreen />}
        {screen === 'history' && <HistoryScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </Container>
    </Panel>
  );
};

export default App;
