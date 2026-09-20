import './burger-menu.scss';
import logoUrl from '../../../assets/icons/logo-minigames.svg';
import closeUrl from '../../../assets/icons/close.svg';

const openAuthPlaceholder = (event: Event) => {
  event.preventDefault();
  alert('Auth dialog will be built later!');
};

export class BurgerMenu {
  private element: HTMLElement;
  private isOpen = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'burger-menu-overlay';

    this.element.innerHTML = `
      <div class="burger-header">
        <a href="/" class="burger-brand" data-link>
          <div class="burger-logo-icon">
            <img src="${logoUrl}" alt="Logo" />
          </div>
          <span class="burger-logo-text">MiniGames</span>
        </a>
        <button type="button" class="burger-close" aria-label="Close menu">
          <img src="${closeUrl}" alt="Close" />
        </button>
      </div>

      <nav class="burger-nav">
        <a href="/" class="nav-item active" data-link>Home</a>
        <a href="/" class="nav-item" data-link>Library</a>
        <a href="/" class="nav-item" data-link>Tournaments</a>
        <a href="/" class="nav-item" data-link>Community</a>
      </nav>

      <div class="burger-auth">
        <button type="button" class="btn-login" id="burger-login-btn">Log In</button>
        <button type="button" class="btn-signup" id="burger-signup-btn">Sign Up</button>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const closeButton = this.element.querySelector('.burger-close');
    closeButton?.addEventListener('click', () => this.close());

    // Close on Esc key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    const loginButton = this.element.querySelector('#burger-login-btn');
    const signupButton = this.element.querySelector('#burger-signup-btn');

    loginButton?.addEventListener('click', (event) => {
      this.close();
      openAuthPlaceholder(event);
    });
    signupButton?.addEventListener('click', (event) => {
      this.close();
      openAuthPlaceholder(event);
    });

    // Close when clicking a nav link
    const navLinks = this.element.querySelectorAll('.nav-item');
    for (const link of navLinks) {
      link.addEventListener('click', () => this.close());
    }
  }

  public open() {
    this.isOpen = true;
    this.element.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  public close() {
    this.isOpen = false;
    this.element.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
