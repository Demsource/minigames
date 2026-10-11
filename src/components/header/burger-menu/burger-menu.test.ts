// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../../../services/app-session';
import { BurgerMenu } from './burger-menu';

type SessionListener = (session: AppSession | undefined) => void;

const mocks = vi.hoisted(() => ({
  showAuth: vi.fn(),
  logoutUser: vi.fn(),
  getSession: vi.fn(),
  subscribeSession: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('../../dialogs/auth-dialog', () => ({
  AuthDialog: { show: mocks.showAuth },
}));
vi.mock('../../../services/session-guard', () => ({
  logoutUser: mocks.logoutUser,
}));
vi.mock('../../../services/session-state', () => ({
  getSession: mocks.getSession,
  subscribeSession: mocks.subscribeSession,
}));

const SESSION: AppSession = {
  displayName: 'Ana Lee',
  email: 'ana@example.com',
  authenticatedAt: 0,
};

// Each menu adds a document keydown listener; remove them after every test
const documentListeners: Parameters<typeof document.addEventListener>[] = [];
const sessionListeners: SessionListener[] = [];

function notifySession(session: AppSession | undefined): void {
  for (const listener of sessionListeners) {
    listener(session);
  }
}

function renderMenu(currentRoute = '/'): HTMLElement {
  const element = new BurgerMenu(currentRoute).getElement();
  document.body.append(element);
  return element;
}

function isHidden(menu: HTMLElement, selector: string): boolean {
  // `hidden` is typed as boolean | string ('until-found'); only true counts
  return menu.querySelector<HTMLElement>(selector)?.hidden === true;
}

function click(menu: HTMLElement, selector: string): void {
  menu.querySelector<HTMLElement>(selector)?.click();
}

function openMenu(currentRoute = '/'): {
  menu: BurgerMenu;
  element: HTMLElement;
} {
  const menu = new BurgerMenu(currentRoute);
  const element = menu.getElement();
  document.body.append(element);
  menu.open();
  return { menu, element };
}

beforeEach(() => {
  const addEventListener = document.addEventListener.bind(document);
  vi.spyOn(document, 'addEventListener').mockImplementation(
    (...listenerArguments: Parameters<typeof document.addEventListener>) => {
      documentListeners.push(listenerArguments);
      addEventListener(...listenerArguments);
    }
  );
  document.body.replaceChildren();
  document.body.style.overflow = '';
  sessionListeners.length = 0;
  mocks.getSession.mockReturnValue(undefined);
  mocks.subscribeSession.mockImplementation((listener: SessionListener) => {
    sessionListeners.push(listener);
    return mocks.unsubscribe;
  });
});

afterEach(() => {
  for (const listenerArguments of documentListeners.splice(0)) {
    document.removeEventListener(...listenerArguments);
  }
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('navigation links', () => {
  it.each([
    ['/', 'Home'],
    ['/library', 'Library'],
  ])('marks the link for %s as active', (route, label) => {
    const menu = renderMenu(route);

    const active = [...menu.querySelectorAll('.nav-item.active')].map(
      (link) => link.textContent
    );
    expect(active).toEqual([label]);
  });

  it('closes the menu when a link is clicked', () => {
    const { element } = openMenu();

    click(element, '.nav-item');

    expect(element.classList).not.toContain('is-open');
  });
});

describe('open and close', () => {
  it('opens and locks page scroll', () => {
    const { element } = openMenu();

    expect(element.classList).toContain('is-open');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes with the close button and unlocks scroll', () => {
    const { element } = openMenu();

    click(element, '.burger-close');

    expect(element.classList).not.toContain('is-open');
    expect(document.body.style.overflow).toBe('');
  });

  it('closes on Escape while open', () => {
    const { element } = openMenu();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(element.classList).not.toContain('is-open');
  });

  it('ignores Escape while closed and other keys while open', () => {
    const { menu } = openMenu();
    menu.close();
    document.body.style.overflow = 'hidden';

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.body.style.overflow).toBe('hidden');

    menu.open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(menu.getElement().classList).toContain('is-open');
  });
});

describe('guest mode', () => {
  it('shows Log In and Sign Up only', () => {
    const menu = renderMenu();

    expect(isHidden(menu, '#burger-login-btn')).toBe(false);
    expect(isHidden(menu, '#burger-signup-btn')).toBe(false);
    expect(isHidden(menu, '#burger-logout-btn')).toBe(true);
    expect(isHidden(menu, '.burger-profile')).toBe(true);
  });

  it.each([
    ['#burger-login-btn', 'login'],
    ['#burger-signup-btn', 'register'],
  ])('%s closes the menu and opens the %s dialog', (selector, mode) => {
    const { element } = openMenu();

    click(element, selector);

    expect(element.classList).not.toContain('is-open');
    expect(mocks.showAuth).toHaveBeenCalledWith(mode);
  });
});

describe('signed-in mode', () => {
  it('shows the profile and Logout instead of the auth buttons', () => {
    mocks.getSession.mockReturnValue(SESSION);

    const menu = renderMenu();

    expect(isHidden(menu, '#burger-login-btn')).toBe(true);
    expect(isHidden(menu, '#burger-signup-btn')).toBe(true);
    expect(isHidden(menu, '#burger-logout-btn')).toBe(false);
    expect(isHidden(menu, '.burger-profile')).toBe(false);
    expect(menu.querySelector('.burger-profile-name')?.textContent).toBe(
      'Ana Lee'
    );
    expect(menu.querySelector('.profile-avatar-initials')?.textContent).toBe(
      'AL'
    );
  });

  it('closes the menu and logs out', () => {
    mocks.getSession.mockReturnValue(SESSION);
    const { element } = openMenu();

    click(element, '#burger-logout-btn');

    expect(element.classList).not.toContain('is-open');
    expect(mocks.logoutUser).toHaveBeenCalledTimes(1);
  });
});

describe('session changes', () => {
  it('switches between guest and signed-in views', () => {
    const menu = renderMenu();

    notifySession(SESSION);
    expect(isHidden(menu, '#burger-logout-btn')).toBe(false);
    expect(menu.querySelector('.burger-profile-name')?.textContent).toBe(
      'Ana Lee'
    );

    notifySession(undefined);
    expect(isHidden(menu, '#burger-logout-btn')).toBe(true);
    expect(isHidden(menu, '#burger-login-btn')).toBe(false);
  });

  it('unsubscribes once the menu is no longer on the page', () => {
    const menu = renderMenu();
    menu.remove();

    notifySession(SESSION);

    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
    expect(isHidden(menu, '#burger-logout-btn')).toBe(true);
  });
});
