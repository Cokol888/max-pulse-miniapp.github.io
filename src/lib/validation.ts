import { getWebApp, isInMax } from './max';

export interface ValidationState {
  ok: boolean;
  reason?: string;
  data?: {
    user?: unknown;
    chat?: unknown;
    start_param?: string;
    query_id?: string;
    auth_date?: number;
  };
  skipped?: boolean;
}

export const validateInitData = async (): Promise<ValidationState> => {
  const webApp = getWebApp();
  const validationUrl = import.meta.env.VITE_VALIDATION_URL;

  if (!isInMax()) {
    return { ok: false, reason: 'not in MAX', skipped: true };
  }

  if (!validationUrl) {
    return { ok: false, reason: 'validation endpoint not configured', skipped: true };
  }

  const initData = webApp?.initData;
  if (!initData) {
    return { ok: false, reason: 'no initData (not in MAX)' };
  }

  try {
    const response = await fetch(`${validationUrl}/api/validate-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { reason?: string };
      return { ok: false, reason: error.reason ?? 'validation failed' };
    }

    const data = (await response.json()) as { data?: ValidationState['data'] };
    return { ok: true, data: data.data };
  } catch {
    return { ok: false, reason: 'network error' };
  }
};
