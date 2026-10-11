export const FALLBACK_PROFILE_NAME = 'Player';

interface ProfileSource {
  displayName?: string;
  email?: string;
}

const ALPHANUMERIC = /[\p{L}\p{N}]/u;

// displayName, else the email part before '@', else a generic name
export function getProfileName({ displayName, email }: ProfileSource): string {
  return (
    displayName?.trim() ||
    email?.split('@', 1)[0]?.trim() ||
    FALLBACK_PROFILE_NAME
  );
}

// First non-whitespace character, uppercased. Array.from keeps characters
// outside the BMP (e.g. emoji) whole. '?' when the name is blank.
export function getFirstInitial(name: string): string {
  const [first] = [...name.trim()];
  return first ? first.toLocaleUpperCase() : '?';
}

// First letter or digit of the first one or two words, uppercased.
// Returns '' when none is found so the caller shows the generic avatar.
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/u).filter(Boolean).slice(0, 2);

  return words
    .map((word) => ALPHANUMERIC.exec(word)?.[0] ?? '')
    .join('')
    .toLocaleUpperCase();
}
