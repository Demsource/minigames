// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteChange } from '../../app/router';
import type { AppSession } from '../../services/app-session';
import type * as Api from '../../services/api';
import type * as GameDetailsModule from './game-details-dialog';

type SessionListener = (session: AppSession | undefined) => void;

const mocks = vi.hoisted(() => ({
  getGameDetails: vi.fn(),
  getComments: vi.fn(),
  postComment: vi.fn(),
  toggleGameFavorite: vi.fn(),
  toggleCommentLike: vi.fn(),
  subscribe: vi.fn(),
  setQuery: vi.fn(),
  showSnackbar: vi.fn(),
  canPerformProtectedAction: vi.fn(),
  getSession: vi.fn(),
  subscribeSession: vi.fn(),
}));

vi.mock('../../services/api', async (importOriginal) => ({
  ...(await importOriginal<typeof Api>()),
  getGameDetails: mocks.getGameDetails,
  getComments: mocks.getComments,
  postComment: mocks.postComment,
  toggleGameFavorite: mocks.toggleGameFavorite,
  toggleCommentLike: mocks.toggleCommentLike,
}));
vi.mock('../../app/router', () => ({
  router: { subscribe: mocks.subscribe, setQuery: mocks.setQuery },
}));
vi.mock('../snackbar/snackbar', () => ({ showSnackbar: mocks.showSnackbar }));
vi.mock('../../services/session-guard', () => ({
  canPerformProtectedAction: mocks.canPerformProtectedAction,
}));
vi.mock('../../services/session-state', () => ({
  getSession: mocks.getSession,
  subscribeSession: mocks.subscribeSession,
}));

const NOW = new Date('2026-06-15T12:00:00Z').getTime();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const SESSION: AppSession = {
  displayName: 'Ana',
  email: 'ana@example.com',
  authenticatedAt: NOW,
};

// Per-test state (top-level reassignment is lint-banned)
const context = {} as {
  dialog: typeof GameDetailsModule.GameDetailsDialog;
  ApiError: typeof Api.ApiError;
  onRoute: (change: Pick<RouteChange, 'query'>) => void;
  onSession: SessionListener;
  session?: AppSession;
};

// Each fresh dialog adds a document keydown listener; remove them after every
// test so dialogs from earlier tests don't react to later key presses
const documentListeners: Parameters<typeof document.addEventListener>[] = [];

function noop(): void {}

function deferred<T>() {
  const handle = {} as {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
  };
  handle.promise = new Promise<T>((resolve, reject) => {
    handle.resolve = resolve;
    handle.reject = reject;
  });
  return handle;
}

function gameDetails(
  overrides: Partial<Api.GameDetails> = {}
): Api.GameDetails {
  return {
    slug: 'snake',
    name: 'Snake',
    heroImage: '/images/snake.png',
    rating: 4.5,
    likesCount: 10,
    isLikedByCurrentUser: false,
    fullDescription: 'Eat apples, grow longer.',
    specs: {
      genre: 'Arcade',
      players: '1',
      duration: '5 min',
      price: 'Free',
    },
    topRecords: [
      {
        position: 1,
        playerName: 'Bob',
        score: 12_345,
        achievedAt: new Date(NOW).toISOString(),
      },
    ],
    ...overrides,
  };
}

function comment(
  commentId: string,
  overrides: Partial<Api.Comment> = {}
): Api.Comment {
  return {
    commentId,
    authorName: 'Bob',
    text: `Comment ${commentId}`,
    likesCount: 2,
    isLikedByCurrentUser: false,
    createdAt: new Date(NOW - 5 * MINUTE).toISOString(),
    ...overrides,
  };
}

