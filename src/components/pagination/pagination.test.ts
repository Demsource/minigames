// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination';

const DESKTOP_WIDTH = 1024;
const MOBILE_WIDTH = 500;

function setViewportWidth(width: number): void {
  Object.defineProperty(globalThis, 'innerWidth', {
    configurable: true,
    value: width,
  });
}

function pageLabels(element: HTMLElement): string[] {
  return [...element.querySelectorAll('.page-btn')].map(
    (button) => button.textContent ?? ''
  );
}

function activePage(element: HTMLElement): string {
  return element.querySelector('.page-btn.active')?.textContent ?? '';
}

function arrow(element: HTMLElement, name: 'prev' | 'next'): HTMLButtonElement {
  return element.querySelector<HTMLButtonElement>(`.arrow-btn.${name}`)!;
}

function pageButton(element: HTMLElement, page: number): HTMLButtonElement {
  return [...element.querySelectorAll<HTMLButtonElement>('.page-btn')].find(
    (button) => button.textContent === String(page)
  )!;
}

beforeEach(() => {
  setViewportWidth(DESKTOP_WIDTH);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Pagination', () => {
  it('starts on page 1 of 1 with both arrows disabled', () => {
    const { element } = Pagination();

    expect(pageLabels(element)).toEqual(['1']);
    expect(activePage(element)).toBe('1');
    expect(arrow(element, 'prev').disabled).toBe(true);
    expect(arrow(element, 'next').disabled).toBe(true);
    expect(arrow(element, 'prev').getAttribute('aria-label')).toBe(
      'Previous page'
    );
  });

  it('shows up to 4 page buttons on desktop and marks the current one', () => {
    const { element, update } = Pagination();

    update(1, 10);

    expect(pageLabels(element)).toEqual(['1', '2', '3', '4']);
    expect(
      element.querySelector('.page-btn.active')?.getAttribute('aria-current')
    ).toBe('page');
    expect(arrow(element, 'prev').classList).toContain('disabled');
    expect(arrow(element, 'next').disabled).toBe(false);
  });

  it('shows only as many buttons as there are pages', () => {
    const { element, update } = Pagination();

    update(2, 2);

    expect(pageLabels(element)).toEqual(['1', '2']);
  });

  it('keeps the current page centered in the visible range', () => {
    const { element, update } = Pagination();

    update(5, 10);

    expect(pageLabels(element)).toEqual(['3', '4', '5', '6']);
  });

  it('pins the range to the last pages near the end', () => {
    const { element, update } = Pagination();

    update(10, 10);

    expect(pageLabels(element)).toEqual(['7', '8', '9', '10']);
    expect(arrow(element, 'next').disabled).toBe(true);
  });

  it('shows 3 page buttons on narrow screens', () => {
    setViewportWidth(MOBILE_WIDTH);
    const { element, update } = Pagination();

    update(5, 10);

    expect(pageLabels(element)).toEqual(['4', '5', '6']);
  });

  it('re-renders for the new width when the window is resized', () => {
    const { element, update } = Pagination();
    update(5, 10);

    setViewportWidth(MOBILE_WIDTH);
    globalThis.dispatchEvent(new Event('resize'));

    expect(pageLabels(element)).toEqual(['4', '5', '6']);
  });

  it.each([
    [0, 0, '1', ['1']],
    [7, 3, '3', ['1', '2', '3']],
    [-2, 3, '1', ['1', '2', '3']],
  ])(
    'clamps update(%i, %i) to a valid page',
    (page, totalPages, expectedActive, expectedLabels) => {
      const { element, update } = Pagination();

      update(page, totalPages);

      expect(activePage(element)).toBe(expectedActive);
      expect(pageLabels(element)).toEqual(expectedLabels);
    }
  );

  it('reports the clicked page and highlights it', () => {
    const onPageChange = vi.fn();
    const { element, update } = Pagination({ onPageChange });
    update(1, 10);

    pageButton(element, 3).click();

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(activePage(element)).toBe('3');
  });

  it('moves one page with the arrows', () => {
    const onPageChange = vi.fn();
    const { element, update } = Pagination({ onPageChange });
    update(5, 10);

    arrow(element, 'next').click();
    arrow(element, 'prev').click();
    arrow(element, 'prev').click();

    expect(onPageChange.mock.calls).toEqual([[6], [5], [4]]);
    expect(activePage(element)).toBe('4');
  });

  it('ignores clicks on the current page', () => {
    const onPageChange = vi.fn();
    const { element, update } = Pagination({ onPageChange });
    update(2, 10);

    pageButton(element, 2).click();

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('works without a page change handler', () => {
    const { element, update } = Pagination();
    update(1, 3);

    arrow(element, 'next').click();

    expect(activePage(element)).toBe('2');
  });
});
