import React, { useState, useEffect } from 'react';
import { Track } from '../../types/music';
import { TrackRow } from '../Common/TrackRow';
import {
  searchYouTubeLive,
  YouTubeSearchResult,
  convertYouTubeResultToTrack,
} from '../../services/youtubeService';
import {
  Search,
  Youtube,
  Tv,
  Play,
  ListPlus,
  Heart,
  Music,
  Check,
  Sparkles,
} from 'lucide-react';

interface SearchResultsViewProps {
  query: string;
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onOpenDetails: (track: Track) => void;
  onOpenCinemaStage?: (track: Track) => void;
  onClearSearch: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  tracks,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onPlayTrack,
  onToggleLike,
  onAddToQueue,
  onOpenDetails,
  onOpenCinemaStage,
  onClearSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'youtube' | 'local'>('all');
  const [ytResults, setYtResults] = useState<YouTubeSearchResult[]>([]);
  const [isYtLoading, setIsYtLoading] = useState(false);
  const [addedQueueId, setAddedQueueId] = useState<string | null>(null);

  const q = query.toLowerCase().trim();

  // Local tracks search
  const matchedLocalTracks = tracks.filter((t) => {
    const titleMatch = t.title.toLowerCase().includes(q);
    const artistMatch = t.artist.toLowerCase().includes(q);
    const albumMatch = t.album.toLowerCase().includes(q);
    const genreMatch = t.genre.toLowerCase().includes(q);
    const tagMatch = t.tags.some((tag) => tag.toLowerCase().includes(q));
    const lyricMatch = t.lyrics.some(
      (l) => l.text.toLowerCase().includes(q) || l.translation?.toLowerCase().includes(q)
    );
    return titleMatch || artistMatch || albumMatch || genreMatch || tagMatch || lyricMatch;
  });

  // Fetch YouTube live search results
  useEffect(() => {
    let isCancelled = false;
    if (!query.trim()) {
      setYtResults([]);
      return;
    }

    setIsYtLoading(true);
    searchYouTubeLive(query.trim())
      .then((results) => {
        if (!isCancelled) {
          setYtResults(results);
          setIsYtLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setIsYtLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [query]);

  const handleQueueClick = (track: Track) => {
    onAddToQueue(track);
    setAddedQueueId(track.id);
    setTimeout(() => setAddedQueueId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-400 font-mono tracking-wider">
              REALTIME SEARCH
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            "{query}" 실시간 통합 검색
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              전체 ({ytResults.length + matchedLocalTracks.length})
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube ({ytResults.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
                activeTab === 'local'
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>보관함/플랫폼 ({matchedLocalTracks.length})</span>
            </button>
          </div>

          <button
            onClick={onClearSearch}
            className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 bg-neutral-900 rounded-xl border border-neutral-800 hover:bg-neutral-800 transition-colors"
          >
            검색 지우기
          </button>
        </div>
      </div>

      {/* Section 1: YouTube Search Results */}
      {(activeTab === 'all' || activeTab === 'youtube') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white">
                YouTube 실시간 검색 결과 ({ytResults.length}개)
              </h3>
            </div>
            <span className="text-xs text-neutral-500">
              클릭 시 고화질 시네마 무대 및 음원 즉시 재생
            </span>
          </div>

          {isYtLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-neutral-900/50 rounded-2xl p-3 border border-neutral-800 animate-pulse space-y-2.5"
                >
                  <div className="aspect-video w-full bg-neutral-800 rounded-xl" />
                  <div className="h-4 bg-neutral-800 rounded w-3/4" />
                  <div className="h-3 bg-neutral-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : ytResults.length === 0 ? (
            <div className="bg-neutral-900/30 rounded-2xl border border-neutral-800 p-8 text-center text-xs text-neutral-500">
              유튜브 검색 결과가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ytResults.map((item) => {
                const track = convertYouTubeResultToTrack(item);
                const isPlayingThis = currentTrack?.youtubeId === item.videoId && isPlaying;
                const isLiked = likedTrackIds.includes(track.id);

                return (
                  <div
                    key={item.videoId}
                    className="group bg-neutral-900/40 hover:bg-neutral-900/90 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-3 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-2.5 bg-neutral-950">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                          YouTube HD
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {item.duration}
                        </div>

                        {/* Hover Overlay Play & Cinema Stage */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center gap-2 transition-opacity ${
                            isPlayingThis ? 'opacity-100 bg-black/60' : 'opacity-0 group-hover:opacity-100 bg-black/40'
                          }`}
                        >
                          <button
                            onClick={() => onPlayTrack(track)}
                            className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                            title="재생"
                          >
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </button>
                          {onOpenCinemaStage && (
                            <button
                              onClick={() => {
                                onPlayTrack(track);
                                onOpenCinemaStage(track);
                              }}
                              className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-cyan-300 flex items-center justify-center shadow-lg border border-cyan-500/40 active:scale-95 transition-transform"
                              title="시네마 무대"
                            >
                              <Tv className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4
                        onClick={() => {
                          onPlayTrack(track);
                          if (onOpenCinemaStage) onOpenCinemaStage(track);
                        }}
                        className="text-xs font-semibold text-neutral-100 group-hover:text-red-400 line-clamp-2 leading-snug cursor-pointer transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-neutral-400 mt-1 truncate">
                        {item.channelTitle}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                        {item.viewCount || '유튜브 스트리밍'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                      {onOpenCinemaStage && (
                        <button
                          onClick={() => {
                            onPlayTrack(track);
                            onOpenCinemaStage(track);
                          }}
                          className="flex items-center gap-1 text-neutral-400 hover:text-cyan-300 transition-colors py-0.5 text-[11px] font-medium"
                        >
                          <Tv className="w-3 h-3 text-red-500" />
                          <span>시네마 무대</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => handleQueueClick(track)}
                          className={`p-1 rounded-md transition-colors ${
                            addedQueueId === track.id ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                          }`}
                          title="대기열 추가"
                        >
                          {addedQueueId === track.id ? <Check className="w-3.5 h-3.5" /> : <ListPlus className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onPlayTrack(track)}
                          className="px-2 py-0.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold text-[10px] rounded-md transition-colors"
                        >
                          재생
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Section 2: Platform & Library Local Tracks */}
      {(activeTab === 'all' || activeTab === 'local') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              플랫폼 수록곡 및 보관함 ({matchedLocalTracks.length}곡)
            </h3>
          </div>

          <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
            {matchedLocalTracks.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                플랫폼 수록곡 중 일치하는 음원이 없습니다.
              </div>
            ) : (
              matchedLocalTracks.map((t, idx) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  index={idx}
                  isPlayingCurrent={currentTrack?.id === t.id && isPlaying}
                  isLiked={likedTrackIds.includes(t.id)}
                  onPlay={onPlayTrack}
                  onToggleLike={onToggleLike}
                  onAddToQueue={onAddToQueue}
                  onClickDetails={onOpenDetails}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};
