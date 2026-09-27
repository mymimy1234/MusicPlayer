import React, { useState } from 'react';
import { Track, Playlist } from '../../types/music';
import { TrackRow } from '../Common/TrackRow';
import { Heart, Disc, Wand2, History, Play, PlusCircle, Upload, Music2 } from 'lucide-react';

interface LibraryViewProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  historyTracks: Track[];
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenCreatePlaylist: () => void;
  onOpenImportSong: () => void;
  onGoToStudio: () => void;
  onOpenDetails: (track: Track) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  playlists,
  currentTrack,
  isPlaying,
  likedTrackIds,
  historyTracks,
  onPlayTrack,
  onPlayAll,
  onToggleLike,
  onAddToQueue,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onOpenImportSong,
  onGoToStudio,
  onOpenDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'liked' | 'imported' | 'playlists' | 'creations' | 'history'>('liked');

  const likedTracks = tracks.filter((t) => likedTrackIds.includes(t.id));
  const importedTracks = tracks.filter((t) => t.sourceType === 'uploaded_file' || t.sourceType === 'stream_url' || t.generatorType === 'real_audio');
  const myPlaylists = playlists.filter((pl) => pl.isCustom);
  const myCreations = tracks.filter((t) => t.generatorType === 'custom');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400 tracking-wider">USER REPOSITORY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            내 음악 보관함
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            내가 찜한 노래, 직접 가져온 실제 MP3 음원, 커스텀 플레이리스트 및 작곡한 음악
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportSong}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>노래 가져오기</span>
          </button>

          {activeTab === 'liked' && likedTracks.length > 0 && (
            <button
              onClick={() => onPlayAll(likedTracks)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>좋아요 전곡 재생</span>
            </button>
          )}
          {activeTab === 'imported' && importedTracks.length > 0 && (
            <button
              onClick={() => onPlayAll(importedTracks)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>가져온 곡 전곡 재생</span>
            </button>
          )}
          {activeTab === 'playlists' && (
            <button
              onClick={onOpenCreatePlaylist}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>플레이리스트 추가</span>
            </button>
          )}
          {activeTab === 'creations' && (
            <button
              onClick={onGoToStudio}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span>새 비트 작곡하기</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800 max-w-fit">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'liked'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          <span>좋아요 ({likedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('imported')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'imported'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Music2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>가져온 실제 노래 ({importedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'playlists'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Disc className="w-3.5 h-3.5 text-indigo-400" />
          <span>플레이리스트 ({myPlaylists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('creations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'creations'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>스튜디오 자작곡 ({myCreations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>최근 재생 ({historyTracks.length})</span>
        </button>
      </div>

      {/* Tab 1: Liked Tracks */}
      {activeTab === 'liked' && (
        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
          {likedTracks.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-sm">
              <Heart className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p>아직 좋아요를 누른 노래가 없습니다.</p>
              <p className="text-xs text-neutral-400 mt-1">마음에 드는 곡에 하트를 눌러 보관해보세요.</p>
            </div>
          ) : (
            likedTracks.map((t, idx) => (
              <TrackRow
                key={t.id}
                track={t}
                index={idx}
                isPlayingCurrent={currentTrack?.id === t.id && isPlaying}
                isLiked={true}
                onPlay={onPlayTrack}
                onToggleLike={onToggleLike}
                onAddToQueue={onAddToQueue}
                onClickDetails={onOpenDetails}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 2: Imported Real Tracks */}
      {activeTab === 'imported' && (
        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
          {importedTracks.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-sm">
              <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-300 font-medium">가져온 실제 노래가 없습니다.</p>
              <p className="text-xs text-neutral-400 mt-1">
                내 컴퓨터의 MP3/음원 파일을 업로드하거나 실제 마스터 음원 팩을 가져와보세요.
              </p>
              <button
                onClick={onOpenImportSong}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow"
              >
                실제 노래 가져오기
              </button>
            </div>
          ) : (
            importedTracks.map((t, idx) => (
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
      )}

      {/* Tab 3: My Custom Playlists */}
      {activeTab === 'playlists' && (
        <div>
          {myPlaylists.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-8">
              <Disc className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-300 font-medium text-sm">아직 생성한 플레이리스트가 없습니다.</p>
              <button
                onClick={onOpenCreatePlaylist}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow"
              >
                첫 플레이리스트 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => onSelectPlaylist(pl)}
                  className="group cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/90 border border-neutral-800/60 hover:border-neutral-700/80 rounded-2xl p-5 transition-all"
                >
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-neutral-950">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors">
                    {pl.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{pl.description}</p>
                  <div className="mt-3 text-[11px] font-mono text-neutral-500">
                    {pl.trackIds.length}곡 수록 · {pl.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Studio Creations */}
      {activeTab === 'creations' && (
        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
          {myCreations.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-sm">
              <Wand2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p>아직 스튜디오에서 작곡한 곡이 없습니다.</p>
              <button
                onClick={onGoToStudio}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow"
              >
                비트 스튜디오로 이동하여 작곡하기
              </button>
            </div>
          ) : (
            myCreations.map((t, idx) => (
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
      )}

      {/* Tab 5: History */}
      {activeTab === 'history' && (
        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
          {historyTracks.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-sm">
              <History className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p>최근 청취한 기록이 없습니다.</p>
            </div>
          ) : (
            historyTracks.map((t, idx) => (
              <TrackRow
                key={`${t.id}-${idx}`}
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
      )}
    </div>
  );
};

