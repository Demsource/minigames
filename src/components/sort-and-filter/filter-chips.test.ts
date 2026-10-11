// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { Category } from '../../services/api';
import { FilterChips, setActiveFilterChip } from './filter-chips';

const CATEGORIES: Category[] = [
  { slug: 'all', label: 'All Games', isDefault: true },
  { slug: 'puzzle', label: 'Puzzle', isDefault: false },
  { slug: 'arcade', label: 'Arcade', isDefault: false },
];

function chipLabels(element: HTMLElement): string[] {
  return [...element.querySelectorAll('.chip')].map(
    (chip) => chip.textContent?.trim() ?? ''
  );
}

function activeSlugs(element: HTMLElement): string[] {
  return [...element.querySelectorAll<HTMLElement>('.chip.active')].map(
    (chip) => chip.dataset.slug ?? ''
  );
}

function chip(element: HTMLElement, slug: string): HTMLElement {
  return element.querySelector<HTMLElement>(
    `.chip[data-slug="${CSS.escape(slug)}"]`
  )!;
}

describe('FilterChips', () => {
  it('renders a chip per category in order', () => {
    const element = FilterChips({ categories: CATEGORIES });

    expect(chipLabels(element)).toEqual(['All Games', 'Puzzle', 'Arcade']);
  });

  it('activates the default category when none is given', () => {
    const element = FilterChips({ categories: CATEGORIES });

    expect(activeSlugs(element)).toEqual(['all']);
  });

  it('activates the given category', () => {
    const element = FilterChips({
      categories: CATEGORIES,
      activeSlug: 'arcade',
    });

    expect(activeSlugs(element)).toEqual(['arcade']);
  });

  it('falls back to the first category without a default', () => {
    const element = FilterChips({
      categories: CATEGORIES.map((category) => ({
        ...category,
        isDefault: false,
      })),
    });

    expect(activeSlugs(element)).toEqual(['all']);
  });

  it('renders no chips without categories', () => {
    const element = FilterChips({ categories: [] });

    expect(chipLabels(element)).toEqual([]);
  });

  it('activates and reports the clicked chip', () => {
    const onChipClick = vi.fn();
    const element = FilterChips({ categories: CATEGORIES, onChipClick });

    chip(element, 'puzzle').click();

    expect(onChipClick).toHaveBeenCalledWith('puzzle');
    expect(activeSlugs(element)).toEqual(['puzzle']);
  });

  it('works without a click handler', () => {
    const element = FilterChips({ categories: CATEGORIES });

    chip(element, 'arcade').click();

    expect(activeSlugs(element)).toEqual(['arcade']);
  });
});

describe('setActiveFilterChip', () => {
  it('moves the active state to the given slug', () => {
    const element = FilterChips({ categories: CATEGORIES });

    setActiveFilterChip(element, 'arcade');

    expect(activeSlugs(element)).toEqual(['arcade']);
  });

  it('clears the active state for an unknown slug', () => {
    const element = FilterChips({ categories: CATEGORIES });

    setActiveFilterChip(element, 'bogus');

    expect(activeSlugs(element)).toEqual([]);
  });
});
