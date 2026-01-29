import { useEffect } from 'react';
import PulseScreen from './screens/PulseScreen';
import { getWebApp, isInMax } from './lib/max';

const App = () => {
  useEffect(() => {
    if (isInMax()) {
      getWebApp()?.ready();
    }
  }, []);

  return <PulseScreen />;
};

export default App;
