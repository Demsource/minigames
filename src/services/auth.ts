import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function signup(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function logout(): Promise<AuthResult> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export function onUserStateChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case 'auth/email-already-in-use': {
        return 'This email is already registered. Try logging in instead.';
      }
      case 'auth/invalid-email': {
        return 'Invalid email address.';
      }
      case 'auth/weak-password': {
        return 'Password is too weak. Use at least 6 characters.';
      }
      case 'auth/user-not-found': {
        return 'No account found with this email.';
      }
      case 'auth/wrong-password': {
        return 'Incorrect password.';
      }
      case 'auth/invalid-credential': {
        return 'Invalid email or password.';
      }
      case 'auth/too-many-requests': {
        return 'Too many login attempts. Try again later.';
      }
      default: {
        return error.message || 'An error occurred. Please try again.';
      }
    }
  }
  return 'An unexpected error occurred.';
}
