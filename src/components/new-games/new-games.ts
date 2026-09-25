import './new-games.scss';
import starIcon from '../../assets/icons/star.svg';
import heartIcon from '../../assets/icons/heart.svg';
import { GameDetailsDialog } from '../dialogs/game-details-dialog';

import imgBubbleShooter from '../../assets/images/new-games/Game Card - Bubble Shooter.png';
import imgCandyCrush from '../../assets/images/new-games/Game Card - Candy Crush.png';
import imgIslanders from '../../assets/images/new-games/Game Card - Islanders New Shores.png';
import imgVacationCafe from '../../assets/images/new-games/Game Card - Vacation Cafe Simulator.png';
import imgWinterBurrow from '../../assets/images/new-games/Game Card - Winter Burrow.png';

interface GameData {
  title: string;
  image: string;
  rating: string;
  likes: string;
}

const games: GameData[] = [
  { title: 'Candy Crush', image: imgCandyCrush, rating: '4.6', likes: '89.0K' },
  {
    title: 'ISLANDERS: New Shores',
    image: imgIslanders,
    rating: '4.9',
    likes: '54.2K',
  },
  {
    title: 'Vacation Cafe Simulator',
    image: imgVacationCafe,
    rating: '4.8',
    likes: '28.7K',
  },
  {
    title: 'Winter Burrow',
    image: imgWinterBurrow,
    rating: '4.9',
    likes: '32.4K',
  },
  {
    title: 'Bubble Shooter',
    image: imgBubbleShooter,
    rating: '4.7',
    likes: '12.1K',
  },
];

function createGameCard(game: GameData, index: number): string {
  const wideClass = index === 2 ? ' game-card-wide' : '';
  return `
    <div class="game-card${wideClass}">
      <img src="${game.image}" alt="${game.title}" class="game-image" />
      <div class="game-info-overlay">
        <h3 class="game-title" title="${game.title}">${game.title}</h3>
        <div class="game-stats">
          <div class="stat-item rating">
            <img src="${starIcon}" alt="Star" />
            <span>${game.rating}</span>
          </div>
          <div class="stat-item likes">
            <img src="${heartIcon}" alt="Heart" />
            <span>${game.likes}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function NewGames(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'new-games-section';

  const cardsHtml = games
    .map((game, index) => createGameCard(game, index))
    .join('');

  section.innerHTML = `
    <header class="section-header">
      <div class="header-title-wrapper">
        <div class="title-accent"></div>
        <h2>New Games</h2>
      </div>
      <div class="header-nav-buttons">
        <button type="button" class="btn-prev" aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <button type="button" class="btn-next" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </header>
    <div class="carousel-container">
      ${cardsHtml}
    </div>
  `;

  setTimeout(() => {
    const carousel = section.querySelector('.carousel-container');
    if (carousel) {
      carousel.scrollLeft = 144;
    }
  }, 0);

  const gameCards = section.querySelectorAll('.game-card');
  for (const card of gameCards) {
    card.addEventListener('click', () => {
      GameDetailsDialog.open();
    });
  }

  return section;
}
