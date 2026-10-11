// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { ProfileAvatar } from './profile-avatar';

function colorClass(avatar: HTMLElement): string {
  return [...avatar.classList].find((name) =>
    name.startsWith('profile-avatar--color-')
  )!;
}

function colorForName(name: string): string {
  return colorClass(ProfileAvatar({ name }));
}

describe('ProfileAvatar', () => {
  it('labels the avatar with the name and defaults to medium size', () => {
    const avatar = ProfileAvatar({ name: 'Ana Lee' });

    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Ana Lee');
    expect(avatar.classList).toContain('profile-avatar--medium');
  });

  it('applies the requested size', () => {
    const avatar = ProfileAvatar({ name: 'Ana', size: 'small' });

    expect(avatar.classList).toContain('profile-avatar--small');
  });

  it('shows the initials without a photo', () => {
    const avatar = ProfileAvatar({ name: 'ana lee' });

    expect(avatar.querySelector('.profile-avatar-initials')?.textContent).toBe(
      'AL'
    );
    expect(avatar.querySelector('img')).toBeNull();
  });

  it('shows the generic icon when the name has no initials', () => {
    const avatar = ProfileAvatar({ name: '!!' });

    expect(avatar.querySelector('.profile-avatar-icon')).not.toBeNull();
    expect(avatar.querySelector('.profile-avatar-initials')).toBeNull();
  });

  it('shows the photo without sending a referrer', () => {
    const avatar = ProfileAvatar({
      name: 'Ana',
      avatarUrl: 'https://example.com/ana.png',
    });

    const photo = avatar.querySelector<HTMLImageElement>(
      '.profile-avatar-photo'
    );
    expect(photo?.src).toBe('https://example.com/ana.png');
    expect(photo?.referrerPolicy).toBe('no-referrer');
    expect(avatar.querySelector('.profile-avatar-initials')).toBeNull();
  });

  it('falls back to the initials when the photo fails to load', () => {
    const avatar = ProfileAvatar({
      name: 'Ana Lee',
      avatarUrl: 'https://example.com/broken.png',
    });

    avatar.querySelector('img')?.dispatchEvent(new Event('error'));

    expect(avatar.querySelector('.profile-avatar-photo')).toBeNull();
    expect(avatar.querySelector('.profile-avatar-initials')?.textContent).toBe(
      'AL'
    );
  });

  it('gives the same name the same color', () => {
    const first = ProfileAvatar({ name: 'Ana Lee' });
    const second = ProfileAvatar({ name: 'Ana Lee' });

    expect(colorClass(first)).toMatch(/^profile-avatar--color-[1-5]$/);
    expect(colorClass(second)).toBe(colorClass(first));
  });

  it('spreads different names across the color variants', () => {
    const names = ['Ana', 'Bob', 'Cleo', 'Dan', 'Eve', 'Finn', 'Gus', 'Hal'];
    const colors = new Set(names.map((name) => colorForName(name)));

    expect(colors.size).toBeGreaterThan(1);
  });
});