function commentsResponse(
  comments: Api.Comment[],
  totalComments = comments.length
): Api.CommentsResponse {
  return {
    data: comments,
    meta: { totalComments, returnedCount: comments.length, sort: 'newest' },
  };
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function setUrlQuery(search: string): void {
  context.onRoute({ query: new URLSearchParams(search) });
}

async function openGame(slug = 'snake'): Promise<void> {
  setUrlQuery(`game=${slug}`);
  await settle();
}

function signIn(): void {
  context.session = SESSION;
}

function query<T extends Element = HTMLElement>(selector: string): T {
  const dialog = document.querySelector('.game-details-dialog')!;
  return dialog.querySelector<T>(selector)!;
}

function text(selector: string): string {
  return query(selector)?.textContent?.trim() ?? '';
}

function backdrop(): HTMLElement {
  return document.querySelector('.game-details-backdrop')!;
}

function favoriteButton(): HTMLButtonElement {
  return query<HTMLButtonElement>('.btn-favorite');
}

function likeButton(commentId: string): HTMLButtonElement {
  return query<HTMLButtonElement>(
    `.comment-like-btn[data-comment-id="${CSS.escape(commentId)}"]`
  );
}

function textarea(): HTMLTextAreaElement {
  return query<HTMLTextAreaElement>('.comment-textarea');
}

function submitButton(): HTMLButtonElement {
  return query<HTMLButtonElement>('.comment-submit-btn');
}

function typeComment(value: string): void {
  textarea().value = value;
  textarea().dispatchEvent(new Event('input', { bubbles: true }));
}

function pressKey(target: EventTarget, key: string, isShifted = false): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, shiftKey: isShifted, bubbles: true })
  );
}

function pressEscape(): void {
  pressKey(document, 'Escape');
}

function clickCloseButton(): void {
  query<HTMLElement>('.close-button').click();
}

function clickBackdrop(): void {
  backdrop().click();
}

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  const addEventListener = document.addEventListener.bind(document);
  vi.spyOn(document, 'addEventListener').mockImplementation(
    (...listenerArguments: Parameters<typeof document.addEventListener>) => {
      documentListeners.push(listenerArguments);
      addEventListener(...listenerArguments);
    }
  );
  document.body.replaceChildren();
  document.body.style.overflow = '';

  context.session = undefined;
  mocks.getSession.mockImplementation(() => context.session);
  mocks.canPerformProtectedAction.mockImplementation(
    () => context.session !== undefined
  );
  mocks.subscribe.mockImplementation((listener) => {
    context.onRoute = listener;
    return noop;
  });
  mocks.subscribeSession.mockImplementation((listener: SessionListener) => {
    context.onSession = listener;
    return noop;
  });
  mocks.getGameDetails.mockResolvedValue({ data: gameDetails() });
  mocks.getComments.mockResolvedValue(
    commentsResponse([comment('c1'), comment('c2')], 7)
  );

  // Fresh singleton per test; ApiError comes from the same module instance
  // so the dialog's instanceof checks match
  vi.resetModules();
  const { ApiError } = await import('../../services/api');
  const { GameDetailsDialog } = await import('./game-details-dialog');
  context.ApiError = ApiError;
  context.dialog = GameDetailsDialog;
});

