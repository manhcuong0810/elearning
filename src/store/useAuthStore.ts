import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, ParentUser } from '@/types/auth';

const STORAGE_KEY = 'elearning-parent-auth-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      loginWithGoogle: async (): Promise<ParentUser> => {
        set({ isLoading: true, error: null });
        try {
          // Simulate Google OAuth response
          const googleUser: ParentUser = {
            id: 'google_parent_1',
            email: 'parent.lananh@gmail.com',
            fullName: 'Mẹ Lan Anh',
            avatarUrl: '👩‍👧',
            provider: 'google',
            createdAt: new Date().toISOString(),
          };

          set({
            user: googleUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return googleUser;
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : 'Đăng nhập Google không thành công';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      loginWithEmail: async (
        email: string,
        password: string
      ): Promise<ParentUser> => {
        set({ isLoading: true, error: null });

        // Basic validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          const err = new Error('Email không hợp lệ. Vui lòng kiểm tra lại!');
          set({ isLoading: false, error: err.message });
          throw err;
        }

        if (!password || password.length < 6) {
          const err = new Error('Mật khẩu phải có ít nhất 6 ký tự!');
          set({ isLoading: false, error: err.message });
          throw err;
        }

        const emailUser: ParentUser = {
          id: `email_${Date.now()}`,
          email,
          fullName: email.split('@')[0],
          avatarUrl: '👨‍👩‍👧',
          provider: 'email',
          createdAt: new Date().toISOString(),
        };

        set({
          user: emailUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return emailUser;
      },

      registerWithEmail: async (
        fullName: string,
        email: string,
        password: string
      ): Promise<ParentUser> => {
        set({ isLoading: true, error: null });

        if (!fullName || fullName.trim().length < 2) {
          const err = new Error('Vui lòng nhập họ và tên phụ huynh!');
          set({ isLoading: false, error: err.message });
          throw err;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          const err = new Error('Email không hợp lệ. Vui lòng kiểm tra lại!');
          set({ isLoading: false, error: err.message });
          throw err;
        }

        if (!password || password.length < 6) {
          const err = new Error('Mật khẩu phải có ít nhất 6 ký tự!');
          set({ isLoading: false, error: err.message });
          throw err;
        }

        const newUser: ParentUser = {
          id: `user_${Date.now()}`,
          fullName: fullName.trim(),
          email,
          avatarUrl: '👨‍👩‍👧',
          provider: 'email',
          createdAt: new Date().toISOString(),
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return newUser;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
