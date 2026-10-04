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

export const DEFAULT_SORT_ID = 'rating-desc';

export function isValidSortId(sortId: string): boolean {
  return SORT_OPTIONS.some((option) => option.id === sortId);
}

export function setActiveSortOption(root: HTMLElement, sortId: string) {
  const selected = SORT_OPTIONS.find((option) => option.id === sortId);
  if (!selected) {
    return;
  }

  for (const option of root.querySelectorAll<HTMLElement>(
    ':scope .sort-option'
  )) {
    const isActive = option.dataset.id === sortId;
    option.classList.toggle('active', isActive);
    option.setAttribute('aria-selected', String(isActive));

    const checkmark = option.querySelector('.checkmark');
    if (isActive && !checkmark) {
      const newCheckmark = document.createElement('img');
      newCheckmark.src = checkmarkIcon;
      newCheckmark.alt = 'Selected';
      newCheckmark.className = 'checkmark';
      option.insertBefore(newCheckmark, option.firstChild);
    } else if (!isActive) {
      checkmark?.remove();
    }
  }

  const sortText = root.querySelector<HTMLElement>(':scope .sort-text');
  if (sortText) {
    sortText.textContent = `Sort by: ${selected.label}`;
  }
}

interface SortControlProperties {
  activeSortId?: string;
  onSortChange?: (sortId: string) => void;
}

export function SortControl({
  activeSortId = DEFAULT_SORT_ID,
  onSortChange,
}: SortControlProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'sort-control';

  const defaultSort =
    SORT_OPTIONS.find((option) => option.id === activeSortId) ||
    SORT_OPTIONS[1]; // Rating ↓

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
  const options = container.querySelectorAll<HTMLElement>('.sort-option');

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
      const sortId = option.dataset.id || '';
      setActiveSortOption(container, sortId);
      onSortChange?.(sortId);

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
