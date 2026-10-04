import './game-details-dialog.scss';
import '../../components/skeletons/skeleton-loader-game-details-dialog.scss';
import '../../components/skeletons/skeleton-loader-comments.scss';
import closeButtonIcon from '../../assets/icons/close-button-wrapper.svg';
import starIcon from '../../assets/icons/star.svg';
import heartIcon from '../../assets/icons/heart.svg';
import heartBlackIcon from '../../assets/icons/heart-black.svg';
import sendCommentIconDefault from '../../assets/icons/send-comment-trigger-default.svg';
import sendCommentIconDisabled from '../../assets/icons/send-comment-trigger-disabled.svg';
import sendCommentIconHover from '../../assets/icons/send-comment-trigger-hover.svg';
import commentsData from '../../data/comments-tukoni-forest-keepers.json';
import { apiCall, GameDetails, GameDetailsResponse } from '../../services/api';
import { SkeletonGameDetailsDialog } from '../../components/skeletons/skeleton-loader-game-details-dialog';
import { SkeletonCommentsSection } from '../../components/skeletons/skeleton-loader-comments';
import { ErrorBanner } from '../../components/error-banner/error-banner';
import { EmptyState } from '../../components/empty-state/empty-state';

class GameDetailsDialogClass {
  private backdrop!: HTMLElement;
  private dialog!: HTMLElement;
  private gameInfoContainer!: HTMLElement;
  private topRecordsContainer!: HTMLElement;
  private isLiked: boolean = false;
  private currentGameSlug: string = '';
  private currentGameData: GameDetails | undefined;

  constructor() {
    this.createDOM();
    this.attachEvents();
  }

  private getAssetPath(assetPath: string): string {
    return assetPath.startsWith('/') ? `/minigames${assetPath}` : assetPath;
  }

  private createDOM() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'game-details-backdrop';

    this.dialog = document.createElement('div');
    this.dialog.className = 'game-details-dialog';

    this.dialog.innerHTML = `
      <div class="dialog-header">
        <button type="button" class="close-button" aria-label="Close dialog">
          <img src="${closeButtonIcon}" alt="Close" />
        </button>
      </div>
      <div class="dialog-image"></div>
      <div class="game-info"></div>
      <div class="top-records-section"></div>
      <div class="comments-section">
        <div class="comments-header">
          <h2 class="comments-title">Comments</h2>
        </div>
        <div class="comment-form">
          <div class="comment-form-avatar">U</div>
          <textarea
            class="comment-textarea"
            name="comment"
            placeholder="Write a comment..."
            rows="1"
          ></textarea>
          <button type="button" class="comment-submit-btn" aria-label="Submit comment">
            <img src="${sendCommentIconDisabled}" alt="Submit" class="submit-icon" />
          </button>
        </div>
        <div class="comments-list"></div>
      </div>
    `;

    this.gameInfoContainer = this.dialog.querySelector(
      '.game-info'
    ) as HTMLElement;
    this.topRecordsContainer = this.dialog.querySelector(
      '.top-records-section'
    ) as HTMLElement;