afterEach(() => {
  for (const listenerArguments of documentListeners.splice(0)) {
    document.removeEventListener(...listenerArguments);
  }
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('loading game details', () => {
  it('opens with a skeleton while the data loads', () => {
    mocks.getGameDetails.mockReturnValue(deferred().promise);

    setUrlQuery('game=snake');

    expect(backdrop().classList).toContain('is-open');
    expect(document.body.style.overflow).toBe('hidden');
    expect(query('.dialog-image .skeleton-dialog-image')).not.toBeNull();
  });

  it('requests guest data without an email', async () => {
    await openGame();

    expect(mocks.getGameDetails).toHaveBeenCalledWith('snake', undefined);
    expect(mocks.getComments).toHaveBeenCalledWith('snake', undefined);
  });

  it('requests personalized data for a signed-in user', async () => {
    signIn();

    await openGame();

    expect(mocks.getGameDetails).toHaveBeenCalledWith(
      'snake',
      'ana@example.com'
    );
    expect(mocks.getComments).toHaveBeenCalledWith('snake', 'ana@example.com');
  });

  it('renders the game info, specs and top records', async () => {
    await openGame();

    expect(text('.game-title')).toBe('Snake');
    expect(text('.rating-value')).toBe('4.5');
    expect(text('.likes-count')).toBe('10');
    expect(text('.game-description')).toBe('Eat apples, grow longer.');
    expect(text('[data-spec="genre"]')).toBe('Arcade');
    expect(text('[data-spec="price"]')).toBe('Free');
    expect(query<HTMLImageElement>('.dialog-image img').src).toContain(
      '/minigames/images/snake.png'
    );
    expect(text('.top-record-item .medal')).toBe('🥇');
    expect(text('.top-record-item .player-name')).toBe('Bob');
    expect(text('.top-record-item .record-score')).toBe('12,345 pts');
  });

  it('keeps absolute image URLs unchanged', async () => {
    mocks.getGameDetails.mockResolvedValue({
      data: gameDetails({ heroImage: 'https://cdn.example.com/snake.png' }),
    });

    await openGame();

    expect(query<HTMLImageElement>('.dialog-image img').src).toBe(
      'https://cdn.example.com/snake.png'
    );
  });

  it.each([
    [999, '999'],
    [1000, '1K'],
    [1500, '1.5K'],
    [2_000_000, '2M'],
    [2_500_000, '2.5M'],
  ])('formats %i likes as %s', async (likesCount, formatted) => {
    mocks.getGameDetails.mockResolvedValue({
      data: gameDetails({ likesCount }),
    });

    await openGame();

    expect(text('.likes-count')).toBe(formatted);
  });

  it.each([
    [1, '🥇', 0, 'Today'],
    [2, '🥈', 1, '1 day ago'],
    [3, '🥉', 3, '3 days ago'],
    [4, '', 7, '1 week ago'],
    [5, '', 21, '3 weeks ago'],
  ])(
    'shows position %i as "%s" and a record %i days old as "%s"',
    async (position, medal, daysAgo, label) => {
      mocks.getGameDetails.mockResolvedValue({
        data: gameDetails({
          topRecords: [
            {
              position,
              playerName: 'Bob',
              score: 1,
              achievedAt: new Date(NOW - daysAgo * DAY).toISOString(),
            },
          ],
        }),
      });

      await openGame();

      expect(text('.medal')).toBe(medal);
      expect(text('.record-date')).toBe(label);
    }
  );

  it('renders the comment count and the latest comments as text', async () => {
    mocks.getComments.mockResolvedValue(
      commentsResponse(
        [
          comment('c1', {
            authorName: 'zoe',
            text: '<b>not html</b>',
            likesCount: 4,
            isLikedByCurrentUser: true,
          }),
        ],
        12
      )
    );

    await openGame();

    expect(text('.comments-title')).toBe('Comments (12)');
    expect(text('.comment-author')).toBe('zoe');
    expect(text('.comment-avatar')).toBe('Z');
    expect(text('.comment-text')).toBe('<b>not html</b>');
    expect(query('.comment-text b')).toBeNull();
    expect(likeButton('c1').classList).toContain('is-liked');
    expect(likeButton('c1').textContent).toBe('4');
  });

  it('keeps the same avatar color for one author', async () => {
    mocks.getComments.mockResolvedValue(
      commentsResponse([comment('c1'), comment('c2')])
    );

    await openGame();

    const [first, second] = document.querySelectorAll('.comment-avatar');
    expect(first.className).toMatch(/comment-avatar--color-[1-5]/);
    expect(second.className).toBe(first.className);
  });

  it.each([
    [0, 'just now'],
    [1 * MINUTE, '1 min ago'],
    [5 * MINUTE, '5 min ago'],
    [1 * HOUR, '1 hour ago'],
    [3 * HOUR, '3 hours ago'],
    [1 * DAY, '1 day ago'],
    [3 * DAY, '3 days ago'],
    [7 * DAY, '1 week ago'],
    [14 * DAY, '2 weeks ago'],
    [30 * DAY, '1 month ago'],
    [60 * DAY, '2 months ago'],
    [365 * DAY, '1 year ago'],
    [730 * DAY, '2 years ago'],
  ])('labels a comment %i ms old as "%s"', async (age, label) => {
    const createdAt = new Date(NOW - age).toISOString();
    mocks.getComments.mockResolvedValue(
      commentsResponse([comment('c1', { createdAt })])
    );

    await openGame();

    expect(text('.comment-time')).toBe(label);
  });

  it('shows an empty state when there are no comments', async () => {
    mocks.getComments.mockResolvedValue(commentsResponse([]));

    await openGame();

    expect(text('.comments-title')).toBe('Comments (0)');
    expect(text('.comments-list')).toContain('No comments yet');
  });

  it('shows an unavailable state for empty game data', async () => {
    mocks.getGameDetails.mockResolvedValue({ data: {} });

    await openGame();

    expect(text('.game-info')).toContain('Game Data Unavailable');
    expect(query('.comment-form')).toBeNull();
  });

  it('shows an error with a working retry when the details fail', async () => {
    mocks.getGameDetails.mockRejectedValueOnce(new Error('offline'));

    await openGame();
    expect(text('.game-info')).toContain(
      'Failed to load game details. Please try again.'
    );

    query<HTMLButtonElement>('.error-retry-btn').click();
    await settle();

    expect(text('.game-title')).toBe('Snake');
  });

  it('shows a comments error whose retry restores the comments', async () => {
    mocks.getComments.mockRejectedValueOnce(new Error('offline'));

    await openGame();
    expect(text('.comments-section')).toContain(
      'Failed to load comments. Please try again.'
    );
    expect(text('.game-title')).toBe('Snake');

    query<HTMLButtonElement>('.comments-section .error-retry-btn').click();
    await settle();

    expect(text('.comments-title')).toBe('Comments (7)');
    expect(document.querySelectorAll('.comment-item')).toHaveLength(2);
  });

  it('ignores a slow response for a game that is no longer open', async () => {
    const slow = deferred<{ data: Api.GameDetails }>();
    mocks.getGameDetails.mockReturnValueOnce(slow.promise);
    setUrlQuery('game=snake');
    mocks.getGameDetails.mockResolvedValueOnce({
      data: gameDetails({ slug: 'tetris', name: 'Tetris' }),
    });
    await openGame('tetris');

    slow.resolve({ data: gameDetails() });
    await settle();

    expect(text('.game-title')).toBe('Tetris');
  });
});

describe('URL-driven open and close', () => {
  it('show() opens a game through the URL', () => {
    context.dialog.show('tetris');

    expect(mocks.setQuery).toHaveBeenCalledWith({ game: 'tetris' });
  });

  it('closes and unlocks scroll when game leaves the URL', async () => {
    await openGame();

    setUrlQuery('');

    expect(backdrop().classList).not.toContain('is-open');
    expect(document.body.style.overflow).toBe('');
  });

  it('does not reload when the same game stays in the URL', async () => {
    await openGame();

    setUrlQuery('game=snake&page=2');

    expect(mocks.getGameDetails).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['Escape', pressEscape],
    ['the close button', clickCloseButton],
    ['a backdrop click', clickBackdrop],
  ])('closes a deep-linked dialog with %s', async (_label, close) => {
    await openGame();

    close();

    expect(mocks.setQuery).toHaveBeenCalledWith(
      { game: undefined },
      { replace: true }
    );
  });

  it('closes with history.back when opened from an in-app page', async () => {
    const back = vi.spyOn(globalThis.history, 'back').mockImplementation(noop);
    setUrlQuery('');
    await openGame();

    pressKey(document, 'Escape');

    expect(back).toHaveBeenCalled();
    expect(mocks.setQuery).not.toHaveBeenCalled();
  });

  it('ignores Escape and clicks inside while closed or on content', async () => {
    pressKey(document, 'Escape');
    await openGame();
    query<HTMLElement>('.game-title').click();

    expect(mocks.setQuery).not.toHaveBeenCalled();
  });

  it('suspends behind the Auth dialog and resumes without reloading', async () => {
    await openGame();

    setUrlQuery('game=snake&auth=login');
    expect(backdrop().classList).not.toContain('is-open');

    setUrlQuery('game=snake');
    expect(backdrop().classList).toContain('is-open');
    expect(mocks.getGameDetails).toHaveBeenCalledTimes(1);
  });

  it('loads the new game when Auth closes onto a different game', async () => {
    await openGame();
    setUrlQuery('game=snake&auth=login');

    await openGame('tetris');

    expect(mocks.getGameDetails).toHaveBeenLastCalledWith('tetris', undefined);
  });
});

describe('favorite', () => {
  it('blocks guests with a login warning and no request', async () => {
    await openGame();

    favoriteButton().click();

    expect(mocks.canPerformProtectedAction).toHaveBeenCalled();
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'Please log in to add games to your favorites.'
    );
    expect(mocks.toggleGameFavorite).not.toHaveBeenCalled();
  });

  it('leaves the expiry message to the guard for an expired session', async () => {
    signIn();
    await openGame();
    mocks.canPerformProtectedAction.mockReturnValue(false);

    favoriteButton().click();

    expect(mocks.showSnackbar).not.toHaveBeenCalled();
    expect(mocks.toggleGameFavorite).not.toHaveBeenCalled();
  });

  it('shows the personalized favorite state on load', async () => {
    signIn();
    mocks.getGameDetails.mockResolvedValue({
      data: gameDetails({ isLikedByCurrentUser: true }),
    });

    await openGame();

    expect(favoriteButton().classList).toContain('is-favorited');
    expect(favoriteButton().getAttribute('aria-pressed')).toBe('true');
    expect(text('.btn-favorite .btn-text')).toBe('Remove from Favorites');
  });

  it('locks the button while the request is pending', async () => {
    signIn();
    await openGame();
    mocks.toggleGameFavorite.mockReturnValue(deferred().promise);

    favoriteButton().click();

    expect(mocks.toggleGameFavorite).toHaveBeenCalledWith(
      'snake',
      'ana@example.com'
    );
    expect(favoriteButton().disabled).toBe(true);
    expect(favoriteButton().getAttribute('aria-busy')).toBe('true');
    expect(text('.btn-favorite .btn-text')).toBe('Saving…');
  });

  it('applies the server state and count on success', async () => {
    signIn();
    await openGame();
    mocks.toggleGameFavorite.mockResolvedValue({
      data: { gameSlug: 'snake', isFavorited: true, likesCount: 11 },
    });

    favoriteButton().click();
    await settle();

    expect(favoriteButton().classList).toContain('is-favorited');
    expect(favoriteButton().disabled).toBe(false);
    expect(text('.btn-favorite .btn-text')).toBe('Remove from Favorites');
    expect(text('.likes-count')).toBe('11');
  });

  it('ignores a result that arrives after logout', async () => {
    signIn();
    await openGame();
    const request = deferred<Api.FavoriteToggleResponse>();
    mocks.toggleGameFavorite.mockReturnValue(request.promise);
    favoriteButton().click();

    context.session = undefined;
    request.resolve({
      data: { gameSlug: 'snake', isFavorited: true, likesCount: 11 },
    });
    await settle();

    expect(favoriteButton().classList).not.toContain('is-favorited');
    expect(text('.likes-count')).toBe('10');
  });

  it.each([
    [401, '', 'Please log in to manage your favorites.'],
    [404, '', 'This game could not be found.'],
    [429, 'Slow down', 'Slow down'],
    [500, '', "Couldn't update favorites. Please try again."],
  ])(
    'keeps the old state and shows a message for HTTP %i',
    async (status, message, expected) => {
      signIn();
      await openGame();
      mocks.toggleGameFavorite.mockRejectedValue(
        new context.ApiError(status, message)
      );

      favoriteButton().click();
      await settle();

      expect(mocks.showSnackbar).toHaveBeenCalledWith(expected);
      expect(mocks.toggleGameFavorite).toHaveBeenCalledTimes(1);
      expect(favoriteButton().classList).not.toContain('is-favorited');
      expect(favoriteButton().disabled).toBe(false);
      expect(text('.btn-favorite .btn-text')).toBe('Add to Favorites');
      expect(text('.likes-count')).toBe('10');
    }
  );

  it('reports an unknown outcome for network failures', async () => {
    signIn();
    await openGame();
    mocks.toggleGameFavorite.mockRejectedValue(new TypeError('offline'));

    favoriteButton().click();
    await settle();

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      "Couldn't confirm the favorite change. Please check and try again."
    );
    expect(mocks.toggleGameFavorite).toHaveBeenCalledTimes(1);
  });

  it('keeps working after a comments retry re-renders the buttons', async () => {
    signIn();
    mocks.getComments.mockRejectedValueOnce(new Error('offline'));
    await openGame();
    query<HTMLButtonElement>('.comments-section .error-retry-btn').click();
    await settle();
    mocks.toggleGameFavorite.mockResolvedValue({
      data: { gameSlug: 'snake', isFavorited: true, likesCount: 11 },
    });

    favoriteButton().click();
    await settle();

    expect(mocks.toggleGameFavorite).toHaveBeenCalledTimes(1);
    expect(favoriteButton().classList).toContain('is-favorited');
  });
});

