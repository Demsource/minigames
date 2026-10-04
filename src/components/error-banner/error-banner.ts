import './error-banner.scss';

export interface ErrorBannerConfig {
  message?: string;
  onRetry?: () => void | Promise<void>;
  isDismissible?: boolean;
}

export function ErrorBanner(config: ErrorBannerConfig = {}): HTMLElement {
  const {
    message = 'Failed to load content. Please try again later.',
    onRetry,
    isDismissible = true,
  } = config;

  const banner = document.createElement('div');
  banner.className = 'error-banner';

  const iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>`;

  let html = `
    <div class="error-banner-content">
      <div class="error-icon">${iconSvg}</div>
      <div class="error-message">${message}</div>
      <div class="error-actions">
  `;

  if (onRetry) {
    html += `<button type="button" class="error-retry-btn">Retry</button>`;
  }

  if (isDismissible) {
    html += `<button type="button" class="error-close-btn" aria-label="Close error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>`;
  }

  html += `
      </div>
    </div>
  `;

  banner.innerHTML = html;

  if (onRetry) {
    const retryButton = banner.querySelector(
      '.error-retry-btn'
    ) as HTMLButtonElement;
    retryButton.addEventListener('click', async () => {
      retryButton.disabled = true;
      retryButton.textContent = 'Retrying...';
      try {
        await onRetry();
      } catch (error) {
        retryButton.disabled = false;
        retryButton.textContent = 'Retry';
        console.error('Retry failed:', error);
      }
    });
  }

  if (isDismissible) {
    const closeButton = banner.querySelector(
      '.error-close-btn'
    ) as HTMLButtonElement;
    closeButton.addEventListener('click', () => {
      banner.remove();
    });
  }

  return banner;
}
