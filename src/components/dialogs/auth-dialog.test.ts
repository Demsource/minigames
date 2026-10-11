// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteChange } from '../../app/router';
import type { AuthResult } from '../../services/auth';
import type * as AuthDialogModule from './auth-dialog';

const mocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
  setQuery: vi.fn(),
  removeQuery: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  googleSignIn: vi.fn(),
  updateProfile: vi.fn(),
  startSession: vi.fn(),
  isSessionActive: vi.fn(),
  showSnackbar: vi.fn(),
  auth: { currentUser: { uid: 'u1' } as { uid: string } | undefined },
}));

vi.mock('../../app/router', () => ({
  router: {
    subscribe: mocks.subscribe,
    setQuery: mocks.setQuery,
    removeQuery: mocks.removeQuery,
  },
}));
vi.mock('../../services/auth', () => ({
  login: mocks.login,
  signup: mocks.signup,
  googleSignIn: mocks.googleSignIn,
}));
vi.mock('firebase/auth', () => ({ updateProfile: mocks.updateProfile }));
vi.mock('../../config/firebase', () => ({ auth: mocks.auth }));
vi.mock('../../services/session-state', () => ({
  startSession: mocks.startSession,
}));
vi.mock('../../services/session-guard', () => ({
  isSessionActive: mocks.isSessionActive,
}));
vi.mock('../snackbar/snackbar', () => ({ showSnackbar: mocks.showSnackbar }));

// Per-test module instance (top-level reassignment is lint-banned)
const context = {} as {
  dialog: typeof AuthDialogModule.AuthDialog;
  onRoute: (change: Pick<RouteChange, 'query'>) => void;
};

function noop(): void {}

function deferred<T>() {
  const handle = {} as { promise: Promise<T>; resolve: (value: T) => void };
  handle.promise = new Promise<T>((resolve) => {
    handle.resolve = resolve;
  });
  return handle;
}

function setUrlQuery(search: string): void {
  context.onRoute({ query: new URLSearchParams(search) });
}

function backdrop(): HTMLElement {
  return document.querySelector('.auth-dialog-backdrop') as HTMLElement;
}

function isOpen(): boolean {
  return backdrop().classList.contains('is-open');
}

function field(name: string): HTMLInputElement {
  return document.querySelector(`input[data-field="${CSS.escape(name)}"]`)!;
}

function errorFor(name: string): HTMLElement {
  return document.querySelector(`[data-error-for="${CSS.escape(name)}"]`)!;
}

function submitButton(view: 'login' | 'register'): HTMLButtonElement {
  return document.querySelector(`#${view}-view .btn-primary`)!;
}

function googleButton(view: 'login' | 'register'): HTMLButtonElement {
  return document.querySelector(`#${view}-view .btn-google`)!;
}

