import React, { useState } from 'react';
import { Track } from '../../types/music';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  FileText,
  ListMusic,
  Heart,
  Maximize2,
  Activity,
  Tv,
} from 'lucide-react';
import { Visualizer } from './Visualizer';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoop: boolean;
  isShuffle: boolean;
  isLiked: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onToggleLike: (trackId: string) => void;
  onOpenLyrics: () => void;
  onOpenQueue: () => void;
  onOpenExpanded: () => void;
  onOpenCinemaStage?: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isLoop,
  isShuffle,
  isLiked,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleLoop,
  onToggleShuffle,
  onToggleLike,
  onOpenLyrics,
  onOpenQueue,
  onOpenExpanded,
  onOpenCinemaStage,
}) => {
  const [showVisualizerMini, setShowVisualizerMini] = useState(true);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800/80 px-4 md:px-8 py-3 select-none">
      {/* Top micro progress line for quick visual tracking */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-800 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = (e.clientX - rect.left) / rect.width;
          onSeek(clickPos * duration);
        }}
      >
        <div
          className={`h-full relative transition-all group-hover:h-1 ${
            currentTrack.youtubeId
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-cyan-400'
              : 'bg-indigo-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Track Info & Artwork */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          <div
            className="relative group w-12 h-12 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-neutral-800 shadow"
            onClick={currentTrack.youtubeId && onOpenCinemaStage ? onOpenCinemaStage : onOpenExpanded}
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              {currentTrack.youtubeId ? (
                <Tv className="w-4 h-4 text-cyan-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4
                onClick={currentTrack.youtubeId && onOpenCinemaStage ? onOpenCinemaStage : onOpenExpanded}
                className="text-sm font-semibold text-neutral-100 truncate hover:text-red-400 cursor-pointer transition-colors"
              >
                {currentTrack.title}
              </h4>
              {currentTrack.youtubeId && (
                <span className="shrink-0 bg-red-600 text-white text-[9px] px-1 py-0.2 rounded font-extrabold tracking-wider">
                  HD
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => onToggleLike(currentTrack.id)}
            className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors ml-1 shrink-0 cursor-pointer"
            title={isLiked ? '좋아요 취소' : '좋아요'}
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'text-rose-500 fill-rose-500' : ''
              }`}
            />
          </button>

          {/* Quick Cinema Stage button on the bar */}
          {currentTrack.youtubeId && onOpenCinemaStage && (
            <button
              onClick={onOpenCinemaStage}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              title="시네마 무대 모드로 열기"
            >
              <Tv className="w-3.5 h-3.5 text-red-500" />
              <span>시네마 무대</span>
            </button>
          )}
        </div>

        {/* Center: Controls & Seek Bar */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-4 mb-1">
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 transition-colors cursor-pointer ${
                isShuffle ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="셔플 재생"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrev}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="이전 곡"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onPlayPause}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer ${
                currentTrack.youtubeId
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : 'bg-white text-neutral-950'
              }`}
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <Pause className={`w-5 h-5 ${currentTrack.youtubeId ? 'fill-white' : 'fill-neutral-950'}`} />
              ) : (
                <Play className={`w-5 h-5 ml-0.5 ${currentTrack.youtubeId ? 'fill-white' : 'fill-neutral-950'}`} />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="다음 곡"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleLoop}
              className={`p-1.5 transition-colors cursor-pointer ${
                isLoop ? 'text-indigo-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="한 곡 반복"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Seek Bar with Time labels */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono tabular-nums text-neutral-400 w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 group py-2 cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none"
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums text-neutral-400 w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Audio Features (Visualizer, Cinema Stage, Lyrics, Queue, Volume) */}
        <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[220px]">
          {/* Cinema Stage Shortcut */}
          {currentTrack.youtubeId && onOpenCinemaStage && (
            <button
              onClick={onOpenCinemaStage}
              className="p-2 text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 rounded-lg transition-colors cursor-pointer"
              title="시네마 무대 모드"
            >
              <Tv className="w-4 h-4 text-red-500" />
            </button>
          )}

          {/* Real-time mini spectrum */}
          {showVisualizerMini && (
            <div
              className="hidden lg:block w-20 h-6 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              onClick={onOpenExpanded}
              title="오디오 비주얼라이저"
            >
              <Visualizer mode="bars" isPlaying={isPlaying} />
            </div>
          )}

          <button
            onClick={() => setShowVisualizerMini(!showVisualizerMini)}
            className={`p-2 rounded-lg transition-colors hidden sm:block cursor-pointer ${
              showVisualizerMini ? 'text-indigo-400 bg-indigo-500/10' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="미니 스펙트럼 토글"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLyrics}
            className="p-2 text-neutral-400 hover:text-indigo-400 rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title="실시간 싱크 가사"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQueue}
            className="p-2 text-neutral-400 hover:text-indigo-400 rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title="재생 대기열"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-16 md:w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
