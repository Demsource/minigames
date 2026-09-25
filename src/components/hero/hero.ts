import './hero.scss';

export function Hero(): HTMLElement {
  const heroElement = document.createElement('section');
  heroElement.className = 'hero-section';

  heroElement.innerHTML = `
    <div class="hero-container">
      <div class="hero-card">
        <h1>Take a Short Break<br>& Have Fun</h1>
        <p>
          <span class="desktop-text">Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.</span>
          <span class="mobile-text">Discover hundreds of curated casual mini-games right in your browser.</span>
        </p>
        <a href="/library" data-link class="btn-browse">Browse Library</a>
      </div>
    </div>
  `;

  return heroElement;
}
