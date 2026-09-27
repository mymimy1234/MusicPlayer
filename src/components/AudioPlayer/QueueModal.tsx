import React from 'react';
import { Track } from '../../types/music';
import { X, Play, Trash2, ListMusic } from 'lucide-react';

interface QueueModalProps {
  queue: Track[];
  currentTrack: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: Track) => void;
  onRemoveTrack: (index: number) => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  queue,
  currentTrack,
  isOpen,
  onClose,
  onSelectTrack,
  onRemoveTrack,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-neutral-100">재생 대기열 ({queue.length}곡)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-sm">
              대기열에 추가된 음악이 없습니다.
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-200'
                      : 'hover:bg-neutral-800/60 text-neutral-200'
                  }`}
                >
                  <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden cursor-pointer" onClick={() => onSelectTrack(track)}>
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onSelectTrack(track)}>
                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-indigo-300 font-semibold' : 'text-neutral-100'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono tabular-nums text-neutral-400">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrack(idx);
                      }}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="대기열에서 제거"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
