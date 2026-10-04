import './auth-dialog.scss';
import googleIcon from '../../assets/icons/google.svg';
import lockIcon from '../../assets/icons/lock.svg';
import mailIcon from '../../assets/icons/mail.svg';
import personIcon from '../../assets/icons/person.svg';
import visibilityIcon from '../../assets/icons/visibility.svg';
import { router } from '../../app/router';

export type AuthMode = 'login' | 'register';

const AUTH_MODES: Set<AuthMode> = new Set(['login', 'register']);

function isAuthMode(value: string): value is AuthMode {
  return AUTH_MODES.has(value as AuthMode);
}

// Switching tabs replaces the entry so Back still closes the dialog
function switchMode(mode: AuthMode) {
  router.setQuery({ auth: mode }, { replace: true });
}

class AuthDialogClass {
  private backdrop!: HTMLElement;
  private dialog!: HTMLElement;
  // True when the history entry below is the page without the dialog
  private canCloseWithBack: boolean = false;
  private hasSeenUrlWithoutAuth: boolean = false;

  constructor() {
    this.createDOM();
    this.attachEvents();
    router.subscribe(({ query }) =>
      this.syncWithUrl(query.get('auth') ?? undefined)
    );
  }

  private isOpen(): boolean {
    return this.backdrop.classList.contains('is-open');
  }

  // The `auth` query param is the source of truth for the dialog
  private syncWithUrl(mode: string | undefined) {
    if (mode === undefined) {
      this.hasSeenUrlWithoutAuth = true;
      if (this.isOpen()) {
        this.close();
      }
      return;
    }

    if (!isAuthMode(mode)) {
      router.setQuery({ auth: undefined }, { replace: true });
      return;
    }

    this.applyMode(mode);
    if (this.isOpen()) {
      return;
    }

    // A deep link has no dialog-less entry below it to go back to
    this.canCloseWithBack = this.hasSeenUrlWithoutAuth;
    this.open();
  }

  private applyMode(mode: AuthMode) {
    const isRegister = mode === 'register';
    this.dialog.classList.toggle('view-register', isRegister);
    this.dialog
      .querySelector('#toggle-login')
      ?.classList.toggle('active', !isRegister);
    this.dialog
      .querySelector('#toggle-register')
      ?.classList.toggle('active', isRegister);
  }

  private requestClose() {
    if (!this.isOpen()) {
      return;
    }

    if (this.canCloseWithBack) {
      globalThis.history.back();
    } else {
      router.setQuery({ auth: undefined }, { replace: true });
    }
  }

  private createDOM() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'auth-dialog-backdrop';

    this.dialog = document.createElement('div');
    this.dialog.className = 'auth-dialog';

    this.dialog.innerHTML = `
      <div class="auth-toggle">
        <button type="button" id="toggle-login" class="active">Login</button>
        <button type="button" id="toggle-register">Register</button>
      </div>

      <div id="login-view">
        <h2>Welcome Back!</h2>
        <p class="subtitle">Sign in to resume your games and progress.</p>
        
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${mailIcon}" alt="Mail" />
            <input type="email" placeholder="e.g. alex@minigames.com" />
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${lockIcon}" alt="Lock" />
            <input type="password" placeholder="••••••••" />
            <img class="icon-right" src="${visibilityIcon}" alt="Visibility" />
          </div>
        </div>

        <a class="forgot-password">Forgot Password?</a>
        <button class="btn-primary" type="button">Login</button>

        <div class="divider">OR</div>
        
        <button class="btn-google" type="button">
          <img src="${googleIcon}" alt="Google" /> Continue with Google
        </button>

        <div class="auth-footer">
          Don't have an account? <a id="switch-to-register">Register</a>
        </div>
      </div>

      <div id="register-view">
        <h2>Create Account</h2>
        <p class="subtitle">Join MiniGames to track your score & streak.</p>
        
        <div class="form-group">
          <label>Username</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${personIcon}" alt="User" />
            <input type="text" placeholder="e.g. CozyGamer_99" />
          </div>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${mailIcon}" alt="Mail" />
            <input type="email" placeholder="your.email@domain.com" />
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${lockIcon}" alt="Lock" />
            <input type="password" placeholder="Min. 8 characters" />
          </div>
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${lockIcon}" alt="Lock" />
            <input type="password" placeholder="Repeat your password" />
          </div>
        </div>

        <button class="btn-primary" type="button" style="margin-top: 16px;">Create Account</button>

        <div class="divider">OR</div>
        
        <button class="btn-google" type="button">
          <img src="${googleIcon}" alt="Google" /> Sign up with Google
        </button>

        <div class="auth-footer">
          Already have an account? <a id="switch-to-login">Login</a>
        </div>
      </div>
    `;

    this.backdrop.append(this.dialog);
    document.body.append(this.backdrop);
  }

  private attachEvents() {
    this.backdrop.addEventListener('click', (event) => {
      if (event.target === this.backdrop) {
        this.requestClose();
      }
    });

    const toggleLoginButton = this.dialog.querySelector('#toggle-login');
    const toggleRegisterButton = this.dialog.querySelector('#toggle-register');
    const switchLoginLink = this.dialog.querySelector('#switch-to-login');
    const switchRegisterLink = this.dialog.querySelector('#switch-to-register');

    toggleLoginButton?.addEventListener('click', () => switchMode('login'));
    switchLoginLink?.addEventListener('click', () => switchMode('login'));

    toggleRegisterButton?.addEventListener('click', () =>
      switchMode('register')
    );
    switchRegisterLink?.addEventListener('click', () => switchMode('register'));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) {
        this.requestClose();
      }
    });
  }

  // Opens the dialog by pushing `?auth=<mode>`; the URL listener does the rest
  public show(mode: AuthMode) {
    router.setQuery({ auth: mode });
  }

  public open() {
    this.backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  public close() {
    this.backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

export const AuthDialog = new AuthDialogClass();
