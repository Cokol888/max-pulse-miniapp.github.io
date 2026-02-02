import React from 'react';
import ReactDOM from 'react-dom/client';
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/dist/styles.css';
import App from './App';
import './index.css';

type StartParamValue = string | undefined;

const getStartParamFromUrl = (): StartParamValue => {
  const params = new URLSearchParams(window.location.search);
  return params.get('startapp') ?? undefined;
};

const createMockWebApp = (): MaxWebApp => ({
  ready: () => undefined,
  platform: 'web',
  version: 'dev',
  initDataUnsafe: {
    start_param: getStartParamFromUrl(),
  },
  enableClosingConfirmation: () => undefined,
  disableClosingConfirmation: () => undefined,
  HapticFeedback: {
    selectionChanged: () => undefined,
  },
  openMaxLink: (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  },
  isMock: true,
});

if (!window.WebApp && import.meta.env.DEV) {
  window.WebApp = createMockWebApp();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MaxUI>
      <App />
    </MaxUI>
  </React.StrictMode>,
);
