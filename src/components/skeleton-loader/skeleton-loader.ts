import './skeleton-loader.scss';

export interface SkeletonConfig {
  width?: string;
  height?: string;
  borderRadius?: string;
  isWide?: boolean;
}

export function SkeletonCard(config: SkeletonConfig = {}): HTMLElement {
  const {
    width = '288px',
    height = '384px',
    borderRadius = '16px',
    isWide = false,
  } = config;

  const card = document.createElement('div');
  card.className = 'skeleton-card';
  if (isWide) {
    card.classList.add('skeleton-card-wide');
  }
  card.style.width = isWide ? '816px' : width;
  card.style.height = height;
  card.style.borderRadius = borderRadius;

  card.innerHTML = `
    <div class="skeleton-image"></div>
    <div class="skeleton-overlay">
      <div class="skeleton-title"></div>
      <div class="skeleton-stats">
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
      </div>
    </div>
  `;

  return card;
}

export function createSkeletonGroup(
  count: number,
  wideIndex?: number
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'skeleton-group';

  for (let index = 0; index < count; index++) {
    group.append(SkeletonCard({ isWide: index === wideIndex }));
  }

  return group;
}
