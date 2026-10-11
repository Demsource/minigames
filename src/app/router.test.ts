import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteChange, Router } from './router';

const BASE = '/minigames';
const ORIGIN = 'https://example.com';

// Minimal location/history pair backed by one URL; no DOM involved
const browser = {
  url: new URL(ORIGIN),
  pushState: vi.fn((_state: unknown, _title: string, url: string) => {
    browser.url = new URL(url, ORIGIN);
  }),
  replaceState: vi.fn((_state: unknown, _title: string, url: string) => {
    browser.url = new URL(url, ORIGIN);
  }),
};

const windowListeners = new Map<string, () => void>();

// Per-test state lives on one object (top-level reassignment is lint-banned)
const context = {} as {
  router: Router;
  documentClick?: (event: unknown) => void;
};

function visit(url: string): void {
  browser.url = new URL(url, ORIGIN);
}

function currentUrl(): string {
  return browser.url.pathname + browser.url.search + browser.url.hash;
}

// Stands in for the #app container; records what the router rendered
function makeRoot() {
  const rendered: unknown[] = [];
  const root = {
    replaceChildren: () => rendered.splice(0),
    append: (page: unknown) => {
      rendered.push(page);
    },
  };
  return { root: root as unknown as HTMLElement, rendered };
}

function page(name: string): HTMLElement {
  return { name } as unknown as HTMLElement;
}

function makeLinkClick(href: string, isRouterLink = true) {
  const anchor = {
    matches: (selector: string) => isRouterLink && selector === '[data-link]',
    getAttribute: () => href,
  };
  return {
    target: { closest: () => anchor },
    preventDefault: vi.fn(),
  };
}

