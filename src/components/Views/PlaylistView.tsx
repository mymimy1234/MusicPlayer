import React, { useState } from 'react';
import { Playlist, Track } from '../../types/music';
import { TrackRow } from '../Common/TrackRow';
import {
  Play,
  Shuffle,
  PlusCircle,
  Clock,
  ArrowLeft,
  Trash2,
  Disc,
} from 'lucide-react';

interface PlaylistViewProps {
  playlists: Playlist[];
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  selectedPlaylist: Playlist | null;
  onSelectPlaylist: (playlist: Playlist | null) => void;
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onOpenCreateModal: () => void;
  onRemoveTrackFromPlaylist?: (playlistId: string, trackId: string) => void;
  onOpenDetails: (track: Track) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlists,
  tracks,
  currentTrack,
  isPlaying,
  likedTrackIds,
  selectedPlaylist,
  onSelectPlaylist,
  onPlayTrack,
  onPlayAll,
  onToggleLike,
  onAddToQueue,
  onOpenCreateModal,
  onRemoveTrackFromPlaylist,
  onOpenDetails,
}) => {
  if (selectedPlaylist) {
    // Detail View of a specific playlist
    const playlistTracks = selectedPlaylist.trackIds
      .map((id) => tracks.find((t) => t.id === id))
      .filter((t): t is Track => t !== undefined);

    const totalDurationSecs = playlistTracks.reduce((sum, t) => sum + t.duration, 0);
    const totalMinutes = Math.floor(totalDurationSecs / 60);

    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        <button
          onClick={() => onSelectPlaylist(null)}
          className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>플레이리스트 목록으로 돌아가기</span>
        </button>

        {/* Playlist Header Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8 border-b border-neutral-800">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-neutral-800 bg-neutral-900">
            <img
              src={selectedPlaylist.coverUrl}
              alt={selectedPlaylist.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="text-xs font-semibold text-indigo-400 tracking-wider mb-1">
              {selectedPlaylist.isCustom ? 'MY PLAYLIST' : 'CURATED PLAYLIST'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 font-display">
              {selectedPlaylist.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mb-4 max-w-xl">
              {selectedPlaylist.description}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-neutral-400 mb-6">
              <span>{playlistTracks.length}곡</span>
              <span aria-hidden="true">·</span>
              <span>약 {totalMinutes}분</span>
              <span aria-hidden="true">·</span>
              <span>{selectedPlaylist.createdAt} 생성</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => onPlayAll(playlistTracks)}
                disabled={playlistTracks.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>전곡 재생</span>
              </button>

              <button
                onClick={() => {
                  const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
                  onPlayAll(shuffled);
                }}
                disabled={playlistTracks.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-medium transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>셔플 재생</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
          {playlistTracks.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-sm">
              이 플레이리스트에 담긴 곡이 없습니다.
            </div>
          ) : (
            playlistTracks.map((t, idx) => (
              <div key={t.id} className="relative group/item flex items-center">
                <div className="flex-1">
                  <TrackRow
                    track={t}
                    index={idx}
                    isPlayingCurrent={currentTrack?.id === t.id && isPlaying}
                    isLiked={likedTrackIds.includes(t.id)}
                    onPlay={onPlayTrack}
                    onToggleLike={onToggleLike}
                    onAddToQueue={onAddToQueue}
                    onClickDetails={onOpenDetails}
                  />
                </div>
                {selectedPlaylist.isCustom && onRemoveTrackFromPlaylist && (
                  <button
                    onClick={() => onRemoveTrackFromPlaylist(selectedPlaylist.id, t.id)}
                    className="p-2 text-neutral-500 hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-opacity mr-2"
                    title="플레이리스트에서 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Gallery of all Playlists
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Disc className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 tracking-wider">ALL PLAYLISTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            플레이리스트 보관소
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            에디터가 엄선한 테마별 모음과 내가 직접 만든 커스텀 플레이리스트
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>새 플레이리스트 생성</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => onSelectPlaylist(pl)}
            className="group cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/90 border border-neutral-800/60 hover:border-neutral-700/80 rounded-2xl p-5 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-neutral-950">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-indigo-400">
                  {pl.isCustom ? '커스텀 제작' : '공식 에디터 픽'}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {pl.trackIds.length}곡
                </span>
              </div>

              <h4 className="text-base font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors">
                {pl.title}
              </h4>
              <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                {pl.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
              <span>{pl.createdAt}</span>
              <span className="text-indigo-400 text-[11px] font-medium group-hover:underline">
                자세히 보기 →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
