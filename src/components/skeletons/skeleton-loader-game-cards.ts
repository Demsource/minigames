export function SkeletonGameCard(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'skeleton-game-card';

  card.innerHTML = `
    <div class="skeleton-game-card-image"></div>
    <div class="skeleton-game-card-content">
      <div class="skeleton-game-card-header">
        <div class="skeleton-game-name"></div>
        <div class="skeleton-game-category"></div>
      </div>
      <div class="skeleton-game-description"></div>
      <div class="skeleton-game-footer">
        <div class="skeleton-game-stats">
          <div class="skeleton-game-stat"></div>
          <div class="skeleton-game-stat"></div>
        </div>
        <div class="skeleton-game-button"></div>
      </div>
    </div>
  `;

  return card;
}

export function createSkeletonGameCardsGroup(count: number): HTMLElement {
  const group = document.createElement('div');
  group.className = 'skeleton-game-cards-group';

  for (let index = 0; index < count; index++) {
    group.append(SkeletonGameCard());
  }

  return group;
}
