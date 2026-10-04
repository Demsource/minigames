import './filter-sort-bar.scss';
import { FilterChips } from './filter-chips';
import { SortControl } from './sort-control';
import { Category } from '../../services/api';

interface FilterSortBarProperties {
  categories: Category[];
  onFilterChange?: (slug: string) => void;
  onSortChange?: (sortId: string) => void;
}

export function FilterSortBar({
  categories,
  onFilterChange,
  onSortChange,
}: FilterSortBarProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'filter-sort-bar';

  container.append(FilterChips({ categories, onChipClick: onFilterChange }));
  container.append(SortControl({ onSortChange }));

  return container;
}
