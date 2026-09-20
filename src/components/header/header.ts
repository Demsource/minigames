import logoUrl from '../../assets/icons/logo-minigames.svg';
import { BurgerMenu } from './burger-menu/burger-menu';
import { AuthDialog } from '../dialogs/auth-dialog';

export function Header(): HTMLElement {
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
        <a href="/" class="nav-item active" data-link>Home</a>
        <a href="/" class="nav-item" data-link>Library</a>
        <a href="/" class="nav-item" data-link>Tournaments</a>
        <a href="/" class="nav-item" data-link>Community</a>
      </nav>

      <div class="header-auth">
        <button type="button" class="btn-login" id="login-btn">Log In</button>
        <button type="button" class="btn-signup" id="signup-btn">Sign Up</button>
        
        <button type="button" class="burger-toggle" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  `;

  // Placeholder event listener for the Auth dialog
  const loginButton = headerElement.querySelector('#login-btn');
  const signupButton = headerElement.querySelector('#signup-btn');

  loginButton?.addEventListener('click', (event) => {
    event.preventDefault();
    AuthDialog.open();
  });
  signupButton?.addEventListener('click', (event) => {
    event.preventDefault();
    AuthDialog.open();
  });

  const burgerMenu = new BurgerMenu();
  document.body.append(burgerMenu.getElement());

  const burgerToggle = headerElement.querySelector('.burger-toggle');
  burgerToggle?.addEventListener('click', () => burgerMenu.open());

  return headerElement;
}
