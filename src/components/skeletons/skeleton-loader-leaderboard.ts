export function createSkeletonLeaderboardRow(): HTMLElement {
  const row = document.createElement('div');
  row.className = 'skeleton-leaderboard-row';

  row.innerHTML = `
    <div class="skeleton-leaderboard-cell skeleton-leaderboard-rank"></div>
    <div class="skeleton-leaderboard-cell skeleton-leaderboard-player">
      <div class="skeleton-leaderboard-avatar"></div>
      <div class="skeleton-leaderboard-text"></div>
    </div>
    <div class="skeleton-leaderboard-cell skeleton-leaderboard-games"></div>
    <div class="skeleton-leaderboard-cell skeleton-leaderboard-score"></div>
    <div class="skeleton-leaderboard-cell skeleton-leaderboard-streak"></div>
    <div class="skeleton-leaderboard-cell skeleton-leaderboard-favorite"></div>
  `;

  return row;
}

export function createSkeletonLeaderboardGroup(count: number): HTMLElement {
  const group = document.createElement('div');
  group.className = 'skeleton-leaderboard-group';

  for (let index = 0; index < count; index++) {
    group.append(createSkeletonLeaderboardRow());
  }

  return group;
}
