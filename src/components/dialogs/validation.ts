export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
    ? { isValid: true }
    : { isValid: false, error: 'Please enter a valid email address' };
}

// Username validation (registration only)
export function validateUsername(username: string): ValidationResult {
  if (!username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 2 || username.length > 30) {
    return { isValid: false, error: 'Username must be 2–30 characters long' };
  }

  const firstChar = username[0];
  if (!/[A-Z]/.test(firstChar)) {
    return {
      isValid: false,
      error: 'Username must start with an uppercase letter',
    };
  }

  const validCharsRegex = /^[A-Za-z0-9]+$/;
  return validCharsRegex.test(username)
    ? { isValid: true }
    : { isValid: false, error: 'Username may only contain letters and digits' };
}

// Password validation for registration (strict)
export function validateRegistrationPassword(
  password: string
): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one digit',
    };
  }

  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    ? { isValid: true }
    : {
        isValid: false,
        error: 'Password must contain at least one special character',
      };
}

// Password validation for login (lenient)
export function validateLoginPassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  return password.length < 6
    ? { isValid: false, error: 'Password must be at least 6 characters long' }
    : { isValid: true };
}

// Confirm password validation
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  return password === confirmPassword
    ? { isValid: true }
    : { isValid: false, error: 'Passwords do not match' };
}
