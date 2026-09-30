import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LyricLine } from '../../types/music';
import { Play } from 'lucide-react';

interface SyncedLyricsListProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
  className?: string;
  showTranslation?: boolean;
  align?: 'left' | 'center';
  compact?: boolean;
}

export const SyncedLyricsList: React.FC<SyncedLyricsListProps> = ({
  lyrics,
  currentTime,
  onSeek,
  className = '',
  showTranslation = false,
  align = 'center',
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Compute active lyric index based on playback time
  const activeIndex = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, currentTime]);

  // Smooth auto-scroll active lyric line to center of container
  useEffect(() => {
    if (isUserScrolling) return;

    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isUserScrolling]);

  // Handle user manual scroll interruption so it doesn't fight the user
  const handleScroll = () => {
    setIsUserScrolling(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-neutral-500 text-sm ${className}`}>
        가사 정보가 없습니다.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto scrollbar-thin select-none relative px-3 py-6 ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div className={`space-y-4 py-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPast = idx < activeIndex;

          return (
            <div
              key={`${line.time}-${idx}`}
              ref={isActive ? activeLineRef : null}
              onClick={() => onSeek(line.time)}
              className={`group flex items-start gap-2 py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
                align === 'center' ? 'justify-center' : 'justify-between'
              } ${
                isActive
                  ? 'scale-105 bg-white/5 shadow-sm'
                  : 'hover:bg-white/5 opacity-80'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={`transition-all duration-300 leading-relaxed ${
                    compact ? 'text-sm' : 'text-sm sm:text-base'
                  } ${
                    isActive
                      ? 'text-white font-bold drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]'
                      : isPast
                      ? 'text-neutral-500 font-medium group-hover:text-neutral-300'
                      : 'text-neutral-500 font-normal group-hover:text-neutral-300'
                  }`}
                >
                  {line.text}
                </p>

                {showTranslation && line.translation && (
                  <p
                    className={`text-xs mt-0.5 transition-colors ${
                      isActive
                        ? 'text-neutral-300 font-normal'
                        : 'text-neutral-600 group-hover:text-neutral-400'
                    }`}
                  >
                    {line.translation}
                  </p>
                )}
              </div>

              {/* Timestamp tag & seek icon on hover */}
              <div
                className={`shrink-0 flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded transition-opacity ${
                  isActive
                    ? 'text-neutral-300 bg-white/10 opacity-100'
                    : 'text-neutral-500 opacity-0 group-hover:opacity-100 bg-neutral-800'
                }`}
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>{formatTime(line.time)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SyncedLyricsList;
