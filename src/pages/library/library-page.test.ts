// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteChange } from '../../app/router';
import type { ApiResponse, Category, Game } from '../../services/api';
import { Library } from './library-page';

const mocks = vi.hoisted(() => ({
  apiCall: vi.fn(),
  subscribe: vi.fn(),
  setQuery: vi.fn(),
  getQuery: vi.fn(),
  showGame: vi.fn(),
}));

vi.mock('../../services/api', () => ({ apiCall: mocks.apiCall }));
vi.mock('../../app/router', () => ({
  router: {
    subscribe: mocks.subscribe,
    setQuery: mocks.setQuery,
    getQuery: mocks.getQuery,
  },
}));
// The header has its own tests; a stand-in keeps the auth stack out
vi.mock('../../components/header/header', () => ({
  Header: () => document.createElement('header'),
}));
vi.mock('../../components/dialogs/game-details-dialog', () => ({
  GameDetailsDialog: { show: mocks.showGame },
}));

const CATEGORIES: Category[] = [
  { slug: 'all', label: 'All Games', isDefault: true },
  { slug: 'puzzle', label: 'Puzzle', isDefault: false },
];

type RouteListener = (change: Pick<RouteChange, 'pathChanged'>) => void;

// Fake URL query and route listener (top-level reassignment is lint-banned)
const url = { query: new URLSearchParams() };
const route = {} as { listener: RouteListener };

function game(slug: string): Game {
  return {
    slug,
    name: slug.toUpperCase(),
    category: 'puzzle',
    price: 'Free',
    shortDescription: `About ${slug}`,
    rating: 4,
    likesCount: 10,
    cardImage: `/cards/${slug}.png`,
  };
}

function gamesResponse(games: Game[], page = 1, totalPages = 1): ApiResponse {
  return {
    data: games,
    meta: {
      page,
      limit: 6,
      totalItems: games.length,
      totalPages,
      appliedFilter: { featured: false },
    },
  };
}

function gameRequests(): URLSearchParams[] {
  return mocks.apiCall.mock.calls
    .map(([path]) => String(path))
    .filter((path) => path.startsWith('/api/games?'))
    .map((path) => new URLSearchParams(path.split('?', 2)[1]));
}

function lastGameRequest(): Record<string, string> {
  return Object.fromEntries(gameRequests().at(-1) ?? []);
}

function noop(): void {}

function defaultGames(): Promise<ApiResponse> {
  return Promise.resolve(gamesResponse([game('snake'), game('tetris')]));
}

// Answers categories and games requests; `games` may be overridden per test
function mockApi(games: () => Promise<ApiResponse> = defaultGames): void {
  mocks.apiCall.mockImplementation((path: string) =>
    path === '/api/categories'
      ? Promise.resolve({ data: CATEGORIES, meta: {} })
      : games()
  );
}

