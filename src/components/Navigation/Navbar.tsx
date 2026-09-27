import React, { useRef, useEffect, useState } from 'react';
import {
  Search,
  Youtube,
  Tv,
  Heart,
  Flame,
  Radio,
  ListMusic,
  Compass,
  History,
  X,
  User,
  LogIn,
  LogOut,
  FolderHeart,
  Plus,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { UserProfile, UserCategory } from '../../types/auth';

interface NavbarProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onPerformSearch: (q: string) => void;
  likedCount: number;
  hasActiveTrack: boolean;
  isPlaying: boolean;
  onOpenCinemaStage: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  userCategories: UserCategory[];
  onOpenCreateCategory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onPerformSearch,
  likedCount,
  hasActiveTrack,
  isPlaying,
  onOpenCinemaStage,
  currentUser,
  onOpenAuth,
  onLogout,
  userCategories,
  onOpenCreateCategory,
}) => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut '/' to quickly focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'explore', label: '실시간 탐색', icon: Compass },
    { id: 'trending', label: '인기 MV', icon: Flame },
    { id: 'live', label: '라이브 직캠', icon: Radio },
    { id: 'mixes', label: '모음 플레이리스트', icon: ListMusic },
    { id: 'favorites', label: '내가 찜한 영상', icon: Heart, badge: likedCount },
    { id: 'history', label: '최근 기록', icon: History },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onPerformSearch(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/80 select-none">
      {/* Zone 1: Brand title & YouTube Engine Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onCategoryChange('explore')}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Youtube className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-white font-display">
                ON:SOUND
              </span>
              <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                TUBE
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
              YouTube Music Explorer
            </p>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links for YouTube Exploration */}
      <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-neutral-400">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onCategoryChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-neutral-800 text-white font-bold shadow-sm border border-neutral-700/60'
                  : 'hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive
                    ? 'text-red-500'
                    : item.id === 'trending'
                    ? 'text-amber-500'
                    : item.id === 'favorites'
                    ? 'text-rose-500'
                    : 'text-neutral-400'
                }`}
              />
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="ml-0.5 bg-red-600/30 text-red-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Search input, Cinema Stage Button & User Auth */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Instant Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="유튜브 음악, 직캠 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-36 sm:w-52 md:w-60 lg:w-64 bg-neutral-900/90 border border-neutral-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500/80 transition-all font-sans"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('explore');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 border border-neutral-800 rounded px-1 font-mono pointer-events-none">
              /
            </span>
          )}
        </form>

        {/* Cinema Stage Launcher */}
        <button
          onClick={onOpenCinemaStage}
          disabled={!hasActiveTrack}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md whitespace-nowrap cursor-pointer ${
            hasActiveTrack
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white shadow-red-600/30 hover:scale-105 active:scale-95'
              : 'bg-neutral-900 text-neutral-500 cursor-not-allowed border border-neutral-800'
          }`}
          title={hasActiveTrack ? '시네마 무대 모드로 전환' : '재생 중인 곡이 없습니다'}
        >
          <Tv className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">시네마</span>
          {isPlaying && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
          )}
        </button>

        {/* User Auth: Login / Profile Menu */}
        <div ref={profileMenuRef} className="relative">
          {currentUser ? (
            /* Logged in User Pill Button */
            <div>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white transition-all cursor-pointer"
              >
                <span className="text-sm">{currentUser.avatar || '🎧'}</span>
                <span className="text-xs font-bold max-w-[80px] sm:max-w-[110px] truncate hidden xs:inline">
                  {currentUser.nickname}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                  {/* User info card */}
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-lg">
                        {currentUser.avatar}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {currentUser.nickname}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    {/* Preferred genres */}
                    {currentUser.favoriteGenres && currentUser.favoriteGenres.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex flex-wrap gap-1">
                        {currentUser.favoriteGenres.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="text-[9px] bg-red-600/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-medium"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        onCategoryChange('favorites');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>내가 찜한 영상</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded-full">
                        {likedCount}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onCategoryChange('history');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-colors cursor-pointer"
                    >
                      <History className="w-4 h-4 text-cyan-400" />
                      <span>최근 감상 기록</span>
                    </button>

                    {/* User custom categories quick list */}
                    {userCategories.length > 0 && (
                      <div className="pt-1.5 pb-1 border-t border-neutral-800/70 mt-1">
                        <div className="px-2 pb-1 text-[10px] font-bold text-neutral-400 flex items-center justify-between">
                          <span>내 카테고리 목록</span>
                          <button
                            onClick={() => {
                              onOpenCreateCategory();
                              setIsProfileMenuOpen(false);
                            }}
                            className="text-red-400 hover:text-red-300 flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>추가</span>
                          </button>
                        </div>
                        {userCategories.slice(0, 4).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              onCategoryChange(`category-${c.id}`);
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer text-[11px]"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>{c.icon}</span>
                              <span className="truncate">{c.name}</span>
                            </div>
                            <span className="text-[9px] text-neutral-500 font-mono">
                              {c.trackIds.length}곡
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="pt-1 border-t border-neutral-800/80 mt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Login & Signup Buttons */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-red-500" />
                <span>로그인</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="hidden sm:flex px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer items-center gap-1"
              >
                <span>회원가입</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
