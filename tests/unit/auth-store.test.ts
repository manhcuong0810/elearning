import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    useAuthStore.getState().logout();
    useAuthStore.getState().clearError();
  });

  it('starts unauthenticated in guest mode', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('authenticates successfully via loginWithGoogle with custom payload', async () => {
    const user = await useAuthStore.getState().loginWithGoogle({
      email: 'ba.nam@gmail.com',
      fullName: 'Ba Nam',
    });
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('ba.nam@gmail.com');
    expect(state.user?.fullName).toBe('Ba Nam');
    expect(state.user?.provider).toBe('google');
    expect(state.user?.children).toEqual([]);
  });

  it('allows adding a new child profile to parent account', async () => {
    await useAuthStore.getState().loginWithGoogle({
      email: 'ba.nam@gmail.com',
      fullName: 'Ba Nam',
    });

    const newChild = useAuthStore.getState().addChildProfile({
      name: 'Bé Tít',
      gradeLabel: 'Lớp 1',
      avatarEmoji: '🐼',
      pinIcons: ['🍎', '🚀', '⭐', '🎈'],
    });

    expect(newChild.id).toBeDefined();
    expect(newChild.name).toBe('Bé Tít');
    const state = useAuthStore.getState();
    expect(state.user?.children.some((c) => c.name === 'Bé Tít')).toBe(true);
  });

  it('registers and logs in via registerWithEmail', async () => {
    const user = await useAuthStore
      .getState()
      .registerWithEmail('Mẹ Bống', 'mebong@gmail.com', 'matkhau123');
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.fullName).toBe('Mẹ Bống');
    expect(state.user?.email).toBe('mebong@gmail.com');
    expect(state.user?.provider).toBe('email');
  });

  it('logs out and resets user state', async () => {
    await useAuthStore.getState().loginWithGoogle();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('rejects invalid email or short password', async () => {
    await expect(
      useAuthStore.getState().loginWithEmail('invalid-email', '123')
    ).rejects.toThrow();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('persists and restores created children profiles when logging in again with Google', async () => {
    // 1. First login with Google
    const user1 = await useAuthStore.getState().loginWithGoogle({
      email: 'me.lan@gmail.com',
      fullName: 'Mẹ Lan',
    });
    expect(user1.children).toEqual([]);

    // 2. Add children profiles
    const child1 = useAuthStore.getState().addChildProfile({
      name: 'Bé Bắp',
      gradeLabel: 'Lớp 1',
      avatarEmoji: '🐼',
      pinIcons: ['🍎', '🚀', '⭐', '🎈'],
    });
    const child2 = useAuthStore.getState().addChildProfile({
      name: 'Bé Sóc',
      gradeLabel: 'Lớp 2',
      avatarEmoji: '🦁',
      pinIcons: ['🍎', '⭐', '🦆', '🌈'],
    });

    expect(useAuthStore.getState().user?.children.length).toBe(2);

    // 3. Log out
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();

    // 4. Log in again with the SAME Google email
    const user2 = await useAuthStore.getState().loginWithGoogle({
      email: 'me.lan@gmail.com',
      fullName: 'Mẹ Lan',
    });

    // 5. Must retain the original user ID and both child profiles!
    expect(user2.id).toBe(user1.id);
    expect(user2.children.length).toBe(2);
    expect(user2.children[0].name).toBe('Bé Bắp');
    expect(user2.children[1].name).toBe('Bé Sóc');
    expect(useAuthStore.getState().user?.children.length).toBe(2);
  });

  it('persists and restores created children profiles when logging in again with Email', async () => {
    // 1. Register with email
    const regUser = await useAuthStore
      .getState()
      .registerWithEmail('Bố Huy', 'bohuy@gmail.com', 'matkhau123', 'Bé Bo');
    expect(regUser.children.length).toBe(1);

    // 2. Log out
    useAuthStore.getState().logout();

    // 3. Login with email
    const loginUser = await useAuthStore
      .getState()
      .loginWithEmail('bohuy@gmail.com', 'matkhau123');

    // 4. Must retain children profiles
    expect(loginUser.children.length).toBe(1);
    expect(loginUser.children[0].name).toBe('Bé Bo');
  });
});
