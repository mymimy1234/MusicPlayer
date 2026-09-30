import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '../../types/music';
import { DiscPlayer } from './DiscPlayer';
import { SyncedLyricsList } from './SyncedLyricsList';
import { getFullTrackLyrics } from '../../utils/lyricsHelper';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Share2,
  Radio,
  Tv,
  ListMusic,
  Languages,
} from 'lucide-react';

interface EmotionalDiscModalProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLiked: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleLike: (trackId: string) => void;
  onOpenCinemaStage?: () => void;
  onOpenLyrics?: () => void;
  onOpenQueue?: () => void;
}

export const EmotionalDiscModal: React.FC<EmotionalDiscModalProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  isLiked,
  isOpen,
  onClose,
  onPlayPause,
  onSeek,
  onPrev,
  onNext,
  onToggleLike,
  onOpenCinemaStage,
  onOpenLyrics,
  onOpenQueue,
}) => {
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [vinylCrackleEnabled, setVinylCrackleEnabled] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [copied, setCopied] = useState(false);

  // Full synchronized lyrics covering the whole song
  const fullLyrics = useMemo(() => getFullTrackLyrics(track), [track]);

  // Web Audio API simulated vintage vinyl crackle/hiss synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Synthesize soft mechanical needle drop / lift sound on play/pause
  const playNeedleSound = (type: 'drop' | 'lift') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'drop' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(type === 'drop' ? 120 : 260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'drop' ? 40 : 160, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext policy
    }
  };

  const handleTogglePlayback = () => {
    playNeedleSound(isPlaying ? 'lift' : 'drop');
    onPlayPause();
  };

  // Audio crackle noise effect
  useEffect(() => {
    if (!vinylCrackleEnabled || !isPlaying) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.05);
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!gainNodeRef.current) {
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gainNodeRef.current = gain;
      }

      gainNodeRef.current.gain.setTargetAtTime(0.035, ctx.currentTime, 0.1);

      if (!noiseNodeRef.current) {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          let pink = b0 + b1 + b2 + white * 0.5362;
          if (Math.random() < 0.0004) {
            pink += (Math.random() - 0.5) * 5;
          }
          output[i] = pink * 0.06;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 0.7;

        whiteNoise.connect(filter);
        filter.connect(gainNodeRef.current);
        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;
      }
    } catch {
      // AudioContext policy
    }

    return () => {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.05);
      }
    };
  }, [vinylCrackleEnabled, isPlaying]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Active lyric line
  let activeLyricIndex = -1;
  for (let i = 0; i < track.lyrics.length; i++) {
    if (currentTime >= track.lyrics[i].time) {
      activeLyricIndex = i;
    } else {
      break;
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-neutral-800/80 max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-neutral-200">
            바이닐 플레이어
          </span>

          {/* RPM Selector */}
          <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setRpm(33)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-medium transition-colors cursor-pointer ${
                rpm === 33
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              33 ⅓ RPM
            </button>
            <button
              onClick={() => setRpm(45)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-medium transition-colors cursor-pointer ${
                rpm === 45
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              45 RPM
            </button>
          </div>

          {/* Vinyl Crackle Toggle */}
          <button
            onClick={() => setVinylCrackleEnabled(!vinylCrackleEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              vinylCrackleEnabled
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                : 'bg-neutral-900/60 text-neutral-500 border-neutral-800 hover:text-neutral-300'
            }`}
            title="아날로그 LP 노이즈 질감 효과"
          >
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">LP 질감</span>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {onOpenCinemaStage && track.youtubeId && (
            <button
              onClick={() => {
                onClose();
                onOpenCinemaStage();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer"
              title="시네마 무대 모드로 전환"
            >
              <Tv className="w-3.5 h-3.5 text-neutral-400" />
              <span>시네마</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Center Turntable & Lyrics */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 px-4 sm:px-8 py-8 max-w-5xl w-full mx-auto">
        {/* Left: Turntable Platter */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 shadow-2xl backdrop-blur-md">
            <DiscPlayer
              track={track}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlayback}
              size={320}
              needleDotColor="#F43F5E"
            />
          </div>
        </div>

        {/* Right: Track Info & Synced Lyrics */}
        <div className="flex-1 max-w-md w-full space-y-5 flex flex-col justify-center">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5 font-medium">
              <span>{track.genre || '음악'}</span>
              <span aria-hidden="true">·</span>
              <span>{formatTime(duration)}</span>
              {track.bpm && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{track.bpm} BPM</span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2">
              {track.title}
            </h1>
            <p className="text-sm text-neutral-300 font-medium mt-1">
              {track.artist}
            </p>
          </div>

          {/* Full Song Auto-Scrolling Synced Lyrics */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl h-60 overflow-hidden relative shadow-inner">
            <SyncedLyricsList
              lyrics={fullLyrics}
              currentTime={currentTime}
              onSeek={onSeek}
              className="h-full"
              align="center"
              showTranslation={showTranslation}
            />
          </div>

          {/* Quick actions & Translation Toggle */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleLike(track.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isLiked ? '보관됨' : '좋아요'}</span>
              </button>

              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  showTranslation
                    ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                    : 'bg-neutral-900/80 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                }`}
                title="한글/영어 번역 가사 토글"
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">번역</span>
              </button>
            </div>

            <div className="flex items-center gap-2">

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? '복사됨' : '공유'}</span>
            </button>

            {onOpenQueue && (
              <button
                onClick={onOpenQueue}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>대기열</span>
              </button>
            )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Transport Controls Bar */}
      <footer className="relative z-10 border-t border-neutral-800/80 bg-neutral-950 px-6 py-5 max-w-4xl w-full mx-auto">
        {/* Progress seekbar */}
        <div className="space-y-1.5 mb-4">
          <div
            className="relative h-1.5 w-full bg-neutral-800 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              onSeek(percent * duration);
            }}
          >
            <div
              className="h-full rounded-full transition-all bg-neutral-300 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onPrev}
            className="p-2.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
            title="이전 곡"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlayback}
            className="w-12 h-12 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
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
            className="p-2.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
            title="다음 곡"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EmotionalDiscModal;
