import { User } from 'firebase/auth';
import { AppSession, clearSession, saveSession } from './app-session';
import { logout } from './auth';

type SessionListener = (session: AppSession | undefined) => void;

// The active app session is the source of truth for authenticated UI,
// not Firebase's currentUser.
const state: { session?: AppSession } = {};
const listeners = new Set<SessionListener>();

function notify(): void {
  listeners.forEach((listener) => listener(state.session));
}

export function getSession(): AppSession | undefined {
  return state.session;
}

export function isAuthenticated(): boolean {
  return state.session !== undefined;
}

export function subscribeSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Called after a successful Firebase sign-in or registration
export function startSession(user: User): AppSession {
  const session = saveSession(user);
  state.session = session;
  notify();
  return session;
}

// Restores an already-validated stored session without touching authenticatedAt
export function restoreSession(session: AppSession): void {
  state.session = session;
  notify();
}

// Clears the app session and signs out of Firebase so its persisted
// identity can't restore the user after the app session has ended
export async function endSession(): Promise<void> {
  clearSession();
  const wasAuthenticated = state.session !== undefined;
  state.session = undefined;
  if (wasAuthenticated) {
    notify();
  }
  await logout();
}
