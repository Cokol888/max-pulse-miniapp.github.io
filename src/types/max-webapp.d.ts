declare global {
  interface MaxWebAppInitDataUnsafe {
    start_param?: string;
  }

  interface MaxWebAppHapticFeedback {
    selectionChanged: () => void;
    notificationOccurred?: (type: 'success' | 'error' | 'warning') => void;
  }

  interface MaxWebApp {
    ready: () => void;
    platform: string;
    version: string;
    initDataUnsafe: MaxWebAppInitDataUnsafe;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    HapticFeedback: MaxWebAppHapticFeedback;
    openMaxLink: (url: string) => void;
    isMock?: boolean;
  }

  interface Window {
    WebApp?: MaxWebApp;
  }
}

export {};
