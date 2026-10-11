import { describe, expect, it } from 'vitest';
import {
  validateConfirmPassword,
  validateEmail,
  validateLoginPassword,
  validateRegistrationPassword,
  validateUsername,
} from './validation';

describe('validateEmail', () => {
  it('accepts a well-formed address', () => {
    expect(validateEmail('player@example.com')).toEqual({ isValid: true });
  });

  it.each(['', ' '.repeat(3)])('requires a non-blank value (%j)', (email) => {
    expect(validateEmail(email)).toEqual({
      isValid: false,
      error: 'Email is required',
    });
  });

  it.each(['player', 'player@example', '@example.com', 'pla yer@example.com'])(
    'rejects a malformed address (%s)',
    (email) => {
      expect(validateEmail(email)).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
    }
  );
});

describe('validateUsername', () => {
  it.each(['Ab', 'Player1', 'A'.repeat(30)])(
    'accepts a valid username (%s)',
    (username) => {
      expect(validateUsername(username)).toEqual({ isValid: true });
    }
  );

  it.each(['', '  '])('requires a non-blank value (%j)', (username) => {
    expect(validateUsername(username).error).toBe('Username is required');
  });

  it.each(['A', 'A'.repeat(31)])(
    'enforces the 2–30 length range (%s)',
    (username) => {
      expect(validateUsername(username).error).toBe(
        'Username must be 2–30 characters long'
      );
    }
  );

  it.each(['player', '1Player'])(
    'requires an uppercase first letter (%s)',
    (username) => {
      expect(validateUsername(username).error).toBe(
        'Username must start with an uppercase letter'
      );
    }
  );

  it.each(['Player_1', 'Play er', 'Plàyer'])(
    'allows only letters and digits (%s)',
    (username) => {
      expect(validateUsername(username).error).toBe(
        'Username may only contain letters and digits'
      );
    }
  );
});

describe('validateRegistrationPassword', () => {
  it('accepts a password meeting every rule', () => {
    expect(validateRegistrationPassword('Secret1!')).toEqual({ isValid: true });
  });

  it.each([
    ['', 'Password is required'],
    ['Ab1!', 'Password must be at least 6 characters long'],
    ['secret1!', 'Password must contain at least one uppercase letter'],
    ['Secret!!', 'Password must contain at least one digit'],
    ['Secret12', 'Password must contain at least one special character'],
  ])('rejects %j with the matching rule', (password, error) => {
    expect(validateRegistrationPassword(password)).toEqual({
      isValid: false,
      error,
    });
  });
});

describe('validateLoginPassword', () => {
  it('accepts any password of 6+ characters without strength rules', () => {
    expect(validateLoginPassword('simple')).toEqual({ isValid: true });
  });

  it('requires a password', () => {
    expect(validateLoginPassword('').error).toBe('Password is required');
  });

  it('rejects passwords shorter than 6 characters', () => {
    expect(validateLoginPassword('short').error).toBe(
      'Password must be at least 6 characters long'
    );
  });
});

describe('validateConfirmPassword', () => {
  it('accepts a matching confirmation', () => {
    expect(validateConfirmPassword('Secret1!', 'Secret1!')).toEqual({
      isValid: true,
    });
  });

  it('requires the confirmation', () => {
    expect(validateConfirmPassword('Secret1!', '').error).toBe(
      'Please confirm your password'
    );
  });

  it('rejects a mismatching confirmation', () => {
    expect(validateConfirmPassword('Secret1!', 'Secret2!').error).toBe(
      'Passwords do not match'
    );
  });
});
