export interface SkeletonConfig {
  width?: string;
  height?: string;
  borderRadius?: string;
  isWide?: boolean;
}

export function SkeletonSliderCard(config: SkeletonConfig = {}): HTMLElement {
  const {
    width = '288px',
    height = '384px',
    borderRadius = '16px',
    isWide = false,
  } = config;

  const card = document.createElement('div');
  card.className = 'skeleton-slider-card';
  if (isWide) {
    card.classList.add('skeleton-slider-card-wide');
  }
  card.style.width = isWide ? '816px' : width;
  card.style.height = height;
  card.style.borderRadius = borderRadius;

  card.innerHTML = `
    <div class="skeleton-slider-image"></div>
    <div class="skeleton-slider-overlay">
      <div class="skeleton-slider-title"></div>
      <div class="skeleton-slider-stats">
        <div class="skeleton-slider-stat"></div>
        <div class="skeleton-slider-stat"></div>
      </div>
    </div>
  `;

  return card;
}

export function createSkeletonSliderGroup(
  count: number,
  wideIndex?: number
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'skeleton-slider-group';

  for (let index = 0; index < count; index++) {
    group.append(SkeletonSliderCard({ isWide: index === wideIndex }));
  }

  return group;
}
