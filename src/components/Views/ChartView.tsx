import React, { useState } from 'react';
import { Track, Genre } from '../../types/music';
import { TrackRow } from '../Common/TrackRow';
import { Play, TrendingUp, Sparkles } from 'lucide-react';

interface ChartViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onOpenDetails: (track: Track) => void;
}

const GENRES: Genre[] = [
  'All',
  'City Pop',
  'Lo-Fi',
  'K-Indie',
  'Synthwave',
  'Acoustic',
  'R&B',
  'Electronic',
];

export const ChartView: React.FC<ChartViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onPlayTrack,
  onPlayAll,
  onToggleLike,
  onAddToQueue,
  onOpenDetails,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<Genre>('All');
  const [sortBy, setSortBy] = useState<'plays' | 'likes' | 'recent'>('plays');

  const filteredTracks = tracks
    .filter((t) => (selectedGenre === 'All' ? true : t.genre === selectedGenre))
    .sort((a, b) => {
      if (sortBy === 'plays') return b.plays - a.plays;
      if (sortBy === 'likes') return b.likes - a.likes;
      return b.releaseDate.localeCompare(a.releaseDate);
    });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 tracking-wider">CHART LEADERBOARD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            실시간 온사운드 차트 TOP 100
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            매시간 업데이트되는 실시간 스트리밍 재생수와 리스너 반응 기반 공식 순위
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlayAll(filteredTracks)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>차트 전곡 재생</span>
          </button>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Genre filter segmented control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedGenre === g
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {g === 'All' ? '전체 장르' : g}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'plays' | 'likes' | 'recent')}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="plays">재생 많은 순</option>
            <option value="likes">좋아요 많은 순</option>
            <option value="recent">최신 발매 순</option>
          </select>
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center justify-between px-4 py-2 text-xs font-mono text-neutral-500 border-b border-neutral-800/80">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <span className="w-6 text-center">#</span>
          <span>곡 제목 및 아티스트</span>
        </div>
        <div className="hidden md:block w-44 px-2">앨범</div>
        <div className="hidden lg:block w-24">장르</div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden sm:inline-block w-16 text-right">재생수</span>
          <span className="w-10 text-right">길이</span>
          <span className="w-12 text-right">관리</span>
        </div>
      </div>

      {/* Track rows */}
      <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            해당 조건의 곡이 없습니다.
          </div>
        ) : (
          filteredTracks.map((t, idx) => (
            <TrackRow
              key={t.id}
              track={t}
              index={idx}
              rank={idx + 1}
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
    </div>
  );
};
