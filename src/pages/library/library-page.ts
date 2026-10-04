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

export function Library(currentRoute: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  let categories: Category[] = [];
  let currentCategory = 'all';
  let currentSort = 'rating-desc';

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
  const skeletonGroup = createSkeletonGameCardsGroup(6);
  contentContainer.append(skeletonGroup);
  section.append(contentContainer);
  container.append(section);

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

  const buildGamesUrl = (
    category: string = currentCategory,
    sort: string = currentSort
  ): string => {
    const parameters = new URLSearchParams();
    if (category && category !== 'all') {
      parameters.append('category', category);
    }
    parameters.append('sort', sort);
    parameters.append('limit', '6');
    return `/api/games?${parameters.toString()}`;
  };

  const loadGames = async () => {
    try {
      const url = buildGamesUrl(currentCategory, currentSort);
      const response = await apiCall<ApiResponse>(url);

      if (response.data.length === 0) {
        const skeleton = contentContainer.querySelector(
          '.skeleton-game-cards-group'
        );
        if (skeleton) {
          skeleton.replaceWith(
            EmptyState({
              title: 'No games available',
              message: 'There are no games to display at the moment.',
              isDismissible: true,
            })
          );
        }
        return;
      }

      const gameCardsElement = GameCardsSection({
        games: response.data,
        onDetailsClick: () => {},
      });

      const gridElement = gameCardsElement.querySelector('.game-cards-grid');
      if (gridElement) {
        const skeleton = contentContainer.querySelector(
          '.skeleton-game-cards-group'
        );
        const errorBanner = contentContainer.querySelector('.error-banner');
        const emptyState = contentContainer.querySelector('.empty-state');

        const existingContent = skeleton || errorBanner || emptyState;
        if (existingContent) {
          existingContent.replaceWith(gridElement);
        }
      }
    } catch (error) {
      console.error('Failed to load games:', error);
      const skeleton = contentContainer.querySelector(
        '.skeleton-game-cards-group'
      );
      if (skeleton) {
        skeleton.replaceWith(
          ErrorBanner({
            message: 'Failed to load games. Please try again.',
            onRetry: loadGames,
            isDismissible: true,
          })
        );
      }
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
            contentContainer.replaceChildren(createSkeletonGameCardsGroup(6));
            loadGames();
          },
          onSortChange: (sortId: string) => {
            currentSort = sortId;
            contentContainer.replaceChildren(createSkeletonGameCardsGroup(6));
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
