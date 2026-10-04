export function SkeletonGameDetailsDialog(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'skeleton-game-details-dialog';

  container.innerHTML = `
    <div class="skeleton-dialog-header"></div>
    <div class="skeleton-dialog-image"></div>
    <div class="skeleton-game-info">
      <div class="skeleton-game-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-meta">
          <div class="skeleton-rating"></div>
          <div class="skeleton-likes"></div>
        </div>
      </div>

      <div class="skeleton-description">
        <div class="skeleton-description-line"></div>
        <div class="skeleton-description-line"></div>
        <div class="skeleton-description-line short"></div>
      </div>

      <div class="skeleton-specs">
        <div class="skeleton-spec-badge"></div>
        <div class="skeleton-spec-badge"></div>
        <div class="skeleton-spec-badge"></div>
        <div class="skeleton-spec-badge"></div>
      </div>

      <div class="skeleton-actions">
        <div class="skeleton-button"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <div class="skeleton-top-records">
      <div class="skeleton-records-header"></div>
      <div class="skeleton-record-item"></div>
      <div class="skeleton-record-item"></div>
      <div class="skeleton-record-item"></div>
    </div>
  `;

  return container;
}