describe('comment form', () => {
  it('is locked for guests', async () => {
    await openGame();

    expect(textarea().disabled).toBe(true);
    expect(textarea().placeholder).toBe('Log in to write a comment...');
    expect(text('.comment-form-avatar')).toBe('?');
    expect(query('.comment-form-avatar').classList).toContain('is-guest');
  });

  it('is open for signed-in users with their initial', async () => {
    signIn();
    await openGame();

    expect(textarea().disabled).toBe(false);
    expect(textarea().placeholder).toBe('Write a comment...');
    expect(text('.comment-form-avatar')).toBe('A');
  });

  it('enables submit only for non-blank text', async () => {
    signIn();
    await openGame();

    typeComment(' '.repeat(3));
    expect(submitButton().disabled).toBe(true);

    typeComment('Nice');
    expect(submitButton().disabled).toBe(false);
  });

  it('swaps to the hover icon while the pointer is over submit', async () => {
    signIn();
    await openGame();
    typeComment('Nice');
    const icon = query<HTMLImageElement>('.submit-icon');
    const defaultIcon = icon.src;

    submitButton().dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true })
    );
    const hoverIcon = icon.src;
    submitButton().dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

    expect(hoverIcon).not.toBe(defaultIcon);
    expect(icon.src).toBe(defaultIcon);
  });
});

