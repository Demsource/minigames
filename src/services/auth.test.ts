import { afterEach, describe, expect, it, vi } from 'vitest';

const firebase = vi.hoisted(() => ({
  auth: { currentUser: { uid: 'u1' } },
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class GoogleAuthProvider {},
}));

vi.mock('../config/firebase', () => ({ auth: firebase.auth }));
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: firebase.createUserWithEmailAndPassword,
  signInWithEmailAndPassword: firebase.signInWithEmailAndPassword,
  signOut: firebase.signOut,
  onAuthStateChanged: firebase.onAuthStateChanged,
  signInWithPopup: firebase.signInWithPopup,
  GoogleAuthProvider: firebase.GoogleAuthProvider,
}));

const {
  getCurrentUser,
  googleSignIn,
  login,
  logout,
  onUserStateChange,
  signup,
} = await import('./auth');

function firebaseError(code: string, message = 'Firebase error'): Error {
  return Object.assign(new Error(message), { code });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('signup', () => {
  it('creates the account through Firebase', async () => {
    firebase.createUserWithEmailAndPassword.mockResolvedValue({});

    await expect(signup('a@example.com', 'Secret1!')).resolves.toEqual({
      success: true,
    });
    expect(firebase.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      firebase.auth,
      'a@example.com',
      'Secret1!'
    );
  });

  it('maps a Firebase failure to a user-facing message', async () => {
    firebase.createUserWithEmailAndPassword.mockRejectedValue(
      firebaseError('auth/email-already-in-use')
    );

    await expect(signup('a@example.com', 'Secret1!')).resolves.toEqual({
      success: false,
      error: 'This email is already registered. Try logging in instead.',
    });
  });
});

describe('login', () => {
  it('signs in through Firebase', async () => {
    firebase.signInWithEmailAndPassword.mockResolvedValue({});

    await expect(login('a@example.com', 'secret')).resolves.toEqual({
      success: true,
    });
    expect(firebase.signInWithEmailAndPassword).toHaveBeenCalledWith(
      firebase.auth,
      'a@example.com',
      'secret'
    );
  });

  it.each([
    ['auth/invalid-email', 'Invalid email address.'],
    ['auth/weak-password', 'Password is too weak. Use at least 6 characters.'],
    ['auth/user-not-found', 'No account found with this email.'],
    ['auth/wrong-password', 'Incorrect password.'],
    ['auth/invalid-credential', 'Invalid email or password.'],
    ['auth/too-many-requests', 'Too many login attempts. Try again later.'],
  ])('maps %s to its message', async (code, error) => {
    firebase.signInWithEmailAndPassword.mockRejectedValue(firebaseError(code));

    await expect(login('a@example.com', 'secret')).resolves.toEqual({
      success: false,
      error,
    });
  });

  it("uses the error's own message for unknown codes", async () => {
    firebase.signInWithEmailAndPassword.mockRejectedValue(
      firebaseError('auth/network-request-failed', 'Network down')
    );

    await expect(login('a@example.com', 'secret')).resolves.toMatchObject({
      error: 'Network down',
    });
  });

  it('uses a generic message for an unknown error without a message', async () => {
    firebase.signInWithEmailAndPassword.mockRejectedValue(
      firebaseError('auth/internal-error', '')
    );

    await expect(login('a@example.com', 'secret')).resolves.toMatchObject({
      error: 'An error occurred. Please try again.',
    });
  });

  it('handles non-Error rejections', async () => {
    firebase.signInWithEmailAndPassword.mockRejectedValue('boom');

    await expect(login('a@example.com', 'secret')).resolves.toEqual({
      success: false,
      error: 'An unexpected error occurred.',
    });
  });
});

describe('logout', () => {
  it('signs out of Firebase', async () => {
    firebase.signOut.mockResolvedValue(undefined);

    await expect(logout()).resolves.toEqual({ success: true });
    expect(firebase.signOut).toHaveBeenCalledWith(firebase.auth);
  });

  it('reports a failed sign-out', async () => {
    firebase.signOut.mockRejectedValue(new Error('Offline'));

    await expect(logout()).resolves.toEqual({
      success: false,
      error: 'Offline',
    });
  });
});

describe('googleSignIn', () => {
  it('signs in with a Google provider popup', async () => {
    firebase.signInWithPopup.mockResolvedValue({});

    await expect(googleSignIn()).resolves.toEqual({ success: true });
    expect(firebase.signInWithPopup).toHaveBeenCalledWith(
      firebase.auth,
      expect.any(firebase.GoogleAuthProvider)
    );
  });

  it('fails silently when the user closes the popup', async () => {
    firebase.signInWithPopup.mockRejectedValue(
      firebaseError('auth/popup-closed-by-user')
    );

    await expect(googleSignIn()).resolves.toEqual({
      success: false,
      error: '',
    });
  });

  it('reports other popup failures', async () => {
    firebase.signInWithPopup.mockRejectedValue(
      firebaseError('auth/too-many-requests')
    );

    await expect(googleSignIn()).resolves.toEqual({
      success: false,
      error: 'Too many login attempts. Try again later.',
    });
  });
});

describe('auth state', () => {
  it('subscribes to Firebase auth changes and returns the unsubscribe', () => {
    const unsubscribe = vi.fn();
    firebase.onAuthStateChanged.mockReturnValue(unsubscribe);
    const callback = vi.fn();

    expect(onUserStateChange(callback)).toBe(unsubscribe);
    expect(firebase.onAuthStateChanged).toHaveBeenCalledWith(
      firebase.auth,
      callback
    );
  });

  it("returns Firebase's current user", () => {
    expect(getCurrentUser()).toBe(firebase.auth.currentUser);
  });
});
