// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Leaderboard } from './leaderboard';

const apiCall = vi.hoisted(() => vi.fn());
vi.mock('../../services/api', () => ({ apiCall }));

interface Player {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

function player(rank: number, overrides: Partial<Player> = {}): Player {
  return {
    rank,
    playerName: `Player${rank}`,
    gamesPlayed: 10 * rank,
    totalScore: 12_345,
    streakDays: 5,
    favoriteGameSlug: 'snake',
    favoriteGameName: 'Snake',
    ...overrides,
  };
}

function leaderboardResponse(players: Player[]) {
  return {
    data: players,
    meta: { totalItems: players.length, description: 'Weekly' },
  };
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderLeaderboard(): Promise<HTMLElement> {
  const section = Leaderboard();
  document.body.append(section);
  await settle();
  return section;
}

function rows(section: HTMLElement): HTMLElement[] {
  return [...section.querySelectorAll<HTMLElement>('.lb-data')];
}

function cellText(row: HTMLElement, selector: string): string {
  return row.querySelector(selector)?.textContent ?? '';
}

beforeEach(() => {
  document.body.replaceChildren();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Leaderboard', () => {
  it('shows a skeleton while the leaderboard loads', () => {
    apiCall.mockReturnValue(new Promise(() => {}));

    const section = Leaderboard();

    expect(apiCall).toHaveBeenCalledWith('/api/leaderboard');
    expect(section.querySelector('.leaderboard-content')).not.toBeNull();
    expect(rows(section)).toHaveLength(0);
  });

  it('renders one row per player in API order after the header', async () => {
    apiCall.mockResolvedValue(
      leaderboardResponse([player(1), player(2), player(3)])
    );

    const section = await renderLeaderboard();

    expect(rows(section).map((row) => cellText(row, '.player-name'))).toEqual([
      'Player1',
      'Player2',
      'Player3',
    ]);
    expect(section.querySelector('.lb-header')?.nextElementSibling).toBe(
      rows(section)[0]
    );
    expect(section.querySelector('.leaderboard-content')).toBeNull();
  });

  it('renders every column for a player', async () => {
    apiCall.mockResolvedValue(
      leaderboardResponse([
        player(1, {
          playerName: 'JohnDoe',
          gamesPlayed: 42,
          totalScore: 12_345,
          streakDays: 7,
          favoriteGameName: 'Tetris',
        }),
      ])
    );

    const [row] = rows(await renderLeaderboard());

    expect(cellText(row, '.cell-rank .desktop-val')).toBe('#1');
    expect(cellText(row, '.player-avatar')).toBe('JD');
    expect(cellText(row, '.col-games')).toBe('42');
    expect(cellText(row, '.cell-score .desktop-val')).toBe('12,345');
    expect(cellText(row, '.cell-score .tablet-val')).toBe('12,345');
    expect(cellText(row, '.cell-score .mobile-val')).toBe('12.3K');
    expect(cellText(row, '.cell-streak .desktop-val')).toBe('7 days');
    expect(cellText(row, '.cell-streak .mobile-val')).toBe('7d');
    expect(cellText(row, '.pill')).toBe('Tetris');
  });

  it.each([
    ['JohnDoe', 'JD'],
    ['Alice Bob Carol', 'AB'],
    ['alice', 'AL'],
    ['Zed', 'ZE'],
  ])(
    'derives the avatar initials of %s as %s',
    async (playerName, initials) => {
      apiCall.mockResolvedValue(
        leaderboardResponse([player(1, { playerName })])
      );

      const [row] = rows(await renderLeaderboard());

      expect(cellText(row, '.player-avatar')).toBe(initials);
    }
  );

  it('highlights only the top 3 ranks', async () => {
    apiCall.mockResolvedValue(
      leaderboardResponse([player(1), player(3), player(4)])
    );

    const [first, third, fourth] = rows(await renderLeaderboard());

    expect(first.querySelector('.cell-rank')?.classList).toContain('top-1');
    expect(third.querySelector('.cell-rank')?.classList).toContain('top-3');
    expect(fourth.querySelector('.cell-rank')?.className).not.toMatch(/top-/);
  });

  it('renders player names as text, not HTML', async () => {
    apiCall.mockResolvedValue(
      leaderboardResponse([player(1, { playerName: '<img src=x>' })])
    );

    const [row] = rows(await renderLeaderboard());

    expect(cellText(row, '.player-name')).toBe('<img src=x>');
    expect(row.querySelector(':scope .player-name img')).toBeNull();
  });

  it('shows an empty state when there are no players', async () => {
    apiCall.mockResolvedValue(leaderboardResponse([]));

    const section = await renderLeaderboard();

    expect(section.textContent).toContain('No players available');
    expect(section.querySelector('.leaderboard-content')).toBeNull();
  });

  it('shows an error banner whose retry loads the players', async () => {
    apiCall.mockRejectedValueOnce(new Error('offline'));
    apiCall.mockResolvedValueOnce(leaderboardResponse([player(1)]));

    const section = await renderLeaderboard();
    expect(section.textContent).toContain(
      'Failed to load leaderboard. Please try again.'
    );
    expect(rows(section)).toHaveLength(0);

    section.querySelector<HTMLButtonElement>('.error-retry-btn')?.click();
    await settle();

    expect(apiCall).toHaveBeenCalledTimes(2);
    expect(rows(section)).toHaveLength(1);
  });
});