describe('comment submission', () => {
  beforeEach(async () => {
    signIn();
    await openGame();
  });

  it('posts the trimmed text with the profile name', async () => {
    mocks.postComment.mockReturnValue(deferred().promise);
    typeComment('  Great game!  ');

    submitButton().click();

    expect(mocks.postComment).toHaveBeenCalledWith('snake', {
      userEmail: 'ana@example.com',
      authorName: 'Ana',
      text: 'Great game!',
    });
  });

  it('locks the form while the comment is being sent', async () => {
    mocks.postComment.mockReturnValue(deferred().promise);
    typeComment('Great game!');

    submitButton().click();
    pressKey(textarea(), 'Enter');

    expect(textarea().disabled).toBe(true);
    expect(submitButton().disabled).toBe(true);
    expect(query('.comment-form').classList).toContain('is-pending');
    expect(mocks.postComment).toHaveBeenCalledTimes(1);
  });

  it('clears the draft and refreshes the comments on success', async () => {
    mocks.postComment.mockResolvedValue({ data: comment('new') });
    mocks.getComments.mockResolvedValue(
      commentsResponse([comment('new', { text: 'Great game!' })], 8)
    );
    typeComment('Great game!');

    submitButton().click();
    await settle();

    expect(textarea().value).toBe('');
    expect(textarea().disabled).toBe(false);
    expect(mocks.getComments).toHaveBeenLastCalledWith(
      'snake',
      'ana@example.com'
    );
    expect(text('.comments-title')).toBe('Comments (8)');
    expect(text('.comment-text')).toBe('Great game!');
  });

  it('submits with Enter but not with Shift+Enter', async () => {
    mocks.postComment.mockReturnValue(deferred().promise);
    typeComment('Great game!');

    pressKey(textarea(), 'Enter', true);
    expect(mocks.postComment).not.toHaveBeenCalled();

    pressKey(textarea(), 'Enter');
    expect(mocks.postComment).toHaveBeenCalledTimes(1);
  });

  it('does not post blank text', () => {
    typeComment(' '.repeat(3));

    pressKey(textarea(), 'Enter');

    expect(mocks.postComment).not.toHaveBeenCalled();
  });

  it('rejects comments longer than 500 characters', () => {
    typeComment('a'.repeat(501));

    pressKey(textarea(), 'Enter');

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'Comments can be at most 500 characters long.'
    );
    expect(mocks.postComment).not.toHaveBeenCalled();
  });

  it('requires a profile name of at least 2 characters', () => {
    context.session = { ...SESSION, displayName: 'A' };
    typeComment('Great game!');

    pressKey(textarea(), 'Enter');

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'Your profile name must be at least 2 characters to comment.'
    );
    expect(mocks.postComment).not.toHaveBeenCalled();
  });

  it('does not post when the session has expired', () => {
    mocks.canPerformProtectedAction.mockReturnValue(false);
    typeComment('Great game!');

    pressKey(textarea(), 'Enter');

    expect(mocks.postComment).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'Text too long', 'Text too long'],
    [401, '', 'Please log in to post a comment.'],
    [404, '', 'This game could not be found.'],
    [429, 'Try again in 42 seconds', 'Try again in 42 seconds'],
    [403, '', "Your comment wasn't posted. Please try again."],
  ])(
    'keeps the text and does not refresh after HTTP %i',
    async (status, message, expected) => {
      mocks.postComment.mockRejectedValue(
        new context.ApiError(status, message)
      );
      const commentsRequests = mocks.getComments.mock.calls.length;
      typeComment('Great game!');

      submitButton().click();
      await settle();

      expect(mocks.showSnackbar).toHaveBeenCalledWith(expected);
      expect(textarea().value).toBe('Great game!');
      expect(textarea().disabled).toBe(false);
      expect(mocks.postComment).toHaveBeenCalledTimes(1);
      expect(mocks.getComments).toHaveBeenCalledTimes(commentsRequests);
    }
  );

  it.each([
    ['a 5xx response', () => new context.ApiError(503, 'Unavailable')],
    ['a network failure', () => new TypeError('offline')],
  ])(
    'reports an unknown outcome and re-reads comments after %s',
    async (_label, makeError) => {
      mocks.postComment.mockRejectedValue(makeError());
      const commentsRequests = mocks.getComments.mock.calls.length;
      typeComment('Great game!');

      submitButton().click();
      await settle();

      expect(mocks.showSnackbar).toHaveBeenCalledWith(
        "We couldn't confirm your comment was posted. Check the comments before trying again."
      );
      expect(textarea().value).toBe('Great game!');
      expect(mocks.postComment).toHaveBeenCalledTimes(1);
      expect(mocks.getComments).toHaveBeenCalledTimes(commentsRequests + 1);
    }
  );

  it('tells the user when the post worked but the refresh failed', async () => {
    mocks.postComment.mockResolvedValue({ data: comment('new') });
    mocks.getComments.mockRejectedValue(new Error('offline'));
    typeComment('Great game!');

    submitButton().click();
    await settle();

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'Your comment was posted, but the comments could not be refreshed.'
    );
    expect(textarea().value).toBe('');
  });
});

