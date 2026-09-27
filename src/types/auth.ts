export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  avatarColor?: string;
  favoriteGenres: string[];
  createdAt: string;
}

export interface UserCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  trackIds: string[];
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  categories: UserCategory[];
}
