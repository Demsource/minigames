import { router } from '../app/router';
import { showSnackbar } from '../components/snackbar/snackbar';
import { APP_SESSION_LIFETIME_MS, AppSession, isExpired } from './app-session';
import { endSession, getSession, subscribeSession } from './session-state';

export const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. You are now in Guest Mode.';
export const LOGOUT_SUCCESS_MESSAGE = 'You have been logged out.';
export const SIGN_OUT_ERROR_MESSAGE =
  'You are in Guest Mode, but sign-out could not be completed. Please try again later.';

// Shows the error if Firebase signOut failed; the app stays in Guest Mode
async function endSessionWithFeedback(successMessage: string): Promise<void> {
  const result = await endSession();
  showSnackbar(result.success ? successMessage : SIGN_OUT_ERROR_MESSAGE);
}

// Logout from the header or mobile menu: same Guest Mode reset as expiry
export async function logoutUser(): Promise<void> {
  await endSessionWithFeedback(LOGOUT_SUCCESS_MESSAGE);
}

// Ends an expired session and switches to Guest Mode. Returns whether an
// authenticated session is still active. endSession() clears the in-memory
// session synchronously, so repeated checks show only one Snackbar.
export function isSessionActive(): boolean {
  const session = getSession();
  if (!session) {
    return false;
  }
  if (!isExpired(session)) {
    return true;
  }

  void endSessionWithFeedback(SESSION_EXPIRED_MESSAGE);
  return false;
}

// Call before every protected action (favorite, comment, like) and skip the
// request when it returns false. Without an active session the Auth dialog
// opens on top of the current URL; an open Game Details is suspended and
// restored when Auth closes. The blocked action is not repeated.
export function canPerformProtectedAction(): boolean {
  if (isSessionActive()) {
    return true;
  }
  router.setQuery({ auth: 'login' });
  return false;
}

const expiryTimer: { id?: number } = {};

// Schedules the expiry check for the exact moment the session ends, so an
// idle page switches to Guest Mode without waiting for user activity
function scheduleExpiry(session: AppSession | undefined): void {
  globalThis.clearTimeout(expiryTimer.id);
  expiryTimer.id = undefined;
  if (!session) {
    return;
  }

  const remaining =
    session.authenticatedAt + APP_SESSION_LIFETIME_MS - Date.now();
  expiryTimer.id = globalThis.setTimeout(
    isSessionActive,
    Math.max(remaining, 0)
  );
}

function handleVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    isSessionActive();
  }
}

// Checks expiry when the session's lifetime ends, when the page becomes
// active again and before every page or dialog navigation; navigation then
// continues in Guest Mode
export function startSessionWatch(): void {
  // A session restored on startup exists before this subscription
  scheduleExpiry(getSession());
  subscribeSession(scheduleExpiry);

  document.addEventListener('visibilitychange', handleVisibilityChange);
  globalThis.addEventListener('focus', isSessionActive);
  router.onBeforeRoute(isSessionActive);
}
