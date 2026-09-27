import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { registerUser, loginUser, loginDemoUser } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

const AVATAR_OPTIONS = ['🎧', '⚡', '🎤', '🎵', '🎸', '🌙', '🐱', '🦊', '🚀', '🔥'];

const GENRE_TAGS = [
  'K-POP',
  '힙합 & R&B',
  '밴드 & 락',
  '발라드',
  '카페 로파이',
  '시티팝',
  '드라마 OST',
  '직캠 라이브',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🎧');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['K-POP', '카페 로파이']);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginUser(email, password);
      setIsSubmitting(false);

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || '로그인에 실패했습니다.');
      }
    }, 300);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim() || !nickname.trim()) {
      setErrorMessage('필수 항목(이메일, 닉네임, 비밀번호)을 모두 입력해주세요.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('비밀번호는 최소 4자 이상 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        email,
        password,
        nickname,
        avatar: selectedAvatar,
        favoriteGenres: selectedGenres,
      });
      setIsSubmitting(false);

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || '회원가입에 실패했습니다.');
      }
    }, 300);
  };

  const handleQuickDemoLogin = () => {
    const demo = loginDemoUser();
    onSuccess(demo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-red-600/15 filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-600/10 filter blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/30 mb-3">
            {mode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'ON:SOUND TUBE 로그인' : 'ON:SOUND 무료 회원가입'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? '로그인하여 나만의 음악 카테고리와 찜한 영상을 관리하세요'
              : '간편하게 가입하고 유튜브 음악 분류 및 시네마 감상을 즐기세요'}
          </p>
        </div>

        {/* Tab switch between Login and Signup */}
        <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                이메일 주소
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>로그인 상태 유지</span>
              </label>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-red-400 hover:text-red-300 font-semibold"
              >
                데모 계정 체험
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인하기</span>
                </>
              )}
            </button>

            {/* Quick 1-Click Demo Login Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/60 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>1초 데모 계정으로 바로 시작</span>
              </button>
            </div>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1 no-scrollbar">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                이메일 주소 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="사용할 이메일 입력"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="예: 뉴진스팬, 뮤직러버"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="4자 이상"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Profile Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                프로필 캐릭터 선택
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all shrink-0 cursor-pointer ${
                      selectedAvatar === emoji
                        ? 'bg-red-600/30 border-2 border-red-500 scale-110 shadow'
                        : 'bg-neutral-950 border border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Music Genres */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>선호 음악 취향 선택 (카테고리 추천에 반영)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GENRE_TAGS.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-red-600/20 text-red-300 border border-red-500/50'
                          : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-red-400" />}
                      <span>{genre}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>회원가입 완료 & 시작하기</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
