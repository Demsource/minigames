import './pagination.scss';

interface PaginationProperties {
  onPageChange?: (pageNumber: number) => void;
}

export interface PaginationController {
  element: HTMLElement;
  update: (currentPage: number, totalPages: number) => void;
}

function getMaxVisiblePages(): number {
  return window.innerWidth < 768 ? 3 : 4;
}

function getVisibleRange(
  currentPage: number,
  totalPages: number
): [number, number] {
  const maxVisiblePages = Math.min(getMaxVisiblePages(), totalPages);
  const centeredStart = currentPage - Math.floor(maxVisiblePages / 2);
  const startPage = Math.max(
    1,
    Math.min(centeredStart, totalPages - maxVisiblePages + 1)
  );
  return [startPage, startPage + maxVisiblePages - 1];
}

function createButton(
  className: string,
  label: string,
  onClick: () => void
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

export function Pagination({
  onPageChange,
}: PaginationProperties = {}): PaginationController {
  const container = document.createElement('div');
  container.className = 'pagination';

  let currentPage = 1;
  let totalPages = 1;

  const goToPage = (pageNumber: number) => {
    if (pageNumber === currentPage || pageNumber < 1 || pageNumber > totalPages)
      return;
    currentPage = pageNumber;
    render();
    onPageChange?.(currentPage);
  };

  const render = () => {
    const isFirst = currentPage <= 1;
    const isLast = currentPage >= totalPages;

    const previousArrow = createButton('arrow-btn prev', '<', () =>
      goToPage(currentPage - 1)
    );
    previousArrow.setAttribute('aria-label', 'Previous page');
    previousArrow.disabled = isFirst;
    previousArrow.classList.toggle('disabled', isFirst);

    const nextArrow = createButton('arrow-btn next', '>', () =>
      goToPage(currentPage + 1)
    );
    nextArrow.setAttribute('aria-label', 'Next page');
    nextArrow.disabled = isLast;
    nextArrow.classList.toggle('disabled', isLast);

    const [startPage, endPage] = getVisibleRange(currentPage, totalPages);
    const pageButtons: HTMLButtonElement[] = [];
    for (let page = startPage; page <= endPage; page++) {
      const button = createButton('page-btn', String(page), () =>
        goToPage(page)
      );
      button.classList.toggle('active', page === currentPage);
      if (page === currentPage) button.setAttribute('aria-current', 'page');
      pageButtons.push(button);
    }

    container.replaceChildren(previousArrow, ...pageButtons, nextArrow);
  };

  const update = (page: number, pages: number) => {
    totalPages = Math.max(1, pages || 1);
    currentPage = Math.min(Math.max(1, page || 1), totalPages);
    render();
  };

  render();
  window.addEventListener('resize', render);

  return { element: container, update };
}