describe('comment likes', () => {
  it('blocks guests with a login warning and no request', async () => {
    await openGame();

    likeButton('c1').click();

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'Please log in to like comments.'
    );
    expect(mocks.toggleCommentLike).not.toHaveBeenCalled();
  });

  it('leaves the expiry message to the guard for an expired session', async () => {
    signIn();
    await openGame();
    mocks.canPerformProtectedAction.mockReturnValue(false);

    likeButton('c1').click();

    expect(mocks.showSnackbar).not.toHaveBeenCalled();
    expect(mocks.toggleCommentLike).not.toHaveBeenCalled();
  });

  it('locks only the pending comment', async () => {
    signIn();
    await openGame();
    mocks.toggleCommentLike.mockReturnValue(deferred().promise);

    likeButton('c1').click();

    expect(mocks.toggleCommentLike).toHaveBeenCalledWith(
      'c1',
      'ana@example.com'
    );
    expect(likeButton('c1').disabled).toBe(true);
    expect(likeButton('c1').classList).toContain('is-pending');
    expect(likeButton('c1').getAttribute('aria-busy')).toBe('true');
    expect(likeButton('c2').disabled).toBe(false);
  });

  it('applies the server like state and count on success', async () => {
    signIn();
    await openGame();
    mocks.toggleCommentLike.mockResolvedValue({
      data: { isLikedByCurrentUser: true, likesCount: 3 },
    });

    likeButton('c1').click();
    await settle();

    expect(likeButton('c1').classList).toContain('is-liked');
    expect(likeButton('c1').textContent).toBe('3');
    expect(likeButton('c1').disabled).toBe(false);
  });

  it.each([
    [401, '', 'Please log in to like comments.'],
    [404, '', 'This comment could not be found.'],
    [429, 'Slow down', 'Slow down'],
    [400, '', "Couldn't update your like. Please try again."],
    [500, '', "Couldn't confirm your like. Please check and try again."],
  ])(
    'keeps the old state and shows a message for HTTP %i',
    async (status, message, expected) => {
      signIn();
      await openGame();
      mocks.toggleCommentLike.mockRejectedValue(
        new context.ApiError(status, message)
      );

      likeButton('c1').click();
      await settle();

      expect(mocks.showSnackbar).toHaveBeenCalledWith(expected);
      expect(mocks.toggleCommentLike).toHaveBeenCalledTimes(1);
      expect(likeButton('c1').classList).not.toContain('is-liked');
      expect(likeButton('c1').textContent).toBe('2');
      expect(likeButton('c1').disabled).toBe(false);
    }
  );

  it('reports an unknown outcome for network failures', async () => {
    signIn();
    await openGame();
    mocks.toggleCommentLike.mockRejectedValue(new TypeError('offline'));

    likeButton('c1').click();
    await settle();

    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      "Couldn't confirm your like. Please check and try again."
    );
  });

  it('works on comments loaded after posting a comment', async () => {
    signIn();
    await openGame();
    mocks.postComment.mockResolvedValue({ data: comment('new') });
    mocks.getComments.mockResolvedValue(commentsResponse([comment('new')]));
    typeComment('Great game!');
    submitButton().click();
    await settle();
    mocks.toggleCommentLike.mockResolvedValue({
      data: { isLikedByCurrentUser: true, likesCount: 3 },
    });

    likeButton('new').click();
    await settle();

    expect(mocks.toggleCommentLike).toHaveBeenCalledWith(
      'new',
      'ana@example.com'
    );
    expect(likeButton('new').classList).toContain('is-liked');
  });
});

