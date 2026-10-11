import { User } from 'firebase/auth';
import {
  AppSession,
  clearSession,
  readSession,
  saveSession,
} from './app-session';
import { AuthResult, logout } from './auth';

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
// identity can't restore the user after the app session has ended.
// The app is in Guest Mode before signOut runs, so a failed signOut
// (reported in the result) never restores the authenticated UI.
export async function endSession(): Promise<AuthResult> {
  clearSession();
  const wasAuthenticated = state.session !== undefined;
  state.session = undefined;
  if (wasAuthenticated) {
    notify();
  }
  return logout();
}

export interface SessionInitResult {
  status: 'restored' | 'guest' | 'expired' | 'invalid';
  // Result of the Firebase signOut run when no usable session exists
  signOut: AuthResult;
}

// Runs once on startup. Only a valid, unexpired stored session restores the
// authenticated UI; Firebase's persisted currentUser alone never does.
export async function initSession(): Promise<SessionInitResult> {
  const result = readSession();

  if (result.status === 'valid') {
    restoreSession(result.session);
    return { status: 'restored', signOut: { success: true } };
  }

  // No usable app session: also sign out of Firebase so its persisted
  // identity is dropped. Errors never crash startup; Guest Mode continues.
  let signOut: AuthResult;
  try {
    signOut = await endSession();
  } catch {
    signOut = { success: false };
  }

  return {
    status: result.status === 'none' ? 'guest' : result.status,
    signOut,
  };
}
