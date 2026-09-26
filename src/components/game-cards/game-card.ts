import './game-card.scss';
import starIcon from '../../assets/icons/star.svg';
import heartIcon from '../../assets/icons/heart.svg';

interface GameCardData {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}

export function GameCard(game: GameCardData): HTMLElement {
  const card = document.createElement('div');
  card.className = 'game-card';

  const formattedLikes = formatLikesCount(game.likesCount);

  card.innerHTML = `
    <div class="card-image">
      <img src="${game.cardImage}" alt="${game.name}" />
    </div>
    <div class="card-content">
      <div class="card-header">
        <h3 class="game-name">${game.name}</h3>
        <span class="game-category">${game.category}</span>
        <span class="game-price">${game.price}</span>
      </div>
      <p class="game-description">${game.shortDescription}</p>
      <div class="card-footer">
        <div class="game-stats">
          <div class="stat-item">
            <img src="${starIcon}" alt="" class="stat-icon" />
            <span>${game.rating}</span>
          </div>
          <div class="stat-item">
            <img src="${heartIcon}" alt="" class="stat-icon" />
            <span>${formattedLikes}</span>
          </div>
        </div>
        <button class="btn-details">Details</button>
      </div>
    </div>
  `;

  return card;
}

function formatLikesCount(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return count >= 1000
    ? (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    : count.toString();
}
