// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../../services/app-session';
import { Header } from './header';

type SessionListener = (session: AppSession | undefined) => void;

const mocks = vi.hoisted(() => ({
  showAuth: vi.fn(),
  logoutUser: vi.fn(),
  getSession: vi.fn(),
  subscribeSession: vi.fn(),
}));

vi.mock('../dialogs/auth-dialog', () => ({
  AuthDialog: { show: mocks.showAuth },
}));
vi.mock('../../services/session-guard', () => ({
  logoutUser: mocks.logoutUser,
}));
vi.mock('../../services/session-state', () => ({
  getSession: mocks.getSession,
  subscribeSession: mocks.subscribeSession,
}));

const SESSION: AppSession = {
  displayName: 'Ana Lee',
  email: 'ana@example.com',
  authenticatedAt: 0,
  avatarUrl: 'https://example.com/ana.png',
};

// Header and its burger menu each subscribe; [listener, unsubscribe] pairs
const subscriptions: [SessionListener, () => void][] = [];

function notifySession(session: AppSession | undefined): void {
  for (const [listener] of subscriptions) {
    listener(session);
  }
}

function renderHeader(currentRoute = '/'): HTMLElement {
  const header = Header(currentRoute);
  document.body.append(header);
  return header;
}

function isHidden(header: HTMLElement, selector: string): boolean {
  return header.querySelector<HTMLElement>(selector)?.hidden ?? false;
}

function click(header: HTMLElement, selector: string): void {
  header.querySelector<HTMLElement>(selector)?.click();
}

beforeEach(() => {
  document.body.replaceChildren();
  subscriptions.length = 0;
  mocks.getSession.mockReturnValue(undefined);
  mocks.subscribeSession.mockImplementation((listener: SessionListener) => {
    const unsubscribe = vi.fn();
    subscriptions.push([listener, unsubscribe]);
    return unsubscribe;
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Header', () => {
  it.each([
    ['/', 'Home'],
    ['/library', 'Library'],
    ['/404', undefined],
  ])('marks the nav link for %s as active', (route, label) => {
    const header = renderHeader(route);

    const active = [...header.querySelectorAll('.nav-item.active')].map(
      (link) => link.textContent
    );
    expect(active).toEqual(label ? [label] : []);
  });

  it('shows Log In and Sign Up for guests', () => {
    const header = renderHeader();

    expect(isHidden(header, '#login-btn')).toBe(false);
    expect(isHidden(header, '#signup-btn')).toBe(false);
    expect(isHidden(header, '#logout-btn')).toBe(true);
    expect(isHidden(header, '.header-profile')).toBe(true);
  });

  it('shows the profile name, photo and Logout when signed in', () => {
    mocks.getSession.mockReturnValue(SESSION);

    const header = renderHeader();

    expect(isHidden(header, '#login-btn')).toBe(true);
    expect(isHidden(header, '#signup-btn')).toBe(true);
    expect(isHidden(header, '#logout-btn')).toBe(false);
    const name = header.querySelector<HTMLElement>('.header-profile-name');
    expect(name?.textContent).toBe('Ana Lee');
    expect(name?.title).toBe('Ana Lee');
    expect(
      header.querySelector<HTMLImageElement>('.profile-avatar-photo')?.src
    ).toBe('https://example.com/ana.png');
  });

  it('falls back to the email name without a display name', () => {
    mocks.getSession.mockReturnValue({ ...SESSION, displayName: '' });

    const header = renderHeader();

    expect(header.querySelector('.header-profile-name')?.textContent).toBe(
      'ana'
    );
  });

  it('follows sign-in and logout while on the page', () => {
    const header = renderHeader();

    notifySession(SESSION);
    expect(isHidden(header, '#logout-btn')).toBe(false);
    expect(isHidden(header, '.header-profile')).toBe(false);

    notifySession(undefined);
    expect(isHidden(header, '#logout-btn')).toBe(true);
    expect(isHidden(header, '#login-btn')).toBe(false);
  });

  it('unsubscribes once the header is no longer on the page', () => {
    const header = renderHeader();
    const [, unsubscribe] = subscriptions[0];
    header.remove();

    notifySession(SESSION);

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(isHidden(header, '#logout-btn')).toBe(true);
  });

  it.each([
    ['#login-btn', 'login'],
    ['#signup-btn', 'register'],
  ])('%s opens the %s dialog', (selector, mode) => {
    const header = renderHeader();

    click(header, selector);

    expect(mocks.showAuth).toHaveBeenCalledWith(mode);
  });

  it('logs out with the Logout button', () => {
    mocks.getSession.mockReturnValue(SESSION);
    const header = renderHeader();

    click(header, '#logout-btn');

    expect(mocks.logoutUser).toHaveBeenCalledTimes(1);
  });

  it('adds a burger menu to the page and opens it from the toggle', () => {
    const header = renderHeader();
    const menu = document.querySelector('.burger-menu-overlay');
    expect(menu?.classList).not.toContain('is-open');

    click(header, '.burger-toggle');

    expect(menu?.classList).toContain('is-open');
  });
});