describe('session changes while open', () => {
  it('switches to the guest view on logout', async () => {
    signIn();
    mocks.getGameDetails.mockResolvedValue({
      data: gameDetails({ isLikedByCurrentUser: true }),
    });
    mocks.getComments.mockResolvedValue(
      commentsResponse([comment('c1', { isLikedByCurrentUser: true })])
    );
    await openGame();
    typeComment('Draft');

    context.session = undefined;
    context.onSession(undefined);

    expect(favoriteButton().classList).not.toContain('is-favorited');
    expect(likeButton('c1').classList).not.toContain('is-liked');
    expect(textarea().disabled).toBe(true);
    expect(textarea().value).toBe('Draft');
  });

  it('reloads personal favorite and like state on sign-in', async () => {
    await openGame();
    mocks.getGameDetails.mockResolvedValue({
      data: gameDetails({ isLikedByCurrentUser: true, likesCount: 11 }),
    });
    mocks.getComments.mockResolvedValue(
      commentsResponse([comment('c1', { isLikedByCurrentUser: true })])
    );

    signIn();
    context.onSession(SESSION);
    await settle();

    expect(mocks.getGameDetails).toHaveBeenLastCalledWith(
      'snake',
      'ana@example.com'
    );
    expect(favoriteButton().classList).toContain('is-favorited');
    expect(text('.likes-count')).toBe('11');
    expect(likeButton('c1').classList).toContain('is-liked');
    expect(textarea().disabled).toBe(false);
  });

  it('keeps the current view when the sign-in refresh fails', async () => {
    await openGame();
    mocks.getGameDetails.mockRejectedValue(new Error('offline'));
    mocks.getComments.mockRejectedValue(new Error('offline'));

    signIn();
    context.onSession(SESSION);
    await settle();

    expect(text('.game-title')).toBe('Snake');
    expect(document.querySelectorAll('.comment-item')).toHaveLength(2);
  });
});
