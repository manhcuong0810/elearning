export type AuthProvider = 'google' | 'email' | 'guest';

export interface ChildProfile {
  id: string;
  name: string;
  gradeLabel: string;
  avatarEmoji: string;
  pinIcons: string[];
  studyMinutesToday: number;
}

export const GUEST_CHILD_PROFILE: ChildProfile = {
  id: 'guest',
  name: 'Bé Học Thử',
  gradeLabel: 'Khách',
  avatarEmoji: '🎒',
  pinIcons: ['⭐', '🌟', '🚀', '🎈'],
  studyMinutesToday: 0,
};

export const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'child_1',
    name: 'Bé Bin',
    gradeLabel: 'Lớp 1A',
    avatarEmoji: '🦁',
    pinIcons: ['🍎', '⭐', '🦆', '🌈'],
    studyMinutesToday: 25,
  },
  {
    id: 'child_2',
    name: 'Bé Na',
    gradeLabel: 'Lớp 1B',
    avatarEmoji: '🐰',
    pinIcons: ['🍓', '🌸', '🐱', '⭐'],
    studyMinutesToday: 15,
  },
  {
    id: 'child_3',
    name: 'Bé Bống',
    gradeLabel: 'Lớp 1C',
    avatarEmoji: '🐼',
    pinIcons: ['⚽', '🚀', '🐶', '🍕'],
    studyMinutesToday: 10,
  },
];

export interface ParentUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  provider: AuthProvider;
  children: ChildProfile[];
  createdAt: string;
}

export interface GoogleAuthPayload {
  email: string;
  fullName: string;
  avatarUrl?: string;
  initialChildren?: ChildProfile[];
}

export interface AuthState {
  user: ParentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: (payload?: GoogleAuthPayload) => Promise<ParentUser>;
  loginWithEmail: (email: string, password: string) => Promise<ParentUser>;
  registerWithEmail: (
    fullName: string,
    email: string,
    password: string,
    initialChildName?: string
  ) => Promise<ParentUser>;
  addChildProfile: (child: Omit<ChildProfile, 'id' | 'studyMinutesToday'>) => ChildProfile;
  logout: () => void;
  clearError: () => void;
}
