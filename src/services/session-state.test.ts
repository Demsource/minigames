import { User } from 'firebase/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_SESSION_KEY, APP_SESSION_LIFETIME_MS } from './app-session';

const logout = vi.hoisted(() => vi.fn());
vi.mock('./auth', () => ({ logout }));

const {
  endSession,
  getSession,
  initSession,
  isAuthenticated,
  restoreSession,
  startSession,
  subscribeSession,
} = await import('./session-state');

const NOW = new Date('2026-01-01T12:00:00Z').getTime();
const MISSING_ITEM: null = JSON.parse('null');

const store = new Map<string, string>();
const session = {
  displayName: 'Ana',
  email: 'ana@example.com',
  authenticatedAt: NOW,
};

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? MISSING_ITEM,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
  logout.mockResolvedValue({ success: true });
  // Module state is shared across tests: start each one in Guest Mode
  await endSession();
  logout.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('startSession', () => {
  it('saves, activates and broadcasts the new session', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    const started = startSession({
      displayName: 'Ana',
      email: 'ana@example.com',
    } as User);
    unsubscribe();

    expect(started).toEqual(session);
    expect(getSession()).toEqual(session);
    expect(isAuthenticated()).toBe(true);
    expect(listener).toHaveBeenCalledWith(session);
    expect(store.has(APP_SESSION_KEY)).toBe(true);
  });
});

describe('restoreSession', () => {
  it('activates the given session without changing authenticatedAt', () => {
    const older = { ...session, authenticatedAt: NOW - 1000 };

    restoreSession(older);

    expect(getSession()).toBe(older);
  });
});

describe('subscribeSession', () => {
  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);
    unsubscribe();

    restoreSession(session);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('endSession', () => {
  it('clears the session, notifies listeners and signs out of Firebase', async () => {
    store.set(APP_SESSION_KEY, JSON.stringify(session));
    restoreSession(session);
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    await expect(endSession()).resolves.toEqual({ success: true });
    unsubscribe();

    expect(isAuthenticated()).toBe(false);
    expect(getSession()).toBeUndefined();
    expect(store.has(APP_SESSION_KEY)).toBe(false);
    expect(listener).toHaveBeenCalledWith(undefined);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('does not notify listeners when already in Guest Mode', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    await endSession();
    unsubscribe();

    expect(listener).not.toHaveBeenCalled();
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('stays in Guest Mode and reports a failed Firebase sign-out', async () => {
    restoreSession(session);
    logout.mockResolvedValue({ success: false, error: 'Offline' });

    await expect(endSession()).resolves.toEqual({
      success: false,
      error: 'Offline',
    });
    expect(isAuthenticated()).toBe(false);
  });
});

describe('initSession', () => {
  it('restores a valid stored session without signing out', async () => {
    store.set(APP_SESSION_KEY, JSON.stringify(session));

    await expect(initSession()).resolves.toEqual({
      status: 'restored',
      signOut: { success: true },
    });
    expect(getSession()).toEqual(session);
    expect(logout).not.toHaveBeenCalled();
  });

  it('starts in Guest Mode and signs out when nothing is stored', async () => {
    await expect(initSession()).resolves.toEqual({
      status: 'guest',
      signOut: { success: true },
    });
    expect(isAuthenticated()).toBe(false);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('reports an expired stored session and removes it', async () => {
    store.set(APP_SESSION_KEY, JSON.stringify(session));
    vi.setSystemTime(NOW + APP_SESSION_LIFETIME_MS);

    await expect(initSession()).resolves.toMatchObject({ status: 'expired' });
    expect(isAuthenticated()).toBe(false);
    expect(store.has(APP_SESSION_KEY)).toBe(false);
  });

  it('reports invalid stored data and removes it', async () => {
    store.set(APP_SESSION_KEY, '{broken');

    await expect(initSession()).resolves.toMatchObject({ status: 'invalid' });
    expect(store.has(APP_SESSION_KEY)).toBe(false);
  });

  it('passes on a failed sign-out result', async () => {
    logout.mockResolvedValue({ success: false, error: 'Offline' });

    await expect(initSession()).resolves.toEqual({
      status: 'guest',
      signOut: { success: false, error: 'Offline' },
    });
  });

  it('never crashes startup when sign-out throws', async () => {
    logout.mockRejectedValue(new Error('Unexpected'));

    await expect(initSession()).resolves.toEqual({
      status: 'guest',
      signOut: { success: false },
    });
  });
});
