import './burger-menu.scss';
import logoUrl from '../../../assets/icons/logo-minigames.svg';
import closeUrl from '../../../assets/icons/close.svg';
import { AuthDialog } from '../../dialogs/auth-dialog';
import { AppSession } from '../../../services/app-session';
import { renderProfile } from '../render-profile';
import {
  endSession,
  getSession,
  subscribeSession,
} from '../../../services/session-state';

export class BurgerMenu {
  private element: HTMLElement;
  private isOpen = false;

  constructor(currentRoute: string) {
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
        <a href="/" class="nav-item${currentRoute === '/' ? ' active' : ''}" data-link>Home</a>
        <a href="/library" class="nav-item${currentRoute === '/library' ? ' active' : ''}" data-link>Library</a>
        <a href="/" class="nav-item" data-link>Tournaments</a>
        <a href="/" class="nav-item" data-link>Community</a>
      </nav>

      <div class="burger-auth">
        <button type="button" class="btn-login" id="burger-login-btn">Log In</button>
        <button type="button" class="btn-signup" id="burger-signup-btn">Sign Up</button>
        <button type="button" class="btn-login btn-logout" id="burger-logout-btn" hidden>Logout</button>
        <div class="burger-profile" hidden>
          <span class="burger-profile-name"></span>
          <span class="burger-profile-avatar"></span>
        </div>
      </div>
    `;

    this.bindEvents();
    this.applyAuthState(getSession());

    // A new menu is created on every page render; drop stale listeners
    const unsubscribe = subscribeSession((session) => {
      if (!this.element.isConnected) {
        unsubscribe();
        return;
      }
      this.applyAuthState(session);
    });
  }

  private applyAuthState(session: AppSession | undefined) {
    const isSignedIn = session !== undefined;
    for (const selector of ['#burger-login-btn', '#burger-signup-btn']) {
      const button = this.element.querySelector<HTMLButtonElement>(selector);
      if (button) {
        button.hidden = isSignedIn;
      }
    }
    const logoutButton =
      this.element.querySelector<HTMLButtonElement>('#burger-logout-btn');
    if (logoutButton) {
      logoutButton.hidden = !isSignedIn;
    }
    const profile = this.element.querySelector<HTMLElement>('.burger-profile');
    if (!profile) {
      return;
    }

    profile.hidden = !isSignedIn;
    if (session) {
      renderProfile(profile, session, 'burger-profile', 'medium');
    }
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
      event.preventDefault();
      this.close();
      AuthDialog.show('login');
    });
    signupButton?.addEventListener('click', (event) => {
      event.preventDefault();
      this.close();
      AuthDialog.show('register');
    });

    const logoutButton = this.element.querySelector('#burger-logout-btn');
    logoutButton?.addEventListener('click', () => {
      this.close();
      void endSession();
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
