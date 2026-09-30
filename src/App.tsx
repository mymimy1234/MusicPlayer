import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Track } from './types/music';
import { UserProfile, UserCategory } from './types/auth';
import { INITIAL_TRACKS } from './data/mockTracks';
import { Navbar } from './components/Navigation/Navbar';
import { PlayerBar } from './components/AudioPlayer/PlayerBar';
import { LyricsModal } from './components/AudioPlayer/LyricsModal';
import { QueueModal } from './components/AudioPlayer/QueueModal';
import { CinemaStageModal } from './components/AudioPlayer/CinemaStageModal';
import { ExpandedPlayer } from './components/AudioPlayer/ExpandedPlayer';
import { EmotionalDiscModal } from './components/AudioPlayer/EmotionalDiscModal';
import { YouTubeExploreView } from './components/Views/YouTubeExploreView';
import {
  YouTubePlayerDock,
  YouTubePlayerRef,
} from './components/AudioPlayer/YouTubePlayerDock';
import { AuthModal } from './components/Auth/AuthModal';
import { CategoryClassifyModal } from './components/Categories/CategoryClassifyModal';
import {
  getCurrentUser,
  logoutUser,
  getUserCategories,
  saveUserCategories,
  DEFAULT_USER_CATEGORIES,
} from './services/authService';

