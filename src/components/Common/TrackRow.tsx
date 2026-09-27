import React from 'react';
import { Track } from '../../types/music';
import { Play, Pause, Heart, ListPlus } from 'lucide-react';

interface TrackRowProps {
  track: Track;
  index: number;
  rank?: number;
  isPlayingCurrent: boolean;
  isLiked: boolean;
  onPlay: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onClickDetails?: (track: Track) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  rank,
  isPlayingCurrent,
  isLiked,
  onPlay,
  onToggleLike,
  onAddToQueue,
  onClickDetails,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`;
    return plays.toString();
  };

  return (
    <div
      className={`group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
        isPlayingCurrent
          ? 'bg-indigo-950/40 border border-indigo-500/30'
          : 'hover:bg-neutral-900/80 border border-transparent'
      }`}
    >
      {/* Left: Index / Play & Artwork & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Rank or Index */}
        <div className="w-6 text-center text-xs font-mono font-medium text-neutral-400 shrink-0">
          <span className="group-hover:hidden">{rank ?? index + 1}</span>
          <button
            onClick={() => onPlay(track)}
            className="hidden group-hover:flex items-center justify-center text-white hover:text-indigo-400 transition-colors mx-auto"
            title="재생"
          >
            {isPlayingCurrent ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>
        </div>

        {/* Artwork */}
        <div
          onClick={() => onPlay(track)}
          className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-900 cursor-pointer shadow-sm"
        >
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={() => onClickDetails?.(track)}
              className={`text-sm font-medium truncate cursor-pointer transition-colors ${
                isPlayingCurrent
                  ? 'text-indigo-300 font-semibold'
                  : 'text-neutral-100 hover:text-indigo-400'
              }`}
            >
              {track.title}
            </h4>
            {track.youtubeId && (
              <span className="text-[9px] font-bold text-red-400 bg-red-950/60 border border-red-800/40 px-1.5 py-0.2 rounded shrink-0">
                YT MV
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
        </div>
      </div>

      {/* Center: Album / Genre (hidden on small screens) */}
      <div className="hidden md:block w-44 px-2">
        <p className="text-xs text-neutral-400 truncate">{track.album}</p>
      </div>

      <div className="hidden lg:block w-24 text-left">
        <span className="text-xs font-mono text-neutral-400">{track.genre}</span>
      </div>

      {/* Right: Plays & Duration & Action buttons */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:inline-block text-xs font-mono tabular-nums text-neutral-400 w-16 text-right">
          {formatPlays(track.plays)}회
        </span>

        <span className="text-xs font-mono tabular-nums text-neutral-400 w-10 text-right">
          {formatTime(track.duration)}
        </span>

        <button
          onClick={() => onToggleLike(track.id)}
          className="p-1.5 text-neutral-500 hover:text-rose-500 transition-colors"
          title="좋아요"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={() => onAddToQueue(track)}
          className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors opacity-0 group-hover:opacity-100"
          title="대기열 추가"
        >
          <ListPlus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
