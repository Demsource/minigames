import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { PageTitle } from '../../components/page-title/page-title';
import { FilterSortBar } from '../../components/sort-and-filter/filter-sort-bar';
import { setActiveFilterChip } from '../../components/sort-and-filter/filter-chips';
import {
  DEFAULT_SORT_ID,
  isValidSortId,
  setActiveSortOption,
} from '../../components/sort-and-filter/sort-control';
import { router } from '../../app/router';
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
  let currentSort = DEFAULT_SORT_ID;
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
      router.setQuery({ page: pageNumber === 1 ? undefined : pageNumber });
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

      // Out-of-range page: fall back to page 1 (listener refetches)
      if (isEmpty && currentPage > 1) {
        router.setQuery({ page: undefined }, { replace: true });
        return;
      }

      currentPage = isEmpty ? 1 : Number(response.meta.page);
      pagination.update(currentPage, Number(response.meta.totalPages));

      // Keep the URL in line with the page the API actually returned
      if (currentPage !== getPageFromUrl()) {
        router.setQuery(
          { page: currentPage === 1 ? undefined : currentPage },
          { replace: true }
        );
      }

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

  let defaultCategorySlug = currentCategory;

  // Resolves the URL category against loaded categories; unknown → default
  const getCategoryFromUrl = (): string => {
    const slug = router.getQuery().get('category');
    return slug && categories.some((c) => c.slug === slug)
      ? slug
      : defaultCategorySlug;
  };

  // Unknown or missing sort → default
  const getSortFromUrl = (): string => {
    const sortId = router.getQuery().get('sort');
    return sortId && isValidSortId(sortId) ? sortId : DEFAULT_SORT_ID;
  };

  // Positive integer, otherwise page 1
  const getPageFromUrl = (): number => {
    const page = Number(router.getQuery().get('page'));
    return Number.isSafeInteger(page) && page > 0 ? page : 1;
  };

  router.subscribe(
    ({ pathChanged }) => {
      if (pathChanged || categories.length === 0) return;

      const slug = getCategoryFromUrl();
      const sortId = getSortFromUrl();
      const page = getPageFromUrl();
      if (
        slug === currentCategory &&
        sortId === currentSort &&
        page === currentPage
      ) {
        return;
      }

      currentCategory = slug;
      currentSort = sortId;
      currentPage = page;
      setActiveFilterChip(filterSortBarContainer, slug);
      setActiveSortOption(filterSortBarContainer, sortId);
      loadGames();
    },
    { pageScoped: true }
  );

  const loadCategories = async () => {
    try {
      const response = await apiCall<CategoriesResponse>('/api/categories');
      categories = response.data;

      const defaultCategory = categories.find((c) => c.isDefault);
      if (defaultCategory) {
        defaultCategorySlug = defaultCategory.slug;
      }

      currentCategory = getCategoryFromUrl();
      currentSort = getSortFromUrl();
      currentPage = getPageFromUrl();

      // Drop invalid category / sort / page values from the URL
      const urlQuery = router.getQuery();
      const urlCategory = urlQuery.get('category');
      const urlSort = urlQuery.get('sort');
      const urlPage = urlQuery.get('page');
      const hasInvalidCategory = urlCategory && urlCategory !== currentCategory;
      const hasInvalidSort = urlSort && urlSort !== currentSort;
      const hasInvalidPage = urlPage && urlPage !== String(currentPage);
      if (hasInvalidCategory || hasInvalidSort || hasInvalidPage) {
        router.setQuery(
          {
            category: hasInvalidCategory ? undefined : urlCategory || undefined,
            sort: hasInvalidSort ? undefined : urlSort || undefined,
            page: hasInvalidPage ? undefined : urlPage || undefined,
          },
          { replace: true }
        );
      }

      filterSortBarContainer.append(
        FilterSortBar({
          categories,
          activeCategory: currentCategory,
          activeSort: currentSort,
          onFilterChange: (slug: string) => {
            router.setQuery({
              category: slug === defaultCategorySlug ? undefined : slug,
              page: undefined,
            });
          },
          onSortChange: (sortId: string) => {
            router.setQuery({
              sort: sortId === DEFAULT_SORT_ID ? undefined : sortId,
              page: undefined,
            });
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
