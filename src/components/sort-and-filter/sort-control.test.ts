// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_SORT_ID,
  isValidSortId,
  setActiveSortOption,
  SortControl,
} from './sort-control';

// Each control adds a document click listener (outside-click close); remove
// them after every test so controls from earlier tests stay inert
const documentListeners: Parameters<typeof document.addEventListener>[] = [];

function renderControl(
  properties: Parameters<typeof SortControl>[0] = {}
): HTMLElement {
  const control = SortControl(properties);
  document.body.append(control);
  return control;
}

function sortButton(control: HTMLElement): HTMLButtonElement {
  return control.querySelector<HTMLButtonElement>('.sort-button')!;
}

function option(control: HTMLElement, id: string): HTMLElement {
  return control.querySelector<HTMLElement>(
    `.sort-option[data-id="${CSS.escape(id)}"]`
  )!;
}

function label(control: HTMLElement): string {
  return control.querySelector('.sort-text')?.textContent ?? '';
}

function activeOptionIds(control: HTMLElement): string[] {
  return [...control.querySelectorAll<HTMLElement>('.sort-option.active')].map(
    (element) => element.dataset.id ?? ''
  );
}

function isDropdownOpen(control: HTMLElement): boolean {
  return (
    control.querySelector('.sort-dropdown')?.classList.contains('open') ?? false
  );
}

beforeEach(() => {
  const addEventListener = document.addEventListener.bind(document);
  vi.spyOn(document, 'addEventListener').mockImplementation(
    (...listenerArguments: Parameters<typeof document.addEventListener>) => {
      documentListeners.push(listenerArguments);
      addEventListener(...listenerArguments);
    }
  );
  document.body.replaceChildren();
});

afterEach(() => {
  for (const listenerArguments of documentListeners.splice(0)) {
    document.removeEventListener(...listenerArguments);
  }
  vi.restoreAllMocks();
});

describe('isValidSortId', () => {
  it.each(['rating-asc', 'rating-desc', 'name-asc', 'name-desc'])(
    'accepts %s',
    (sortId) => {
      expect(isValidSortId(sortId)).toBe(true);
    }
  );

  it.each(['', 'price-asc', 'RATING-DESC'])('rejects %j', (sortId) => {
    expect(isValidSortId(sortId)).toBe(false);
  });

  it('defaults to rating descending', () => {
    expect(DEFAULT_SORT_ID).toBe('rating-desc');
  });
});

describe('SortControl', () => {
  it('shows the default sort with a checkmark when none is given', () => {
    const control = renderControl();

    expect(label(control)).toBe('Sort by: Rating ↓');
    expect(activeOptionIds(control)).toEqual(['rating-desc']);
    expect(option(control, 'rating-desc').getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(control.querySelectorAll('.checkmark')).toHaveLength(1);
    expect(
      option(control, 'rating-desc').querySelector('.checkmark')
    ).not.toBeNull();
  });

  it('shows the given active sort', () => {
    const control = renderControl({ activeSortId: 'name-asc' });

    expect(label(control)).toBe('Sort by: Name A→Z');
    expect(activeOptionIds(control)).toEqual(['name-asc']);
  });

  it('falls back to the default for an unknown sort', () => {
    const control = renderControl({ activeSortId: 'bogus' });

    expect(label(control)).toBe('Sort by: Rating ↓');
  });

  it('opens and closes the dropdown with the button', () => {
    const control = renderControl();

    sortButton(control).click();
    expect(isDropdownOpen(control)).toBe(true);
    expect(sortButton(control).getAttribute('aria-expanded')).toBe('true');
    expect(sortButton(control).classList).toContain('open');

    sortButton(control).click();
    expect(isDropdownOpen(control)).toBe(false);
    expect(sortButton(control).getAttribute('aria-expanded')).toBe('false');
  });

  it('applies the chosen option, reports it and closes', () => {
    const onSortChange = vi.fn();
    const control = renderControl({ onSortChange });
    sortButton(control).click();

    option(control, 'name-desc').click();

    expect(onSortChange).toHaveBeenCalledWith('name-desc');
    expect(label(control)).toBe('Sort by: Name Z→A');
    expect(activeOptionIds(control)).toEqual(['name-desc']);
    expect(option(control, 'name-desc').getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(option(control, 'rating-desc').getAttribute('aria-selected')).toBe(
      'false'
    );
    expect(control.querySelectorAll('.checkmark')).toHaveLength(1);
    expect(
      option(control, 'name-desc').querySelector('.checkmark')
    ).not.toBeNull();
    expect(isDropdownOpen(control)).toBe(false);
  });

  it('works without a change handler', () => {
    const control = renderControl();

    option(control, 'rating-asc').click();

    expect(label(control)).toBe('Sort by: Rating ↑');
  });

  it('highlights the hovered option only while open', () => {
    const control = renderControl();

    option(control, 'name-asc').dispatchEvent(new Event('mouseenter'));
    expect(option(control, 'name-asc').classList).not.toContain('hover');

    sortButton(control).click();
    option(control, 'name-asc').dispatchEvent(new Event('mouseenter'));
    option(control, 'name-desc').dispatchEvent(new Event('mouseenter'));

    expect(option(control, 'name-asc').classList).not.toContain('hover');
    expect(option(control, 'name-desc').classList).toContain('hover');
  });

  it('closes when clicking outside, but not inside', () => {
    const control = renderControl();
    sortButton(control).click();

    control.querySelector<HTMLElement>('.sort-dropdown')?.click();
    expect(isDropdownOpen(control)).toBe(true);

    document.body.click();
    expect(isDropdownOpen(control)).toBe(false);
  });
});

describe('setActiveSortOption', () => {
  it('moves the active state, checkmark and label', () => {
    const control = renderControl();

    setActiveSortOption(control, 'name-asc');

    expect(label(control)).toBe('Sort by: Name A→Z');
    expect(activeOptionIds(control)).toEqual(['name-asc']);
    expect(control.querySelectorAll('.checkmark')).toHaveLength(1);
  });

  it('ignores unknown sort ids', () => {
    const control = renderControl();

    setActiveSortOption(control, 'bogus');

    expect(label(control)).toBe('Sort by: Rating ↓');
    expect(activeOptionIds(control)).toEqual(['rating-desc']);
  });

  it('keeps a single checkmark when reapplying the active sort', () => {
    const control = renderControl();

    setActiveSortOption(control, 'rating-desc');

    expect(control.querySelectorAll('.checkmark')).toHaveLength(1);
  });
});
