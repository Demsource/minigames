// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as SnackbarModule from './snackbar';

// Per-test module instance (top-level reassignment is lint-banned)
const context = {} as { snackbar: typeof SnackbarModule };

// Animation frames are queued here and run on demand
const frames: FrameRequestCallback[] = [];

function runFrames(): void {
  for (const callback of frames.splice(0)) {
    callback(0);
  }
}

function snackbarElements(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('.snackbar')];
}

function snackbar(): HTMLElement {
  return snackbarElements()[0];
}

function isVisible(): boolean {
  return snackbar().classList.contains('is-visible');
}

function show(text: string, options?: SnackbarModule.SnackbarOptions): void {
  context.snackbar.showSnackbar(text, options);
  runFrames();
}

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  document.body.replaceChildren();
  frames.length = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });

  // Fresh module per test: the snackbar element is module-level state
  vi.resetModules();
  context.snackbar = await import('./snackbar');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('showSnackbar', () => {
  it('creates an accessible status element with the message', () => {
    show('Saved!');

    expect(snackbarElements()).toHaveLength(1);
    expect(snackbar().getAttribute('role')).toBe('status');
    expect(snackbar().getAttribute('aria-live')).toBe('polite');
    expect(document.querySelector('.snackbar-message')?.textContent).toBe(
      'Saved!'
    );
  });

  it('becomes visible on the next animation frame', () => {
    context.snackbar.showSnackbar('Saved!');
    expect(isVisible()).toBe(false);

    runFrames();

    expect(isVisible()).toBe(true);
  });

  it('renders the message as text, not HTML', () => {
    show('<b>bold</b>');

    expect(document.querySelector('.snackbar-message')?.textContent).toBe(
      '<b>bold</b>'
    );
    expect(document.querySelector('.snackbar-message b')).toBeNull();
  });

  it('hides after 4 seconds by default', () => {
    show('Saved!');

    vi.advanceTimersByTime(3999);
    expect(isVisible()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(isVisible()).toBe(false);
  });

  it('hides after a custom duration', () => {
    show('Saved!', { duration: 1000 });

    vi.advanceTimersByTime(1000);

    expect(isVisible()).toBe(false);
  });

  it('reuses one element and restarts the timer for a new message', () => {
    show('First');
    vi.advanceTimersByTime(3000);

    show('Second');
    vi.advanceTimersByTime(3000);

    expect(snackbarElements()).toHaveLength(1);
    expect(document.querySelector('.snackbar-message')?.textContent).toBe(
      'Second'
    );
    expect(isVisible()).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(isVisible()).toBe(false);
  });

  it('restarts the enter transition when replacing a visible message', () => {
    show('First');

    context.snackbar.showSnackbar('Second');

    expect(isVisible()).toBe(false);
    runFrames();
    expect(isVisible()).toBe(true);
  });
});

describe('hiding', () => {
  it('hides when the close button is clicked', () => {
    show('Saved!');

    document.querySelector<HTMLButtonElement>('.snackbar-close')?.click();

    expect(isVisible()).toBe(false);
    expect(
      document.querySelector('.snackbar-close')?.getAttribute('aria-label')
    ).toBe('Dismiss notification');
  });

  it('hideSnackbar hides the message and cancels the timer', () => {
    show('Saved!');

    context.snackbar.hideSnackbar();

    expect(isVisible()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('hideSnackbar does nothing before any message was shown', () => {
    expect(() => context.snackbar.hideSnackbar()).not.toThrow();
    expect(snackbarElements()).toHaveLength(0);
  });
});
