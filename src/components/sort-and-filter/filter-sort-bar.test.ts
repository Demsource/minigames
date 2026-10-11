// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { Category } from '../../services/api';
import { FilterSortBar } from './filter-sort-bar';

const CATEGORIES: Category[] = [
  { slug: 'all', label: 'All Games', isDefault: true },
  { slug: 'puzzle', label: 'Puzzle', isDefault: false },
];

describe('FilterSortBar', () => {
  it('shows the active category and sort', () => {
    const bar = FilterSortBar({
      categories: CATEGORIES,
      activeCategory: 'puzzle',
      activeSort: 'name-asc',
    });

    expect(bar.querySelector<HTMLElement>('.chip.active')?.dataset.slug).toBe(
      'puzzle'
    );
    expect(bar.querySelector('.sort-text')?.textContent).toBe(
      'Sort by: Name A→Z'
    );
  });

  it('reports filter and sort changes to the given handlers', () => {
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();
    const bar = FilterSortBar({
      categories: CATEGORIES,
      onFilterChange,
      onSortChange,
    });

    bar.querySelector<HTMLElement>('.chip[data-slug="puzzle"]')?.click();
    bar
      .querySelector<HTMLElement>('.sort-option[data-id="name-desc"]')
      ?.click();

    expect(onFilterChange).toHaveBeenCalledWith('puzzle');
    expect(onSortChange).toHaveBeenCalledWith('name-desc');
  });
});
