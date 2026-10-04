import './new-games.scss';
import '../skeletons/skeleton-loader-slider.scss';
import starIcon from '../../assets/icons/star.svg';
import heartIcon from '../../assets/icons/heart.svg';
import { GameDetailsDialog } from '../dialogs/game-details-dialog';
import { apiCall, type Game, type ApiResponse } from '../../services/api';
import { createSkeletonSliderGroup } from '../skeletons/skeleton-loader-slider';
import { ErrorBanner } from '../error-banner/error-banner';
import { EmptyState } from '../empty-state/empty-state';

interface GameData {
  slug: string;
  title: string;
  image: string;
  rating: string;
  likes: string;
}

function formatLikesCount(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return count >= 1000
    ? (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    : count.toString();
}

function transformApiGameToCardData(game: Game): GameData {
  return {
    slug: game.slug,
    title: game.name,
    image: `${import.meta.env.BASE_URL}${game.cardImage}`,
    rating: game.rating.toString(),
    likes: formatLikesCount(game.likesCount),
  };
}

function createGameCard(game: GameData, index: number): string {
  const wideClass = index === 2 ? ' game-card-wide' : '';
  return `
    <div class="game-card${wideClass}" data-game-slug="${game.slug}">
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

class CarouselSlider {
  private track: HTMLElement;
  private container: HTMLElement;
  private currentIndex = 0;
  private cardWidth = 288;
  private gap = 4;
  private isDragging = false;
  private dragStartX = 0;
  private dragOffset = 0;
  private holdInterval: ReturnType<typeof setInterval> | undefined;
  private holdStartTime = 0;
  private holdThreshold = 250;
  private autoAdvanceInterval: ReturnType<typeof setInterval> | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private autoAdvanceAnimationFrameId: number | undefined;
  private autoAdvanceStartTime = 0;
  private autoAdvanceDuration = 0;
  private buttonAnimationFrameId: number | undefined;
  private buttonAnimationStartTime = 0;
  private buttonAnimationDuration = 0;
  private buttonAnimationStartIndex = 0;
  private buttonAnimationTargetIndex = 0;

  private autoAdvanceFrame = () => {
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;

    const now = performance.now();
    const elapsed = now - this.autoAdvanceStartTime;
    const progress = elapsed / this.autoAdvanceDuration;

    if (progress >= 1) {
      this.currentIndex = 0;
      this.track.style.transition = 'transform 0.1s ease';
      this.updatePosition();
      this.startAutoAdvance();
      return;
    }

    this.track.style.transition = 'none';
    const cardStep = this.cardWidth + this.gap;
    const targetIndex = (maxOffset / cardStep) * progress;
    this.currentIndex = targetIndex;
    this.updatePosition();

    this.autoAdvanceAnimationFrameId = requestAnimationFrame(
      this.autoAdvanceFrame
    );
  };

  private buttonAnimationFrame = () => {
    const now = performance.now();
    const elapsed = now - this.buttonAnimationStartTime;
    const progress = Math.min(elapsed / this.buttonAnimationDuration, 1);

    const currentIndex =
      this.buttonAnimationStartIndex +
      (this.buttonAnimationTargetIndex - this.buttonAnimationStartIndex) *
        progress;
    this.currentIndex = currentIndex;
    this.updatePosition();

    if (progress < 1) {
      this.buttonAnimationFrameId = requestAnimationFrame(
        this.buttonAnimationFrame
      );
    } else {
      this.handleButtonAnimationEnd();
    }
  };

  constructor(track: HTMLElement) {
    this.track = track;
    this.container = track.parentElement as HTMLElement;
    this.updateCardWidth();
    this.attachDragListeners();
    this.startAutoAdvance();
    this.attachResizeObserver();
  }

  private getIndexIncrement(): number {
    const cardStep = this.cardWidth + this.gap;
    return 100 / cardStep;
  }

  private startAutoAdvance() {
    this.stopAutoAdvance();
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;
    const cardStep = this.cardWidth + this.gap;
    const maxIndex = maxOffset / cardStep;

    this.autoAdvanceDuration = (maxIndex / this.getIndexIncrement()) * 4000;
    this.autoAdvanceStartTime = performance.now();
    this.autoAdvanceAnimationFrameId = requestAnimationFrame(
      this.autoAdvanceFrame
    );
  }

  private stopAutoAdvance() {
    if (this.autoAdvanceAnimationFrameId) {
      cancelAnimationFrame(this.autoAdvanceAnimationFrameId);
      this.autoAdvanceAnimationFrameId = undefined;
    }

    if (!this.autoAdvanceInterval) {
      return;
    }

    clearInterval(this.autoAdvanceInterval);
    this.autoAdvanceInterval = undefined;
  }

  private attachResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCardWidth();
    });
    this.resizeObserver.observe(this.track);
  }

  private updateCardWidth() {
    const card = this.track.querySelector('.game-card') as HTMLElement;
    if (!card) return;
    this.cardWidth = card.offsetWidth;
    const styles = globalThis.getComputedStyle(this.track);
    const gapString = styles.gap || '4px';
    this.gap = Number(gapString.match(/[\d.]+/)?.[0] || '4');
  }

  private attachDragListeners() {
    this.track.addEventListener('mousedown', (event) =>
      this.onDragStart(event)
    );
    this.track.addEventListener('mouseleave', () => this.onDragEnd());
    document.addEventListener('mousemove', (event) => this.onDragMove(event));
    document.addEventListener('mouseup', () => this.onDragEnd());
  }

  private onDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragOffset = 0;
    this.track.style.transition = 'none';
    this.stopAutoAdvance();
  }

  private onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;

    this.dragOffset = event.clientX - this.dragStartX;
    const baseOffset = (this.cardWidth + this.gap) * this.currentIndex;
    let translateX = baseOffset - this.dragOffset;

    // Clamp to valid range based on container and track dimensions
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;

    translateX = Math.max(0, Math.min(translateX, maxOffset));

    this.track.style.transform = `translateX(-${translateX}px)`;
  }

  private onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.transition = 'transform 0.1s ease';

    const threshold = (this.cardWidth + this.gap) * 0.2;

    if (this.dragOffset > threshold) {
      this.currentIndex--;
    } else if (this.dragOffset < -threshold) {
      this.currentIndex++;
    }

    this.dragOffset = 0;

    // Apply edge wrapping logic
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;
    const currentOffset = (this.cardWidth + this.gap) * this.currentIndex;

    if (currentOffset >= maxOffset) {
      this.track.style.transition = 'none';
      this.currentIndex = 0;
      this.updatePosition();
      setTimeout(() => {
        this.track.style.transition = 'transform 0.1s ease';
      }, 10);
    } else if (this.currentIndex < 0) {
      this.track.style.transition = 'none';
      const cardStep = this.cardWidth + this.gap;
      this.currentIndex = Math.floor(maxOffset / cardStep);
      this.updatePosition();
      setTimeout(() => {
        this.track.style.transition = 'transform 0.1s ease';
      }, 10);
    } else {
      this.updatePosition();
    }

    this.startAutoAdvance();
  }

  private updatePosition() {
    const cardStep = this.cardWidth + this.gap;
    const offset = cardStep * this.currentIndex;
    this.track.style.transform = `translateX(-${offset}px)`;
  }

  private animateToIndex(targetIndex: number) {
    this.stopButtonAnimation();
    this.track.style.transition = 'none';
    this.buttonAnimationStartIndex = this.currentIndex;
    this.buttonAnimationTargetIndex = targetIndex;
    this.buttonAnimationDuration = 300;
    this.buttonAnimationStartTime = performance.now();
    this.buttonAnimationFrameId = requestAnimationFrame(
      this.buttonAnimationFrame
    );
  }

  private handleButtonAnimationEnd() {
    this.buttonAnimationFrameId = undefined;
    this.track.style.transition = 'transform 0.1s ease';
  }

  private stopButtonAnimation() {
    if (!this.buttonAnimationFrameId) {
      return;
    }

    cancelAnimationFrame(this.buttonAnimationFrameId);
    this.buttonAnimationFrameId = undefined;
  }

  private moveNextStep() {
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;
    const cardStep = this.cardWidth + this.gap;
    const maxIndex = maxOffset / cardStep;

    this.currentIndex += this.getIndexIncrement();

    if (this.currentIndex >= maxIndex) {
      this.currentIndex = 0;
    }

    this.updatePosition();
  }

  private movePrevStep() {
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;
    const cardStep = this.cardWidth + this.gap;
    const maxIndex = maxOffset / cardStep;

    this.currentIndex -= this.getIndexIncrement();

    if (this.currentIndex < 0) {
      this.currentIndex = maxIndex;
    }

    this.updatePosition();
  }

  next() {
    const targetIndex = this.currentIndex + this.getIndexIncrement();
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;
    const cardStep = this.cardWidth + this.gap;
    const maxIndex = maxOffset / cardStep;

    if (targetIndex >= maxIndex) {
      this.animateToIndex(maxIndex);
      setTimeout(() => {
        this.track.style.transition = 'none';
        this.currentIndex = 0;
        this.updatePosition();
        setTimeout(() => {
          this.track.style.transition = 'transform 0.1s ease';
        }, 10);
      }, 300);
    } else {
      this.animateToIndex(targetIndex);
    }
  }

  prev() {
    const targetIndex = this.currentIndex - this.getIndexIncrement();
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;
    const cardStep = this.cardWidth + this.gap;
    const maxIndex = maxOffset / cardStep;

    if (targetIndex < 0) {
      this.animateToIndex(0);
      setTimeout(() => {
        this.track.style.transition = 'none';
        this.currentIndex = maxIndex;
        this.updatePosition();
        setTimeout(() => {
          this.track.style.transition = 'transform 0.1s ease';
        }, 10);
      }, 300);
    } else {
      this.animateToIndex(targetIndex);
    }
  }

  wasDragged(): boolean {
    return Math.abs(this.dragOffset) > 5;
  }

  startHoldNext() {
    this.stopAutoAdvance();
    this.stopButtonAnimation();
    this.track.style.transition = 'none';
    this.holdStartTime = performance.now();
    this.moveNextStep();
    this.holdInterval = setInterval(() => this.moveNextStep(), 200);
  }

  startHoldPrev() {
    this.stopAutoAdvance();
    this.stopButtonAnimation();
    this.track.style.transition = 'none';
    this.holdStartTime = performance.now();
    this.movePrevStep();
    this.holdInterval = setInterval(() => this.movePrevStep(), 200);
  }

  stopHold() {
    const holdDuration = performance.now() - this.holdStartTime;
    const isQuickClick = holdDuration < this.holdThreshold;

    if (this.holdInterval) {
      clearInterval(this.holdInterval);
      this.holdInterval = undefined;

      if (isQuickClick) {
        this.track.style.transition = 'transform 0.1s ease';
      }
    }

    this.track.style.transition = 'transform 0.1s ease';
    this.startAutoAdvance();
  }
}

export function NewGames(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'new-games-section';

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
      <div class="carousel-track">
      </div>
    </div>
  `;

  const track = section.querySelector('.carousel-track') as HTMLElement;
  track.append(createSkeletonSliderGroup(5, 2));

  const buttonPrevious = section.querySelector(
    '.btn-prev'
  ) as HTMLButtonElement;
  const buttonNext = section.querySelector('.btn-next') as HTMLButtonElement;

  let slider: CarouselSlider | undefined;

  const loadGames = async () => {
    try {
      const apiGames = await apiCall<ApiResponse>('/api/games?featured=true');
      const games = apiGames.data.map((game) =>
        transformApiGameToCardData(game)
      );

      if (games.length === 0) {
        track.replaceChildren(
          EmptyState({
            title: 'No games available',
            message: 'There are no featured games to display at the moment.',
            isDismissible: true,
          })
        );
        return;
      }

      const cardsHtml = games
        .map((game, index) => createGameCard(game, index))
        .join('');

      track.innerHTML = cardsHtml;

      slider = new CarouselSlider(track);

      buttonPrevious.addEventListener('mousedown', () =>
        slider?.startHoldPrev()
      );
      buttonPrevious.addEventListener('mouseup', () => slider?.stopHold());
      buttonPrevious.addEventListener('mouseleave', () => slider?.stopHold());

      buttonNext.addEventListener('mousedown', () => slider?.startHoldNext());
      buttonNext.addEventListener('mouseup', () => slider?.stopHold());
      buttonNext.addEventListener('mouseleave', () => slider?.stopHold());

      const gameCards = section.querySelectorAll('.game-card');
      for (const card of gameCards) {
        const cardElement = card as HTMLElement;
        cardElement.addEventListener('click', () => {
          if (!slider || slider.wasDragged()) {
            return;
          }

          const gameSlug = cardElement.dataset.gameSlug;
          if (!gameSlug) {
            return;
          }

          GameDetailsDialog.show(gameSlug);
        });
      }
    } catch (error) {
      console.error('Failed to load featured games:', error);
      track.replaceChildren(
        ErrorBanner({
          message: 'Failed to load featured games. Please try again.',
          onRetry: loadGames,
          isDismissible: true,
        })
      );
    }
  };

  loadGames();

  return section;
}
