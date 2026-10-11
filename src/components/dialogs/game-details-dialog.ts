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
  ApiError,
  getComments,
  getGameDetails,
  postComment,
  toggleGameFavorite,
  GameDetails,
  Comment,
  TopRecord,
} from '../../services/api';
import { SkeletonGameDetailsDialog } from '../../components/skeletons/skeleton-loader-game-details-dialog';
import { SkeletonCommentsSection } from '../../components/skeletons/skeleton-loader-comments';
import { ErrorBanner } from '../../components/error-banner/error-banner';
import { EmptyState } from '../../components/empty-state/empty-state';
import { router } from '../../app/router';
import { showSnackbar } from '../snackbar/snackbar';
import { getInitials, getProfileName } from '../../utils/profile';
import { canPerformProtectedAction } from '../../services/session-guard';
import { getSession, subscribeSession } from '../../services/session-state';

// Sets API-provided values as plain text, never parsed as HTML
function setText(root: ParentNode, selector: string, value: string) {
  const element = root.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

const COMMENT_MAX_LENGTH = 500;
const AUTHOR_NAME_MIN_LENGTH = 2;
const AUTHOR_NAME_MAX_LENGTH = 30;

const COMMENT_UNKNOWN_OUTCOME_MESSAGE =
  "We couldn't confirm your comment was posted. Check the comments before trying again.";

// 4xx: the server definitively rejected it, so no comment exists and a
// retry is safe. Network failures, timeouts and 5xx: the comment may or
// may not exist, so the user is told the result is unknown.
function isUnknownOutcome(error: unknown): boolean {
  return !(error instanceof ApiError) || error.status >= 500;
}

function getCommentErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError) || isUnknownOutcome(error)) {
    return COMMENT_UNKNOWN_OUTCOME_MESSAGE;
  }
  switch (error.status) {
    case 401: {
      return 'Please log in to post a comment.';
    }
    case 404: {
      return 'This game could not be found.';
    }
    case 400:
    case 429: {
      // e.g. validation details or "Rate limit exceeded. Try again in 42 seconds"
      return error.message;
    }
    default: {
      return "Your comment wasn't posted. Please try again.";
    }
  }
}

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
  // Slug of the game whose favorite POST is in flight; that game's button
  // stays locked until it settles, other games are unaffected
  private favoritePendingSlug: string | undefined;
  // Slug of the game whose comment POST is in flight; its form stays locked
  private commentPendingSlug: string | undefined;

  constructor() {
    this.createDOM();
    this.attachEvents();
    // Sign-in: load the user's favorite state. Logout or expiry: switch any
    // open Game Details to its Guest state.
    subscribeSession(() => {
      this.syncFavoriteWithSession();
      this.updateCommentFormAccess();
    });
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
          <div class="comment-form-avatar" aria-hidden="true"></div>
          <textarea
            class="comment-textarea"
            name="comment"
            placeholder="Write a comment..."
            rows="1" maxlength="500"
          ></textarea>
          <button type="button" class="comment-submit-btn" aria-label="Submit comment" disabled>
            <img src="${sendCommentIconDisabled}" alt="" class="submit-icon" />
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
    // Static markup only; every API value is set below as text or as an
    // element property, never parsed as HTML
    const heroImage = document.createElement('img');
    heroImage.src = this.getAssetPath(gameData.heroImage);
    heroImage.alt = gameData.name;
    dialogImage.replaceChildren(heroImage);

    this.gameInfoContainer.innerHTML = `
      <div class="game-header">
        <h1 class="game-title"></h1>
        <div class="game-meta">
          <div class="rating">
            <img src="${starIcon}" alt="" class="meta-icon" />
            <span class="rating-value"></span>
          </div>
          <div class="likes">
            <img src="${heartIcon}" alt="" class="meta-icon" />
            <span class="likes-count"></span>
          </div>
        </div>
      </div>

      <p class="game-description"></p>

      <div class="game-specs">
        <div class="spec-badge">
          <div class="spec-label">Genre</div>
          <div class="spec-value" data-spec="genre"></div>
        </div>
        <div class="spec-badge">
          <div class="spec-label">Players</div>
          <div class="spec-value" data-spec="players"></div>
        </div>
        <div class="spec-badge">
          <div class="spec-label">Duration</div>
          <div class="spec-value" data-spec="duration"></div>
        </div>
        <div class="spec-badge">
          <div class="spec-label">Price</div>
          <div class="spec-value" data-spec="price"></div>
        </div>
      </div>

      <div class="game-actions">
        <button type="button" class="btn-play-now">Play Now</button>
        <button type="button" class="btn-favorite">
          <img src="${heartBlackIcon}" alt="" class="btn-heart-icon" />
          <span class="btn-text"></span>
        </button>
      </div>
    `;

    const info = this.gameInfoContainer;
    setText(info, '.game-title', gameData.name);
    setText(info, '.rating-value', String(gameData.rating));
    setText(info, '.game-description', gameData.fullDescription);
    for (const key of ['genre', 'players', 'duration', 'price'] as const) {
      setText(info, `[data-spec="${key}"]`, gameData.specs[key]);
    }
    this.setLikesCount(gameData.likesCount);
    this.updateFavoriteButton();

    this.topRecordsContainer.innerHTML = `
      <div class="top-records-header">
        <h2 class="top-records-title">🏆 Top Records</h2>
      </div>
      <div class="top-records-list"></div>
    `;
    this.topRecordsContainer
      .querySelector('.top-records-list')
      ?.replaceChildren(
        ...gameData.topRecords.map((record) => this.createTopRecordItem(record))
      );

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
          // Re-render replaced the buttons: re-bind and restore their state
          this.attachGameActionEvents();
          this.updateFavoriteButton();
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
        <div class="comment-form-avatar" aria-hidden="true"></div>
        <textarea
          class="comment-textarea"
          name="comment"
          placeholder="Write a comment..."
          rows="1" maxlength="500"
        ></textarea>
        <button type="button" class="comment-submit-btn" aria-label="Submit comment" disabled>
          <img src="${sendCommentIconDisabled}" alt="" class="submit-icon" />
        </button>
      </div>

      <div class="comments-list"></div>
    `;

    this.renderCommentsList();
  }

  private createTopRecordItem(record: TopRecord): HTMLElement {
    const item = document.createElement('div');
    item.className = 'top-record-item';

    const fields: [string, string][] = [
      ['medal', this.getMedalEmoji(record.position)],
      ['player-name', record.playerName],
      ['record-score', this.formatScore(record.score)],
      ['record-date', this.calculateDaysAgo(record.achievedAt)],
    ];
    for (const [className, value] of fields) {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = value;
      item.append(span);
    }
    return item;
  }

  private renderCommentsList() {
    const commentsList =
      this.dialog.querySelector<HTMLElement>('.comments-list');
    if (!commentsList) {
      return;
    }

    if (this.currentCommentsData.length === 0) {
      commentsList.replaceChildren(
        EmptyState({
          title: 'No comments yet',
          message: 'Be the first to share your thoughts about this game!',
          isDismissible: false,
        })
      );
      return;
    }

    commentsList.replaceChildren(
      ...this.currentCommentsData.map((comment) =>
        this.createCommentItem(comment)
      )
    );
  }

  // Built with textContent: API values are rendered as text, never as HTML
  private createCommentItem(comment: Comment): HTMLElement {
    const item = document.createElement('div');
    item.className = 'comment-item';

    const avatar = document.createElement('div');
    avatar.className = 'comment-avatar';
    avatar.textContent = comment.authorName.charAt(0).toUpperCase();

    const content = document.createElement('div');
    content.className = 'comment-content';

    const header = document.createElement('div');
    header.className = 'comment-header';

    const author = document.createElement('span');
    author.className = 'comment-author';
    author.textContent = comment.authorName;

    const time = document.createElement('span');
    time.className = 'comment-time';
    time.textContent = this.calculateTimeAgo(comment.createdAt);

    header.append(author, time);

    const text = document.createElement('p');
    text.className = 'comment-text';
    text.textContent = comment.text;

    const likeButton = document.createElement('button');
    likeButton.type = 'button';
    likeButton.className = 'comment-like-btn';
    likeButton.classList.toggle('is-liked', comment.isLikedByCurrentUser);
    likeButton.dataset.commentId = comment.commentId;

    const likeIcon = document.createElement('img');
    likeIcon.src = heartBlackIcon;
    likeIcon.alt = '';
    likeIcon.className = 'like-icon';

    const likeCount = document.createElement('span');
    likeCount.className = 'like-count';
    likeCount.textContent = String(comment.likesCount);

    likeButton.append(likeIcon, likeCount);
    content.append(header, text, likeButton);
    item.append(avatar, content);
    return item;
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

    // Delegated to the dialog: the comment form is re-rendered on every
    // game load, so listeners on the form itself would be lost
    this.dialog.addEventListener('input', (event) => {
      const target = event.target as HTMLElement;
      if (!target.matches('.comment-textarea')) {
        return;
      }

      this.autoGrowTextarea(target as HTMLTextAreaElement);
      this.updateCommentSubmitState();
    });

    // Enter submits, Shift+Enter inserts a new line. Skipped while an IME
    // is composing so confirming a character doesn't send the comment.
    this.dialog.addEventListener('keydown', (event) => {
      const target = event.target as HTMLElement;
      if (
        event.key !== 'Enter' ||
        event.shiftKey ||
        event.isComposing ||
        !target.matches('.comment-textarea')
      ) {
        return;
      }
      event.preventDefault();
      void this.submitComment();
    });

    this.dialog.addEventListener('click', (event) => {
      if ((event.target as HTMLElement).closest('.comment-submit-btn')) {
        void this.submitComment();
      }
    });

    this.dialog.addEventListener('mouseover', (event) => {
      if ((event.target as HTMLElement).closest('.comment-submit-btn')) {
        this.updateCommentSubmitState(true);
      }
    });

    this.dialog.addEventListener('mouseout', (event) => {
      if ((event.target as HTMLElement).closest('.comment-submit-btn')) {
        this.updateCommentSubmitState();
      }
    });

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
    if (this.isFavoritePending()) {
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

    this.favoritePendingSlug = slug;
    this.updateFavoriteButton();
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
      this.favoritePendingSlug = undefined;
      // Unlock; on error this restores the confirmed (unchanged) label
      this.updateFavoriteButton();
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
    this.updateFavoriteButton();
  }

  // Locked only for the game whose request is in flight
  private isFavoritePending(): boolean {
    return this.favoritePendingSlug === this.currentGameSlug;
  }

  // Renders favorite and pending state onto the current button
  private updateFavoriteButton() {
    const favoriteButton =
      this.dialog.querySelector<HTMLButtonElement>('.btn-favorite');
    if (!favoriteButton) {
      return;
    }

    const isPending = this.isFavoritePending();
    favoriteButton.classList.toggle('is-favorited', this.isLiked);
    favoriteButton.classList.toggle('is-pending', isPending);
    favoriteButton.disabled = isPending;
    favoriteButton.setAttribute('aria-busy', String(isPending));
    favoriteButton.setAttribute('aria-pressed', String(this.isLiked));

    const textSpan = favoriteButton.querySelector('.btn-text');
    if (!textSpan) {
      return;
    }
    if (isPending) {
      textSpan.textContent = 'Saving…';
    } else {
      textSpan.textContent = this.isLiked
        ? 'Remove from Favorites'
        : 'Add to Favorites';
    }
  }

  // Empty (or whitespace-only) comment: grey and disabled.
  // Has text: blue, or the hover variant while the pointer is over it.
  // Guests see a locked form; signed-in users get their initial and input
  private updateCommentFormAccess() {
    const session = getSession();
    const textarea =
      this.dialog.querySelector<HTMLTextAreaElement>('.comment-textarea');
    const avatar = this.dialog.querySelector<HTMLElement>(
      '.comment-form-avatar'
    );

    if (avatar) {
      // Uppercase first letter of the profile name (Unicode-aware)
      const initial = session
        ? ([...getInitials(getProfileName(session))][0] ?? '')
        : '';
      avatar.textContent = initial || '?';
      avatar.classList.toggle('is-guest', !session);
    }

    const isPending = this.isCommentPending();
    if (textarea) {
      // Locked for guests and while this game's comment is being sent
      textarea.disabled = !session || isPending;
      textarea.placeholder = session
        ? 'Write a comment...'
        : 'Log in to write a comment...';
    }

    const form = this.dialog.querySelector<HTMLElement>('.comment-form');
    form?.classList.toggle('is-pending', isPending);
    form?.setAttribute('aria-busy', String(isPending));

    this.updateCommentSubmitState();
  }

  private isCommentPending(): boolean {
    return this.commentPendingSlug === this.currentGameSlug;
  }

  // Posts the comment, then reloads the latest comments and the count from
  // the server. Never resubmitted automatically.
  private async submitComment() {
    if (this.isCommentPending()) {
      return;
    }

    const textarea =
      this.dialog.querySelector<HTMLTextAreaElement>('.comment-textarea');
    const text = textarea?.value.trim() ?? '';
    if (!text) {
      return;
    }
    if (text.length > COMMENT_MAX_LENGTH) {
      showSnackbar(
        `Comments can be at most ${COMMENT_MAX_LENGTH} characters long.`
      );
      return;
    }

    if (!canPerformProtectedAction()) {
      return;
    }
    const session = getSession();
    if (!session) {
      return;
    }

    const authorName = getProfileName(session).slice(0, AUTHOR_NAME_MAX_LENGTH);
    if (authorName.length < AUTHOR_NAME_MIN_LENGTH) {
      showSnackbar(
        `Your profile name must be at least ${AUTHOR_NAME_MIN_LENGTH} characters to comment.`
      );
      return;
    }

    const slug = this.currentGameSlug;
    const { email } = session;

    this.commentPendingSlug = slug;
    this.updateCommentFormAccess();
    try {
      await postComment(slug, { userEmail: email, authorName, text });
    } catch (error) {
      // Either way the typed text is kept and the form unlocks; nothing is
      // resubmitted automatically
      showSnackbar(getCommentErrorMessage(error));
      this.unlockCommentForm(slug);
      if (isUnknownOutcome(error)) {
        // A safe GET (not a re-POST) so the user can see if it went through
        void this.refreshComments(slug, email).catch(() => {});
      }
      return;
    }

    // Created (201): clear the draft if the user is still on this game
    if (slug === this.currentGameSlug && textarea?.isConnected) {
      textarea.value = '';
      textarea.style.height = 'auto';
    }
    this.unlockCommentForm(slug);

    try {
      await this.refreshComments(slug, email);
    } catch {
      showSnackbar(
        'Your comment was posted, but the comments could not be refreshed.'
      );
    }
  }

  private unlockCommentForm(slug: string) {
    if (this.commentPendingSlug === slug) {
      this.commentPendingSlug = undefined;
    }
    this.updateCommentFormAccess();
  }

  // Latest 3 comments plus meta.totalComments for the heading
  private async refreshComments(slug: string, email: string) {
    const response = await getComments(slug, email);
    if (slug !== this.currentGameSlug || getSession()?.email !== email) {
      return;
    }

    this.currentCommentsData = response.data;
    this.totalCommentsCount = response.meta.totalComments;
    this.commentsLoadFailed = false;

    setText(
      this.dialog,
      '.comments-title',
      `Comments (${this.totalCommentsCount})`
    );
    this.renderCommentsList();
    this.attachCommentLikeEvents();
  }

  private updateCommentSubmitState(isHovered = false) {
    const textarea =
      this.dialog.querySelector<HTMLTextAreaElement>('.comment-textarea');
    const submitButton = this.dialog.querySelector<HTMLButtonElement>(
      '.comment-submit-btn'
    );
    const submitIcon =
      submitButton?.querySelector<HTMLImageElement>('.submit-icon');
    if (!submitButton || !submitIcon) {
      return;
    }

    // Locked textarea (guest) counts as empty: grey and not clickable
    const hasText =
      !textarea?.disabled && (textarea?.value.trim().length ?? 0) > 0;
    submitButton.disabled = !hasText;
    if (!hasText) {
      submitIcon.src = sendCommentIconDisabled;
    } else if (isHovered) {
      submitIcon.src = sendCommentIconHover;
    } else {
      submitIcon.src = sendCommentIconDefault;
    }
  }

  private resetCommentState() {
    const textarea =
      this.dialog.querySelector<HTMLTextAreaElement>('.comment-textarea');

    if (textarea) {
      textarea.value = '';
      textarea.style.height = 'auto';
    }

    this.updateCommentFormAccess();

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

    this.attachCommentLikeEvents();
  }

  // Separate so a comments-only refresh doesn't re-bind the favorite button
  private attachCommentLikeEvents() {
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
      const response = await getComments(
        this.currentGameSlug,
        getSession()?.email
      );
      this.currentCommentsData = response.data;
      this.totalCommentsCount = response.meta.totalComments;
      this.commentsLoadFailed = false;
    } catch {
      // Shown to the user as the comments error banner with Retry
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
      this.attachGameActionEvents();
      this.resetFavoriteState();
      this.resetCommentState();

      // Signed in or out while loading: the personal state is outdated
      if (getSession()?.email !== email) {
        this.syncFavoriteWithSession();
      }
    } catch {
      // Shown to the user as the dialog error state
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
    // Only reachable through syncWithUrl, which always sets the slug first
    if (!this.currentGameSlug) {
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
