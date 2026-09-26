import './game-cards-section.scss';
import { GameCard } from './game-card';
import { GameDetailsDialog } from '../dialogs/game-details-dialog';
import gamesData from '../../data/all-games-seed.json';

interface GameCardsSectionProperties {
  onDetailsClick?: (slug: string) => void;
}

export function GameCardsSection({
  onDetailsClick,
}: GameCardsSectionProperties): HTMLElement {
  const section = document.createElement('section');
  section.className = 'game-cards-section';

  const container = document.createElement('div');
  container.className = 'game-cards-grid';

  for (const game of gamesData.data.slice(0, 6)) {
    const card = GameCard(game);
    const detailsButton = card.querySelector(
      '.btn-details'
    ) as HTMLButtonElement;

    if (detailsButton) {
      detailsButton.addEventListener('click', () => {
        GameDetailsDialog.open();
        onDetailsClick?.(game.slug);
      });
    }

    container.append(card);
  }

  section.append(container);
  return section;
}
