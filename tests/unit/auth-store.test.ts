import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    useAuthStore.getState().clearError();
  });

  it('starts unauthenticated in guest mode', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('authenticates successfully via loginWithGoogle', async () => {
    const user = await useAuthStore.getState().loginWithGoogle();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toContain('@gmail.com');
    expect(state.user?.provider).toBe('google');
    expect(user.fullName).toBeDefined();
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
});
