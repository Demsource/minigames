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
import {
  apiCall,
  ApiError,
  getGameDetails,
  toggleGameFavorite,
  GameDetails,
  Comment,
  CommentsResponse,
} from '../../services/api';
import { SkeletonGameDetailsDialog } from '../../components/skeletons/skeleton-loader-game-details-dialog';
import { SkeletonCommentsSection } from '../../components/skeletons/skeleton-loader-comments';
import { ErrorBanner } from '../../components/error-banner/error-banner';
import { EmptyState } from '../../components/empty-state/empty-state';
import { router } from '../../app/router';
import { showSnackbar } from '../snackbar/snackbar';
import { canPerformProtectedAction } from '../../services/session-guard';
import { getSession, subscribeSession } from '../../services/session-state';

const FAVORITES_LOGIN_REQUIRED_MESSAGE =
  'Please log in to add games to your favorites.';

function getFavoriteErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    // Network failure or timeout: the outcome is unknown, so don't retry
    return "Couldn't confirm the favorite change. Please check and try again.";
  }
  switch (error.status) {
    case 401: {
      return 'Please log in to manage your favorites.';
    }
    case 404: {
      return 'This game could not be found.';
    }
    case 429: {
      return error.message;
    }
    default: {
      return "Couldn't update favorites. Please try again.";
    }
  }
}

class GameDetailsDialogClass {
  private backdrop!: HTMLElement;
  private dialog!: HTMLElement;
  private gameInfoContainer!: HTMLElement;
  private topRecordsContainer!: HTMLElement;
  private isLiked: boolean = false;
  private currentGameSlug: string = '';
  private currentGameData: GameDetails | undefined;
  private currentCommentsData: Comment[] = [];
  private totalCommentsCount: number = 0;
  private commentsLoadFailed: boolean = false;
  // True when the history entry below is the page without the dialog
  private canCloseWithBack: boolean = false;
  private hasSeenUrlWithoutGame: boolean = false;
  // Hidden behind the Auth dialog with its content and state preserved
  private isSuspended: boolean = false;
  // A favorite POST is in flight; further clicks are ignored
  private isFavoritePending: boolean = false;

  constructor() {
    this.createDOM();
    this.attachEvents();
    // Sign-in: load the user's favorite state. Logout or expiry: switch any
    // open Game Details to its Guest state.
    subscribeSession(() => this.syncFavoriteWithSession());
    // Auth dialog wins when both `auth` and `game` are in the URL; an open
    // Game Details is suspended rather than closed so it can be restored
    router.subscribe(({ query }) => {
      const authMode = query.get('auth');
      const gameSlug = query.get('game') ?? undefined;
      if (authMode && gameSlug) {
        this.suspend();
        return;
      }
      this.syncWithUrl(gameSlug);
    });
  }

  private isOpen(): boolean {
    return this.backdrop.classList.contains('is-open');
  }

  // Hides the dialog so only Auth is active, keeping its state for resume
  private suspend() {
    if (!this.isOpen()) {
      return;
    }
    this.isSuspended = true;
    this.backdrop.classList.remove('is-open');
  }

  // The `game` query param is the source of truth for the dialog
  private syncWithUrl(slug: string | undefined) {
    if (this.isSuspended) {
      this.isSuspended = false;
      if (slug === this.currentGameSlug) {
        this.backdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        return;
      }
    }

    if (slug) {
      if (!this.isOpen() || slug !== this.currentGameSlug) {
        // A deep link has no dialog-less entry below it to go back to
        this.canCloseWithBack = this.hasSeenUrlWithoutGame;
        this.setGameSlug(slug);
        this.open();
      }
    } else {
      this.hasSeenUrlWithoutGame = true;
      if (this.isOpen()) {
        this.close();
      }
    }
  }

  private requestClose() {
    if (!this.isOpen()) {
      return;
    }

    if (this.canCloseWithBack) {
      globalThis.history.back();
    } else {
      router.setQuery({ game: undefined }, { replace: true });
    }
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
            <span class="likes-count">${formattedLikes}</span>
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

    if (this.commentsLoadFailed) {
      commentsSection.innerHTML = `
        <div class="comments-header">
          <h2 class="comments-title">Comments</h2>
        </div>
      `;
      const errorBanner = ErrorBanner({
        message: 'Failed to load comments. Please try again.',
        onRetry: async () => {
          await this.loadComments();
          this.renderGameContent(this.currentGameData!);
        },
        isDismissible: true,
      });
      commentsSection.append(errorBanner);
      return;
    }

    commentsSection.innerHTML = `
      <div class="comments-header">
        <h2 class="comments-title">Comments (${this.totalCommentsCount})</h2>
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
        ${
          this.currentCommentsData.length === 0
            ? EmptyState({
                title: 'No comments yet',
                message: 'Be the first to share your thoughts about this game!',
                isDismissible: false,
              }).outerHTML
            : this.currentCommentsData
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
                .join('')
        }
      </div>
    `;
  }

