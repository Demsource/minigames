import './snackbar.scss';

export interface SnackbarOptions {
  duration?: number;
}

const DEFAULT_DURATION_MS = 4000;

const CLOSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;

// Single shared element: a new message replaces the one currently shown
const state: {
  element?: HTMLElement;
  message?: HTMLElement;
  hideTimer?: number;
} = {};

function getElements(): { element: HTMLElement; message: HTMLElement } {
  if (!state.element || !state.message) {
    const element = document.createElement('div');
    element.className = 'snackbar';
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');

    const message = document.createElement('span');
    message.className = 'snackbar-message';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'snackbar-close';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.innerHTML = CLOSE_ICON;
    closeButton.addEventListener('click', hideSnackbar);

    element.append(message, closeButton);
    document.body.append(element);
    state.element = element;
    state.message = message;
  }
  return { element: state.element, message: state.message };
}

export function hideSnackbar(): void {
  globalThis.clearTimeout(state.hideTimer);
  state.element?.classList.remove('is-visible');
}

export function showSnackbar(
  text: string,
  { duration = DEFAULT_DURATION_MS }: SnackbarOptions = {}
): void {
  const { element, message } = getElements();
  globalThis.clearTimeout(state.hideTimer);

  message.textContent = text;
  // Restart the enter transition when a message replaces a visible one
  element.classList.remove('is-visible');
  requestAnimationFrame(() => element.classList.add('is-visible'));

  state.hideTimer = globalThis.setTimeout(hideSnackbar, duration);
}