export default function App() {
  const ytPlayerRef = useRef<YouTubePlayerRef | null>(null);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // User Categories State
  const [userCategories, setUserCategories] = useState<UserCategory[]>(() => {
    const userId = currentUser ? currentUser.id : 'guest';
    return getUserCategories(userId);
  });

  // Category classification modal state
  const [isClassifyModalOpen, setIsClassifyModalOpen] = useState(false);
  const [targetClassifyTrack, setTargetClassifyTrack] = useState<Track | null>(null);

  // Tracks & Library state (persisted to localStorage)
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('onsound_yt_tracks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t: Track) => t.id));
          const missing = INITIAL_TRACKS.filter((t) => !existingIds.has(t.id));
          return [...parsed, ...missing];
        }
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_TRACKS;
  });

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('onsound_liked');
    return saved ? JSON.parse(saved) : ['yt-iu-love-wins-all', 'yt-newjeans-ditto', 'yt-aespa-supernova'];
  });

  const [historyTracks, setHistoryTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('onsound_history');
    return saved ? JSON.parse(saved) : INITIAL_TRACKS.slice(0, 3);
  });

  // Navigation: YouTube exploration categories
  const [activeCategory, setActiveCategory] = useState<string>('explore');
  const [searchQuery, setSearchQuery] = useState('');

  // Playback States
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(() => {
    const saved = localStorage.getItem('onsound_autoplay');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [queue, setQueue] = useState<Track[]>(INITIAL_TRACKS);

  // Modals
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false);
  const [isCinemaStageOpen, setIsCinemaStageOpen] = useState(false);
  const [isDiscPlayerOpen, setIsDiscPlayerOpen] = useState(false);

  // Sync user categories when user changes
  useEffect(() => {
    const userId = currentUser ? currentUser.id : 'guest';
    const cats = getUserCategories(userId);
    setUserCategories(cats);
  }, [currentUser]);

  // Persist user categories
  useEffect(() => {
    const userId = currentUser ? currentUser.id : 'guest';
    saveUserCategories(userId, userCategories);
  }, [userCategories, currentUser]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('onsound_autoplay', JSON.stringify(isAutoplay));
  }, [isAutoplay]);

  useEffect(() => {
    localStorage.setItem('onsound_yt_tracks', JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem('onsound_liked', JSON.stringify(likedTrackIds));
  }, [likedTrackIds]);

  useEffect(() => {
    localStorage.setItem('onsound_history', JSON.stringify(historyTracks));
  }, [historyTracks]);

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Category Handlers
  const handleCreateCategory = (name: string, icon: string, color: string) => {
    const newCat: UserCategory = {
      id: 'cat-' + Date.now(),
      name,
      icon,
      color,
      description: '사용자가 직접 생성한 맞춤 카테고리',
      trackIds: targetClassifyTrack ? [targetClassifyTrack.id] : [],
      createdAt: new Date().toISOString(),
    };
    setUserCategories((prev) => [newCat, ...prev]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setUserCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (activeCategory === `category-${categoryId}`) {
      setActiveCategory('explore');
    }
  };

  const handleToggleTrackInCategory = (categoryId: string, track: Track) => {
    setUserCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          const exists = c.trackIds.includes(track.id);
          const newTrackIds = exists
            ? c.trackIds.filter((id) => id !== track.id)
            : [...c.trackIds, track.id];
          return { ...c, trackIds: newTrackIds };
        }
        return c;
      })
    );

    // Also ensure track is saved in tracks pool
    setTracks((prev) => (prev.some((t) => t.id === track.id) ? prev : [track, ...prev]));
  };

  const handleOpenClassifyModal = (track: Track) => {
    setTargetClassifyTrack(track);
    setIsClassifyModalOpen(true);
  };

  // Track playback handlers
  const handlePlayTrack = useCallback(
    (track: Track) => {
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          ytPlayerRef.current?.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current?.resumeVideo();
          setIsPlaying(true);
        }
        return;
      }

      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);

      if (track.youtubeId) {
        ytPlayerRef.current?.playVideo(track.youtubeId, 0);
      }

      setHistoryTracks((prev) => [track, ...prev.filter((t) => t.id !== track.id)].slice(0, 40));
      setTracks((prev) => (prev.some((t) => t.id === track.id) ? prev : [track, ...prev]));

      setQueue((prev) => {
        if (!prev.some((t) => t.id === track.id)) {
          return [track, ...prev];
        }
        return prev;
      });
    },
    [currentTrack, isPlaying]
  );

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      ytPlayerRef.current?.pauseVideo();
      setIsPlaying(false);
    } else {
      if (currentTrack.youtubeId) {
        ytPlayerRef.current?.resumeVideo();
      }
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying]);

  const handleNextTrack = useCallback(() => {
    if (!currentTrack) {
      if (queue.length > 0) handlePlayTrack(queue[0]);
      return;
    }

    if (isShuffle) {
      const remaining = queue.filter((t) => t.id !== currentTrack.id);
      if (remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length);
        handlePlayTrack(remaining[randomIndex]);
      } else {
        handlePlayTrack(currentTrack);
      }
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex >= queue.length - 1) {
      if (isLoop) {
        handlePlayTrack(queue[0]);
      } else if (isAutoplay) {
        // Smart Autoplay: find candidate from library not yet in current queue or history
        const queueIds = new Set(queue.map((t) => t.id));
        const unplayedCandidates = tracks.filter((t) => !queueIds.has(t.id) && t.id !== currentTrack.id);

        if (unplayedCandidates.length > 0) {
          // Prefer same artist or genre, or random candidate
          const sameArtist = unplayedCandidates.filter((t) => t.artist === currentTrack.artist);
          const nextTrack = sameArtist.length > 0 ? sameArtist[0] : unplayedCandidates[Math.floor(Math.random() * unplayedCandidates.length)];
          setQueue((prev) => [...prev, nextTrack]);
          handlePlayTrack(nextTrack);
        } else if (queue.length > 0) {
          // Loop queue seamlessly
          handlePlayTrack(queue[0]);
        } else if (tracks.length > 0) {
          handlePlayTrack(tracks[0]);
        }
      } else {
        setIsPlaying(false);
      }
    } else {
      handlePlayTrack(queue[currentIndex + 1]);
    }
  }, [queue, currentTrack, isShuffle, isLoop, isAutoplay, tracks, handlePlayTrack]);

  const handlePrevTrack = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;

    if (currentTime > 3) {
      ytPlayerRef.current?.seekTo(0);
      setCurrentTime(0);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      handlePlayTrack(queue[currentIndex - 1]);
    } else if (isLoop) {
      handlePlayTrack(queue[queue.length - 1]);
    }
  }, [queue, currentTrack, currentTime, isLoop, handlePlayTrack]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
    ytPlayerRef.current?.seekTo(time);
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    ytPlayerRef.current?.setVolume(vol * 100);
  }, []);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      ytPlayerRef.current?.setVolume(volume * 100);
    } else {
      setIsMuted(true);
      ytPlayerRef.current?.setVolume(0);
    }
  }, [isMuted, volume]);

  const handleToggleLike = useCallback((trackId: string) => {
    setLikedTrackIds((prev) => {
      const isLiked = prev.includes(trackId);
      if (isLiked) {
        return prev.filter((id) => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  }, []);

  const handleAddToQueue = useCallback((track: Track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const handleRemoveFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handlePlayAll = useCallback(
    (tracksToPlay: Track[]) => {
      if (tracksToPlay.length === 0) return;
      setQueue(tracksToPlay);
      handlePlayTrack(tracksToPlay[0]);
    },
    [handlePlayTrack]
  );

  const handleClearHistory = useCallback(() => {
    setHistoryTracks([]);
    localStorage.removeItem('onsound_history');
  }, []);

  // Compute liked tracks
  const likedTracks = useMemo(() => {
    const map = new Map<string, Track>();
    tracks.forEach((t) => map.set(t.id, t));
    return likedTrackIds
      .map((id) => map.get(id))
      .filter((t): t is Track => t !== undefined);
  }, [tracks, likedTrackIds]);

  // One-click intuitive DiscPlayer launcher (automatically plays if idle)
  const handleOpenDiscPlayerDirectly = useCallback(() => {
    if (!currentTrack && tracks.length > 0) {
      handlePlayTrack(tracks[0]);
    } else if (currentTrack && !isPlaying) {
      handlePlayPause();
    }
    setIsDiscPlayerOpen(true);
  }, [currentTrack, tracks, isPlaying, handlePlayTrack, handlePlayPause]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Top Navbar: Dedicated to YouTube Exploration, Categories & Auth */}
      <Navbar
        currentCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onPerformSearch={(q) => {
          setSearchQuery(q);
          setActiveCategory('explore');
        }}
        likedCount={likedTrackIds.length}
        hasActiveTrack={!!currentTrack}
        isPlaying={isPlaying}
        onOpenCinemaStage={() => setIsCinemaStageOpen(true)}
        onOpenDiscPlayer={handleOpenDiscPlayerDirectly}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        userCategories={userCategories}
        onOpenCreateCategory={() => {
          setTargetClassifyTrack(currentTrack);
          setIsClassifyModalOpen(true);
        }}
      />

      {/* Main Content Area: YouTube Exploration & Category Hub */}
      <main className="flex-1 px-3 sm:px-6 lg:px-8 pt-5 pb-32">
        <YouTubeExploreView
          allTracks={tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          likedTrackIds={likedTrackIds}
          likedTracks={likedTracks}
          historyTracks={historyTracks}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onCategoryChange={setActiveCategory}
          onSearchQueryChange={setSearchQuery}
          onPlayTrack={handlePlayTrack}
          onPlayAll={handlePlayAll}
          onAddToQueue={handleAddToQueue}
          onOpenCinemaStage={(t) => {
            handlePlayTrack(t);
            setIsCinemaStageOpen(true);
          }}
          onOpenDiscPlayer={(t) => {
            handlePlayTrack(t);
            setIsDiscPlayerOpen(true);
          }}
          onToggleLike={handleToggleLike}
          onClearHistory={handleClearHistory}
          currentUser={currentUser}
          userCategories={userCategories}
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onToggleTrackInCategory={handleToggleTrackInCategory}
          onOpenClassifyModal={handleOpenClassifyModal}
          onOpenAuth={handleOpenAuth}
        />
      </main>

      {/* Docked Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={currentTrack?.duration || 180}
        volume={volume}
        isMuted={isMuted}
        isLoop={isLoop}
        isShuffle={isShuffle}
        isAutoplay={isAutoplay}
        isLiked={currentTrack ? likedTrackIds.includes(currentTrack.id) : false}
        onPlayPause={handlePlayPause}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleLoop={() => setIsLoop(!isLoop)}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleAutoplay={() => setIsAutoplay(!isAutoplay)}
        onToggleLike={handleToggleLike}
        onOpenLyrics={() => setIsLyricsOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenExpanded={() => setIsExpandedPlayerOpen(true)}
        onOpenCinemaStage={() => setIsCinemaStageOpen(true)}
        onOpenDiscPlayer={() => setIsDiscPlayerOpen(true)}
      />

      {/* Framer DiscPlayer - Emotional Vinyl Turntable Modal */}
      {isDiscPlayerOpen && currentTrack && (
        <EmotionalDiscModal
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={currentTrack.duration || 180}
          isLiked={likedTrackIds.includes(currentTrack.id)}
          isOpen={isDiscPlayerOpen}
          onClose={() => setIsDiscPlayerOpen(false)}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onPrev={handlePrevTrack}
          onNext={handleNextTrack}
          onToggleLike={handleToggleLike}
          onOpenCinemaStage={() => {
            setIsDiscPlayerOpen(false);
            setIsCinemaStageOpen(true);
          }}
          onOpenLyrics={() => {
            setIsDiscPlayerOpen(false);
            setIsLyricsOpen(true);
          }}
          onOpenQueue={() => {
            setIsDiscPlayerOpen(false);
            setIsQueueOpen(true);
          }}
        />
      )}

      {/* Ultra-Cool YouTube Cinema Stage Modal */}
      {isCinemaStageOpen && currentTrack && (
        <CinemaStageModal
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={currentTrack.duration || 180}
          isLiked={likedTrackIds.includes(currentTrack.id)}
          isAutoplay={isAutoplay}
          onClose={() => setIsCinemaStageOpen(false)}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onPrev={handlePrevTrack}
          onNext={handleNextTrack}
          onToggleLike={handleToggleLike}
          onToggleAutoplay={() => setIsAutoplay(!isAutoplay)}
          recommendations={tracks.filter((t) => t.youtubeId && t.id !== currentTrack.id)}
          onSelectTrack={handlePlayTrack}
        />
      )}

      {/* Synced Lyrics Modal */}
      {currentTrack && (
        <LyricsModal
          track={currentTrack}
          currentTime={currentTime}
          isOpen={isLyricsOpen}
          onClose={() => setIsLyricsOpen(false)}
          onSeek={handleSeek}
        />
      )}

      {/* Queue Drawer Modal */}
      <QueueModal
        queue={queue}
        currentTrack={currentTrack}
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        onSelectTrack={handlePlayTrack}
        onRemoveTrack={handleRemoveFromQueue}
      />

      {/* Fullscreen Expanded Player */}
      {isExpandedPlayerOpen && currentTrack && (
        <ExpandedPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          comments={[]}
          isLiked={likedTrackIds.includes(currentTrack.id)}
          onClose={() => setIsExpandedPlayerOpen(false)}
          onPlayPause={handlePlayPause}
          onToggleLike={handleToggleLike}
          onAddToPlaylist={() => {}}
          onAddComment={() => {}}
          onSeek={handleSeek}
        />
      )}

      {/* Real YouTube Floating PiP / Background Player Dock */}
      <YouTubePlayerDock
        ref={ytPlayerRef}
        currentVideoId={currentTrack?.youtubeId}
        isPlaying={isPlaying}
        isCinemaExpanded={isExpandedPlayerOpen || isCinemaStageOpen}
        trackTitle={currentTrack?.title}
        artistName={currentTrack?.artist}
        onTimeUpdate={(t) => setCurrentTime(t)}
        onDurationChange={(d) => {
          if (d && !isNaN(d) && isFinite(d)) {
            setCurrentTrack((prev) => (prev ? { ...prev, duration: d } : null));
          }
        }}
        onPlayStateChange={(playing) => setIsPlaying(playing)}
        onEnded={handleNextTrack}
        onClosePip={() => {}}
      />

      {/* Authentication Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* Category Classification Modal */}
      <CategoryClassifyModal
        isOpen={isClassifyModalOpen}
        onClose={() => {
          setIsClassifyModalOpen(false);
          setTargetClassifyTrack(null);
        }}
        track={targetClassifyTrack}
        categories={userCategories}
        onCreateCategory={handleCreateCategory}
        onToggleTrackInCategory={handleToggleTrackInCategory}
      />
    </div>
  );
}
