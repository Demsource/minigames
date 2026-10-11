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
  const imageSource = `/minigames${game.cardImage}`;

  // Static markup only; API values are set below as text or properties
  card.innerHTML = `
    <div class="card-image">
      <img />
    </div>
    <div class="card-content">
      <div class="card-header">
        <h3 class="game-name"></h3>
        <span class="game-category"></span>
        <span class="game-price"></span>
      </div>
      <p class="game-description"></p>
      <div class="card-footer">
        <div class="game-stats">
          <div class="stat-item">
            <img src="${starIcon}" alt="" class="stat-icon" />
            <span class="game-rating"></span>
          </div>
          <div class="stat-item">
            <img src="${heartIcon}" alt="" class="stat-icon" />
            <span class="game-likes"></span>
          </div>
        </div>
        <button class="btn-details">Details</button>
      </div>
    </div>
  `;

  const image = card.querySelector<HTMLImageElement>(':scope .card-image img');
  if (image) {
    image.src = imageSource;
    image.alt = game.name;
  }
  setText(card, '.game-name', game.name);
  setText(card, '.game-category', game.category);
  setText(card, '.game-price', game.price);
  setText(card, '.game-description', game.shortDescription);
  setText(card, '.game-rating', String(game.rating));
  setText(card, '.game-likes', formattedLikes);

  return card;
}

function setText(root: ParentNode, selector: string, value: string) {
  const element = root.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function formatLikesCount(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return count >= 1000
    ? (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    : count.toString();
}
