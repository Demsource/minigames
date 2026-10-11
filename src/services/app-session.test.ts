import { User } from 'firebase/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APP_SESSION_KEY,
  APP_SESSION_LIFETIME_MS,
  AppSession,
  clearSession,
  isExpired,
  readSession,
  saveSession,
} from './app-session';

const NOW = new Date('2026-01-01T12:00:00Z').getTime();

// Storage.getItem's value for a missing key (literal null is lint-banned)
const MISSING_ITEM: null = JSON.parse('null');

const store = new Map<string, string>();
const memoryStorage = {
  getItem: (key: string) => store.get(key) ?? MISSING_ITEM,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
};

function makeUser(fields: Partial<User>): User {
  return fields as User;
}

function storeSession(value: unknown): void {
  store.set(APP_SESSION_KEY, JSON.stringify(value));
}

function validSession(overrides: Partial<AppSession> = {}): AppSession {
  return {
    displayName: 'Player',
    email: 'player@example.com',
    authenticatedAt: NOW,
    ...overrides,
  };
}

function throwingStorage(): void {
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {
      throw new Error('SecurityError');
    },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  store.clear();
  vi.stubGlobal('localStorage', memoryStorage);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('saveSession', () => {
  it('persists the user with the current time and returns the session', () => {
    const session = saveSession(
      makeUser({
        displayName: 'Ana',
        email: 'ana@example.com',
        photoURL: 'https://example.com/ana.png',
      })
    );

    expect(session).toEqual({
      displayName: 'Ana',
      email: 'ana@example.com',
      authenticatedAt: NOW,
      avatarUrl: 'https://example.com/ana.png',
    });
    expect(JSON.parse(store.get(APP_SESSION_KEY) ?? '')).toEqual(session);
  });

  it('falls back to the email name when there is no display name', () => {
    const session = saveSession(makeUser({ email: 'ana.b@example.com' }));

    expect(session.displayName).toBe('ana.b');
    expect(session).not.toHaveProperty('avatarUrl');
  });

  it('falls back to "Player" when neither display name nor email exist', () => {
    const session = saveSession(makeUser({}));

    expect(session).toMatchObject({ displayName: 'Player', email: '' });
  });

  it('still returns the session when storage is unavailable', () => {
    throwingStorage();

    expect(saveSession(makeUser({ displayName: 'Ana' })).displayName).toBe(
      'Ana'
    );
  });
});

describe('readSession', () => {
  it('reports "none" when nothing is stored', () => {
    expect(readSession()).toEqual({ status: 'none' });
  });

  it('reports "none" when storage is unavailable', () => {
    throwingStorage();

    expect(readSession()).toEqual({ status: 'none' });
  });

  it('returns a valid stored session', () => {
    const session = validSession({ avatarUrl: 'https://example.com/a.png' });
    storeSession(session);

    expect(readSession()).toEqual({ status: 'valid', session });
  });

  it('reports "invalid" for data that is not JSON', () => {
    store.set(APP_SESSION_KEY, '{not json');

    expect(readSession()).toEqual({ status: 'invalid' });
  });

  it.each([
    ['a non-object', 'session'],
    ['null', MISSING_ITEM],
    ['an array', [validSession()]],
    ['a missing displayName', { ...validSession(), displayName: undefined }],
    ['a non-string email', { ...validSession(), email: 42 }],
    ['a string timestamp', { ...validSession(), authenticatedAt: String(NOW) }],
    ['a future timestamp', validSession({ authenticatedAt: NOW + 1 })],
    ['a non-string avatarUrl', { ...validSession(), avatarUrl: 1 }],
  ])('reports "invalid" for %s', (_label, value) => {
    storeSession(value);

    expect(readSession()).toEqual({ status: 'invalid' });
  });

  it('reports "expired" once the session lifetime has passed', () => {
    storeSession(validSession());
    vi.setSystemTime(NOW + APP_SESSION_LIFETIME_MS);

    expect(readSession()).toEqual({ status: 'expired' });
  });
});

describe('isExpired', () => {
  const session = validSession();

  it('is false just before the 5-minute lifetime ends', () => {
    expect(isExpired(session, NOW + APP_SESSION_LIFETIME_MS - 1)).toBe(false);
  });

  it('is true exactly when the lifetime ends', () => {
    expect(isExpired(session, NOW + APP_SESSION_LIFETIME_MS)).toBe(true);
  });

  it('defaults to the current time', () => {
    vi.setSystemTime(NOW + APP_SESSION_LIFETIME_MS);

    expect(isExpired(session)).toBe(true);
  });
});

describe('clearSession', () => {
  it('removes the stored session', () => {
    storeSession(validSession());

    clearSession();

    expect(readSession()).toEqual({ status: 'none' });
  });

  it('does not throw when storage is unavailable', () => {
    throwingStorage();

    expect(() => clearSession()).not.toThrow();
  });
});
