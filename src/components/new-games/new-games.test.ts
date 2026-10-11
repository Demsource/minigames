// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game } from '../../services/api';
import { NewGames } from './new-games';

const mocks = vi.hoisted(() => ({
  apiCall: vi.fn(),
  showGame: vi.fn(),
}));

vi.mock('../../services/api', () => ({ apiCall: mocks.apiCall }));
vi.mock('../dialogs/game-details-dialog', () => ({
  GameDetailsDialog: { show: mocks.showGame },
}));

// Layout the slider measures (happy-dom has no layout engine):
// 96px cards + 4px default gap = 100px per step; 1000px track in a 400px
// container leaves 600px to scroll, i.e. 6 steps
const CARD_WIDTH = 96;
const CONTAINER_WIDTH = 400;
const TRACK_WIDTH = 1000;

// Animation frames are queued here and run on demand
const frames = new Map<number, FrameRequestCallback>();
const frameIds = { next: 1 };

// Resize callbacks are collected so a test can trigger one
const resizeCallbacks: (() => void)[] = [];

class FakeResizeObserver {
  constructor(callback: () => void) {
    resizeCallbacks.push(callback);
  }

  observe(): void {}
}

// Each slider adds document mousemove/mouseup listeners; remove them after
// every test so a drag left open in one test can't react in the next
const documentListeners: Parameters<typeof document.addEventListener>[] = [];

type LayoutProperty = 'offsetWidth' | 'clientWidth' | 'scrollWidth';

// Stubs a layout getter on whichever prototype in the element chain defines
// it, since happy-dom places these differently than browsers do
function mockLayout(property: LayoutProperty, value: number): void {
  let owner: object | null = HTMLElement.prototype;
  while (owner && !Object.hasOwn(owner, property)) {
    owner = Object.getPrototypeOf(owner);
  }
  if (!owner) {
    throw new Error(`No prototype defines ${property}`);
  }
  vi.spyOn(owner as HTMLElement, property, 'get').mockReturnValue(value);
}

function runFrame(): void {
  const [id, callback] = [...frames][0];
  frames.delete(id);
  callback(performance.now());
}

function game(slug: string, overrides: Partial<Game> = {}): Game {
  return {
    slug,
    name: slug.toUpperCase(),
    category: 'arcade',
    price: 'Free',
    shortDescription: '',
    rating: 4.5,
    likesCount: 10,
    cardImage: `cards/${slug}.png`,
    ...overrides,
  };
}

function gamesResponse(games: Game[]) {
  return { data: games, meta: {} };
}

async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
}

async function renderNewGames(): Promise<HTMLElement> {
  const section = NewGames();
  document.body.append(section);
  await settle();
  return section;
}

function cards(section: HTMLElement): HTMLElement[] {
  return [...section.querySelectorAll<HTMLElement>('.game-card')];
}

function track(section: HTMLElement): HTMLElement {
  return section.querySelector<HTMLElement>('.carousel-track')!;
}

function button(section: HTMLElement, name: 'prev' | 'next'): HTMLElement {
  return section.querySelector<HTMLElement>(`.btn-${name}`)!;
}

function mouse(target: EventTarget, type: string, clientX = 0): void {
  target.dispatchEvent(new MouseEvent(type, { clientX, bubbles: true }));
}

// One quick press of a nav button
function pressButton(section: HTMLElement, name: 'prev' | 'next'): void {
  mouse(button(section, name), 'mousedown');
  mouse(button(section, name), 'mouseup');
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'performance',
    ],
  });
  const addEventListener = document.addEventListener.bind(document);
  vi.spyOn(document, 'addEventListener').mockImplementation(
    (...listenerArguments: Parameters<typeof document.addEventListener>) => {
      documentListeners.push(listenerArguments);
      addEventListener(...listenerArguments);
    }
  );
  document.body.replaceChildren();
  frames.clear();
  resizeCallbacks.length = 0;
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = frameIds.next++;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  mockLayout('offsetWidth', CARD_WIDTH);
  mockLayout('clientWidth', CONTAINER_WIDTH);
  mockLayout('scrollWidth', TRACK_WIDTH);
  mocks.apiCall.mockResolvedValue(
    gamesResponse([game('snake'), game('tetris'), game('pong')])
  );
});

