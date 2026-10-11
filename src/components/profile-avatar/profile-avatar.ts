import './profile-avatar.scss';
import personIcon from '../../assets/icons/person.svg';
import { getInitials } from '../../utils/profile';

export interface ProfileAvatarConfig {
  name: string;
  avatarUrl?: string;
  size?: 'small' | 'medium';
}

const COLOR_VARIANTS = 5;

// Same name always gets the same background color
function getColorVariant(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 1_000_003;
  }
  return (hash % COLOR_VARIANTS) + 1;
}

// Initials, or the generic person icon when the name has none
function renderFallback(avatar: HTMLElement, name: string) {
  const initials = getInitials(name);
  avatar.replaceChildren();

  if (initials) {
    const text = document.createElement('span');
    text.className = 'profile-avatar-initials';
    text.textContent = initials;
    avatar.append(text);
  } else {
    const icon = document.createElement('img');
    icon.className = 'profile-avatar-icon';
    icon.src = personIcon;
    icon.alt = '';
    avatar.append(icon);
  }
}

export function ProfileAvatar(config: ProfileAvatarConfig): HTMLElement {
  const { name, avatarUrl, size = 'medium' } = config;

  const avatar = document.createElement('span');
  avatar.className = `profile-avatar profile-avatar--${size} profile-avatar--color-${getColorVariant(name)}`;
  avatar.setAttribute('role', 'img');
  avatar.setAttribute('aria-label', name);

  if (!avatarUrl) {
    renderFallback(avatar, name);
    return avatar;
  }

  const photo = document.createElement('img');
  photo.className = 'profile-avatar-photo';
  photo.src = avatarUrl;
  photo.alt = '';
  // Google profile photos can reject requests that carry a referrer
  photo.referrerPolicy = 'no-referrer';
  photo.addEventListener('error', () => renderFallback(avatar, name), {
    once: true,
  });
  avatar.append(photo);

  return avatar;
}
