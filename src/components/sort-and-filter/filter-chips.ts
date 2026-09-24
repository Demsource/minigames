import './filter-chips.scss';
import categoriesData from '../../data/categories.json';

interface FilterChipsProperties {
  onChipClick?: (slug: string) => void;
}

export function FilterChips({
  onChipClick,
}: FilterChipsProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'filter-chips';

  const defaultCategory =
    categoriesData.data.find((c) => c.isDefault) || categoriesData.data[0];

  container.innerHTML = `
    <div class="chips-scroll-container">
      ${categoriesData.data
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
