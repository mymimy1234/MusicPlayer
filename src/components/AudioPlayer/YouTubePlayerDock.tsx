import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { loadYouTubeIframeAPI } from '../../services/youtubeService';
import { Maximize2, Minimize2, X, ExternalLink, Youtube } from 'lucide-react';

export interface YouTubePlayerRef {
  playVideo: (videoId: string, startOffset?: number) => void;
  pauseVideo: () => void;
  resumeVideo: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
}

interface YouTubePlayerDockProps {
  currentVideoId?: string;
  isPlaying: boolean;
  isCinemaExpanded: boolean;
  trackTitle?: string;
  artistName?: string;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onEnded: () => void;
  onClosePip: () => void;
}

export const YouTubePlayerDock = forwardRef<YouTubePlayerRef, YouTubePlayerDockProps>(
  (
    {
      currentVideoId,
      isPlaying,
      isCinemaExpanded,
      trackTitle,
      artistName,
      onTimeUpdate,
      onDurationChange,
      onPlayStateChange,
      onEnded,
      onClosePip,
    },
    ref
  ) => {
    const playerContainerRef = useRef<HTMLDivElement | null>(null);
    const ytPlayerRef = useRef<any>(null);
    const timeIntervalRef = useRef<number | null>(null);
    const [isPipVisible, setIsPipVisible] = useState(true);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // Initialize or load YouTube IFrame API
    useEffect(() => {
      let isMounted = true;

      loadYouTubeIframeAPI().then(() => {
        if (!isMounted || !playerContainerRef.current) return;

        // Create player iframe container
        const playerDivId = 'youtube-dock-iframe';
        let targetDiv = document.getElementById(playerDivId);
        if (!targetDiv) {
          targetDiv = document.createElement('div');
          targetDiv.id = playerDivId;
          playerContainerRef.current.appendChild(targetDiv);
        }

        try {
          ytPlayerRef.current = new window.YT.Player(playerDivId, {
            height: '100%',
            width: '100%',
            videoId: currentVideoId || '',
            playerVars: {
              autoplay: 1,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                setIsPlayerReady(true);
                if (currentVideoId) {
                  event.target.cueVideoById(currentVideoId);
                }
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  onPlayStateChange(true);
                  const dur = event.target.getDuration();
                  if (dur && !isNaN(dur) && dur > 0) {
                    onDurationChange(Math.round(dur));
                  }
                  startTimePolling();
                } else if (
                  event.data === window.YT.PlayerState.PAUSED ||
                  event.data === window.YT.PlayerState.BUFFERING
                ) {
                  if (event.data === window.YT.PlayerState.PAUSED) {
                    onPlayStateChange(false);
                    stopTimePolling();
                  }
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  onPlayStateChange(false);
                  stopTimePolling();
                  onEnded();
                }
              },
            },
          });
        } catch (e) {
          console.warn('YouTube Player initialization warning:', e);
        }
      });

      return () => {
        isMounted = false;
        stopTimePolling();
      };
    }, []);

    const startTimePolling = () => {
      stopTimePolling();
      timeIntervalRef.current = window.setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const cur = ytPlayerRef.current.getCurrentTime();
            if (typeof cur === 'number' && !isNaN(cur)) {
              onTimeUpdate(cur);
            }
          } catch (e) {
            // Ignore cross-origin transient poll warning
          }
        }
      }, 250);
    };

    const stopTimePolling = () => {
      if (timeIntervalRef.current !== null) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    };

    // Expose ref methods
    useImperativeHandle(ref, () => ({
      playVideo: (videoId: string, startOffset: number = 0) => {
        if (ytPlayerRef.current && isPlayerReady) {
          try {
            ytPlayerRef.current.loadVideoById({
              videoId,
              startSeconds: startOffset,
            });
            ytPlayerRef.current.playVideo();
          } catch (e) {
            console.warn('Error loading video by ID:', e);
          }
        }
      },
      pauseVideo: () => {
        if (ytPlayerRef.current && isPlayerReady) {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch (e) {}
        }
      },
      resumeVideo: () => {
        if (ytPlayerRef.current && isPlayerReady) {
          try {
            ytPlayerRef.current.playVideo();
          } catch (e) {}
        }
      },
      seekTo: (seconds: number) => {
        if (ytPlayerRef.current && isPlayerReady) {
          try {
            ytPlayerRef.current.seekTo(seconds, true);
          } catch (e) {}
        }
      },
      setVolume: (volume: number) => {
        if (ytPlayerRef.current && isPlayerReady) {
          try {
            ytPlayerRef.current.setVolume(Math.round(volume * 100));
          } catch (e) {}
        }
      },
    }));

    if (!currentVideoId) {
      return <div className="hidden" ref={playerContainerRef} />;
    }

    // If Cinema Expanded is active, the video element is embedded or styled for the main player
    // Otherwise it renders as a sleek floating PiP screen at bottom-right above the player bar
    return (
      <div
        className={`fixed transition-all duration-300 z-40 ${
          isCinemaExpanded
            ? 'hidden' // When expanded player takes over, we can show it inside ExpandedPlayer or dock
            : isPipVisible
            ? 'bottom-20 right-4 w-72 sm:w-80 h-44 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-black/95 backdrop-blur-md animate-in slide-in-from-bottom-5'
            : 'w-0 h-0 overflow-hidden opacity-0 pointer-events-none'
        }`}
      >
        {/* Floating Mini PiP Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-white/90 truncate max-w-[160px]">
              {trackTitle || 'YouTube MV'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`https://www.youtube.com/watch?v=${currentVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-white/70 hover:text-white transition-colors"
              title="YouTube에서 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setIsPipVisible(false)}
              className="p-1 text-white/70 hover:text-white transition-colors"
              title="화면 최소화 (오디오는 계속 재생)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient backglow */}
        <div className="absolute inset-0 bg-red-600/10 pointer-events-none filter blur-xl" />

        {/* YouTube Iframe Container */}
        <div ref={playerContainerRef} className="w-full h-full" />
      </div>
    );
  }
);
