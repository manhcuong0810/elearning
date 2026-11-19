export type AuthProvider = 'google' | 'email' | 'guest';

export interface ParentUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: string;
}

export interface AuthState {
  user: ParentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<ParentUser>;
  loginWithEmail: (email: string, password: string) => Promise<ParentUser>;
  registerWithEmail: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<ParentUser>;
  logout: () => void;
  clearError: () => void;
}
