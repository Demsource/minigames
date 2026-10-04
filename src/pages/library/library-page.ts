import { Header } from '../../components/header/header';
import '../../components/header/header.scss';
import { PageTitle } from '../../components/page-title/page-title';
import { FilterSortBar } from '../../components/sort-and-filter/filter-sort-bar';
import { GameCardsSection } from '../../components/game-cards/game-cards-section';
import { Pagination } from '../../components/pagination/pagination';
import { Footer } from '../../components/footer/footer';
import { apiCall, ApiResponse } from '../../services/api';
import { ErrorBanner } from '../../components/error-banner/error-banner';
import { createSkeletonGameCardsGroup } from '../../components/skeletons/skeleton-loader-game-cards';
import '../../components/skeletons/skeleton-loader-game-cards.scss';
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

  const loadGames = async () => {
    try {
      const response = await apiCall<ApiResponse>('/api/games?limit=6');

      const gameCardsElement = GameCardsSection({
        games: response.data,
        onDetailsClick: () => {},
      });

      const gridElement = gameCardsElement.querySelector('.game-cards-grid');
      if (gridElement) {
        const skeleton = contentContainer.querySelector(
          '.skeleton-game-cards-group'
        );
        if (skeleton) {
          skeleton.replaceWith(gridElement);
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

  loadGames();

  return container;
}
