import { User } from 'firebase/auth';

export const APP_SESSION_KEY = 'minigames:demsource-rs-minigames:app-session';
export const APP_SESSION_LIFETIME_MS = 5 * 60 * 1000;

export interface AppSession {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
}

export type SessionReadResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'valid'; session: AppSession };

export function saveSession(user: User): AppSession {
  const email = user.email ?? '';
  const session: AppSession = {
    displayName: user.displayName || email.split('@', 1)[0] || 'Player',
    email,
    authenticatedAt: Date.now(),
  };
  if (user.photoURL) {
    session.avatarUrl = user.photoURL;
  }
  try {
    localStorage.setItem(APP_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable: session lives only for this page load.
  }
  return session;
}

export function readSession(): SessionReadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(APP_SESSION_KEY);
  } catch {
    return { status: 'none' };
  }
  if (raw === null) {
    return { status: 'none' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'invalid' };
  }
  if (!isAppSession(parsed)) {
    return { status: 'invalid' };
  }
  return isExpired(parsed)
    ? { status: 'expired' }
    : { status: 'valid', session: parsed };
}

export function clearSession(): void {
  try {
    localStorage.removeItem(APP_SESSION_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function isExpired(session: AppSession, now = Date.now()): boolean {
  return now - session.authenticatedAt >= APP_SESSION_LIFETIME_MS;
}

function isAppSession(value: unknown): value is AppSession {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.displayName === 'string' &&
    typeof record.email === 'string' &&
    typeof record.authenticatedAt === 'number' &&
    Number.isFinite(record.authenticatedAt) &&
    record.authenticatedAt <= Date.now() &&
    (record.avatarUrl === undefined || typeof record.avatarUrl === 'string')
  );
}
