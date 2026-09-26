import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { PageTitle } from '../../components/page-title/page-title';
import { FilterSortBar } from '../../components/sort-and-filter/filter-sort-bar';
import { GameCardsSection } from '../../components/game-cards/game-cards-section';
import { Pagination } from '../../components/pagination/pagination';
import { Footer } from '../../components/footer/footer';
import './library-page.scss';

export function Library(currentRoute: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.append(Header(currentRoute));
  container.append(
    PageTitle({
      title: 'Game Library',
      subtitle: 'Browse our collection of casual mini-games',
    })
  );
  container.append(
    FilterSortBar({
      onFilterChange: () => {},
      onSortChange: () => {},
    })
  );
  container.append(
    GameCardsSection({
      onDetailsClick: () => {},
    })
  );

  const paginationWrapper = document.createElement('div');
  paginationWrapper.className = 'pagination-wrapper';
  paginationWrapper.append(
    Pagination({
      totalPages: 10,
      onPageChange: () => {},
    })
  );
  container.append(paginationWrapper);

  container.append(Footer());
  return container;
}