afterEach(() => {
  for (const listenerArguments of documentListeners.splice(0)) {
    document.removeEventListener(...listenerArguments);
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('loading featured games', () => {
  it('requests featured games and shows a skeleton meanwhile', () => {
    mocks.apiCall.mockReturnValue(new Promise(() => {}));

    const section = NewGames();

    expect(mocks.apiCall).toHaveBeenCalledWith('/api/games?featured=true');
    expect(track(section).children.length).toBeGreaterThan(0);
    expect(cards(section)).toHaveLength(0);
  });

  it('renders a card per game with its data', async () => {
    mocks.apiCall.mockResolvedValue(
      gamesResponse([game('snake', { name: 'Snake', rating: 4.8 })])
    );

    const [card] = cards(await renderNewGames());

    expect(card.dataset.gameSlug).toBe('snake');
    expect(card.querySelector('.game-title')?.textContent).toBe('Snake');
    expect(card.querySelector<HTMLElement>('.game-title')?.title).toBe('Snake');
    const image = card.querySelector<HTMLImageElement>('.game-image');
    expect(image?.src).toContain('cards/snake.png');
    expect(image?.alt).toBe('Snake');
    const [rating, likes] = card.querySelectorAll('.stat-value');
    expect(rating.textContent).toBe('4.8');
    expect(likes.textContent).toBe('10');
  });

  it.each([
    [999, '999'],
    [1000, '1K'],
    [1500, '1.5K'],
    [1_000_000, '1M'],
    [2_500_000, '2.5M'],
  ])('formats %i likes as %s', async (likesCount, formatted) => {
    mocks.apiCall.mockResolvedValue(
      gamesResponse([game('snake', { likesCount })])
    );

    const [card] = cards(await renderNewGames());

    expect(card.querySelectorAll('.stat-value')[1].textContent).toBe(formatted);
  });

  it('makes the third card wide', async () => {
    const section = await renderNewGames();

    expect(cards(section).map((card) => card.className)).toEqual([
      'game-card',
      'game-card',
      'game-card game-card-wide',
    ]);
  });

  it('renders game names as text, not HTML', async () => {
    mocks.apiCall.mockResolvedValue(
      gamesResponse([game('x', { name: '<b>bold</b>' })])
    );

    const [card] = cards(await renderNewGames());

    expect(card.querySelector('.game-title')?.textContent).toBe('<b>bold</b>');
    expect(card.querySelector(':scope .game-title b')).toBeNull();
  });

  it('shows an empty state when there are no featured games', async () => {
    mocks.apiCall.mockResolvedValue(gamesResponse([]));

    const section = await renderNewGames();

    expect(section.textContent).toContain('No games available');
    expect(cards(section)).toHaveLength(0);
  });

  it('shows an error banner whose retry loads the games', async () => {
    mocks.apiCall.mockRejectedValueOnce(new Error('offline'));

    const section = await renderNewGames();
    expect(section.textContent).toContain(
      'Failed to load featured games. Please try again.'
    );

    section.querySelector<HTMLButtonElement>('.error-retry-btn')?.click();
    await settle();

    expect(cards(section)).toHaveLength(3);
    expect(section.querySelector('.error-banner')).toBeNull();
  });
});

describe('opening a game', () => {
  it('opens the game details for the clicked card', async () => {
    const section = await renderNewGames();

    cards(section)[1].click();

    expect(mocks.showGame).toHaveBeenCalledWith('tetris');
  });
});

describe('navigation buttons', () => {
  it('moves one step forward per press of next', async () => {
    const section = await renderNewGames();

    pressButton(section, 'next');
    pressButton(section, 'next');

    expect(track(section).style.transform).toBe('translateX(-200px)');
  });

  it('wraps back to the start after the last step', async () => {
    const section = await renderNewGames();

    for (let step = 0; step < 6; step++) {
      pressButton(section, 'next');
    }

    expect(track(section).style.transform).toBe('translateX(-0px)');
  });

  it('wraps to the end when going back from the start', async () => {
    const section = await renderNewGames();

    pressButton(section, 'prev');

    expect(track(section).style.transform).toBe('translateX(-600px)');
  });

  it('moves one step back per press of prev', async () => {
    const section = await renderNewGames();
    pressButton(section, 'next');
    pressButton(section, 'next');

    pressButton(section, 'prev');

    expect(track(section).style.transform).toBe('translateX(-100px)');
  });

  it('keeps moving every 200ms while a button is held', async () => {
    const section = await renderNewGames();

    mouse(button(section, 'next'), 'mousedown');
    vi.advanceTimersByTime(400);
    mouse(button(section, 'next'), 'mouseup');

    expect(track(section).style.transform).toBe('translateX(-300px)');
  });

  it('stops moving when the pointer leaves a held button', async () => {
    const section = await renderNewGames();

    mouse(button(section, 'prev'), 'mousedown');
    mouse(button(section, 'prev'), 'mouseleave');
    vi.advanceTimersByTime(1000);

    expect(track(section).style.transform).toBe('translateX(-600px)');
  });

  it('pauses auto-advance while held and resumes it on release', async () => {
    const section = await renderNewGames();
    expect(frames.size).toBe(1);

    mouse(button(section, 'next'), 'mousedown');
    expect(frames.size).toBe(0);

    mouse(button(section, 'next'), 'mouseup');
    expect(frames.size).toBe(1);
    expect(track(section).style.transition).toBe('transform 0.1s ease');
  });
});

describe('auto-advance', () => {
  // 6 steps at 4 seconds per 100px step
  const FULL_CYCLE_MS = 24_000;

  it('scrolls smoothly in proportion to the elapsed time', async () => {
    const section = await renderNewGames();

    vi.advanceTimersByTime(FULL_CYCLE_MS / 2);
    runFrame();

    expect(track(section).style.transform).toBe('translateX(-300px)');
    expect(track(section).style.transition).toBe('none');
    expect(frames.size).toBe(1);
  });

  it('returns to the start and begins a new cycle at the end', async () => {
    const section = await renderNewGames();
    vi.advanceTimersByTime(FULL_CYCLE_MS / 2);
    runFrame();

    vi.advanceTimersByTime(FULL_CYCLE_MS);
    runFrame();

    expect(track(section).style.transform).toBe('translateX(-0px)');
    expect(frames.size).toBe(1);
  });

  it('re-measures the cards when the track is resized', async () => {
    const section = await renderNewGames();
    mockLayout('offsetWidth', 196);

    resizeCallbacks[0]();
    pressButton(section, 'next');

    expect(track(section).style.transform).toBe('translateX(-100px)');
    pressButton(section, 'next');
    expect(track(section).style.transform).toBe('translateX(-200px)');
  });
});

describe('dragging', () => {
  it('follows the pointer while dragging', async () => {
    const section = await renderNewGames();

    mouse(track(section), 'mousedown', 300);
    mouse(document, 'mousemove', 250);

    expect(track(section).style.transform).toBe('translateX(-50px)');
    expect(frames.size).toBe(0);
  });

  it('clamps the drag to the scrollable range', async () => {
    const section = await renderNewGames();

    mouse(track(section), 'mousedown', 1000);
    mouse(document, 'mousemove', 0);

    expect(track(section).style.transform).toBe('translateX(-600px)');
  });

  it('snaps to the next card after dragging left past the threshold', async () => {
    const section = await renderNewGames();

    mouse(track(section), 'mousedown', 300);
    mouse(document, 'mousemove', 250);
    mouse(document, 'mouseup');

    expect(track(section).style.transform).toBe('translateX(-100px)');
    expect(frames.size).toBe(1);
  });

  it('snaps back after a short drag', async () => {
    const section = await renderNewGames();

    mouse(track(section), 'mousedown', 300);
    mouse(document, 'mousemove', 290);
    mouse(track(section), 'mouseleave');

    expect(track(section).style.transform).toBe('translateX(-0px)');
  });

  it('wraps to the end when dragging right from the start', async () => {
    const section = await renderNewGames();

    mouse(track(section), 'mousedown', 300);
    mouse(document, 'mousemove', 350);
    mouse(document, 'mouseup');

    expect(track(section).style.transform).toBe('translateX(-600px)');
    expect(track(section).style.transition).toBe('none');
    vi.advanceTimersByTime(10);
    expect(track(section).style.transition).toBe('transform 0.1s ease');
  });

  it('wraps to the start when dragging left past the end', async () => {
    const section = await renderNewGames();
    for (let step = 0; step < 5; step++) {
      pressButton(section, 'next');
    }

    mouse(track(section), 'mousedown', 300);
    mouse(document, 'mousemove', 250);
    mouse(document, 'mouseup');

    expect(track(section).style.transform).toBe('translateX(-0px)');
    vi.advanceTimersByTime(10);
    expect(track(section).style.transition).toBe('transform 0.1s ease');
  });

  it('ignores pointer movement and release without a drag', async () => {
    const section = await renderNewGames();

    mouse(document, 'mousemove', 100);
    mouse(document, 'mouseup');

    expect(track(section).style.transform).toBe('');
  });
});
