import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../../types/music';
import { X, Languages, Volume2 } from 'lucide-react';

interface LyricsModalProps {
  track: Track;
  currentTime: number;
  isOpen: boolean;
  onClose: () => void;
  onSeek: (time: number) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  track,
  currentTime,
  isOpen,
  onClose,
  onSeek,
}) => {
  const [showTranslation, setShowTranslation] = useState(true);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Find currently active lyric index
  let activeIndex = -1;
  for (let i = 0; i < track.lyrics.length; i++) {
    if (currentTime >= track.lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth scroll active line into center of container
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current && isOpen) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-12 h-12 rounded-lg object-cover shadow"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-neutral-100 truncate text-base">{track.title}</h3>
              <p className="text-xs text-neutral-400 truncate">{track.artist} · {track.album}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showTranslation
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title="번역 가사 토글"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>번역 {showTranslation ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Synced Lyrics List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 text-center select-none"
        >
          {track.lyrics.length === 0 ? (
            <div className="py-20 text-neutral-500 text-sm">
              등록된 실시간 싱크 가사가 없습니다.
            </div>
          ) : (
            track.lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`group cursor-pointer transition-all duration-300 py-2 px-4 rounded-xl ${
                    isActive
                      ? 'scale-105 text-white font-bold bg-indigo-950/40 border border-indigo-500/30'
                      : isPast
                      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                      : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isActive && (
                      <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
                    )}
                    <span className={`text-lg md:text-xl tracking-wide ${isActive ? 'text-indigo-200' : ''}`}>
                      {line.text}
                    </span>
                  </div>

                  {showTranslation && line.translation && (
                    <p
                      className={`text-xs mt-1 transition-opacity ${
                        isActive
                          ? 'text-indigo-300/80 font-normal'
                          : 'text-neutral-500'
                      }`}
                    >
                      {line.translation}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <span>가사 줄을 클릭하면 해당 구간으로 바로 이동합니다.</span>
        </div>
      </div>
    </div>
  );
};