  private attachEvents() {
    const closeButton =
      this.dialog.querySelector<HTMLButtonElement>('.close-button');

    closeButton?.addEventListener('click', () => {
      this.requestClose();
    });

    const favoriteButton =
      this.dialog.querySelector<HTMLButtonElement>('.btn-favorite');

    favoriteButton?.addEventListener('click', () => {
      void this.toggleFavorite();
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
        this.requestClose();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) {
        this.requestClose();
      }
    });
  }

  private autoGrowTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 88);
    textarea.style.height = `${newHeight}px`;
  }

  private toggleCommentLike(button: HTMLButtonElement) {
    if (!canPerformProtectedAction()) {
      return;
    }

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
      return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
  }

  // One POST flips the favorite; the UI changes only from the server's
  // response. Never retried: a second POST could undo the first.
  private async toggleFavorite() {
    if (this.isFavoritePending) {
      return;
    }

    const wasGuest = !getSession();
    if (!canPerformProtectedAction()) {
      // Expiry shows its own Snackbar; a guest gets the warning
      if (wasGuest) {
        showSnackbar(FAVORITES_LOGIN_REQUIRED_MESSAGE);
      }
      return;
    }

    const slug = this.currentGameSlug;
    const email = getSession()?.email;
    if (!email) {
      return;
    }

    this.isFavoritePending = true;
    try {
      const { data } = await toggleGameFavorite(slug, email);
      // Game or user changed meanwhile: this result is not for this view
      if (slug !== this.currentGameSlug || getSession()?.email !== email) {
        return;
      }
      if (this.currentGameData) {
        this.currentGameData.isLikedByCurrentUser = data.isFavorited;
        this.currentGameData.likesCount = data.likesCount;
      }
      this.setFavoriteView(data.isFavorited);
      this.setLikesCount(data.likesCount);
    } catch (error) {
      showSnackbar(getFavoriteErrorMessage(error));
    } finally {
      this.isFavoritePending = false;
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

    this.setFavoriteView(this.currentGameData.isLikedByCurrentUser);
  }

  private syncFavoriteWithSession() {
    if (getSession()) {
      void this.refreshFavoriteState();
    } else {
      this.resetToGuestState();
    }
  }

  // Re-requests the personalized details for the loaded game (e.g. after
  // signing in through the Auth handoff) and applies the server's state
  private async refreshFavoriteState() {
    const slug = this.currentGameSlug;
    const email = getSession()?.email;
    if (!email || !this.currentGameData) {
      return;
    }

    try {
      const { data } = await getGameDetails(slug, email);
      // Ignore if the game or the session changed while waiting
      if (slug !== this.currentGameSlug || getSession()?.email !== email) {
        return;
      }
      this.currentGameData = data;
      this.setFavoriteView(data.isLikedByCurrentUser);
      this.setLikesCount(data.likesCount);
    } catch {
      // Keep the current view; the next open loads fresh state
    }
  }

  private setLikesCount(count: number) {
    const likesCount =
      this.gameInfoContainer.querySelector<HTMLElement>('.likes-count');
    if (likesCount) {
      likesCount.textContent = this.formatLikesCount(count);
    }
  }

  // Guest Mode after logout or expiry: drop user-specific favorite and
  // like state but keep the public content (and any comment draft) open
  private resetToGuestState() {
    this.setFavoriteView(false);
    this.resetCommentLikes();
  }

  private setFavoriteView(isFavorited: boolean) {
    this.isLiked = isFavorited;
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

    if (textarea) {
      textarea.value = '';
      textarea.style.height = 'auto';
    }

    if (submitIcon) {
      submitIcon.src = sendCommentIconDisabled;
    }

    this.resetCommentLikes();
  }

  // Un-likes every comment and restores the loaded like counts
  private resetCommentLikes() {
    const commentLikeButtons =
      this.dialog.querySelectorAll<HTMLButtonElement>('.comment-like-btn');

    for (const button of commentLikeButtons) {
      const likeCount = button.querySelector<HTMLSpanElement>('.like-count');
      const commentId = button.dataset.commentId;
      const commentData = this.currentCommentsData.find(
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
      void this.toggleFavorite();
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

  private async loadComments() {
    try {
      const response = await apiCall<CommentsResponse>(
        `/api/games/${this.currentGameSlug}/comments?limit=3&sort=newest`
      );
      this.currentCommentsData = response.data;
      this.totalCommentsCount = response.meta.totalComments;
      this.commentsLoadFailed = false;
    } catch (error) {
      console.error('Failed to load comments:', error);
      this.currentCommentsData = [];
      this.totalCommentsCount = 0;
      this.commentsLoadFailed = true;
    }
  }

  private async loadGameData() {
    const slug = this.currentGameSlug;
    const email = getSession()?.email;

    try {
      // Personalized for signed-in users: isLikedByCurrentUser is theirs
      const [gameResponse] = await Promise.all([
        getGameDetails(slug, email),
        this.loadComments(),
      ]);
      // Another game was opened while this one was loading
      if (slug !== this.currentGameSlug) {
        return;
      }
      this.renderGameContent(gameResponse.data);

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

      // Signed in or out while loading: the personal state is outdated
      if (getSession()?.email !== email) {
        this.syncFavoriteWithSession();
      }
    } catch (error) {
      console.error('Failed to load game details:', error);
      this.showError();
    }
  }

  // Opens the dialog by pushing `?game=<slug>`; the URL listener does the rest
  public show(slug: string) {
    router.setQuery({ game: slug });
  }

  public setGameSlug(slug: string) {
    this.currentGameSlug = slug;
  }

  public async open() {
    if (!this.currentGameSlug) {
      console.error('Game slug not set');
      return;
    }

    this.commentsLoadFailed = false;
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
