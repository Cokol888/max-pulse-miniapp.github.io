import crypto from 'crypto';

export interface ValidationResult {
  ok: boolean;
  reason?: string;
  data?: {
    user?: unknown;
    chat?: unknown;
    start_param?: string;
    query_id?: string;
    auth_date?: number;
  };
  warning?: string;
}

const parseAuthDate = (raw: string | undefined): number | null => {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return null;
  }
  return value > 1e12 ? value : value * 1000;
};

const constantTimeEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export const validateInitData = (initDataRaw: string, botToken: string): ValidationResult => {
  if (!initDataRaw) {
    return { ok: false, reason: 'initData missing' };
  }

  if (!botToken) {
    return { ok: false, reason: 'bot token missing' };
  }

  const decoded = decodeURIComponent(initDataRaw);
  const params = new URLSearchParams(decoded);
  const hash = params.get('hash');
  if (!hash) {
    return { ok: false, reason: 'hash missing' };
  }
  params.delete('hash');

  const dataCheckArray: string[] = [];
  params.forEach((value, key) => {
    dataCheckArray.push(`${key}=${value}`);
  });
  dataCheckArray.sort();
  const dataCheckString = dataCheckArray.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (!constantTimeEqual(computedHash, hash)) {
    return { ok: false, reason: 'hash mismatch' };
  }

  const authDateValue = parseAuthDate(params.get('auth_date') ?? undefined);
  if (!authDateValue) {
    return { ok: false, reason: 'auth_date missing' };
  }

  const ageMs = Date.now() - authDateValue;
  if (ageMs > 24 * 60 * 60 * 1000) {
    return { ok: false, reason: 'auth_date expired' };
  }

  const getJson = <T>(key: string): T | undefined => {
    const raw = params.get(key);
    if (!raw) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  };

  return {
    ok: true,
    data: {
      user: getJson('user'),
      chat: getJson('chat'),
      start_param: params.get('start_param') ?? undefined,
      query_id: params.get('query_id') ?? undefined,
      auth_date: authDateValue,
    },
  };
};
