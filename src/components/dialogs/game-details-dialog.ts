import './game-details-dialog.scss';
import closeButtonIcon from '../../assets/icons/close-button-wrapper.svg';
import starIcon from '../../assets/icons/star.svg';
import heartIcon from '../../assets/icons/heart.svg';
import heartBlackIcon from '../../assets/icons/heart-black.svg';
import gameData from '../../data/game-tukoni-forest-keepers.json';

class GameDetailsDialogClass {
  private backdrop!: HTMLElement;
  private dialog!: HTMLElement;
  private isLiked: boolean;

  constructor() {
    this.isLiked = gameData.data.isLikedByCurrentUser;
    this.createDOM();
    this.attachEvents();
  }

  private createDOM() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'game-details-backdrop';

    this.dialog = document.createElement('div');
    this.dialog.className = 'game-details-dialog';

    const formattedLikes = this.formatLikesCount(gameData.data.likesCount);

    this.dialog.innerHTML = `
      <div class="dialog-header">
        <button type="button" class="close-button" aria-label="Close dialog">
          <img src="${closeButtonIcon}" alt="Close" />
        </button>
      </div>
      <div class="dialog-image">
        <img src="${gameData.data.heroImage}" alt="${gameData.data.name}" />
      </div>
      <div class="game-info">
        <div class="game-header">
          <h1 class="game-title">${gameData.data.name}</h1>
          <div class="game-meta">
            <div class="rating">
              <img src="${starIcon}" alt="" class="meta-icon" />
              <span>${gameData.data.rating}</span>
            </div>
            <div class="likes">
              <img src="${heartIcon}" alt="" class="meta-icon" />
              <span>${formattedLikes}</span>
            </div>
          </div>
        </div>

        <p class="game-description">${gameData.data.fullDescription}</p>

        <div class="game-specs">
          <div class="spec-badge">
            <div class="spec-label">Genre</div>
            <div class="spec-value">${gameData.data.specs.genre}</div>
          </div>
          <div class="spec-badge">
            <div class="spec-label">Players</div>
            <div class="spec-value">${gameData.data.specs.players}</div>
          </div>
          <div class="spec-badge">
            <div class="spec-label">Duration</div>
            <div class="spec-value">${gameData.data.specs.duration}</div>
          </div>
          <div class="spec-badge">
            <div class="spec-label">Price</div>
            <div class="spec-value">${gameData.data.specs.price}</div>
          </div>
        </div>

        <div class="game-actions">
          <button type="button" class="btn-play-now">Play Now</button>
          <button type="button" class="btn-favorite ${this.isLiked ? 'is-favorited' : ''}">
            <img src="${heartBlackIcon}" alt="" class="btn-heart-icon" />
            <span class="btn-text">${this.isLiked ? 'Remove from Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>

      <div class="top-records-section">
        <div class="top-records-header">
          <h2 class="top-records-title">🏆 Top Records</h2>
        </div>
        <div class="top-records-list">
          ${gameData.data.topRecords
            .map((record) => {
              const medalEmoji = this.getMedalEmoji(record.position);
              const formattedScore = this.formatScore(record.score);
              const daysAgo = this.calculateDaysAgo(record.achievedAt);
              return `
                <div class="top-record-item">
                  <span class="medal">${medalEmoji}</span>
                  <span class="player-name">${record.playerName}</span>
                  <span class="record-score">${formattedScore}</span>
                  <span class="record-date">${daysAgo}</span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;

    this.backdrop.append(this.dialog);
    document.body.append(this.backdrop);
  }

  private attachEvents() {
    const closeButton =
      this.dialog.querySelector<HTMLButtonElement>('.close-button');

    closeButton?.addEventListener('click', () => {
      this.close();
    });

    const favoriteButton =
      this.dialog.querySelector<HTMLButtonElement>('.btn-favorite');

    favoriteButton?.addEventListener('click', () => {
      this.toggleFavorite(favoriteButton);
    });

    this.backdrop.addEventListener('click', (event) => {
      if (event.target === this.backdrop) {
        this.close();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        this.backdrop.classList.contains('is-open')
      ) {
        this.close();
      }
    });
  }

  private toggleFavorite(button: HTMLButtonElement) {
    this.isLiked = !this.isLiked;
    button.classList.toggle('is-favorited');
    const textSpan = button.querySelector('.btn-text');
    if (textSpan) {
      textSpan.textContent = this.isLiked
        ? 'Remove from Favorites'
        : 'Add to Favorites';
    }
  }

  private formatLikesCount(count: number): string {
    if (count >= 1_000_000) {
      return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    return count >= 1000
      ? (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
      : count.toString();
  }

  private getMedalEmoji(position: number): string {
    switch (position) {
      case 1: {
        return '🥇';
      }
      case 2: {
        return '🥈';
      }
      case 3: {
        return '🥉';
      }
      default: {
        return '';
      }
    }
  }

  private formatScore(score: number): string {
    return score.toLocaleString('en-US') + ' pts';
  }

  private calculateDaysAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return '1 day ago';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  private resetFavoriteState() {
    this.isLiked = gameData.data.isLikedByCurrentUser;
    const favoriteButton =
      this.dialog.querySelector<HTMLButtonElement>('.btn-favorite');

    if (!favoriteButton) {
      return;
    }

    favoriteButton.classList.toggle('is-favorited', this.isLiked);
    const textSpan = favoriteButton.querySelector('.btn-text');
    if (textSpan) {
      textSpan.textContent = this.isLiked
        ? 'Remove from Favorites'
        : 'Add to Favorites';
    }
  }

  public open() {
    this.resetFavoriteState();
    this.backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  public close() {
    this.backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

export const GameDetailsDialog = new GameDetailsDialogClass();
