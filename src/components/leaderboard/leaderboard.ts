import './leaderboard.scss';
import { apiCall } from '../../services/api';
import { ErrorBanner } from '../error-banner/error-banner';
import { createSkeletonGroup } from '../skeleton-loader/skeleton-loader';
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

function createLeaderboardRows(players: LeaderboardPlayer[]): string {
  return players
    .map(
      (player) => `
    <div class="lb-row lb-data rank-${player.rank}">
      <div class="lb-cell cell-rank ${player.rank === 1 ? 'top-1' : ''} ${player.rank === 2 ? 'top-2' : ''} ${player.rank === 3 ? 'top-3' : ''}">
        <span class="desktop-val">#${player.rank}</span>
        <span class="tablet-val">#${player.rank}</span>
        <span class="mobile-val">#${player.rank}</span>
      </div>
      <div class="lb-cell cell-player">
        <div class="player-avatar bg-${player.rank}">${getInitials(player.playerName)}</div>
        <span class="player-name">${player.playerName}</span>
      </div>
      <div class="lb-cell col-games">${player.gamesPlayed}</div>
      <div class="lb-cell cell-score">
        <span class="desktop-val">${formatScoreDesktop(player.totalScore)}</span>
        <span class="tablet-val">${formatScoreDesktop(player.totalScore)}</span>
        <span class="mobile-val">${formatScoreMobile(player.totalScore)}</span>
      </div>
      <div class="lb-cell cell-streak">
        🔥 <span class="desktop-val">${player.streakDays} days</span>
        <span class="tablet-val">${player.streakDays}d</span>
        <span class="mobile-val">${player.streakDays}d</span>
      </div>
      <div class="lb-cell col-favorite cell-favorite">
        <span class="pill">${player.favoriteGameName}</span>
      </div>
    </div>
  `
    )
    .join('');
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
  skeletonContainer.append(createSkeletonGroup(5));
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

      const rowsHtml = createLeaderboardRows(response.data);
      headerRow.insertAdjacentHTML('afterend', rowsHtml);

      skeletonContainer.remove();
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
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
