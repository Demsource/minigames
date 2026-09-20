import logoUrl from '../../assets/icons/logo-minigames.svg';

const openAuthPlaceholder = (event: Event) => {
  event.preventDefault();
  alert('Auth dialog will be built later!');
};

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
      </div>
    </div>
  `;

  // Placeholder event listener for the Auth dialog
  const loginButton = headerElement.querySelector('#login-btn');
  const signupButton = headerElement.querySelector('#signup-btn');

  loginButton?.addEventListener('click', openAuthPlaceholder);
  signupButton?.addEventListener('click', openAuthPlaceholder);

  return headerElement;
}
