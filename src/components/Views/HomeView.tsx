import React from 'react';
import { Track, Playlist, Genre } from '../../types/music';
import { TrackCard } from '../Common/TrackCard';
import { TrackRow } from '../Common/TrackRow';
import {
  Play,
  Pause,
  Flame,
  Disc,
  Radio,
  Wand2,
  Upload,
  Sparkles,
  Youtube,
  Tv,
  ArrowRight,
} from 'lucide-react';

interface HomeViewProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenDetails: (track: Track) => void;
  onOpenCinemaStage: (track: Track) => void;
  onGoToStudio: () => void;
  onOpenImportSong: () => void;
  onGoToYouTube: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  playlists,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onPlayTrack,
  onToggleLike,
  onAddToQueue,
  onSelectPlaylist,
  onOpenDetails,
  onOpenCinemaStage,
  onGoToStudio,
  onOpenImportSong,
  onGoToYouTube,
}) => {
  const heroTrack = tracks.find((t) => t.youtubeId) || tracks[0];
  const isHeroPlaying = currentTrack?.id === heroTrack?.id && isPlaying;
  const youtubeTracks = tracks.filter((t) => t.youtubeId);
  const trendingTracks = tracks.slice(0, 6);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Spotlight Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-red-950/20 border border-neutral-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/10 filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full bg-indigo-600/10 filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400 tracking-wider font-mono">
                {heroTrack.youtubeId ? 'FEATURED YOUTUBE CINEMA' : 'FEATURED TRACK'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 font-display">
              {heroTrack.title}
            </h1>
            <p className="text-lg text-neutral-300 font-medium mb-3">{heroTrack.artist}</p>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6 line-clamp-2">
              {heroTrack.description}
            </p>

            {/* Clean Metadata with bullet points */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-6">
              <span>{heroTrack.genre}</span>
              <span aria-hidden="true">·</span>
              <span>BPM {heroTrack.bpm}</span>
              <span aria-hidden="true">·</span>
              <span>{(heroTrack.plays / 1000000).toFixed(1)}M 재생</span>
              {heroTrack.youtubeId && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-red-400 font-bold">YouTube HD 1080p</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onPlayTrack(heroTrack)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                  heroTrack.youtubeId
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                    <span>{heroTrack.youtubeId ? '음악 & 영상 재생' : '지금 재생'}</span>
                  </>
                )}
              </button>

              {heroTrack.youtubeId && (
                <button
                  onClick={() => {
                    onPlayTrack(heroTrack);
                    onOpenCinemaStage(heroTrack);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/40 text-sm font-semibold transition-all shadow-lg cursor-pointer"
                >
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>시네마 무대 모드</span>
                </button>
              )}

              <button
                onClick={onGoToYouTube}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>유튜브 음악 검색</span>
              </button>
            </div>
          </div>

          {/* Hero cover image card */}
          <div className="relative group shrink-0 w-60 h-60 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800">
            <img
              src={heroTrack.coverUrl}
              alt={heroTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            {heroTrack.youtubeId && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                YouTube Live
              </div>
            )}
            <div
              onClick={() => {
                onPlayTrack(heroTrack);
                if (heroTrack.youtubeId) onOpenCinemaStage(heroTrack);
              }}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl transform active:scale-90 transition-transform">
                <Play className="w-6 h-6 fill-white ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Live Music Banner Callout */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/40 via-neutral-900 to-neutral-900/60 border border-red-900/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Youtube className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>유튜브 실시간 검색 & 시네마 무대</span>
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-extrabold">NEW</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              원하는 가수의 모든 라이브 무대와 뮤직비디오를 무제한으로 검색하고 감상하세요.
            </p>
          </div>
        </div>

        <button
          onClick={onGoToYouTube}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/25 whitespace-nowrap cursor-pointer active:scale-95"
        >
          <span>유튜브 음악 탐색</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Featured YouTube MV Row */}
      {youtubeTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Youtube className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white font-display">
                YouTube 공식 뮤직비디오 & 라이브
              </h2>
            </div>
            <button
              onClick={onGoToYouTube}
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <span>더 많은 유튜브 음악 검색</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {youtubeTracks.slice(0, 3).map((track) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className="group bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1"
                >
                  <div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-neutral-950">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                        YouTube HD
                      </div>
                      <div
                        onClick={() => {
                          onPlayTrack(track);
                          onOpenCinemaStage(track);
                        }}
                        className={`absolute inset-0 flex items-center justify-center gap-2 transition-opacity cursor-pointer ${
                          isPlayingThis ? 'opacity-100 bg-black/60' : 'opacity-0 group-hover:opacity-100 bg-black/40'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <h3
                      onClick={() => {
                        onPlayTrack(track);
                        onOpenCinemaStage(track);
                      }}
                      className="text-sm font-semibold text-neutral-100 group-hover:text-red-400 line-clamp-1 cursor-pointer transition-colors"
                    >
                      {track.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 truncate">{track.artist}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onPlayTrack(track);
                        onOpenCinemaStage(track);
                      }}
                      className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold hover:text-cyan-200 transition-colors cursor-pointer"
                    >
                      <Tv className="w-3.5 h-3.5 text-red-500" />
                      <span>시네마 무대</span>
                    </button>

                    <button
                      onClick={() => onPlayTrack(track)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      재생
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending Tracks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-white font-display">실시간 인기 차트 TOP 6</h2>
          </div>
          <span className="text-xs text-neutral-500">실시간 스트리밍 집계</span>
        </div>

        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/50 p-2">
          {trendingTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              rank={idx + 1}
              isPlayingCurrent={currentTrack?.id === track.id && isPlaying}
              isLiked={likedTrackIds.includes(track.id)}
              onPlay={onPlayTrack}
              onToggleLike={onToggleLike}
              onAddToQueue={onAddToQueue}
              onClickDetails={onOpenDetails}
            />
          ))}
        </div>
      </section>

      {/* Curated Playlists Bento Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Disc className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white font-display">테마별 큐레이션 플레이리스트</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {playlists.slice(0, 4).map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="group cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-xl"
            >
              <div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-neutral-950">
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-neutral-100 group-hover:text-indigo-400 transition-colors truncate">
                  {pl.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {pl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 font-mono">
                <span>{pl.trackIds.length}곡 수록</span>
                <span>{!pl.isCustom ? '에디터 큐레이션' : '내 플레이리스트'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Beat Studio Callout Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-indigo-950/40 border border-purple-800/40 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Wand2 className="w-3.5 h-3.5" />
              <span>크리에이터 스튜디오</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              직접 비트와 멜로디를 작곡해보세요
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg">
              16스텝 시퀀서와 신디사이저로 Lo-Fi, City Pop 비트를 만들고 나만의 노래로 저장하여 플랫폼에 바로 등록할 수 있습니다.
            </p>
          </div>

          <button
            onClick={onGoToStudio}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-transform active:scale-95 shrink-0"
          >
            비트 스튜디오 열기
          </button>
        </div>
      </section>
    </div>
  );
};
