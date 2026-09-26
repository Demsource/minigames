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
  private maxIndex = 0;

  constructor(track: HTMLElement) {
    this.track = track;
    this.container = track.parentElement as HTMLElement;
    this.updateCardWidth();
    this.attachDragListeners();
    setTimeout(() => this.calculateMaxIndex(), 0);
  }

  private updateCardWidth() {
    const card = this.track.querySelector('.game-card') as HTMLElement;
    if (!card) return;
    this.cardWidth = card.offsetWidth;
    const styles = globalThis.getComputedStyle(this.container);
    this.gap = Number(styles.gap || '4');
  }

  private calculateMaxIndex() {
    const containerWidth = this.container.clientWidth;
    const trackWidth = this.track.scrollWidth;
    const maxOffset = trackWidth - containerWidth;
    this.maxIndex = Math.max(
      0,
      Math.floor(maxOffset / (this.cardWidth + this.gap))
    );
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
  }

  private onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;

    this.dragOffset = event.clientX - this.dragStartX;
    const baseOffset = (this.cardWidth + this.gap) * this.currentIndex;
    let translateX = baseOffset - this.dragOffset;

    // Clamp to valid range
    const maxOffset = Math.max(
      0,
      this.track.scrollWidth - this.container.clientWidth
    );
    translateX = Math.max(0, Math.min(translateX, maxOffset));

    this.track.style.transform = `translateX(-${translateX}px)`;
  }

  private onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.transition = 'transform 0.1s ease';

    const threshold = (this.cardWidth + this.gap) * 0.2;

    if (this.dragOffset > threshold && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.dragOffset < -threshold) {
      this.currentIndex++;
    }

    this.dragOffset = 0;
    this.updatePosition();
  }

  private updatePosition() {
    const offset = (this.cardWidth + this.gap) * this.currentIndex;
    this.track.style.transform = `translateX(-${offset}px)`;
  }

  next() {
    this.currentIndex = Math.min(this.currentIndex + 3, this.maxIndex);
    this.updatePosition();
  }

  prev() {
    this.currentIndex = Math.max(this.currentIndex - 3, 0);
    this.updatePosition();
  }

  wasDragged(): boolean {
    return Math.abs(this.dragOffset) > 5;
  }

  startHoldNext() {
    if (this.holdInterval) return;
    this.holdInterval = setInterval(() => this.next(), 100);
  }

  startHoldPrev() {
    if (this.holdInterval) return;
    this.holdInterval = setInterval(() => this.prev(), 100);
  }

  stopHold() {
    if (!this.holdInterval) {
      return;
    }

    clearInterval(this.holdInterval);
    this.holdInterval = undefined;
  }
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
      <div class="carousel-track">
        ${cardsHtml}
      </div>
    </div>
  `;

  const track = section.querySelector('.carousel-track') as HTMLElement;
  const slider = new CarouselSlider(track);

  const buttonPrevious = section.querySelector(
    '.btn-prev'
  ) as HTMLButtonElement;
  const buttonNext = section.querySelector('.btn-next') as HTMLButtonElement;

  buttonPrevious.addEventListener('mousedown', () => slider.startHoldPrev());
  buttonPrevious.addEventListener('mouseup', () => slider.stopHold());
  buttonPrevious.addEventListener('mouseleave', () => slider.stopHold());
  buttonPrevious.addEventListener('click', () => slider.prev());

  buttonNext.addEventListener('mousedown', () => slider.startHoldNext());
  buttonNext.addEventListener('mouseup', () => slider.stopHold());
  buttonNext.addEventListener('mouseleave', () => slider.stopHold());
  buttonNext.addEventListener('click', () => slider.next());

  const gameCards = section.querySelectorAll('.game-card');
  for (const card of gameCards) {
    card.addEventListener('click', () => {
      if (!slider.wasDragged()) {
        GameDetailsDialog.open();
      }
    });
  }

  return section;
}
