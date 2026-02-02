import { useCallback, useEffect, useState } from 'react';
import { Panel, Container, Grid, Typography, Button } from '@maxhub/max-ui';
import PulseScreen from './screens/PulseScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { getWebApp, isInMax } from './lib/max';

type Screen = 'pulse' | 'history' | 'settings';

const App = () => {
  const [screen, setScreen] = useState<Screen>('pulse');

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
    <Panel>
      <Container>
        <Grid>
          <Typography.Title variant="large-strong">Pulse</Typography.Title>
          <Grid>
            <Button onClick={() => setScreen('pulse')}>Pulse</Button>
            <Button onClick={() => setScreen('history')}>History</Button>
            <Button onClick={() => setScreen('settings')}>Settings</Button>
          </Grid>
        </Grid>
      </Container>
      {screen === 'pulse' && <PulseScreen />}
      {screen === 'history' && <HistoryScreen />}
      {screen === 'settings' && <SettingsScreen />}
    </Panel>
  );
};

export default App;