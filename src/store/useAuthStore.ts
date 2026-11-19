import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProgressStore } from '@/store/useProgressStore';
import {
  AuthState,
  ParentUser,
  GoogleAuthPayload,
  ChildProfile,
  DEFAULT_CHILDREN,
} from '@/types/auth';

const STORAGE_KEY = 'elearning-parent-auth-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      loginWithGoogle: async (
        payload?: GoogleAuthPayload
      ): Promise<ParentUser> => {
        set({ isLoading: true, error: null });
        try {
          const email = payload?.email?.trim() || 'phuhuynh@gmail.com';
          const fullName = payload?.fullName?.trim() || 'Phụ Huynh';

          const googleUser: ParentUser = {
            id: `google_${Date.now()}`,
            email,
            fullName,
            avatarUrl: payload?.avatarUrl || '👩‍👧',
            provider: 'google',
            children: payload?.initialChildren || [],
            createdAt: new Date().toISOString(),
          };

          set({
            user: googleUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          if (googleUser.children && googleUser.children.length > 0) {
            useProgressStore.getState().loadChildProgress(googleUser.children[0].id);
          }

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
          children: [],
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
        password: string,
        initialChildName?: string
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

        const initialChildren: ChildProfile[] = initialChildName
          ? [
              {
                id: `child_${Date.now()}`,
                name: initialChildName.trim(),
                gradeLabel: 'Lớp 1',
                avatarEmoji: '🦁',
                pinIcons: ['🍎', '⭐', '🦆', '🌈'],
                studyMinutesToday: 0,
              },
            ]
          : [];

        const newUser: ParentUser = {
          id: `user_${Date.now()}`,
          fullName: fullName.trim(),
          email,
          avatarUrl: '👨‍👩‍👧',
          provider: 'email',
          children: initialChildren,
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

      addChildProfile: (childData) => {
        const currentUser = get().user;
        const newChild: ChildProfile = {
          ...childData,
          id: `child_${Date.now()}`,
          studyMinutesToday: 0,
        };

        if (currentUser) {
          const updatedChildren = [...(currentUser.children || []), newChild];
          set({
            user: {
              ...currentUser,
              children: updatedChildren,
            },
          });
          if (updatedChildren.length === 1) {
            useProgressStore.getState().loadChildProgress(newChild.id);
          }
        }

        return newChild;
      },

      logout: () => {
        useProgressStore.getState().reset();
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