    this.backdrop.append(this.dialog);
    document.body.append(this.backdrop);
  }

  private renderGameContent(gameData: GameDetails) {
    this.currentGameData = gameData;
    this.isLiked = gameData.isLikedByCurrentUser;

    const isMissingData = !gameData || Object.keys(gameData).length === 0;

    if (isMissingData) {
      this.gameInfoContainer.replaceChildren(
        EmptyState({
          title: 'Game Data Unavailable',
          message:
            'This game information is currently unavailable. Please try again later.',
          isDismissible: false,
        })
      );

      this.topRecordsContainer.replaceChildren();

      const commentsSection = this.dialog.querySelector(
        '.comments-section'
      ) as HTMLElement;
      commentsSection.replaceChildren();

      return;
    }

    const dialogImage = this.dialog.querySelector(
      '.dialog-image'
    ) as HTMLElement;
    const imagePath = this.getAssetPath(gameData.heroImage);
    dialogImage.innerHTML = `<img src="${imagePath}" alt="${gameData.name}" />`;

    const formattedLikes = this.formatLikesCount(gameData.likesCount);

    this.gameInfoContainer.innerHTML = `
      <div class="game-header">
        <h1 class="game-title">${gameData.name}</h1>
        <div class="game-meta">
          <div class="rating">
            <img src="${starIcon}" alt="" class="meta-icon" />
            <span>${gameData.rating}</span>
          </div>
          <div class="likes">
            <img src="${heartIcon}" alt="" class="meta-icon" />
            <span>${formattedLikes}</span>
          </div>
        </div>
      </div>

      <p class="game-description">${gameData.fullDescription}</p>

      <div class="game-specs">
        <div class="spec-badge">
          <div class="spec-label">Genre</div>
          <div class="spec-value">${gameData.specs.genre}</div>
        </div>
        <div class="spec-badge">
          <div class="spec-label">Players</div>
          <div class="spec-value">${gameData.specs.players}</div>
        </div>
        <div class="spec-badge">
          <div class="spec-label">Duration</div>
          <div class="spec-value">${gameData.specs.duration}</div>
        </div>
        <div class="spec-badge">
          <div class="spec-label">Price</div>
          <div class="spec-value">${gameData.specs.price}</div>
        </div>
      </div>

      <div class="game-actions">
        <button type="button" class="btn-play-now">Play Now</button>
        <button type="button" class="btn-favorite ${this.isLiked ? 'is-favorited' : ''}">
          <img src="${heartBlackIcon}" alt="" class="btn-heart-icon" />
          <span class="btn-text">${this.isLiked ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        </button>
      </div>
    `;

    this.topRecordsContainer.innerHTML = `
      <div class="top-records-header">
        <h2 class="top-records-title">🏆 Top Records</h2>
      </div>
      <div class="top-records-list">
        ${gameData.topRecords
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
    `;

    const commentsSection = this.dialog.querySelector(
      '.comments-section'
    ) as HTMLElement;
    commentsSection.innerHTML = `
      <div class="comments-header">
        <h2 class="comments-title">Comments (${commentsData.data.length})</h2>
      </div>

      <div class="comment-form">
        <div class="comment-form-avatar">U</div>
        <textarea
          class="comment-textarea"
          name="comment"
          placeholder="Write a comment..."
          rows="1"
        ></textarea>
        <button type="button" class="comment-submit-btn" aria-label="Submit comment">
          <img src="${sendCommentIconDisabled}" alt="Submit" class="submit-icon" />
        </button>
      </div>

      <div class="comments-list">
        ${commentsData.data
          .map((comment) => {
            const timeAgo = this.calculateTimeAgo(comment.createdAt);
            const initial = comment.authorName.charAt(0).toUpperCase();
            return `
              <div class="comment-item">
                <div class="comment-avatar">${initial}</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">${comment.authorName}</span>
                    <span class="comment-time">${timeAgo}</span>
                  </div>
                  <p class="comment-text">${comment.text}</p>
                  <button class="comment-like-btn ${comment.isLikedByCurrentUser ? 'is-liked' : ''}" data-comment-id="${comment.commentId}">
                    <img src="${heartBlackIcon}" alt="" class="like-icon" />
                    <span class="like-count">${comment.likesCount}</span>
                  </button>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
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

    const textarea =
      this.dialog.querySelector<HTMLTextAreaElement>('.comment-textarea');
    const submitButton = this.dialog.querySelector<HTMLButtonElement>(
      '.comment-submit-btn'
    );
    const submitIcon =
      submitButton?.querySelector<HTMLImageElement>('.submit-icon');

    if (textarea && submitButton && submitIcon) {
      textarea.addEventListener('input', (event) => {
        this.autoGrowTextarea(event.target as HTMLTextAreaElement);
        const hasText = textarea.value.trim().length > 0;
        submitIcon.src = hasText
          ? sendCommentIconDefault
          : sendCommentIconDisabled;
      });

      submitButton.addEventListener('mouseenter', () => {
        if (textarea.value.trim().length > 0) {
          submitIcon.src = sendCommentIconHover;
        }
      });

      submitButton.addEventListener('mouseleave', () => {
        const hasText = textarea.value.trim().length > 0;
        submitIcon.src = hasText
          ? sendCommentIconDefault
          : sendCommentIconDisabled;
      });
    }

    const commentLikeButtons =
      this.dialog.querySelectorAll<HTMLButtonElement>('.comment-like-btn');
    for (const button of commentLikeButtons) {
      button.addEventListener('click', () => {
        this.toggleCommentLike(button);
      });
    }

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

  private autoGrowTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 88);
    textarea.style.height = `${newHeight}px`;
  }

  private toggleCommentLike(button: HTMLButtonElement) {
    button.classList.toggle('is-liked');
    const likeCount = button.querySelector<HTMLSpanElement>('.like-count');
    if (!likeCount) {
      return;
    }

    const currentCount = Number(likeCount.textContent || '0');
    const isLiked = button.classList.contains('is-liked');
    likeCount.textContent = isLiked
      ? (currentCount + 1).toString()
      : (currentCount - 1).toString();
  }

  private calculateTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'just now';
    }

    if (diffMinutes < 60) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }

    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
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
    if (!this.currentGameData) {
      return;
    }

    this.isLiked = this.currentGameData.isLikedByCurrentUser;
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

  private resetCommentState() {
    const textarea =
      this.dialog.querySelector<HTMLTextAreaElement>('.comment-textarea');
    const submitIcon = this.dialog.querySelector<HTMLImageElement>(
      ':scope .comment-submit-btn .submit-icon'
    );
    const commentLikeButtons =
      this.dialog.querySelectorAll<HTMLButtonElement>('.comment-like-btn');

    if (textarea) {
      textarea.value = '';
      textarea.style.height = 'auto';
    }

    if (submitIcon) {
      submitIcon.src = sendCommentIconDisabled;
    }

    for (const button of commentLikeButtons) {
      const likeCount = button.querySelector<HTMLSpanElement>('.like-count');
      const commentId = button.dataset.commentId;
      const commentData = commentsData.data.find(
        (c) => c.commentId === commentId
      );

      button.classList.remove('is-liked');
      if (likeCount && commentData) {
        likeCount.textContent = commentData.likesCount.toString();
      }
    }
  }

  private attachGameActionEvents() {
    const favoriteButton =
      this.dialog.querySelector<HTMLButtonElement>('.btn-favorite');

    favoriteButton?.addEventListener('click', () => {
      this.toggleFavorite(favoriteButton);
    });

    const commentLikeButtons =
      this.dialog.querySelectorAll<HTMLButtonElement>('.comment-like-btn');
    for (const button of commentLikeButtons) {
      button.addEventListener('click', () => {
        this.toggleCommentLike(button);
      });
    }
  }

  private showSkeleton() {
    const dialogImage = this.dialog.querySelector(
      '.dialog-image'
    ) as HTMLElement;
    const gameInfoContainer = this.dialog.querySelector(
      '.game-info'
    ) as HTMLElement;
    const topRecordsContainer = this.dialog.querySelector(
      '.top-records-section'
    ) as HTMLElement;
    const commentsSection = this.dialog.querySelector(
      '.comments-section'
    ) as HTMLElement;

    const skeletonElement = SkeletonGameDetailsDialog();
    const skeletonCommentsElement = SkeletonCommentsSection();

    const skeletonImage =
      skeletonElement.querySelector('.skeleton-dialog-image')?.outerHTML || '';
    const skeletonGameInfo =
      skeletonElement.querySelector('.skeleton-game-info')?.getHTML() || '';
    const skeletonTopRecords =
      skeletonElement.querySelector('.skeleton-top-records')?.getHTML() || '';
    const skeletonCommentsContent = skeletonCommentsElement.getHTML() || '';

    dialogImage.innerHTML = skeletonImage;
    gameInfoContainer.innerHTML = skeletonGameInfo;
    topRecordsContainer.innerHTML = skeletonTopRecords;
    commentsSection.innerHTML = skeletonCommentsContent;
  }

  private showError() {
    const gameInfoContainer = this.dialog.querySelector(
      '.game-info'
    ) as HTMLElement;
    const topRecordsContainer = this.dialog.querySelector(
      '.top-records-section'
    ) as HTMLElement;
    const commentsSection = this.dialog.querySelector(
      '.comments-section'
    ) as HTMLElement;

    gameInfoContainer.replaceChildren();
    topRecordsContainer.replaceChildren();
    commentsSection.replaceChildren();

    const errorBanner = ErrorBanner({
      message: 'Failed to load game details. Please try again.',
      onRetry: async () => {
        this.showSkeleton();
        await this.loadGameData();
      },
      isDismissible: true,
    });

    gameInfoContainer.append(errorBanner);
  }

  private async loadGameData() {
    try {
      const response = await apiCall<GameDetailsResponse>(
        `/api/games/${this.currentGameSlug}`
      );
      this.renderGameContent(response.data);

      try {
        this.attachGameActionEvents();
      } catch (error) {
        console.error('Error attaching game action events:', error);
      }

      try {
        this.resetFavoriteState();
      } catch (error) {
        console.error('Error resetting favorite state:', error);
      }

      try {
        this.resetCommentState();
      } catch (error) {
        console.error('Error resetting comment state:', error);
      }
    } catch (error) {
      console.error('Failed to load game details:', error);
      this.showError();
    }
  }

  public setGameSlug(slug: string) {
    this.currentGameSlug = slug;
  }

  public async open() {
    if (!this.currentGameSlug) {
      console.error('Game slug not set');
      return;
    }

    this.backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    this.showSkeleton();

    await this.loadGameData();
  }

  public close() {
    this.backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

export const GameDetailsDialog = new GameDetailsDialogClass();
