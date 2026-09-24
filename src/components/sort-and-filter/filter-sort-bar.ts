import './filter-sort-bar.scss';
import { FilterChips } from './filter-chips';
import { SortControl } from './sort-control';

interface FilterSortBarProperties {
  onFilterChange?: (slug: string) => void;
  onSortChange?: (sortId: string) => void;
}

export function FilterSortBar({
  onFilterChange,
  onSortChange,
}: FilterSortBarProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'filter-sort-bar';

  container.append(FilterChips({ onChipClick: onFilterChange }));
  container.append(SortControl({ onSortChange }));

  return container;
}
