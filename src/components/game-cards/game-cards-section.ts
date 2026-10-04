import './game-cards-section.scss';
import { GameCard } from './game-card';
import { GameDetailsDialog } from '../dialogs/game-details-dialog';
import { Game } from '../../services/api';

interface GameCardsSectionProperties {
  games: Game[];
  onDetailsClick?: (slug: string) => void;
}

export function GameCardsSection({
  games,
  onDetailsClick,
}: GameCardsSectionProperties): HTMLElement {
  const section = document.createElement('section');
  section.className = 'game-cards-section';

  const container = document.createElement('div');
  container.className = 'game-cards-grid';

  for (const game of games) {
    const card = GameCard(game);
    const detailsButton = card.querySelector(
      '.btn-details'
    ) as HTMLButtonElement;

    if (detailsButton) {
      detailsButton.addEventListener('click', () => {
        GameDetailsDialog.show(game.slug);
        onDetailsClick?.(game.slug);
      });
    }

    container.append(card);
  }

  section.append(container);
  return section;
}
