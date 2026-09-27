import { UserProfile, UserCategory } from '../types/auth';

const STORAGE_USERS_KEY = 'onsound_registered_users';
const STORAGE_CURRENT_USER_KEY = 'onsound_session_user';
const STORAGE_USER_CATEGORIES_KEY = 'onsound_user_categories';

// Initial default categories for users to explore category classification
export const DEFAULT_USER_CATEGORIES: UserCategory[] = [
  {
    id: 'cat-night-vibe',
    name: '새벽 감성 힐링곡',
    icon: '🌙',
    color: '#818cf8',
    description: '조용하고 감성적인 밤과 새벽에 지친 마음을 다정하게 위로해주는 힐링 플레이리스트',
    trackIds: [
      'yt-iu-night-letter',
      'yt-paulkim-every-day',
      'yt-yerin-here-i-am',
      'yt-jukjae-stars',
      'yt-taeyeon-four-seasons',
      'yt-sung-every-moment',
      'yt-iu-love-wins-all',
      'yt-newjeans-ditto',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-drive-hype',
    name: '신나는 드라이브 믹스',
    icon: '🚗',
    color: '#f43f5e',
    description: '텐션 폭발! 고속도로 질주하며 시원하게 따라부르는 K-POP & 밴드 명곡',
    trackIds: [
      'yt-lesserafim-perfect-night',
      'yt-aespa-supernova',
      'yt-day6-welcome',
      'yt-twice-talk-that-talk',
      'yt-newjeans-hype-boy',
      'yt-gidle-queencard',
      'yt-seventeen-super',
      'yt-bts-dynamite',
      'yt-ive-i-am',
      'yt-nmixx-dash',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-study-focus',
    name: '집중 & 코딩 노동요',
    icon: '💻',
    color: '#10b981',
    description: '개발자 몰입도 200%! 잡념을 비우고 클린 코드를 완성하는 로파이 & 신스웨이브 비트',
    trackIds: [
      'yt-lofigirl-study-1am',
      'yt-synthwave-cyberpunk-dev',
      'yt-coding-flow-rain',
      'yt-ghibli-piano-coding',
      'yt-deep-focus-programming',
      'yt-peppertones-good-luck',
      'yt-cafe-lofi',
    ],
    createdAt: new Date().toISOString(),
  },
];

export interface StoredUserAccount {
  profile: UserProfile;
  passwordHash: string;
}

export function getRegisteredUsers(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function registerUser(params: {
  email: string;
  password: string;
  nickname: string;
  avatar: string;
  favoriteGenres: string[];
}): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();
  const emailLower = params.email.trim().toLowerCase();

  if (users.some((u) => u.profile.email.toLowerCase() === emailLower)) {
    return { success: false, error: '이미 가입된 이메일 주소입니다.' };
  }

  const newProfile: UserProfile = {
    id: 'user-' + Date.now(),
    email: emailLower,
    nickname: params.nickname.trim() || '음악 애호가',
    avatar: params.avatar || '🎧',
    favoriteGenres: params.favoriteGenres.length ? params.favoriteGenres : ['K-POP', '로파이'],
    createdAt: new Date().toISOString(),
  };

  const newAccount: StoredUserAccount = {
    profile: newProfile,
    passwordHash: btoa(params.password), // simple client encoding
  };

  users.push(newAccount);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newProfile));

  // Initialize categories for user
  const categories = getUserCategories(newProfile.id);
  if (categories.length === 0) {
    saveUserCategories(newProfile.id, DEFAULT_USER_CATEGORIES);
  }

  return { success: true, user: newProfile };
}

export function loginUser(
  email: string,
  password: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();
  const emailLower = email.trim().toLowerCase();

  const account = users.find((u) => u.profile.email.toLowerCase() === emailLower);
  if (!account) {
    return { success: false, error: '등록되지 않은 이메일 계정입니다.' };
  }

  if (account.passwordHash !== btoa(password)) {
    return { success: false, error: '비밀번호가 올바르지 않습니다.' };
  }

  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(account.profile));
  return { success: true, user: account.profile };
}

export function loginDemoUser(): UserProfile {
  const demoProfile: UserProfile = {
    id: 'user-demo-vip',
    email: 'demo@onsound.kr',
    nickname: '온사운드 VIP',
    avatar: '⚡',
    avatarColor: 'from-amber-500 to-red-500',
    favoriteGenres: ['K-POP', '힙합 & R&B', '시티팝'],
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(demoProfile));

  // Seed default categories if not present
  const existing = getUserCategories(demoProfile.id);
  if (existing.length === 0) {
    saveUserCategories(demoProfile.id, DEFAULT_USER_CATEGORIES);
  }

  return demoProfile;
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
}

// User-defined categories storage
export function getUserCategories(userId: string): UserCategory[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_USER_CATEGORIES_KEY}_${userId}`);
    if (!raw) {
      return DEFAULT_USER_CATEGORIES;
    }
    const parsed: UserCategory[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_USER_CATEGORIES;
    }

    // Merge new default tracks into preset categories if they have missing tracks
    const updated = parsed.map((cat) => {
      const defaultCat = DEFAULT_USER_CATEGORIES.find((d) => d.id === cat.id);
      if (defaultCat) {
        const mergedTrackIds = Array.from(new Set([...cat.trackIds, ...defaultCat.trackIds]));
        return {
          ...defaultCat,
          ...cat,
          trackIds: mergedTrackIds,
        };
      }
      return cat;
    });

    // Ensure all 3 default categories are present
    for (const d of DEFAULT_USER_CATEGORIES) {
      if (!updated.some((c) => c.id === d.id)) {
        updated.push(d);
      }
    }

    return updated;
  } catch (e) {
    return DEFAULT_USER_CATEGORIES;
  }
}

export function saveUserCategories(userId: string, categories: UserCategory[]): void {
  localStorage.setItem(`${STORAGE_USER_CATEGORIES_KEY}_${userId}`, JSON.stringify(categories));
}
