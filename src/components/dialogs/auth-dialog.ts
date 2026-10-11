import './auth-dialog.scss';
import googleIcon from '../../assets/icons/google.svg';
import lockIcon from '../../assets/icons/lock.svg';
import mailIcon from '../../assets/icons/mail.svg';
import personIcon from '../../assets/icons/person.svg';
import visibilityIcon from '../../assets/icons/visibility.svg';
import { router } from '../../app/router';
import {
  validateEmail,
  validateUsername,
  validateRegistrationPassword,
  validateLoginPassword,
  validateConfirmPassword,
} from './validation';
import { login, signup } from '../../services/auth';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';

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
  private currentMode: AuthMode = 'login';

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
    this.currentMode = mode;
    this.dialog.classList.toggle('view-register', isRegister);
    this.dialog
      .querySelector('#toggle-login')
      ?.classList.toggle('active', !isRegister);
    this.dialog
      .querySelector('#toggle-register')
      ?.classList.toggle('active', isRegister);
    this.clearFormState();
  }

  private getFieldInput(fieldName: string): HTMLInputElement | null {
    return this.dialog.querySelector(
      `input[data-field="${CSS.escape(fieldName)}"]`
    );
  }

  private getErrorElement(fieldName: string): HTMLElement | null {
    return this.dialog.querySelector(
      `[data-error-for="${CSS.escape(fieldName)}"]`
    );
  }

  private showError(fieldName: string, errorMessage: string) {
    const input = this.getFieldInput(fieldName);
    const errorElement = this.getErrorElement(fieldName);

    if (input) {
      input.classList.add('has-error');
    }

    if (!errorElement) {
      return;
    }

    errorElement.textContent = errorMessage;
    errorElement.classList.add('is-visible');
  }

  private clearError(fieldName: string) {
    const input = this.getFieldInput(fieldName);
    const errorElement = this.getErrorElement(fieldName);

    if (input) {
      input.classList.remove('has-error');
    }

    if (!errorElement) {
      return;
    }

    errorElement.textContent = '';
    errorElement.classList.remove('is-visible');
  }

  private validateField(fieldName: string) {
    const input = this.getFieldInput(fieldName);
    if (!input) return;

    const value = input.value;
    let validationResult;

    switch (fieldName) {
      case 'login-email':
      case 'register-email': {
        validationResult = validateEmail(value);
        break;
      }

      case 'register-username': {
        validationResult = validateUsername(value);
        break;
      }

      case 'register-password': {
        validationResult = validateRegistrationPassword(value);
        // Revalidate confirm password when password changes
        this.validateField('register-confirm-password');
        break;
      }

      case 'register-confirm-password': {
        const passwordInput = this.getFieldInput('register-password');
        const passwordValue = passwordInput?.value ?? '';
        validationResult = validateConfirmPassword(passwordValue, value);
        break;
      }

      case 'login-password': {
        validationResult = validateLoginPassword(value);
        break;
      }

      default: {
        return;
      }
    }

    if (validationResult.isValid) {
      this.clearError(fieldName);
    } else {
      this.showError(fieldName, validationResult.error ?? 'Invalid field');
    }

    this.updateSubmitButtonState();
  }

  private getFieldsForMode(mode: AuthMode): string[] {
    return mode === 'login'
      ? ['login-email', 'login-password']
      : [
          'register-username',
          'register-email',
          'register-password',
          'register-confirm-password',
        ];
  }

  private isFormValid(): boolean {
    const fields = this.getFieldsForMode(this.currentMode);

    for (const fieldName of fields) {
      const input = this.getFieldInput(fieldName);
      const errorElement = this.getErrorElement(fieldName);

      // Field is invalid if: empty, has error class, or has visible error message
      if (
        !input ||
        !input.value.trim() ||
        input.classList.contains('has-error') ||
        errorElement?.classList.contains('is-visible')
      ) {
        return false;
      }
    }

    return true;
  }

  private updateSubmitButtonState() {
    const view =
      this.currentMode === 'login' ? '#login-view' : '#register-view';
    const submitButton = this.dialog.querySelector(
      `${view} .btn-primary`
    ) as HTMLButtonElement;

    if (submitButton) {
      submitButton.disabled = !this.isFormValid();
    }
  }

  private clearFormState() {
    const fields = this.getFieldsForMode(this.currentMode);

    for (const fieldName of fields) {
      const input = this.getFieldInput(fieldName);
      if (input) {
        input.value = '';
      }
      this.clearError(fieldName);
    }

    this.updateSubmitButtonState();
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
            <input type="email" placeholder="e.g. alex@minigames.com" data-field="login-email" />
          </div>
          <div class="error-message" data-error-for="login-email"></div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${lockIcon}" alt="Lock" />
            <input type="password" placeholder="••••••••" data-field="login-password" />
            <img class="icon-right" src="${visibilityIcon}" alt="Visibility" />
          </div>
          <div class="error-message" data-error-for="login-password"></div>
        </div>

        <a class="forgot-password">Forgot Password?</a>
        <button class="btn-primary" type="button" disabled>Login</button>

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
            <input type="text" placeholder="e.g. CozyGamer_99" data-field="register-username" />
          </div>
          <div class="error-message" data-error-for="register-username"></div>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${mailIcon}" alt="Mail" />
            <input type="email" placeholder="your.email@domain.com" data-field="register-email" />
          </div>
          <div class="error-message" data-error-for="register-email"></div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${lockIcon}" alt="Lock" />
            <input type="password" placeholder="Min. 8 characters" data-field="register-password" />
          </div>
          <div class="error-message" data-error-for="register-password"></div>
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <div class="input-wrapper">
            <img class="icon-left" src="${lockIcon}" alt="Lock" />
            <input type="password" placeholder="Repeat your password" data-field="register-confirm-password" />
          </div>
          <div class="error-message" data-error-for="register-confirm-password"></div>
        </div>

        <button class="btn-primary" type="button" disabled style="margin-top: 16px;">Create Account</button>

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

  private attachFieldValidationListeners() {
    const allInputs = this.dialog.querySelectorAll('input[data-field]');

    for (const input of allInputs) {
      const fieldName = (input as HTMLInputElement).dataset.field;
      if (!fieldName) continue;

      // Validate on input (real-time as user types)
      input.addEventListener('input', () => {
        this.validateField(fieldName);
      });

      // Validate on blur (when user leaves the field)
      input.addEventListener('blur', () => {
        this.validateField(fieldName);
      });
    }
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

    const loginButton = this.dialog.querySelector(
      ':scope > #login-view .btn-primary'
    ) as HTMLButtonElement;
    const registerButton = this.dialog.querySelector(
      ':scope > #register-view .btn-primary'
    ) as HTMLButtonElement;

    loginButton?.addEventListener('click', () => this.handleLogin());
    registerButton?.addEventListener('click', () => this.handleRegister());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) {
        this.requestClose();
      }
    });

    this.attachFieldValidationListeners();
  }

  private async handleLogin() {
    const emailInput = this.getFieldInput('login-email');
    const passwordInput = this.getFieldInput('login-password');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    const result = await login(email, password);

    if (!result.success) {
      this.showError('login-email', result.error || 'Login failed');
      return;
    }

    this.close();
  }

  private async handleRegister() {
    const usernameInput = this.getFieldInput('register-username');
    const emailInput = this.getFieldInput('register-email');
    const passwordInput = this.getFieldInput('register-password');

    if (!usernameInput || !emailInput || !passwordInput) return;

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    const result = await signup(email, password);

    if (!result.success) {
      this.showError('register-email', result.error || 'Registration failed');
      return;
    }

    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: username });
    }

    this.close();
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
