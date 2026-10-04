import './filter-chips.scss';
import { Category } from '../../services/api';

interface FilterChipsProperties {
  categories: Category[];
  onChipClick?: (slug: string) => void;
}

export function FilterChips({
  categories,
  onChipClick,
}: FilterChipsProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'filter-chips';

  const defaultCategory = categories.find((c) => c.isDefault) || categories[0];

  container.innerHTML = `
    <div class="chips-scroll-container">
      ${categories
        .map(
          (category) => `
        <button
          class="chip${category.slug === defaultCategory.slug ? ' active' : ''}"
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
      const previousActive = container.querySelector('.chip.active');
      previousActive?.classList.remove('active');
      chip.classList.add('active');

      const slug = chip.dataset.slug;
      onChipClick?.(slug || '');
    });
  }

  return container;
}
