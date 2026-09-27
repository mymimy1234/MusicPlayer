import React, { useState } from 'react';
import { Track, Comment } from '../../types/music';
import {
  ChevronDown,
  Heart,
  Share2,
  ListPlus,
  Activity,
  Send,
  Sparkles,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { Visualizer } from './Visualizer';

interface ExpandedPlayerProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  comments: Comment[];
  isLiked: boolean;
  onClose: () => void;
  onToggleLike: (trackId: string) => void;
  onAddToPlaylist: (trackId: string) => void;
  onAddComment: (trackId: string, text: string) => void;
  onSeek: (time: number) => void;
}

export const ExpandedPlayer: React.FC<ExpandedPlayerProps> = ({
  track,
  isPlaying,
  currentTime,
  comments,
  isLiked,
  onClose,
  onToggleLike,
  onAddToPlaylist,
  onAddComment,
  onSeek,
}) => {
  const [visualMode, setVisualMode] = useState<'bars' | 'wave' | 'circle'>('bars');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'visual' | 'mv' | 'lyrics' | 'comments'>(
    track.youtubeId ? 'mv' : 'visual'
  );
  const [copied, setCopied] = useState(false);

  // Active lyric calculation
  let activeLyricIndex = -1;
  for (let i = 0; i < track.lyrics.length; i++) {
    if (currentTime >= track.lyrics[i].time) {
      activeLyricIndex = i;
    } else {
      break;
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(track.id, commentText.trim());
    setCommentText('');
  };

  const trackComments = comments.filter((c) => c.trackId === track.id);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Dynamic ambient backdrop glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top action header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-800/60 max-w-6xl w-full mx-auto">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800/60 transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
          <span className="text-sm font-medium">플레이어 접기</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            {track.youtubeId && (
              <button
                onClick={() => setActiveTab('mv')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'mv'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>공식 MV</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'visual'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              비주얼라이저
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'lyrics'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              싱크 가사
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'comments'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              댓글 ({trackComments.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddToPlaylist(track.id)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors"
            title="플레이리스트에 담기"
          >
            <ListPlus className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors relative"
            title="공유하기"
          >
            <Share2 className="w-5 h-5" />
            {copied && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-neutral-700">
                링크 복사됨!
              </span>
            )}
          </button>
          <button
            onClick={() => onToggleLike(track.id)}
            className="p-2 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-800/60 transition-colors"
            title="좋아요"
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked ? 'text-rose-500 fill-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 items-stretch pb-28">
        {/* Left Column: Artwork & Track Metadata */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center">
          <div className="relative group w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 mb-6">
            <img
              src={track.coverUrl}
              alt={track.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />
            {isPlaying && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs text-indigo-300 border border-indigo-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>재생 중</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 mb-1 max-w-md">
            {track.title}
          </h2>
          <p className="text-base text-neutral-400 mb-3">{track.artist}</p>

          {/* Clean Unboxed Metadata with · separator */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 font-mono mb-4">
            <span>{track.genre}</span>
            <span aria-hidden="true">·</span>
            <span>BPM {track.bpm}</span>
            <span aria-hidden="true">·</span>
            <span>{track.musicalKey}</span>
            <span aria-hidden="true">·</span>
            <span>{track.releaseDate}</span>
          </div>

          <p className="text-xs text-neutral-400 max-w-md leading-relaxed px-4">
            {track.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            {track.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-neutral-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Interactive Tab (Visualizer / YouTube MV / Lyrics / Comments) */}
        <div className="w-full md:w-1/2 bg-neutral-900/60 rounded-2xl border border-neutral-800/80 p-6 flex flex-col justify-between overflow-hidden">
          {activeTab === 'mv' && track.youtubeId && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>YouTube 공식 뮤직비디오</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                      HD 1080p
                    </span>
                    <a
                      href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="유튜브에서 직접 보기"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 16:9 Video Player Container */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl border border-neutral-800">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                    title={track.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

              {/* Synchronized Lyric line preview below the MV */}
              <div className="mt-4 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>실시간 싱크 가사</span>
                </div>
                {activeLyricIndex >= 0 && track.lyrics[activeLyricIndex] ? (
                  <div>
                    <p className="text-sm font-semibold text-neutral-100">
                      {track.lyrics[activeLyricIndex].text}
                    </p>
                    {track.lyrics[activeLyricIndex].translation && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {track.lyrics[activeLyricIndex].translation}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">음악이 흘러나오는 중...</p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <span>채널: {track.channelTitle || track.artist}</span>
                <span>YouTube Player API 스트리밍</span>
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>실시간 오디오 분석기</span>
                  </div>
                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                    <button
                      onClick={() => setVisualMode('bars')}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        visualMode === 'bars'
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      스펙트럼
                    </button>
                    <button
                      onClick={() => setVisualMode('wave')}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        visualMode === 'wave'
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      파형
                    </button>
                    <button
                      onClick={() => setVisualMode('circle')}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        visualMode === 'circle'
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      펄스
                    </button>
                  </div>
                </div>

                <div className="h-56 bg-neutral-950/80 rounded-xl border border-neutral-800 p-4 flex items-center justify-center">
                  <Visualizer
                    mode={visualMode}
                    isPlaying={isPlaying}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Real-time currently sung lyric highlight */}
              <div className="mt-6 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>현재 가사</span>
                </div>
                {activeLyricIndex >= 0 && track.lyrics[activeLyricIndex] ? (
                  <div>
                    <p className="text-base font-semibold text-neutral-100">
                      {track.lyrics[activeLyricIndex].text}
                    </p>
                    {track.lyrics[activeLyricIndex].translation && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {track.lyrics[activeLyricIndex].translation}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">음악이 흘러나오는 중...</p>
                )}
              </div>

              {/* Sound Architecture Details */}
              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span>합성 엔진: Web Audio API Oscillator</span>
                <span>샘플링: 48,000 Hz 32-bit</span>
              </div>
            </div>
          )}

          {activeTab === 'lyrics' && (
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-semibold text-neutral-200 mb-3">
                실시간 싱크 가사 (클릭 시 이동)
              </h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 select-none">
                {track.lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => onSeek(line.time)}
                      className={`cursor-pointer p-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-200 border-l-2 border-indigo-400'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                      }`}
                    >
                      <p className={`text-sm ${isActive ? 'font-bold' : ''}`}>
                        {line.text}
                      </p>
                      {line.translation && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {line.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-semibold text-neutral-200 mb-3">
                리스너 이야기 ({trackComments.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {trackComments.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-xs">
                    첫 번째 감상평을 남겨보세요!
                  </div>
                ) : (
                  trackComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 text-[10px] flex items-center justify-center font-bold">
                            {comment.avatar}
                          </div>
                          <span className="text-xs font-semibold text-neutral-300">
                            {comment.author}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-200 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="이 곡에 대한 감상을 남겨보세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>등록</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