function type(name: string, value: string): void {
  const input = field(name);
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function fillLogin(): void {
  type('login-email', 'ana@example.com');
  type('login-password', 'secret');
}

function fillRegister(): void {
  type('register-username', 'Ana');
  type('register-email', 'ana@example.com');
  type('register-password', 'Secret1!');
  type('register-confirm-password', 'Secret1!');
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function pressKey(target: EventTarget, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

// Each fresh dialog adds a document keydown listener; remove them after every
// test so dialogs from earlier tests don't react to later key presses
const documentListeners: Parameters<typeof document.addEventListener>[] = [];

beforeEach(async () => {
  const addEventListener = document.addEventListener.bind(document);
  vi.spyOn(document, 'addEventListener').mockImplementation(
    (...listenerArguments: Parameters<typeof document.addEventListener>) => {
      documentListeners.push(listenerArguments);
      addEventListener(...listenerArguments);
    }
  );
  document.body.replaceChildren();
  document.body.style.overflow = '';
  mocks.auth.currentUser = { uid: 'u1' };
  mocks.isSessionActive.mockReturnValue(false);
  mocks.subscribe.mockImplementation((listener) => {
    context.onRoute = listener;
    return noop;
  });

  // Fresh singleton per test: the dialog keeps open/pending state
  vi.resetModules();
  const imported = await import('./auth-dialog');
  context.dialog = imported.AuthDialog;
});

afterEach(() => {
  for (const listenerArguments of documentListeners.splice(0)) {
    document.removeEventListener(...listenerArguments);
  }
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('URL-driven opening', () => {
  it('opens in login mode for ?auth=login and locks page scroll', () => {
    setUrlQuery('auth=login');

    expect(isOpen()).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.querySelector('#toggle-login')?.classList).toContain(
      'active'
    );
  });

  it('opens in register mode for ?auth=register', () => {
    setUrlQuery('auth=register');

    expect(document.querySelector('.auth-dialog')?.classList).toContain(
      'view-register'
    );
    expect(document.querySelector('#toggle-register')?.classList).toContain(
      'active'
    );
  });

  it('removes an unknown auth mode from the URL without opening', () => {
    setUrlQuery('auth=admin');

    expect(mocks.removeQuery).toHaveBeenCalledWith('auth');
    expect(isOpen()).toBe(false);
  });

  it('refuses to open for an already authenticated user', () => {
    mocks.isSessionActive.mockReturnValue(true);

    setUrlQuery('auth=login');

    expect(isOpen()).toBe(false);
    expect(mocks.removeQuery).toHaveBeenCalledWith('auth');
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'You are already logged in.'
    );
  });

  it('closes and unlocks scroll when auth leaves the URL', () => {
    setUrlQuery('auth=login');

    setUrlQuery('');

    expect(isOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps scroll locked when Game Details is open underneath', () => {
    const gameDetails = document.createElement('div');
    gameDetails.className = 'game-details-backdrop is-open';
    document.body.append(gameDetails);
    setUrlQuery('auth=login');

    setUrlQuery('');

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('clears typed values and errors when switching mode', () => {
    setUrlQuery('auth=register');
    type('register-email', 'bad');

    setUrlQuery('auth=login');
    setUrlQuery('auth=register');

    expect(field('register-email').value).toBe('');
    expect(errorFor('register-email').textContent).toBe('');
  });
});

describe('navigation controls', () => {
  beforeEach(() => {
    setUrlQuery('auth=login');
  });

  it('show() opens the dialog through the URL', () => {
    context.dialog.show('register');

    expect(mocks.setQuery).toHaveBeenCalledWith({ auth: 'register' });
  });

  it.each([
    ['#toggle-register', 'register'],
    ['#switch-to-register', 'register'],
    ['#toggle-login', 'login'],
    ['#switch-to-login', 'login'],
  ])('%s switches mode in place', (selector, mode) => {
    document.querySelector<HTMLElement>(selector)?.click();

    expect(mocks.setQuery).toHaveBeenCalledWith(
      { auth: mode },
      { replace: true }
    );
  });

  it('closes on Escape by replacing the URL for a deep link', () => {
    pressKey(document, 'Escape');

    expect(mocks.setQuery).toHaveBeenCalledWith(
      { auth: undefined },
      { replace: true }
    );
  });

  it('closes with history.back when opened from an in-app page', () => {
    const back = vi.spyOn(globalThis.history, 'back').mockImplementation(noop);
    setUrlQuery('');
    setUrlQuery('auth=login');

    backdrop().click();

    expect(back).toHaveBeenCalled();
  });

  it('ignores clicks inside the dialog and other keys', () => {
    document.querySelector<HTMLElement>('.auth-dialog h2')?.click();
    pressKey(document, 'Enter');

    expect(mocks.setQuery).not.toHaveBeenCalled();
  });
});

describe('form validation guards', () => {
  it('keeps login disabled until both fields are valid', () => {
    setUrlQuery('auth=login');
    expect(submitButton('login').disabled).toBe(true);

    type('login-email', 'ana@example.com');
    expect(submitButton('login').disabled).toBe(true);

    type('login-password', 'secret');
    expect(submitButton('login').disabled).toBe(false);
  });

  it('shows the field error and disables submit for invalid input', () => {
    setUrlQuery('auth=login');
    fillLogin();

    type('login-email', 'not-an-email');

    expect(field('login-email').classList).toContain('has-error');
    expect(errorFor('login-email').textContent).toBe(
      'Please enter a valid email address'
    );
    expect(errorFor('login-email').classList).toContain('is-visible');
    expect(submitButton('login').disabled).toBe(true);
  });

  it('validates a field when it loses focus', () => {
    setUrlQuery('auth=login');

    field('login-password').dispatchEvent(new Event('blur'));

    expect(errorFor('login-password').textContent).toBe('Password is required');
  });

  it('clears the error once the value is corrected', () => {
    setUrlQuery('auth=login');
    type('login-email', 'bad');

    type('login-email', 'ana@example.com');

    expect(field('login-email').classList).not.toContain('has-error');
    expect(errorFor('login-email').classList).not.toContain('is-visible');
  });

  it('applies the strict registration rules', () => {
    setUrlQuery('auth=register');

    type('register-username', 'ana');
    type('register-password', 'weakpass');

    expect(errorFor('register-username').textContent).toBe(
      'Username must start with an uppercase letter'
    );
    expect(errorFor('register-password').textContent).toBe(
      'Password must contain at least one uppercase letter'
    );
  });

  it('revalidates the confirmation when the password changes', () => {
    setUrlQuery('auth=register');
    fillRegister();
    expect(submitButton('register').disabled).toBe(false);

    type('register-password', 'Secret2!');

    expect(errorFor('register-confirm-password').textContent).toBe(
      'Passwords do not match'
    );
    expect(submitButton('register').disabled).toBe(true);
  });
});

describe('login submission', () => {
  beforeEach(() => {
    setUrlQuery('auth=login');
    fillLogin();
  });

  it('locks the form while the request is pending', () => {
    mocks.login.mockReturnValue(deferred<AuthResult>().promise);

    submitButton('login').click();

    expect(mocks.login).toHaveBeenCalledWith('ana@example.com', 'secret');
    expect(submitButton('login').disabled).toBe(true);
    expect(submitButton('login').textContent).toBe('Logging in...');
    expect(field('login-email').disabled).toBe(true);
  });

  it('cannot be closed while the request is pending', () => {
    mocks.login.mockReturnValue(deferred<AuthResult>().promise);
    submitButton('login').click();

    pressKey(document, 'Escape');

    expect(mocks.setQuery).not.toHaveBeenCalled();
  });

  it('starts the session and closes on success', async () => {
    mocks.login.mockResolvedValue({ success: true });

    submitButton('login').click();
    await settle();

    expect(mocks.startSession).toHaveBeenCalledWith(mocks.auth.currentUser);
    expect(mocks.setQuery).toHaveBeenCalledWith(
      { auth: undefined },
      { replace: true }
    );
    expect(submitButton('login').textContent).toBe('Login');
  });

  it('does not start a session when Firebase has no current user', async () => {
    mocks.login.mockResolvedValue({ success: true });
    mocks.auth.currentUser = undefined;

    submitButton('login').click();
    await settle();

    expect(mocks.startSession).not.toHaveBeenCalled();
  });

  it('shows the error, keeps the dialog open and unlocks on failure', async () => {
    mocks.login.mockResolvedValue({
      success: false,
      error: 'Invalid email or password.',
    });

    submitButton('login').click();
    await settle();

    expect(errorFor('login-email').textContent).toBe(
      'Invalid email or password.'
    );
    // Server errors don't mark the input invalid, so retry stays possible
    expect(field('login-email').classList).not.toContain('has-error');
    expect(submitButton('login').disabled).toBe(false);
    expect(submitButton('login').textContent).toBe('Login');
    expect(field('login-email').disabled).toBe(false);
    expect(mocks.startSession).not.toHaveBeenCalled();
    expect(mocks.setQuery).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when the failure has none', async () => {
    mocks.login.mockResolvedValue({ success: false });

    submitButton('login').click();
    await settle();

    expect(errorFor('login-email').textContent).toBe('Login failed');
  });

  it('submits with the Enter key', () => {
    mocks.login.mockReturnValue(deferred<AuthResult>().promise);

    pressKey(field('login-password'), 'Enter');

    expect(mocks.login).toHaveBeenCalledTimes(1);
  });
});

describe('registration submission', () => {
  beforeEach(() => {
    setUrlQuery('auth=register');
    fillRegister();
  });

  it('creates the account, saves the username and starts the session', async () => {
    mocks.signup.mockResolvedValue({ success: true });
    mocks.updateProfile.mockResolvedValue(undefined);

    submitButton('register').click();
    expect(submitButton('register').textContent).toBe('Creating Account...');
    await settle();

    expect(mocks.signup).toHaveBeenCalledWith('ana@example.com', 'Secret1!');
    expect(mocks.updateProfile).toHaveBeenCalledWith(mocks.auth.currentUser, {
      displayName: 'Ana',
    });
    expect(mocks.startSession).toHaveBeenCalledWith(mocks.auth.currentUser);
    expect(mocks.setQuery).toHaveBeenCalledWith(
      { auth: undefined },
      { replace: true }
    );
  });

  it('skips the profile update without a Firebase user', async () => {
    mocks.signup.mockResolvedValue({ success: true });
    mocks.auth.currentUser = undefined;

    submitButton('register').click();
    await settle();

    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it('shows the error under the email field on failure', async () => {
    mocks.signup.mockResolvedValue({
      success: false,
      error: 'This email is already registered. Try logging in instead.',
    });

    submitButton('register').click();
    await settle();

    expect(errorFor('register-email').textContent).toBe(
      'This email is already registered. Try logging in instead.'
    );
    expect(submitButton('register').disabled).toBe(false);
    expect(mocks.updateProfile).not.toHaveBeenCalled();
    expect(mocks.startSession).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when the failure has none', async () => {
    mocks.signup.mockResolvedValue({ success: false });

    submitButton('register').click();
    await settle();

    expect(errorFor('register-email').textContent).toBe('Registration failed');
  });
});

describe('Google sign-in', () => {
  it('starts the session and closes on success', async () => {
    setUrlQuery('auth=register');
    mocks.googleSignIn.mockResolvedValue({ success: true });

    googleButton('register').click();
    await settle();

    expect(mocks.startSession).toHaveBeenCalledWith(mocks.auth.currentUser);
    expect(mocks.setQuery).toHaveBeenCalledWith(
      { auth: undefined },
      { replace: true }
    );
  });

  it('silently unlocks when the popup is closed', async () => {
    setUrlQuery('auth=login');
    mocks.googleSignIn.mockResolvedValue({ success: false, error: '' });

    googleButton('login').click();
    await settle();

    expect(errorFor('login-email').textContent).toBe('');
    expect(field('login-email').disabled).toBe(false);
    expect(mocks.startSession).not.toHaveBeenCalled();
  });

  it('shows the error on failure', async () => {
    setUrlQuery('auth=login');
    mocks.googleSignIn.mockResolvedValue({
      success: false,
      error: 'Too many login attempts. Try again later.',
    });

    googleButton('login').click();
    await settle();

    expect(errorFor('login-email').textContent).toBe(
      'Too many login attempts. Try again later.'
    );
    expect(mocks.startSession).not.toHaveBeenCalled();
  });
});
