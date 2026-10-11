import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_SESSION_LIFETIME_MS, AppSession } from './app-session';
import type * as SessionGuard from './session-guard';

type SessionListener = (session: AppSession | undefined) => void;

const mocks = vi.hoisted(() => ({
  showSnackbar: vi.fn(),
  setQuery: vi.fn(),
  onBeforeRoute: vi.fn(),
  getSession: vi.fn(),
  endSession: vi.fn(),
  subscribeSession: vi.fn(),
}));

vi.mock('../components/snackbar/snackbar', () => ({
  showSnackbar: mocks.showSnackbar,
}));
vi.mock('../app/router', () => ({
  router: { setQuery: mocks.setQuery, onBeforeRoute: mocks.onBeforeRoute },
}));
vi.mock('./session-state', () => ({
  getSession: mocks.getSession,
  endSession: mocks.endSession,
  subscribeSession: mocks.subscribeSession,
}));

const NOW = new Date('2026-01-01T12:00:00Z').getTime();

const state: {
  session?: AppSession;
  signOut: { success: boolean };
  sessionListener?: SessionListener;
} = { signOut: { success: true } };

const documentListeners = new Map<string, () => void>();
const windowListeners = new Map<string, () => void>();
const fakeDocument = {
  visibilityState: 'visible',
  addEventListener: (type: string, listener: () => void) =>
    documentListeners.set(type, listener),
};

// Per-test module instance (top-level reassignment is lint-banned)
const context = {} as { guard: typeof SessionGuard };

function noop(): void {}

function sessionAt(authenticatedAt: number): AppSession {
  return { displayName: 'Ana', email: 'ana@example.com', authenticatedAt };
}

// Lets the async endSession → showSnackbar chain settle
async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  state.session = undefined;
  state.signOut = { success: true };
  state.sessionListener = undefined;
  documentListeners.clear();
  windowListeners.clear();
  fakeDocument.visibilityState = 'visible';

  mocks.getSession.mockImplementation(() => state.session);
  // Mirrors session-state: the in-memory session is cleared synchronously
  mocks.endSession.mockImplementation(() => {
    state.session = undefined;
    return Promise.resolve(state.signOut);
  });
  mocks.subscribeSession.mockImplementation((listener: SessionListener) => {
    state.sessionListener = listener;
    return noop;
  });

  vi.stubGlobal('document', fakeDocument);
  vi.stubGlobal('addEventListener', (type: string, listener: () => void) =>
    windowListeners.set(type, listener)
  );

  // Fresh module per test: the expiry timer is module-level state
  vi.resetModules();
  context.guard = await import('./session-guard');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('logoutUser', () => {
  it('ends the session and confirms the logout', async () => {
    state.session = sessionAt(NOW);

    await context.guard.logoutUser();

    expect(mocks.endSession).toHaveBeenCalledTimes(1);
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      context.guard.LOGOUT_SUCCESS_MESSAGE
    );
  });

  it('reports a failed Firebase sign-out', async () => {
    state.session = sessionAt(NOW);
    state.signOut = { success: false };

    await context.guard.logoutUser();

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      context.guard.SIGN_OUT_ERROR_MESSAGE
    );
  });
});

describe('isSessionActive', () => {
  it('is false for guests without ending anything', () => {
    expect(context.guard.isSessionActive()).toBe(false);
    expect(mocks.endSession).not.toHaveBeenCalled();
  });

  it('is true for an unexpired session', () => {
    state.session = sessionAt(NOW);
    vi.setSystemTime(NOW + APP_SESSION_LIFETIME_MS - 1);

    expect(context.guard.isSessionActive()).toBe(true);
    expect(mocks.endSession).not.toHaveBeenCalled();
  });

  it('ends an expired session and notifies the user once', async () => {
    state.session = sessionAt(NOW);
    vi.setSystemTime(NOW + APP_SESSION_LIFETIME_MS);

    expect(context.guard.isSessionActive()).toBe(false);
    expect(context.guard.isSessionActive()).toBe(false);
    await settle();

    expect(mocks.endSession).toHaveBeenCalledTimes(1);
    expect(mocks.showSnackbar).toHaveBeenCalledTimes(1);
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      context.guard.SESSION_EXPIRED_MESSAGE
    );
  });

  it('shows the sign-out error when ending an expired session fails', async () => {
    state.session = sessionAt(NOW - APP_SESSION_LIFETIME_MS);
    state.signOut = { success: false };

    context.guard.isSessionActive();
    await settle();

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      context.guard.SIGN_OUT_ERROR_MESSAGE
    );
  });
});

describe('canPerformProtectedAction', () => {
  it('allows the action with an active session', () => {
    state.session = sessionAt(NOW);

    expect(context.guard.canPerformProtectedAction()).toBe(true);
    expect(mocks.setQuery).not.toHaveBeenCalled();
  });

  it('blocks guests and opens the login dialog', () => {
    expect(context.guard.canPerformProtectedAction()).toBe(false);
    expect(mocks.setQuery).toHaveBeenCalledWith({ auth: 'login' });
  });

  it('blocks an expired session and opens the login dialog', async () => {
    state.session = sessionAt(NOW - APP_SESSION_LIFETIME_MS);

    expect(context.guard.canPerformProtectedAction()).toBe(false);
    await settle();

    expect(mocks.setQuery).toHaveBeenCalledWith({ auth: 'login' });
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      context.guard.SESSION_EXPIRED_MESSAGE
    );
  });
});

describe('startSessionWatch', () => {
  it('expires a restored session exactly when its lifetime ends', async () => {
    state.session = sessionAt(NOW);
    context.guard.startSessionWatch();

    await vi.advanceTimersByTimeAsync(APP_SESSION_LIFETIME_MS - 1);
    expect(mocks.endSession).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(mocks.endSession).toHaveBeenCalledTimes(1);
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      context.guard.SESSION_EXPIRED_MESSAGE
    );
  });

  it('reschedules the expiry when a new session starts', async () => {
    context.guard.startSessionWatch();
    vi.setSystemTime(NOW + 60_000);
    state.session = sessionAt(NOW + 60_000);
    state.sessionListener?.(state.session);

    await vi.advanceTimersByTimeAsync(APP_SESSION_LIFETIME_MS - 1);
    expect(mocks.endSession).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(mocks.endSession).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending expiry when the session ends', async () => {
    state.session = sessionAt(NOW);
    context.guard.startSessionWatch();
    state.session = undefined;
    state.sessionListener?.(state.session);

    await vi.advanceTimersByTimeAsync(APP_SESSION_LIFETIME_MS);

    expect(mocks.endSession).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('checks expiry when the page becomes visible, not when hidden', async () => {
    context.guard.startSessionWatch();
    state.session = sessionAt(NOW - APP_SESSION_LIFETIME_MS);
    const onVisibilityChange = documentListeners.get('visibilitychange');

    fakeDocument.visibilityState = 'hidden';
    onVisibilityChange?.();
    expect(mocks.endSession).not.toHaveBeenCalled();

    fakeDocument.visibilityState = 'visible';
    onVisibilityChange?.();
    await settle();
    expect(mocks.endSession).toHaveBeenCalledTimes(1);
  });

  it('checks expiry on window focus and before every route', () => {
    context.guard.startSessionWatch();

    expect(windowListeners.get('focus')).toBe(context.guard.isSessionActive);
    expect(mocks.onBeforeRoute).toHaveBeenCalledWith(
      context.guard.isSessionActive
    );
  });
});
