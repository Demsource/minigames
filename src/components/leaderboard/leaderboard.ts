import './leaderboard.scss';
import '../skeletons/skeleton-loader-leaderboard.scss';
import { apiCall } from '../../services/api';
import { ErrorBanner } from '../error-banner/error-banner';
import { createSkeletonLeaderboardGroup } from '../skeletons/skeleton-loader-leaderboard';
import { EmptyState } from '../empty-state/empty-state';

interface LeaderboardPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

interface LeaderboardResponse {
  data: LeaderboardPlayer[];
  meta: {
    totalItems: number;
    description: string;
  };
}

function formatScoreDesktop(score: number): string {
  return score.toLocaleString('en-US');
}

function formatScoreMobile(score: number): string {
  return (score / 1000).toFixed(1) + 'K';
}

function getInitials(name: string): string {
  const matches = name.match(/[A-Z]/g);
  return matches && matches.length >= 2
    ? matches[0] + matches[1]
    : name.slice(0, 2).toUpperCase();
}

// Creates an element whose content is set as text, never parsed as HTML
function createElement(
  tag: string,
  className: string,
  text?: string
): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// Desktop / tablet / mobile variants of one value
function createResponsiveValues(
  desktop: string,
  tablet: string,
  mobile: string
): HTMLElement[] {
  return [
    createElement('span', 'desktop-val', desktop),
    createElement('span', 'tablet-val', tablet),
    createElement('span', 'mobile-val', mobile),
  ];
}

function createLeaderboardRow(player: LeaderboardPlayer): HTMLElement {
  const { rank } = player;
  const row = createElement('div', `lb-row lb-data rank-${rank}`);

  const rankCell = createElement('div', 'lb-cell cell-rank');
  if (rank >= 1 && rank <= 3) {
    rankCell.classList.add(`top-${rank}`);
  }
  rankCell.append(
    ...createResponsiveValues(`#${rank}`, `#${rank}`, `#${rank}`)
  );

  const playerCell = createElement('div', 'lb-cell cell-player');
  playerCell.append(
    createElement(
      'div',
      `player-avatar bg-${rank}`,
      getInitials(player.playerName)
    ),
    createElement('span', 'player-name', player.playerName)
  );

  const gamesCell = createElement(
    'div',
    'lb-cell col-games',
    String(player.gamesPlayed)
  );

  const scoreCell = createElement('div', 'lb-cell cell-score');
  scoreCell.append(
    ...createResponsiveValues(
      formatScoreDesktop(player.totalScore),
      formatScoreDesktop(player.totalScore),
      formatScoreMobile(player.totalScore)
    )
  );

  const streakCell = createElement('div', 'lb-cell cell-streak', '🔥 ');
  streakCell.append(
    ...createResponsiveValues(
      `${player.streakDays} days`,
      `${player.streakDays}d`,
      `${player.streakDays}d`
    )
  );

  const favoriteCell = createElement(
    'div',
    'lb-cell col-favorite cell-favorite'
  );
  favoriteCell.append(createElement('span', 'pill', player.favoriteGameName));

  row.append(
    rankCell,
    playerCell,
    gamesCell,
    scoreCell,
    streakCell,
    favoriteCell
  );
  return row;
}

export function Leaderboard(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'leaderboard-section';

  section.innerHTML = `
    <header class="section-header">
      <div class="title-accent"></div>
      <h2>
        <span class="desktop-title">Top Players This Week</span>
        <span class="mobile-title">Top Players</span>
      </h2>
    </header>
    <div class="leaderboard-table-container">
      <div class="lb-row lb-header">
        <div class="lb-cell">RANK</div>
        <div class="lb-cell">PLAYER</div>
        <div class="lb-cell col-games">
          <span class="desktop-val">GAMES PLAYED</span>
          <span class="tablet-val">GAMES</span>
          <span class="mobile-val">GAMES</span>
        </div>
        <div class="lb-cell">
          <span class="desktop-val">TOTAL SCORE</span>
          <span class="tablet-val">SCORE</span>
          <span class="mobile-val">SCORE</span>
        </div>
        <div class="lb-cell">STREAK</div>
        <div class="lb-cell col-favorite">FAVORITE GAME</div>
      </div>
    </div>
  `;

  const tableContainer = section.querySelector(
    '.leaderboard-table-container'
  ) as HTMLElement;
  const headerRow = section.querySelector('.lb-header') as HTMLElement;

  const skeletonContainer = document.createElement('div');
  skeletonContainer.className = 'leaderboard-content';
  skeletonContainer.append(createSkeletonLeaderboardGroup(5));
  tableContainer.append(skeletonContainer);

  const loadLeaderboard = async () => {
    try {
      const response = await apiCall<LeaderboardResponse>('/api/leaderboard');

      if (response.data.length === 0) {
        skeletonContainer.replaceWith(
          EmptyState({
            title: 'No players available',
            message: 'There are no players to display at the moment.',
            isDismissible: true,
          })
        );
        return;
      }

      headerRow.after(
        ...response.data.map((player) => createLeaderboardRow(player))
      );

      skeletonContainer.remove();
    } catch {
      // Shown to the user as the error banner with Retry
      skeletonContainer.replaceWith(
        ErrorBanner({
          message: 'Failed to load leaderboard. Please try again.',
          onRetry: loadLeaderboard,
          isDismissible: true,
        })
      );
    }
  };

  loadLeaderboard();

  return section;
}
