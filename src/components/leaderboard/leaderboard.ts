import './leaderboard.scss';
import leaderboardJson from '../../data/leaderboard.json';

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

export function Leaderboard(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'leaderboard-section';

  const players = leaderboardJson.data;

  const rowsHtml = players
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
      ${rowsHtml}
    </div>
  `;

  return section;
}
