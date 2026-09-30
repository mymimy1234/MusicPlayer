import React, { useState, useEffect } from 'react';
import { Track } from '../../types/music';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  ListMusic,
  Infinity,
  Moon,
  Sun,
  Sparkles,
  SlidersHorizontal,
  Tv,
  Disc,
} from 'lucide-react';
import { DiscPlayer } from './DiscPlayer';

interface CinemaStageModalProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLiked: boolean;
  isAutoplay?: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleLike: (trackId: string) => void;
  onToggleAutoplay?: () => void;
  recommendations?: Track[];
  onSelectTrack: (track: Track) => void;
}

type StageAmbiance = 'golden_lounge' | 'aurora_stage' | 'midnight_cyber' | 'nordic_slate' | 'pure_obsidian';

export const CinemaStageModal: React.FC<CinemaStageModalProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  isLiked,
  isAutoplay = true,
  onClose,
  onPlayPause,
  onSeek,
  onPrev,
  onNext,
  onToggleLike,
  onToggleAutoplay,
  recommendations = [],
  onSelectTrack,
}) => {
  const [ambiance, setAmbiance] = useState<StageAmbiance>('golden_lounge');
  const [isLightsDimmed, setIsLightsDimmed] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [stageMode, setStageMode] = useState<'video' | 'turntable'>(track.youtubeId ? 'video' : 'turntable');

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

  // Refined, glamorous architectural lighting presets
  const ambianceThemes = {
    golden_lounge: {
      name: '골든 라운지',
      glow: 'from-amber-950/30 via-yellow-950/20 to-transparent',
      radial: 'radial-gradient(circle at center, rgba(245,158,11,0.22) 0%, rgba(217,119,6,0.1) 40%, rgba(0,0,0,0) 75%)',
      accentDot: '#f59e0b',
    },
    aurora_stage: {
      name: '오로라 앰비언스',
      glow: 'from-emerald-950/30 via-teal-950/20 to-transparent',
      radial: 'radial-gradient(circle at center, rgba(16,185,129,0.2) 0%, rgba(99,102,241,0.14) 40%, rgba(0,0,0,0) 75%)',
      accentDot: '#10b981',
    },
    midnight_cyber: {
      name: '미드나잇 사이버',
      glow: 'from-purple-950/30 via-pink-950/20 to-transparent',
      radial: 'radial-gradient(circle at center, rgba(139,92,246,0.22) 0%, rgba(244,63,94,0.12) 40%, rgba(0,0,0,0) 75%)',
      accentDot: '#c084fc',
    },
    nordic_slate: {
      name: '노르딕 스튜디오',
      glow: 'from-sky-950/30 via-slate-950/20 to-transparent',
      radial: 'radial-gradient(circle at center, rgba(56,189,248,0.18) 0%, rgba(30,41,59,0.1) 40%, rgba(0,0,0,0) 75%)',
      accentDot: '#38bdf8',
    },
    pure_obsidian: {
      name: '퓨어 옵시디언',
      glow: 'from-transparent to-transparent',
      radial: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)',
      accentDot: '#ffffff',
    },
  };

  const currentTheme = ambianceThemes[ambiance];

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

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between transition-all duration-700 select-none overflow-hidden ${
        isLightsDimmed ? 'bg-black' : 'bg-[#0a0a0c]'
      }`}
    >
      {/* Refined Ambient Room Light (Subtle, tasteful background aura) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isLightsDimmed ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ background: currentTheme.radial }}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b ${currentTheme.glow} transition-opacity duration-1000 pointer-events-none ${
          isLightsDimmed ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Top Minimal Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-white/[0.06] transition-all text-xs font-medium cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>닫기</span>
        </button>

        {/* Center: Subtle Ambiance Theme Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] backdrop-blur-xl rounded-full border border-white/[0.06]">
          {(Object.keys(ambianceThemes) as StageAmbiance[]).map((key) => {
            const item = ambianceThemes[key];
            const isSelected = ambiance === key;
            return (
              <button
                key={key}
                onClick={() => setAmbiance(key)}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/10 text-white font-medium shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Dim lights toggle */}
          <button
            onClick={() => setIsLightsDimmed(!isLightsDimmed)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isLightsDimmed
                ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                : 'bg-white/[0.03] text-neutral-400 hover:text-white border-white/[0.06]'
            }`}
            title={isLightsDimmed ? '조명 켜기' : '조명 어둡게'}
          >
            {isLightsDimmed ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
              showDrawer
                ? 'bg-white/15 text-white border-white/20'
                : 'bg-white/[0.03] text-neutral-400 hover:text-white border-white/[0.06]'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">대기열</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage: Elegant Hi-Fi Turntable & Live Lyrics or Theater Video */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 max-w-4xl mx-auto w-full my-auto">
        {/* Mode Switcher (Video Stage / LP Turntable) */}
        {track.youtubeId && (
          <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] backdrop-blur-md rounded-full border border-white/[0.06] text-xs mb-6">
            <button
              onClick={() => setStageMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                stageMode === 'video'
                  ? 'bg-white/10 text-white font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>무대 비디오</span>
            </button>
            <button
              onClick={() => setStageMode('turntable')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                stageMode === 'turntable'
                  ? 'bg-white/10 text-white font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>LP 바이닐</span>
            </button>
          </div>
        )}

        {stageMode === 'video' && track.youtubeId ? (
          <div className="w-full flex flex-col items-center">
            {/* Cinema Video Frame */}
            <div className="relative w-full aspect-video max-w-3xl rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.95)] bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(
                  window.location.origin
                )}`}
                title={track.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Track Info & Lyric Line */}
            <div className="mt-5 text-center max-w-lg mx-auto flex flex-col items-center">
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate max-w-md">
                {track.title}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {track.artist}
              </p>

              {activeLyric && (
                <div className="mt-2 text-xs sm:text-sm text-neutral-200 transition-all font-medium">
                  {activeLyric.text}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Turntable Platter Stage */
          <div className="relative flex flex-col items-center justify-center my-auto">
            {/* Soft Matte Halo */}
            <div
              className={`absolute -inset-10 rounded-full transition-all duration-1000 pointer-events-none ${
                isPlaying && !isLightsDimmed ? 'opacity-80 scale-100' : 'opacity-20 scale-95'
              }`}
              style={{
                background: `radial-gradient(circle, ${currentTheme.accentDot}18 0%, transparent 70%)`,
              }}
            />

            <DiscPlayer
              track={track}
              isPlaying={isPlaying}
              onTogglePlay={onPlayPause}
              size="min(46vh, 360px)"
              needleDotColor={currentTheme.accentDot}
              showGlow={false}
            />

            {/* Track Metadata & Elegant Synchronized Lyrics */}
            <div className="mt-6 text-center max-w-lg mx-auto flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                {track.title}
              </h2>
              <p className="text-sm text-neutral-400 mt-1 font-normal tracking-wide">
                {track.artist}
              </p>

              {/* Sync Lyric Line */}
              <div className="mt-3 min-h-[30px] flex items-center justify-center">
                {activeLyric ? (
                  <p className="text-sm sm:text-base font-medium text-neutral-200 transition-all duration-500 tracking-normal leading-relaxed">
                    {activeLyric.text}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-600 font-normal">
                    High Fidelity Audio · 33⅓ RPM
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Floating Minimal Control Strip */}
      <footer className="relative z-20 px-8 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {/* Subtle Hairline Progress Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] font-mono tabular-nums text-neutral-500 w-9 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onSeek(ratio * duration);
              }}
              className="flex-1 h-1 bg-white/[0.08] hover:h-1.5 rounded-full cursor-pointer relative transition-all"
            >
              <div
                className="h-full bg-neutral-200 rounded-full relative"
                style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
              />
            </div>

            <span className="text-[11px] font-mono tabular-nums text-neutral-500 w-9">
              {formatTime(duration)}
            </span>
          </div>

          {/* Core Controls */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => onToggleLike(track.id)}
              className="p-2 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="좋아요"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Playback Button Group */}
            <div className="flex items-center gap-6">
              <button
                onClick={onPrev}
                className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="이전 곡"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPlayPause}
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 hover:scale-105 text-neutral-950 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_28px_rgba(245,158,11,0.5)] active:scale-95"
                title={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-neutral-950" />
                ) : (
                  <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="다음 곡"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Autoplay Toggle */}
            {onToggleAutoplay && (
              <button
                onClick={onToggleAutoplay}
                className={`p-2 transition-colors cursor-pointer ${
                  isAutoplay ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'
                }`}
                title={isAutoplay ? '연속 재생 켜짐' : '연속 재생 꺼짐'}
              >
                <Infinity className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Up Next Drawer Slide-over */}
      {showDrawer && (
        <aside className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#0c0c0e]/95 backdrop-blur-3xl border-l border-white/[0.08] z-40 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300 shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">다음 트랙</h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
              {recommendations.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-12">
                  대기열이 비어 있습니다.
                </p>
              ) : (
                recommendations.map((rec) => {
                  const isCurrent = rec.id === track.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => onSelectTrack(rec)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-white/10 text-white'
                          : 'hover:bg-white/[0.04] text-neutral-300'
                      }`}
                    >
                      <img
                        src={rec.coverUrl}
                        alt={rec.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{rec.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">{rec.artist}</p>
                      </div>
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
