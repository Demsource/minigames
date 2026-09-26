import './pagination.scss';

interface PaginationProperties {
  totalPages: number;
  onPageChange?: (pageNumber: number) => void;
}

function getMaxVisiblePages(): number {
  return window.innerWidth < 768 ? 3 : 4;
}

function renderPageButtons(currentPage: number, totalPages: number): string {
  const maxVisiblePages = getMaxVisiblePages();
  const buttons: string[] = [];

  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  for (let index = startPage; index <= endPage; index++) {
    buttons.push(`
      <button class="page-btn${index === currentPage ? ' active' : ''}" data-page="${index}">
        ${index}
      </button>
    `);
  }

  return buttons.join('');
}

export function Pagination({
  totalPages,
  onPageChange,
}: PaginationProperties): HTMLElement {
  const container = document.createElement('div');
  container.className = 'pagination';

  let currentPage = 1;

  const updatePagination = () => {
    const pageButtons =
      container.querySelectorAll<HTMLButtonElement>('.page-btn');
    const previousArrow =
      container.querySelector<HTMLButtonElement>('.arrow-btn.prev');
    const nextArrow =
      container.querySelector<HTMLButtonElement>('.arrow-btn.next');

    if (!previousArrow || !nextArrow) return;

    for (const button of pageButtons) {
      const pageNumber = Number(button.dataset.page);
      button.classList.toggle('active', pageNumber === currentPage);
    }

    previousArrow.disabled = currentPage === 1;
    nextArrow.disabled = currentPage === totalPages;
    previousArrow.classList.toggle('disabled', currentPage === 1);
    nextArrow.classList.toggle('disabled', currentPage === totalPages);
  };

  const renderPagination = () => {
    container.innerHTML = `
      <button class="arrow-btn prev" aria-label="Previous page">
        <span>&lt;</span>
      </button>
      ${renderPageButtons(currentPage, totalPages)}
      <button class="arrow-btn next" aria-label="Next page">
        <span>&gt;</span>
      </button>
    `;
    attachEventListeners();
    updatePagination();
  };

  const attachEventListeners = () => {
    const previousArrow =
      container.querySelector<HTMLButtonElement>('.arrow-btn.prev');
    const nextArrow =
      container.querySelector<HTMLButtonElement>('.arrow-btn.next');
    const pageButtons =
      container.querySelectorAll<HTMLButtonElement>('.page-btn');

    previousArrow?.addEventListener('click', () => {
      if (currentPage <= 1) return;
      currentPage--;
      renderPagination();
      onPageChange?.(currentPage);
    });

    nextArrow?.addEventListener('click', () => {
      if (currentPage >= totalPages) return;
      currentPage++;
      renderPagination();
      onPageChange?.(currentPage);
    });

    for (const button of pageButtons) {
      button.addEventListener('click', () => {
        currentPage = Number(button.dataset.page);
        renderPagination();
        onPageChange?.(currentPage);
      });
    }
  };

  renderPagination();

  window.addEventListener('resize', () => {
    renderPagination();
  });

  return container;
}
