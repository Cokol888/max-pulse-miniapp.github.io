const BOT_NAME = import.meta.env.VITE_MAX_BOT_NAME ?? 'MyPulseBot';

export type HapticResultType = 'success' | 'error' | 'warning';

export type WebAppLike = MaxWebApp;

export const getWebApp = (): WebAppLike | null => window.WebApp ?? null;

export const isInMax = (): boolean => {
  const webApp = getWebApp();
  if (!webApp) {
    return false;
  }
  return webApp.isMock !== true;
};

export const getStartParam = (): string | undefined => getWebApp()?.initDataUnsafe.start_param;

export const hapticSelect = (): void => {
  const webApp = getWebApp();
  webApp?.HapticFeedback?.selectionChanged?.();
};

export const hapticResult = (type: HapticResultType): void => {
  const webApp = getWebApp();
  webApp?.HapticFeedback?.notificationOccurred?.(type);
};

export const setClosingProtection = (enabled: boolean): void => {
  const webApp = getWebApp();
  if (!webApp) {
    return;
  }
  if (enabled) {
    webApp.enableClosingConfirmation();
  } else {
    webApp.disableClosingConfirmation();
  }
};

export const openModeLink = (modePayload: string): void => {
  const webApp = getWebApp();
  if (isInMax() && webApp) {
    webApp.openMaxLink(`https://max.ru/${BOT_NAME}?startapp=${encodeURIComponent(modePayload)}`);
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set('startapp', modePayload);
  window.history.replaceState({}, '', url);

  if (webApp?.isMock) {
    webApp.initDataUnsafe.start_param = modePayload;
  }

  window.dispatchEvent(new PopStateEvent('popstate'));
};
