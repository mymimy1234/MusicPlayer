import React from 'react';
import { Track } from '../../types/music';
import { Play, Pause, Heart, MoreHorizontal, ListPlus } from 'lucide-react';

interface TrackCardProps {
  track: Track;
  isPlayingCurrent: boolean;
  isLiked: boolean;
  onPlay: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onClickDetails?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlayingCurrent,
  isLiked,
  onPlay,
  onToggleLike,
  onAddToQueue,
  onClickDetails,
}) => {
  return (
    <div className="group relative bg-neutral-900/40 hover:bg-neutral-900/90 border border-neutral-800/60 hover:border-neutral-700/80 rounded-2xl p-3.5 transition-all duration-200 flex flex-col justify-between">
      {/* Cover image container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-neutral-950">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Hover play button overlay */}
        <div
          onClick={() => onPlay(track)}
          className={`absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity ${
            isPlayingCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform transform active:scale-95">
            {isPlayingCurrent ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* YouTube tag */}
        {track.youtubeId && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10">
            YouTube MV
          </div>
        )}

        {/* Action icon in corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(track.id);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-neutral-950/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-400"
          title="좋아요"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h4
            onClick={() => onClickDetails?.(track)}
            className="text-sm font-semibold text-neutral-100 hover:text-indigo-400 cursor-pointer truncate transition-colors"
          >
            {track.title}
          </h4>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
        </div>

        {/* Clean unboxed metadata with · separator */}
        <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span>{track.genre}</span>
            <span aria-hidden="true">·</span>
            <span>BPM {track.bpm}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddToQueue(track)}
              className="p-1 hover:text-neutral-200 transition-colors"
              title="대기열 추가"
            >
              <ListPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
