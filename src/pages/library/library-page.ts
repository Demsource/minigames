import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { PageTitle } from '../../components/page-title/page-title';
import { FilterSortBar } from '../../components/sort-and-filter/filter-sort-bar';
import { GameCardsSection } from '../../components/game-cards/game-cards-section';
import { Pagination } from '../../components/pagination/pagination';
import { Footer } from '../../components/footer/footer';
import {
  apiCall,
  ApiResponse,
  CategoriesResponse,
  Category,
} from '../../services/api';
import { ErrorBanner } from '../../components/error-banner/error-banner';
import { EmptyState } from '../../components/empty-state/empty-state';
import { createSkeletonGameCardsGroup } from '../../components/skeletons/skeleton-loader-game-cards';
import '../../components/skeletons/skeleton-loader-game-cards.scss';
import './library-page.scss';

const PAGE_SIZE = 6;

export function Library(currentRoute: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  let categories: Category[] = [];
  let currentCategory = 'all';
  let currentSort = 'rating-desc';
  let currentPage = 1;

  container.append(Header(currentRoute));
  container.append(
    PageTitle({
      title: 'Game Library',
      subtitle: 'Browse our collection of casual mini-games',
    })
  );

  const filterSortBarContainer = document.createElement('div');
  filterSortBarContainer.id = 'filter-sort-bar-container';
  container.append(filterSortBarContainer);

  const section = document.createElement('section');
  section.className = 'game-cards-section';

  const contentContainer = document.createElement('div');
  contentContainer.id = 'game-cards-content';
  contentContainer.append(createSkeletonGameCardsGroup(PAGE_SIZE));
  section.append(contentContainer);
  container.append(section);

  const pagination = Pagination({
    onPageChange: (pageNumber: number) => {
      currentPage = pageNumber;
      loadGames();
    },
  });
  const paginationWrapper = document.createElement('div');
  paginationWrapper.className = 'pagination-wrapper';
  paginationWrapper.append(pagination.element);
  container.append(paginationWrapper);

  container.append(Footer());

  const buildGamesUrl = (): string => {
    const parameters = new URLSearchParams({
      category: currentCategory,
      sort: currentSort,
      page: String(currentPage),
      limit: String(PAGE_SIZE),
    });
    return `/api/games?${parameters.toString()}`;
  };

  let latestRequestId = 0;

  const loadGames = async () => {
    const requestId = ++latestRequestId;
    contentContainer.replaceChildren(createSkeletonGameCardsGroup(PAGE_SIZE));

    try {
      const response = await apiCall<ApiResponse>(buildGamesUrl());
      if (requestId !== latestRequestId) return;

      const isEmpty = response.data.length === 0;
      currentPage = isEmpty ? 1 : Number(response.meta.page);
      pagination.update(currentPage, Number(response.meta.totalPages));

      if (isEmpty) {
        contentContainer.replaceChildren(
          EmptyState({
            title: 'Data Not Found',
            message: 'There are no games to display for this selection.',
            isDismissible: false,
          })
        );
        return;
      }

      const gameCardsElement = GameCardsSection({
        games: response.data,
        onDetailsClick: () => {},
      });
      const gridElement = gameCardsElement.querySelector('.game-cards-grid');
      if (gridElement) {
        contentContainer.replaceChildren(gridElement);
      }
    } catch (error) {
      if (requestId !== latestRequestId) return;
      console.error('Failed to load games:', error);
      contentContainer.replaceChildren(
        ErrorBanner({
          message: 'Failed to load games. Please try again.',
          onRetry: loadGames,
          isDismissible: true,
        })
      );
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiCall<CategoriesResponse>('/api/categories');
      categories = response.data;

      const defaultCategory = categories.find((c) => c.isDefault);
      if (defaultCategory) {
        currentCategory = defaultCategory.slug;
      }

      filterSortBarContainer.append(
        FilterSortBar({
          categories,
          onFilterChange: (slug: string) => {
            currentCategory = slug;
            currentPage = 1;
            loadGames();
          },
          onSortChange: (sortId: string) => {
            currentSort = sortId;
            currentPage = 1;
            loadGames();
          },
        })
      );

      loadGames();
    } catch (error) {
      console.error('Failed to load categories:', error);
      filterSortBarContainer.append(
        FilterSortBar({
          categories: [],
          onFilterChange: () => {},
          onSortChange: () => {},
        })
      );
    }
  };

  loadCategories();

  return container;
}
