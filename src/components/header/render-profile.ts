import { AppSession } from '../../services/app-session';
import { getProfileName } from '../../utils/profile';
import {
  ProfileAvatar,
  ProfileAvatarConfig,
} from '../profile-avatar/profile-avatar';

// Fills `.<prefix>-name` (as text, never HTML) and `.<prefix>-avatar`
export function renderProfile(
  container: HTMLElement,
  session: AppSession,
  prefix: string,
  size: ProfileAvatarConfig['size']
): void {
  const name = getProfileName(session);

  const nameElement = container.querySelector<HTMLElement>(`.${prefix}-name`);
  if (nameElement) {
    nameElement.textContent = name;
    nameElement.title = name;
  }

  const avatarSlot = container.querySelector<HTMLElement>(`.${prefix}-avatar`);
  avatarSlot?.replaceChildren(
    ProfileAvatar({ name, avatarUrl: session.avatarUrl, size })
  );
}
