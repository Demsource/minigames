import './sort-control.scss';
import triangleIcon from '../../assets/icons/triangle.svg';
import checkmarkIcon from '../../assets/icons/checkmark.svg';

interface SortOption {
  id: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'rating-asc', label: 'Rating ↑' },
  { id: 'rating-desc', label: 'Rating ↓' },
  { id: 'name-asc', label: 'Name A→Z' },
  { id: 'name-desc', label: 'Name Z→A' },
];

interface SortControlProperties {
  onSortChange?: (sortId: string) => void;
}

export function SortControl({
  onSortChange,
}: SortControlProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'sort-control';

  const defaultSort = SORT_OPTIONS[1]; // Rating ↓

  container.innerHTML = `
    <button class="sort-button" aria-expanded="false" aria-haspopup="listbox">
      <span class="sort-text">Sort by: ${defaultSort.label}</span>
      <img src="${triangleIcon}" alt="" class="sort-icon" />
    </button>
    <div class="sort-dropdown" role="listbox" aria-label="Sort options">
      ${SORT_OPTIONS.map(
        (option) => `
        <div
          class="sort-option${option.id === defaultSort.id ? ' active' : ''}"
          role="option"
          data-id="${option.id}"
          aria-selected="${option.id === defaultSort.id}"
        >
          ${option.id === defaultSort.id ? `<img src="${checkmarkIcon}" alt="Selected" class="checkmark" />` : ''}
          <span>${option.label}</span>
        </div>
      `
      ).join('')}
    </div>
  `;

  const button = container.querySelector('.sort-button') as HTMLButtonElement;
  const dropdown = container.querySelector('.sort-dropdown') as HTMLElement;
  const options = container.querySelectorAll('.sort-option');

  let isOpen = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
    dropdown.classList.toggle('open', isOpen);
    button.classList.toggle('open', isOpen);
    button.setAttribute('aria-expanded', isOpen.toString());

    if (isOpen) {
      (options[0] as HTMLElement).focus();
    }
  };

  const closeDropdown = () => {
    if (!isOpen) {
      return;
    }

    isOpen = false;
    dropdown.classList.remove('open');
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  };

  button.addEventListener('click', toggleDropdown);

  for (const option of options) {
    option.addEventListener('click', () => {
      const previousActive = container.querySelector('.sort-option.active');
      previousActive?.classList.remove('active');
      previousActive?.setAttribute('aria-selected', 'false');

      const previousCheckmark = previousActive?.querySelector('.checkmark');
      if (previousCheckmark) {
        previousCheckmark.remove();
      }

      option.classList.add('active');
      option.setAttribute('aria-selected', 'true');

      const sortText = container.querySelector('.sort-text') as HTMLElement;
      const optionText = option.querySelector('span')?.textContent || '';
      sortText.textContent = `Sort by: ${optionText}`;

      const checkmark = document.createElement('img');
      checkmark.src = checkmarkIcon;
      checkmark.alt = 'Selected';
      checkmark.className = 'checkmark';
      option.insertBefore(checkmark, option.firstChild);

      const sortId = option.dataset.id;
      onSortChange?.(sortId || '');

      closeDropdown();
    });

    option.addEventListener('mouseenter', () => {
      if (!isOpen) {
        return;
      }

      for (const opt of options) {
        opt.classList.remove('hover');
      }
      option.classList.add('hover');
    });
  }

  document.addEventListener('click', (event) => {
    if (!container.contains(event.target as Node)) {
      closeDropdown();
    }
  });

  return container;
}
