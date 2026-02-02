import { waitForEvent } from './bridgeEvents';

const BOT_NAME = import.meta.env.VITE_MAX_BOT_NAME ?? 'MyPulseBot';

export type HapticResultType = 'success' | 'error' | 'warning';

export type WebAppLike = MaxWebApp;

export type ShareResult = 'shared' | 'cancelled' | 'error';

export interface ContactResult {
  phone: string;
}

export const getWebApp = (): WebAppLike | null => window.WebApp ?? null;

export const isInMax = (): boolean => {
  const webApp = getWebApp();
  if (!webApp) {
    return false;
  }
  return webApp.isMock !== true;
};

export const getStartParam = (): string | undefined => getWebApp()?.initDataUnsafe?.start_param;

export const hapticSelect = (): void => {
  const webApp = getWebApp();
  webApp?.HapticFeedback?.selectionChanged?.();
};

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void => {
  const webApp = getWebApp();
  webApp?.HapticFeedback?.impactOccurred?.(style);
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
    if (!webApp.initDataUnsafe) {
      webApp.initDataUnsafe = {};
    }
    webApp.initDataUnsafe.start_param = modePayload;
  }

  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const openLink = (path: string): void => {
  const url = new URL(path, window.location.origin).toString();
  const webApp = getWebApp();

  if (isInMax() && webApp) {
    webApp.openMaxLink(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};

export const shareText = async (text: string, link?: string): Promise<ShareResult> => {
  const safeText = text.slice(0, 200);
  const webApp = getWebApp();

  if (isInMax() && webApp) {
    if (webApp.shareMaxContent) {
      webApp.shareMaxContent(safeText, link ?? '', undefined, undefined);
    } else if (webApp.shareContent) {
      webApp.shareContent(safeText, link);
    } else {
      return 'error';
    }

    try {
      const result = await waitForEvent<{ status?: ShareResult }>(
        'share_result',
        (data): data is { status?: ShareResult } =>
          typeof data === 'object' && data !== null && 'status' in data,
      );
      return result.status ?? 'shared';
    } catch {
      return 'shared';
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ text: safeText, url: link });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(link ? `${safeText}\n${link}` : safeText);
      return 'shared';
    } catch {
      return 'error';
    }
  }

  return 'error';
};

export const requestContact = async (): Promise<ContactResult | null> => {
  const webApp = getWebApp();
  if (!webApp?.requestContact) {
    return null;
  }

  webApp.requestContact();

  try {
    const result = await waitForEvent<ContactResult>(
      'contact_requested',
      (data): data is ContactResult =>
        typeof data === 'object' &&
        data !== null &&
        'phone' in data &&
        typeof (data as ContactResult).phone === 'string',
    );
    return result;
  } catch {
    return null;
  }
};
