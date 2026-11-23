import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProgressStore } from '@/store/useProgressStore';
import {
  AuthState,
  ParentUser,
  GoogleAuthPayload,
  ChildProfile,
} from '@/types/auth';

const STORAGE_KEY = 'elearning-parent-auth-storage';
const ACCOUNTS_REGISTRY_KEY = 'elearning-accounts-registry';

function getAccountsRegistry(): Record<string, ParentUser> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // Ignore storage parse error
  }
  return {};
}

function saveAccountToRegistry(user: ParentUser): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const registry = getAccountsRegistry();
      const normalizedEmail = user.email.toLowerCase().trim();
      registry[normalizedEmail] = user;
      window.localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(registry));
    }
  } catch {
    // Ignore storage write error
  }
}

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
          const normalizedEmail = email.toLowerCase();

          const registry = getAccountsRegistry();
          const existingAccount = registry[normalizedEmail];

          let googleUser: ParentUser;
          if (existingAccount) {
            // Restore existing parent account and preserve all previously created child profiles!
            googleUser = {
              ...existingAccount,
              fullName: payload?.fullName?.trim() || existingAccount.fullName,
              avatarUrl: payload?.avatarUrl || existingAccount.avatarUrl,
              children: existingAccount.children || [],
            };
          } else {
            googleUser = {
              id: `google_${Date.now()}`,
              email,
              fullName,
              avatarUrl: payload?.avatarUrl || '👩‍👧',
              provider: 'google',
              children: payload?.initialChildren || [],
              createdAt: new Date().toISOString(),
            };
          }

          saveAccountToRegistry(googleUser);

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

        const normalizedEmail = email.toLowerCase().trim();
        const registry = getAccountsRegistry();
        const existingAccount = registry[normalizedEmail];

        let emailUser: ParentUser;
        if (existingAccount) {
          emailUser = {
            ...existingAccount,
            children: existingAccount.children || [],
          };
        } else {
          emailUser = {
            id: `email_${Date.now()}`,
            email: normalizedEmail,
            fullName: email.split('@')[0],
            avatarUrl: '👨‍👩‍👧',
            provider: 'email',
            children: [],
            createdAt: new Date().toISOString(),
          };
        }

        saveAccountToRegistry(emailUser);

        set({
          user: emailUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        if (emailUser.children && emailUser.children.length > 0) {
          useProgressStore.getState().loadChildProgress(emailUser.children[0].id);
        }

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

        const normalizedEmail = email.toLowerCase().trim();
        const registry = getAccountsRegistry();
        const existingAccount = registry[normalizedEmail];

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
          : existingAccount?.children || [];

        const newUser: ParentUser = {
          id: existingAccount?.id || `user_${Date.now()}`,
          fullName: fullName.trim(),
          email: normalizedEmail,
          avatarUrl: '👨‍👩‍👧',
          provider: 'email',
          children: initialChildren,
          createdAt: existingAccount?.createdAt || new Date().toISOString(),
        };

        saveAccountToRegistry(newUser);

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        if (newUser.children && newUser.children.length > 0) {
          useProgressStore.getState().loadChildProgress(newUser.children[0].id);
        }

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
          const updatedUser: ParentUser = {
            ...currentUser,
            children: updatedChildren,
          };

          saveAccountToRegistry(updatedUser);

          set({
            user: updatedUser,
          });
          if (updatedChildren.length === 1) {
            useProgressStore.getState().loadChildProgress(newChild.id);
          }
        }

        return newChild;
      },

      addStudyMinutesToChild: (childId: string, minutes: number) => {
        const currentUser = get().user;
        if (!currentUser || !currentUser.children) return;

        const updatedChildren = currentUser.children.map((child) => {
          if (child.id === childId) {
            return {
              ...child,
              studyMinutesToday: Math.max(0, (child.studyMinutesToday || 0) + minutes),
            };
          }
          return child;
        });

        const updatedUser: ParentUser = {
          ...currentUser,
          children: updatedChildren,
        };

        saveAccountToRegistry(updatedUser);

        set({
          user: updatedUser,
        });
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
