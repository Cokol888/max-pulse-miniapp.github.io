import type { WebAppLike } from './max';

const getWebApp = (): WebAppLike | null => window.WebApp ?? null;

export const waitForEvent = <T>(
  eventName: string,
  predicate: (data: unknown) => data is T,
  timeoutMs = 10000,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const webApp = getWebApp();
    if (!webApp?.onEvent || !webApp.offEvent) {
      reject(new Error('Events are not supported.'));
      return;
    }

    const onEvent = webApp.onEvent;
    const offEvent = webApp.offEvent;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      offEvent(eventName, handler);
    };

    const handler = (data: unknown) => {
      if (predicate(data)) {
        cleanup();
        resolve(data);
      }
    };

    onEvent(eventName, handler);

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for ${eventName}`));
    }, timeoutMs);
  });
};