// Every games request resolves with the same response
function mockGamesResponse(response: ApiResponse): void {
  mockApi(() => Promise.resolve(response));
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderLibrary(search = ''): Promise<HTMLElement> {
  url.query = new URLSearchParams(search);
  const page = Library('/library');
  document.body.append(page);
  await settle();
  return page;
}

// Simulates navigating to a new query on the same page
async function navigate(search: string): Promise<void> {
  url.query = new URLSearchParams(search);
  route.listener({ pathChanged: false });
  await settle();
}

function cardNames(page: HTMLElement): string[] {
  return [...page.querySelectorAll('.game-name')].map(
    (name) => name.textContent ?? ''
  );
}

function activeChip(page: HTMLElement): string {
  return page.querySelector<HTMLElement>('.chip.active')?.dataset.slug ?? '';
}

function sortLabel(page: HTMLElement): string {
  return page.querySelector('.sort-text')?.textContent ?? '';
}

beforeEach(() => {
  document.body.replaceChildren();
  mocks.getQuery.mockImplementation(() => new URLSearchParams(url.query));
  mocks.subscribe.mockImplementation((listener: RouteListener) => {
    route.listener = listener;
    return noop;
  });
  mockApi();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('initial load', () => {
  it('renders the page shell with a loading skeleton', () => {
    mocks.apiCall.mockReturnValue(new Promise(() => {}));
    url.query = new URLSearchParams();

    const page = Library('/library');

    expect(page.querySelector('header')).not.toBeNull();
    expect(page.textContent).toContain('Game Library');
    expect(
      page.querySelector('#game-cards-content')?.children.length
    ).toBeGreaterThan(0);
    expect(page.querySelector('.pagination')).not.toBeNull();
    expect(mocks.apiCall).toHaveBeenCalledWith('/api/categories');
  });

  it('requests the first page with the default filter and sort', async () => {
    await renderLibrary();

    expect(lastGameRequest()).toEqual({
      category: 'all',
      sort: 'rating-desc',
      page: '1',
      limit: '6',
    });
  });

  it('renders the returned games as cards', async () => {
    const page = await renderLibrary();

    expect(cardNames(page)).toEqual(['SNAKE', 'TETRIS']);
  });

  it('opens game details from a card', async () => {
    const page = await renderLibrary();

    page.querySelector<HTMLButtonElement>('.btn-details')?.click();

    expect(mocks.showGame).toHaveBeenCalledWith('snake');
  });

  it('shows the category chips and the default sort', async () => {
    const page = await renderLibrary();

    expect(activeChip(page)).toBe('all');
    expect(sortLabel(page)).toBe('Sort by: Rating ↓');
  });

  it('applies valid category, sort and page from the URL', async () => {
    mockGamesResponse(gamesResponse([game('snake')], 2, 3));

    const page = await renderLibrary('category=puzzle&sort=name-asc&page=2');

    expect(lastGameRequest()).toMatchObject({
      category: 'puzzle',
      sort: 'name-asc',
      page: '2',
    });
    expect(activeChip(page)).toBe('puzzle');
    expect(sortLabel(page)).toBe('Sort by: Name A→Z');
    expect(mocks.setQuery).not.toHaveBeenCalled();
  });

  it('drops invalid URL values and loads the defaults', async () => {
    await renderLibrary('category=bogus&sort=cheapest&page=-1');

    expect(mocks.setQuery).toHaveBeenCalledWith(
      { category: undefined, sort: undefined, page: undefined },
      { replace: true }
    );
    expect(lastGameRequest()).toMatchObject({
      category: 'all',
      sort: 'rating-desc',
      page: '1',
    });
  });

  it('keeps valid URL values when dropping invalid ones', async () => {
    await renderLibrary('category=puzzle&sort=cheapest');

    expect(mocks.setQuery).toHaveBeenCalledWith(
      { category: 'puzzle', sort: undefined, page: undefined },
      { replace: true }
    );
  });
});

describe('results', () => {
  it('shows the page buttons from the response', async () => {
    mockGamesResponse(gamesResponse([game('snake')], 1, 3));

    const page = await renderLibrary();

    expect(
      [...page.querySelectorAll('.page-btn')].map(
        (button) => button.textContent
      )
    ).toEqual(['1', '2', '3']);
  });

  it('shows an empty state when the selection has no games', async () => {
    mockGamesResponse(gamesResponse([]));

    const page = await renderLibrary();

    expect(page.textContent).toContain('Data Not Found');
    expect(cardNames(page)).toEqual([]);
  });

  it('goes back to page 1 when a later page is empty', async () => {
    mockGamesResponse(gamesResponse([], 3, 2));

    await renderLibrary('page=3');

    expect(mocks.setQuery).toHaveBeenCalledWith(
      { page: undefined },
      { replace: true }
    );
  });

  it('corrects the URL to the page the API returned', async () => {
    mockGamesResponse(gamesResponse([game('snake')], 2, 2));

    await renderLibrary('page=5');

    expect(mocks.setQuery).toHaveBeenCalledWith({ page: 2 }, { replace: true });
  });

  it('removes the page from the URL when the API returns page 1', async () => {
    mockGamesResponse(gamesResponse([game('snake')], 1, 1));

    await renderLibrary('page=2');

    expect(mocks.setQuery).toHaveBeenCalledWith(
      { page: undefined },
      { replace: true }
    );
  });

  it('shows an error banner whose retry reloads the games', async () => {
    const games = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(gamesResponse([game('snake')]));
    mockApi(games);

    const page = await renderLibrary();
    expect(page.textContent).toContain(
      'Failed to load games. Please try again.'
    );

    page.querySelector<HTMLButtonElement>('.error-retry-btn')?.click();
    await settle();

    expect(cardNames(page)).toEqual(['SNAKE']);
  });

  it('shows a bar without chips and loads no games if categories fail', async () => {
    mocks.apiCall.mockRejectedValue(new Error('offline'));

    const page = await renderLibrary();

    expect(page.querySelector('.filter-sort-bar')).not.toBeNull();
    expect(page.querySelectorAll('.chip')).toHaveLength(0);
    expect(gameRequests()).toHaveLength(0);
  });
});

describe('user controls', () => {
  it('puts a chosen category in the URL and resets the page', async () => {
    const page = await renderLibrary();

    page.querySelector<HTMLElement>('.chip[data-slug="puzzle"]')?.click();

    expect(mocks.setQuery).toHaveBeenCalledWith({
      category: 'puzzle',
      page: undefined,
    });
  });

  it('removes the category from the URL for the default chip', async () => {
    const page = await renderLibrary('category=puzzle');

    page.querySelector<HTMLElement>('.chip[data-slug="all"]')?.click();

    expect(mocks.setQuery).toHaveBeenCalledWith({
      category: undefined,
      page: undefined,
    });
  });

  it('puts a chosen sort in the URL and resets the page', async () => {
    const page = await renderLibrary();

    page
      .querySelector<HTMLElement>('.sort-option[data-id="name-asc"]')
      ?.click();

    expect(mocks.setQuery).toHaveBeenCalledWith({
      sort: 'name-asc',
      page: undefined,
    });
  });

  it('removes the sort from the URL for the default sort', async () => {
    const page = await renderLibrary('sort=name-asc');

    page
      .querySelector<HTMLElement>('.sort-option[data-id="rating-desc"]')
      ?.click();

    expect(mocks.setQuery).toHaveBeenCalledWith({
      sort: undefined,
      page: undefined,
    });
  });

  it('puts the chosen page in the URL, omitting page 1', async () => {
    mockGamesResponse(gamesResponse([game('snake')], 1, 3));
    const page = await renderLibrary();

    page.querySelector<HTMLButtonElement>('.arrow-btn.next')?.click();
    page.querySelector<HTMLButtonElement>('.arrow-btn.prev')?.click();

    expect(mocks.setQuery.mock.calls).toEqual([
      [{ page: 2 }],
      [{ page: undefined }],
    ]);
  });
});

describe('URL changes on the page', () => {
  it('reloads with the new values and syncs the controls', async () => {
    const page = await renderLibrary();

    await navigate('category=puzzle&sort=name-desc');

    expect(lastGameRequest()).toMatchObject({
      category: 'puzzle',
      sort: 'name-desc',
      page: '1',
    });
    expect(activeChip(page)).toBe('puzzle');
    expect(sortLabel(page)).toBe('Sort by: Name Z→A');
  });

  it('does not reload when the values are unchanged', async () => {
    await renderLibrary('category=puzzle');

    await navigate('category=puzzle&game=snake');

    expect(gameRequests()).toHaveLength(1);
  });

  it('ignores path changes, which re-render the whole page', async () => {
    await renderLibrary();

    url.query = new URLSearchParams('category=puzzle');
    route.listener({ pathChanged: true });

    expect(gameRequests()).toHaveLength(1);
  });

  it('ignores URL changes before the categories have loaded', () => {
    mocks.apiCall.mockReturnValue(new Promise(() => {}));
    url.query = new URLSearchParams();
    Library('/library');

    url.query = new URLSearchParams('category=puzzle');
    route.listener({ pathChanged: false });

    expect(gameRequests()).toHaveLength(0);
  });

  it('shows only the latest response when requests overlap', async () => {
    const pending: ((response: ApiResponse) => void)[] = [];
    mockApi(
      () =>
        new Promise<ApiResponse>((resolve) => {
          pending.push(resolve);
        })
    );
    const page = await renderLibrary();
    await navigate('category=puzzle');

    pending[1](gamesResponse([game('tetris')]));
    await settle();
    pending[0](gamesResponse([game('snake')]));
    await settle();

    expect(cardNames(page)).toEqual(['TETRIS']);
  });

  it('ignores a failure of an outdated request', async () => {
    const pending: [
      (response: ApiResponse) => void,
      (reason: unknown) => void,
    ][] = [];
    mockApi(
      () =>
        new Promise<ApiResponse>((resolve, reject) => {
          pending.push([resolve, reject]);
        })
    );
    const page = await renderLibrary();
    await navigate('category=puzzle');

    pending[1][0](gamesResponse([game('tetris')]));
    await settle();
    pending[0][1](new Error('offline'));
    await settle();

    expect(cardNames(page)).toEqual(['TETRIS']);
    expect(page.querySelector('.error-banner')).toBeNull();
  });
});