beforeEach(() => {
  visit(`${BASE}/`);
  windowListeners.clear();
  context.documentClick = undefined;
  vi.stubGlobal('location', {
    get pathname() {
      return browser.url.pathname;
    },
    get search() {
      return browser.url.search;
    },
    get hash() {
      return browser.url.hash;
    },
  });
  vi.stubGlobal('history', {
    pushState: browser.pushState,
    replaceState: browser.replaceState,
  });
  vi.stubGlobal('addEventListener', (type: string, listener: () => void) =>
    windowListeners.set(type, listener)
  );
  vi.stubGlobal('document', {
    addEventListener: (_type: string, listener: (event: unknown) => void) => {
      context.documentClick = listener;
    },
  });
  context.router = new Router(BASE);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('getPath', () => {
  it('strips the base path', () => {
    visit(`${BASE}/library`);

    expect(context.router.getPath()).toBe('/library');
  });

  it('treats the bare base path as the home route', () => {
    visit(BASE);

    expect(context.router.getPath()).toBe('/');
  });

  it('returns paths outside the base unchanged', () => {
    visit('/other/page');

    expect(context.router.getPath()).toBe('/other/page');
  });
});

describe('start and rendering', () => {
  it('renders the page registered for the current path', () => {
    const home = page('home');
    const handler = vi.fn(() => home);
    context.router.addRoute('/', handler);
    const { root, rendered } = makeRoot();

    context.router.start(root);

    expect(handler).toHaveBeenCalledWith('/');
    expect(rendered).toEqual([home]);
  });

  it('falls back to the 404 page for unknown paths', () => {
    const notFound = page('404');
    context.router.addRoute('/404', () => notFound);
    visit(`${BASE}/missing`);
    const { root, rendered } = makeRoot();

    context.router.start(root);

    expect(rendered).toEqual([notFound]);
  });

  it('renders nothing when no route matches and there is no 404 page', () => {
    visit(`${BASE}/missing`);
    const { root, rendered } = makeRoot();

    context.router.start(root);

    expect(rendered).toEqual([]);
  });

  it('restores a GitHub Pages 404 redirect into the real URL', () => {
    context.router.addRoute('/library', () => page('library'));
    visit(`${BASE}/?p=/library&q=page=2#top`);
    const { root, rendered } = makeRoot();

    context.router.start(root);

    expect(browser.replaceState).toHaveBeenCalledWith(
      {},
      '',
      `${BASE}/library?page=2#top`
    );
    expect(context.router.getPath()).toBe('/library');
    expect(rendered).toHaveLength(1);
  });

  it('restores a redirect without a query', () => {
    visit(`${BASE}/?p=/library`);

    context.router.start(makeRoot().root);

    expect(currentUrl()).toBe(`${BASE}/library`);
  });

  it('re-handles the route on browser back/forward', () => {
    context.router.addRoute('/', () => page('home'));
    context.router.addRoute('/library', () => page('library'));
    const { root, rendered } = makeRoot();
    context.router.start(root);

    visit(`${BASE}/library`);
    windowListeners.get('popstate')?.();

    expect(rendered).toEqual([page('library')]);
  });
});

describe('link interception', () => {
  beforeEach(() => {
    context.router.start(makeRoot().root);
  });

  it('navigates internal [data-link] links without a reload', () => {
    const click = makeLinkClick('/library');

    context.documentClick?.(click);

    expect(click.preventDefault).toHaveBeenCalled();
    expect(currentUrl()).toBe(`${BASE}/library`);
  });

  it('ignores links without data-link', () => {
    const click = makeLinkClick('/library', false);

    context.documentClick?.(click);

    expect(click.preventDefault).not.toHaveBeenCalled();
    expect(browser.pushState).not.toHaveBeenCalled();
  });

  it('ignores clicks outside links', () => {
    const click = { target: { closest: () => {} }, preventDefault: vi.fn() };

    context.documentClick?.(click);

    expect(click.preventDefault).not.toHaveBeenCalled();
  });

  it('does not navigate for a data-link with an empty href', () => {
    const click = makeLinkClick('');

    context.documentClick?.(click);

    expect(click.preventDefault).toHaveBeenCalled();
    expect(browser.pushState).not.toHaveBeenCalled();
  });
});

describe('navigateTo', () => {
  it('pushes the base-prefixed URL and notifies listeners', () => {
    const listener = vi.fn();
    context.router.subscribe(listener);

    context.router.navigateTo('/library?page=2');

    expect(browser.pushState).toHaveBeenCalledWith(
      {},
      '',
      `${BASE}/library?page=2`
    );
    const change: RouteChange = listener.mock.calls[0][0];
    expect(change.path).toBe('/library');
    expect(change.query.get('page')).toBe('2');
    expect(change.pathChanged).toBe(true);
  });

  it('replaces the history entry when asked', () => {
    context.router.navigateTo('/library', { replace: true });

    expect(browser.replaceState).toHaveBeenCalled();
    expect(browser.pushState).not.toHaveBeenCalled();
  });

  it('does nothing when the URL is unchanged', () => {
    const listener = vi.fn();
    context.router.subscribe(listener);

    context.router.navigateTo('/');

    expect(browser.pushState).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('query updates', () => {
  it('merges values and removes undefined or empty keys', () => {
    visit(`${BASE}/library?category=puzzle&page=3&sort=name#list`);

    context.router.setQuery({
      page: 1,
      category: undefined,
      sort: '',
      q: 'snake',
    });

    expect(currentUrl()).toBe(`${BASE}/library?page=1&q=snake#list`);
  });

  it('drops the question mark when the query becomes empty', () => {
    visit(`${BASE}/library?auth=login`);

    context.router.setQuery({ auth: undefined });

    expect(currentUrl()).toBe(`${BASE}/library`);
  });

  it('removes a single key in place without a new history entry', () => {
    visit(`${BASE}/?auth=login&game=snake`);

    context.router.removeQuery('auth');

    expect(browser.replaceState).toHaveBeenCalledWith(
      {},
      '',
      `${BASE}/?game=snake`
    );
    expect(browser.pushState).not.toHaveBeenCalled();
  });

  it('keeps the page when only the query changes', () => {
    const home = vi.fn(() => page('home'));
    context.router.addRoute('/', home);
    context.router.start(makeRoot().root);
    const listener = vi.fn();
    context.router.subscribe(listener);

    context.router.setQuery({ game: 'snake' });

    expect(home).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].pathChanged).toBe(false);
  });
});

describe('listeners and hooks', () => {
  it('runs before-route hooks before handling, until removed', () => {
    const hook = vi.fn();
    const remove = context.router.onBeforeRoute(hook);

    context.router.handleRoute();
    remove();
    context.router.handleRoute();

    expect(hook).toHaveBeenCalledTimes(1);
  });

  it('stops notifying unsubscribed listeners', () => {
    const listener = vi.fn();
    const unsubscribe = context.router.subscribe(listener);
    unsubscribe();

    context.router.handleRoute();

    expect(listener).not.toHaveBeenCalled();
  });

  it('drops page-scoped listeners when the page changes', () => {
    context.router.addRoute('/', () => page('home'));
    context.router.addRoute('/library', () => page('library'));
    context.router.start(makeRoot().root);
    const pageListener = vi.fn();
    const globalListener = vi.fn();
    context.router.subscribe(pageListener, { pageScoped: true });
    context.router.subscribe(globalListener);

    context.router.navigateTo('/library');
    context.router.navigateTo('/');

    expect(pageListener).not.toHaveBeenCalled();
    expect(globalListener).toHaveBeenCalledTimes(2);
  });

  it('keeps page-scoped listeners while the path stays the same', () => {
    context.router.start(makeRoot().root);
    const pageListener = vi.fn();
    context.router.subscribe(pageListener, { pageScoped: true });

    context.router.setQuery({ game: 'snake' });

    expect(pageListener).toHaveBeenCalledTimes(1);
  });

  it('stops delivering a stale change once a listener navigates again', () => {
    const seen: string[] = [];
    context.router.subscribe((change) => {
      seen.push(`guard:${change.query.toString()}`);
      if (change.query.has('auth')) {
        context.router.removeQuery('auth');
      }
    });
    context.router.subscribe((change) => {
      seen.push(`dialog:${change.query.toString()}`);
    });

    context.router.setQuery({ auth: 'login' });

    expect(seen).toEqual(['guard:auth=login', 'guard:', 'dialog:']);
  });
});
