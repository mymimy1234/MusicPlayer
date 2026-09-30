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
  Disc,
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
  onOpenDiscPlayer?: () => void;
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
  onOpenDiscPlayer,
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
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.06] select-none">
      {/* Zone 1: Brand Wordmark & Architectural Hi-Fi Emblem */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onCategoryChange('explore')}
          className="group flex items-center gap-3 hover:opacity-95 transition-all shrink-0 text-left cursor-pointer"
        >
          {/* Architectural Hi-Fi Vinyl & Sound Wave Emblem */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e1e28] via-[#121217] to-[#09090c] p-[1.5px] shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.18)] group-hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] transition-all">
            <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-[#181820] to-[#0b0b0e] border border-amber-400/30 group-hover:border-amber-400/60 transition-colors flex items-center justify-center overflow-hidden relative">
              {/* Subtle radial glow inside badge */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(245,158,11,0.25)_0%,transparent_75%)] pointer-events-none" />

              {/* Vector Vinyl & Waveform Art */}
              <svg
                viewBox="0 0 32 32"
                className={`w-5 h-5 transition-transform duration-700 ease-out ${
                  isPlaying ? 'animate-[spin_6s_linear_infinite]' : 'group-hover:rotate-45'
                }`}
                fill="none"
              >
                {/* Concentric Vinyl Grooves */}
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.8" className="text-white/10" />
                <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="0.8" className="text-white/15" />
                <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="0.8" className="text-white/20" />

                {/* Stylized Golden Sound Arc Wave */}
                <path
                  d="M16 4 A12 12 0 0 1 28 16"
                  stroke="url(#navbar-logo-gold)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 28 A12 12 0 0 1 4 16"
                  stroke="url(#navbar-logo-gold)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                />

                {/* Center Brass Spindle & Core */}
                <circle cx="16" cy="16" r="3.5" fill="#f59e0b" />
                <circle cx="16" cy="16" r="1.5" fill="#09090b" />

                <defs>
                  <linearGradient id="navbar-logo-gold" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fde047" />
                    <stop offset="0.5" stopColor="#f59e0b" />
                    <stop offset="1" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Live Audio indicator dot */}
              {isPlaying && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
              )}
            </div>
          </div>

          {/* Sophisticated Wordmark & Hierarchy */}
          <div className="flex flex-col">
            <div className="flex items-center tracking-tight leading-none">
              <span className="font-extrabold text-[17px] text-white tracking-wider font-display">
                ON
              </span>
              <span className="mx-[2px] flex flex-col gap-[3px] items-center justify-center px-0.5">
                <span className="w-[3px] h-[3px] rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <span className="w-[3px] h-[3px] rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
              </span>
              <span className="font-extrabold text-[17px] bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent tracking-widest font-display">
                SOUND
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[8px] font-mono tracking-[0.25em] text-neutral-400 uppercase font-medium">
                STUDIO HI-FI
              </span>
              <span className="w-1 h-1 rounded-full bg-amber-400/60" />
              <span className="text-[8px] font-mono tracking-widest text-amber-400/90 font-semibold">
                33⅓ RPM
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: Clean Typography Navigation Links */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-medium">
        {navItems.map((item) => {
          const isActive = currentCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onCategoryChange(item.id)}
              className={`transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="ml-1 text-[11px] font-mono text-neutral-500 tabular-nums">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="음악, 아티스트, 직캠 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-36 sm:w-52 md:w-60 lg:w-64 bg-white/[0.04] border border-white/[0.08] focus:border-white/25 rounded-lg pl-8 pr-7 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all font-sans"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('explore');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 border border-white/[0.06] rounded px-1 font-mono pointer-events-none">
              /
            </span>
          )}
        </form>

        {/* DiscPlayer Launcher */}
        {onOpenDiscPlayer && (
          <button
            onClick={onOpenDiscPlayer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              isPlaying
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-white/[0.03] text-neutral-400 border-white/[0.06] hover:text-neutral-200 hover:bg-white/[0.06]'
            }`}
            title="바이닐 턴테이블 모드"
          >
            <Disc className={`w-3.5 h-3.5 ${isPlaying ? 'text-rose-400 animate-spin' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">LP 모드</span>
          </button>
        )}

        {/* Cinema Stage Launcher */}
        <button
          onClick={onOpenCinemaStage}
          disabled={!hasActiveTrack}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
            hasActiveTrack
              ? 'bg-white/[0.03] text-neutral-300 border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
              : 'bg-white/[0.01] text-neutral-600 border-white/[0.04] cursor-not-allowed'
          }`}
          title={hasActiveTrack ? '시네마 무대 모드로 전환' : '재생 중인 곡이 없습니다'}
        >
          <Tv className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">시네마</span>
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
