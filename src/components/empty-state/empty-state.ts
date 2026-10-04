import './empty-state.scss';

export interface EmptyStateConfig {
  title?: string;
  message?: string;
  icon?: string;
  isDismissible?: boolean;
}

export function EmptyState(config: EmptyStateConfig = {}): HTMLElement {
  const {
    title = 'No items found',
    message = 'There are no items to display at the moment.',
    isDismissible = true,
  } = config;

  const container = document.createElement('div');
  container.className = 'empty-state';

  const iconSvg = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>`;

  let html = `
    <div class="empty-state-content">
      <div class="empty-state-icon">${iconSvg}</div>
      <div class="empty-state-text">
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-message">${message}</p>
      </div>
  `;

  if (isDismissible) {
    html += `
      <button type="button" class="empty-state-close" aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
  }

  html += `
    </div>
  `;

  container.innerHTML = html;

  if (isDismissible) {
    const closeButton = container.querySelector(
      '.empty-state-close'
    ) as HTMLButtonElement;
    closeButton.addEventListener('click', () => {
      container.remove();
    });
  }

  return container;
}
