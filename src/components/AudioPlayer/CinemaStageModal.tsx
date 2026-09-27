import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../../types/music';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Tv,
  Sparkles,
  Flame,
  Radio,
  ExternalLink,
  Sliders,
  ListMusic,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Visualizer } from './Visualizer';

interface CinemaStageModalProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLiked: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleLike: (trackId: string) => void;
  recommendations?: Track[];
  onSelectTrack: (track: Track) => void;
}

type LightingMood = 'cyber' | 'sunset' | 'deep_space' | 'cinema';

interface ReactionBubble {
  id: number;
  emoji: string;
  x: number;
}

export const CinemaStageModal: React.FC<CinemaStageModalProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  isLiked,
  onClose,
  onPlayPause,
  onSeek,
  onPrev,
  onNext,
  onToggleLike,
  recommendations = [],
  onSelectTrack,
}) => {
  const [mood, setMood] = useState<LightingMood>('cyber');
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [screenMode, setScreenMode] = useState<'standard' | 'wide' | 'theater'>('wide');
  const [showDrawer, setShowDrawer] = useState(false);
  const [soundMode, setSoundMode] = useState<'studio' | 'bass' | 'stadium' | 'lofi'>('studio');
  const [reactions, setReactions] = useState<ReactionBubble[]>([]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Find active lyric if available
  const activeLyric = track.lyrics.find(
    (l, idx) =>
      currentTime >= l.time &&
      (idx === track.lyrics.length - 1 || currentTime < track.lyrics[idx + 1].time)
  );

  // Trigger floating reaction emoji
  const triggerReaction = (emoji: string) => {
    const newBubble: ReactionBubble = {
      id: Date.now() + Math.random(),
      emoji,
      x: 60 + Math.random() * 30, // percentage from left
    };
    setReactions((prev) => [...prev.slice(-15), newBubble]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newBubble.id));
    }, 2800);
  };

  // Ambient lighting gradient classes
  const getAmbientGradient = () => {
    switch (mood) {
      case 'cyber':
        return 'from-cyan-600/30 via-fuchsia-600/25 to-blue-600/30';
      case 'sunset':
        return 'from-amber-600/30 via-rose-600/25 to-purple-600/30';
      case 'deep_space':
        return 'from-indigo-600/30 via-violet-600/25 to-sky-600/30';
      case 'cinema':
        return 'from-amber-500/10 via-neutral-800/20 to-neutral-900/30';
    }
  };

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        onPlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPlayPause]);

  const videoId = track.youtubeId;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between transition-colors duration-700 select-none overflow-hidden ${
        isLightsOff ? 'bg-black' : 'bg-neutral-950/95 backdrop-blur-xl'
      }`}
    >
      {/* Dynamic Stage Ambilight Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${getAmbientGradient()} filter blur-[120px] pointer-events-none transition-all duration-1000 opacity-80 ${
          isLightsOff ? 'opacity-40 scale-95' : 'opacity-80 scale-100'
        }`}
      />

      {/* Floating Animated Reaction Emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%` }}
            className="absolute bottom-24 text-3xl animate-bounce duration-1000 select-none drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-in slide-in-from-bottom-20 fade-out-0"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Floating Control Bar */}
      <header
        className={`relative z-20 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
          isLightsOff ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors shadow-lg active:scale-95"
          >
            <X className="w-4 h-4" />
            <span className="text-xs font-semibold">무대 나가기</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-extrabold tracking-wider text-red-400 font-display">
              ON:SOUND CINEMA STAGE
            </span>
          </div>
        </div>

        {/* Center: Mood & Lights Toggles */}
        <div className="flex items-center gap-2">
          {/* Lights Off toggle */}
          <button
            onClick={() => setIsLightsOff(!isLightsOff)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isLightsOff
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
            title="조명 끄기 (영상에만 집중)"
          >
            {isLightsOff ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isLightsOff ? '조명 켜기' : '조명 끄기'}</span>
          </button>

          {/* Ambilight Mood selector */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px]">
            <span className="text-neutral-500 px-2 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> 무대 조명:
            </span>
            <button
              onClick={() => setMood('cyber')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                mood === 'cyber' ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              사이버
            </button>
            <button
              onClick={() => setMood('sunset')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                mood === 'sunset' ? 'bg-rose-500/20 text-rose-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              선셋
            </button>
            <button
              onClick={() => setMood('deep_space')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                mood === 'deep_space' ? 'bg-indigo-500/20 text-indigo-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              스페이스
            </button>
            <button
              onClick={() => setMood('cinema')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                mood === 'cinema' ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              시네마
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {videoId && (
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              title="YouTube 원본에서 열기"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showDrawer
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-neutral-900/80 text-neutral-300 hover:text-white border-neutral-800'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span className="hidden sm:inline">추천 노래</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-2 overflow-hidden">
        {/* Screen Container with Glow & Reflection */}
        <div
          className={`relative transition-all duration-500 flex flex-col items-center ${
            screenMode === 'theater'
              ? 'w-full max-w-6xl'
              : screenMode === 'wide'
              ? 'w-full max-w-5xl'
              : 'w-full max-w-4xl'
          }`}
        >
          {/* Glowing Ambient Behind Screen */}
          <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 via-indigo-600/30 to-purple-600/30 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

          {/* Screen Frame */}
          <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-neutral-800/80 bg-black">
            {videoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(
                  window.location.origin
                )}`}
                title={track.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-950">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-48 h-48 rounded-2xl object-cover shadow-2xl mb-4 border border-neutral-800"
                />
                <h3 className="text-xl font-bold text-white mb-1">{track.title}</h3>
                <p className="text-sm text-neutral-400">{track.artist}</p>
              </div>
            )}

            {/* Badges on Top of Screen */}
            <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
                YouTube Live HD
              </span>
              <span className="bg-black/60 backdrop-blur-md text-neutral-300 font-mono text-[10px] px-2 py-0.5 rounded border border-white/10">
                {track.channelTitle || track.artist}
              </span>
            </div>
          </div>

          {/* Under-screen Floating Visualizer Bar & Live Lyric */}
          <div className="w-full mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80">
            {/* Title & Live Lyric */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                  {track.title}
                </h2>
                <span className="text-xs text-neutral-400 shrink-0">· {track.artist}</span>
              </div>

              {activeLyric ? (
                <div className="text-xs font-semibold text-cyan-300 truncate mt-0.5 flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{activeLyric.text}</span>
                  {activeLyric.translation && (
                    <span className="text-neutral-400 font-normal">({activeLyric.translation})</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 truncate mt-0.5">
                  실시간 고화질 시네마 사운드 재생 중
                </p>
              )}
            </div>

            {/* Mini Visualizer Canvas */}
            <div className="w-40 sm:w-56 h-8 shrink-0 bg-neutral-950/80 rounded-xl px-2 py-1 border border-neutral-800/60 flex items-center justify-center">
              <Visualizer mode="bars" isPlaying={isPlaying} className="w-full h-full" />
            </div>

            {/* Reaction Emojis Row */}
            <div className="flex items-center gap-1 shrink-0">
              {['🔥', '💖', '👏', '🎶', '⚡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-700/80 text-sm flex items-center justify-center transition-transform active:scale-125"
                  title="무대 응원하기"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sleek Floating HUD Player Controls */}
      <footer
        className={`relative z-20 px-6 py-4 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent transition-all duration-300 ${
          isLightsOff ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {/* Progress scrubber bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] font-mono text-neutral-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onSeek(ratio * duration);
              }}
              className="flex-1 h-2 bg-neutral-800 rounded-full cursor-pointer relative overflow-hidden group py-1"
            >
              <div
                className="h-full bg-gradient-to-r from-red-600 via-indigo-500 to-cyan-400 rounded-full relative"
                style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <span className="text-[11px] font-mono text-neutral-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Strip */}
          <div className="flex items-center justify-between">
            {/* Left: Sound Mode Preset */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-400 flex items-center gap-1 hidden sm:flex">
                <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                <span>EQ 모드:</span>
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-neutral-900 rounded-lg border border-neutral-800 text-[11px]">
                <button
                  onClick={() => setSoundMode('studio')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    soundMode === 'studio' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  원음
                </button>
                <button
                  onClick={() => setSoundMode('bass')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    soundMode === 'bass' ? 'bg-neutral-800 text-cyan-300 font-bold' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  베이스
                </button>
                <button
                  onClick={() => setSoundMode('stadium')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    soundMode === 'stadium' ? 'bg-neutral-800 text-rose-300 font-bold' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  스타디움
                </button>
              </div>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={onPrev}
                className="p-2 text-neutral-400 hover:text-white transition-colors active:scale-95"
                title="이전 곡"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={onPlayPause}
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95"
                title={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 text-neutral-400 hover:text-white transition-colors active:scale-95"
                title="다음 곡"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Like & Screen Sizing */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleLike(track.id)}
                className={`p-2 rounded-xl transition-colors ${
                  isLiked ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-rose-400'
                }`}
                title="좋아요"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Screen mode toggle */}
              <button
                onClick={() =>
                  setScreenMode(
                    screenMode === 'standard' ? 'wide' : screenMode === 'wide' ? 'theater' : 'standard'
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 text-xs transition-colors"
                title="화면 크기 변경"
              >
                <Tv className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">
                  {screenMode === 'standard' ? '표준' : screenMode === 'wide' ? '와이드' : '시네마 극장'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Up Next / Recommendations Slide-over Drawer */}
      {showDrawer && (
        <aside className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-neutral-950/95 backdrop-blur-2xl border-l border-neutral-800 z-40 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-300 shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-white">시네마 무대 추천 곡</h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
              {recommendations.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-10">
                  추천할 다음 트랙이 없습니다.
                </p>
              ) : (
                recommendations.map((rec) => {
                  const isCurrent = rec.id === track.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => onSelectTrack(rec)}
                      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-red-600/20 border border-red-500/40 text-white'
                          : 'bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/60 text-neutral-300'
                      }`}
                    >
                      <img
                        src={rec.coverUrl}
                        alt={rec.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{rec.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{rec.artist}</p>
                      </div>
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
