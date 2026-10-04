import './filter-chips.scss';
import { Category } from '../../services/api';

interface FilterChipsProperties {
  categories: Category[];
  activeSlug?: string;
  onChipClick?: (slug: string) => void;
}

export function setActiveFilterChip(root: HTMLElement, slug: string) {
  for (const chip of root.querySelectorAll<HTMLElement>(':scope .chip')) {
    chip.classList.toggle('active', chip.dataset.slug === slug);
  }
}

export function FilterChips({
  categories,
  activeSlug,
  onChipClick,
}: FilterChipsProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'filter-chips';

  const defaultCategory = categories.find((c) => c.isDefault) || categories[0];
  const initialSlug = activeSlug ?? defaultCategory?.slug;

  container.innerHTML = `
    <div class="chips-scroll-container">
      ${categories
        .map(
          (category) => `
        <button
          class="chip${category.slug === initialSlug ? ' active' : ''}"
          data-slug="${category.slug}"
        >
          ${category.label}
        </button>
      `
        )
        .join('')}
    </div>
  `;

  const chips = container.querySelectorAll<HTMLElement>('.chip');
  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const slug = chip.dataset.slug || '';
      setActiveFilterChip(container, slug);
      onChipClick?.(slug);
    });
  }

  return container;
}
