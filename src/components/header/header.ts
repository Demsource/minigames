import logoUrl from '../../assets/icons/logo-minigames.svg';
import { BurgerMenu } from './burger-menu/burger-menu';
import { AuthDialog } from '../dialogs/auth-dialog';
import { AppSession } from '../../services/app-session';
import {
  endSession,
  getSession,
  subscribeSession,
} from '../../services/session-state';

export function Header(currentRoute: string): HTMLElement {
  const headerElement = document.createElement('header');
  headerElement.className = 'site-header';

  headerElement.innerHTML = `
    <div class="header-inner">
      <a href="/" class="header-brand" data-link>
        <div class="header-logo-icon">
          <img src="${logoUrl}" alt="Logo" />
        </div>
        <span class="header-logo-text">MiniGames</span>
      </a>

      <nav class="header-nav">
        <a href="/" class="nav-item${currentRoute === '/' ? ' active' : ''}" data-link>Home</a>
        <a href="/library" class="nav-item${currentRoute === '/library' ? ' active' : ''}" data-link>Library</a>
        <a href="/" class="nav-item" data-link>Tournaments</a>
        <a href="/" class="nav-item" data-link>Community</a>
      </nav>

      <div class="header-auth">
        <button type="button" class="btn-login" id="login-btn">Log In</button>
        <button type="button" class="btn-signup" id="signup-btn">Sign Up</button>
        <button type="button" class="btn-signup btn-logout" id="logout-btn" hidden>Logout</button>

        <button type="button" class="burger-toggle" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  `;

  const loginButton =
    headerElement.querySelector<HTMLButtonElement>('#login-btn');
  const signupButton =
    headerElement.querySelector<HTMLButtonElement>('#signup-btn');
  const logoutButton =
    headerElement.querySelector<HTMLButtonElement>('#logout-btn');

  const applyAuthState = (session: AppSession | undefined) => {
    const isSignedIn = session !== undefined;
    for (const button of [loginButton, signupButton]) {
      if (button) {
        button.hidden = isSignedIn;
      }
    }
    if (logoutButton) {
      logoutButton.hidden = !isSignedIn;
    }
  };
  applyAuthState(getSession());

  // The header is re-created on every page render; drop stale listeners
  const unsubscribe = subscribeSession((session) => {
    if (!headerElement.isConnected) {
      unsubscribe();
      return;
    }
    applyAuthState(session);
  });

  logoutButton?.addEventListener('click', () => {
    void endSession();
  });

  loginButton?.addEventListener('click', (event) => {
    event.preventDefault();
    AuthDialog.show('login');
  });
  signupButton?.addEventListener('click', (event) => {
    event.preventDefault();
    AuthDialog.show('register');
  });

  const burgerMenu = new BurgerMenu(currentRoute);
  document.body.append(burgerMenu.getElement());

  const burgerToggle = headerElement.querySelector('.burger-toggle');
  burgerToggle?.addEventListener('click', () => burgerMenu.open());

  return headerElement;
}
