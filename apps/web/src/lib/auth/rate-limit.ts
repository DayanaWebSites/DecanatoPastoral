type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX = 5;

export function loginPermitido(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const key = `login:${ip}`;
  const actual = buckets.get(key);
  if (!actual || actual.reset < now) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true };
  }
  if (actual.count >= MAX) {
    return { ok: false, retryAfter: Math.ceil((actual.reset - now) / 1000) };
  }
  actual.count += 1;
  return { ok: true };
}

export function resetLogin(ip: string) {
  buckets.delete(`login:${ip}`);
}
