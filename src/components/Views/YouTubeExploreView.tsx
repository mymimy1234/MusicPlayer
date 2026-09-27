import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '../../types/music';
import { UserProfile, UserCategory } from '../../types/auth';
import {
  searchYouTubeLive,
  YouTubeSearchResult,
  convertYouTubeResultToTrack,
  getYouTubeSuggestions,
  extractYouTubeId,
  fetchYouTubeMeta,
} from '../../services/youtubeService';
import {
  Search,
  Youtube,
  Play,
  ListPlus,
  Tv,
  Check,
  Flame,
  Radio,
  Sparkles,
  Link as LinkIcon,
  Heart,
  LayoutGrid,
  List,
  Compass,
  ListMusic,
  History,
  Trash2,
  Copy,
  ChevronRight,
  Coffee,
  Disc,
  FolderPlus,
  Tag,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  X,
  Music2,
  Mic2,
  SlidersHorizontal,
  Moon,
  Car,
  Laptop,
} from 'lucide-react';

interface YouTubeExploreViewProps {
  allTracks?: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  likedTracks: Track[];
  historyTracks: Track[];
  activeCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchQueryChange: (q: string) => void;
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
  onAddToQueue: (track: Track) => void;
  onOpenCinemaStage: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onClearHistory?: () => void;
  currentUser: UserProfile | null;
  userCategories: UserCategory[];
  onCreateCategory: (name: string, icon: string, color: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleTrackInCategory: (categoryId: string, track: Track) => void;
  onOpenClassifyModal: (track: Track) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

// Built-in Exploration Categories with pre-configured search queries and iconography
const SYSTEM_CATEGORIES = [
  { id: 'explore', label: '전체 탐색', icon: Compass, query: 'K-POP 인기곡' },
  { id: 'night', label: '🌙 새벽 감성 힐링', icon: Moon, query: '새벽 감성 힐링 노래 모음' },
  { id: 'drive', label: '🚗 신나는 드라이브', icon: Car, query: '신나는 드라이브 믹스 K-POP' },
  { id: 'coding', label: '💻 집중 코딩 노동요', icon: Laptop, query: '집중 코딩 노동요 로파이' },
  { id: 'trending', label: '인기 MV', icon: Flame, query: 'K-POP 인기 뮤직비디오' },
  { id: 'kpop', label: '아이돌 & K-POP', icon: Sparkles, query: 'K-POP 최신 아이돌 인기곡' },
  { id: 'hiphop', label: '힙합 & R&B', icon: Disc, query: '한국 힙합 알앤비 플레이리스트' },
  { id: 'indie', label: '밴드 & 인디', icon: Music2, query: '한국 인디 밴드 라이브 명곡' },
  { id: 'ballad', label: '감성 발라드', icon: Heart, query: '애절한 감성 발라드 명곡' },
  { id: 'lofi', label: '로파이 & 칠', icon: Coffee, query: '카페 감성 로파이 음악 플레이리스트' },
  { id: 'citypop', label: '시티팝 드라이브', icon: Disc, query: '한국 시티팝 명곡 모음 드라이브' },
  { id: 'ost', label: '드라마 OST', icon: Tv, query: '레전드 명작 드라마 OST 모음' },
  { id: 'live', label: '4K 직캠 & 무대', icon: Radio, query: 'K-POP 레전드 라이브 무대 4K' },
  { id: 'mixes', label: '모음 플레이리스트', icon: ListMusic, query: '노래 모음 연속 재생 플레이리스트' },
];

export const YouTubeExploreView: React.FC<YouTubeExploreViewProps> = ({
  allTracks = [],
  currentTrack,
  isPlaying,
  likedTrackIds,
  likedTracks,
  historyTracks,
  activeCategory,
  searchQuery,
  onCategoryChange,
  onSearchQueryChange,
  onPlayTrack,
  onPlayAll,
  onAddToQueue,
  onOpenCinemaStage,
  onToggleLike,
  onClearHistory,
  currentUser,
  userCategories,
  onCreateCategory,
  onDeleteCategory,
  onToggleTrackInCategory,
  onOpenClassifyModal,
  onOpenAuth,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter & Sorting controls
  const [filterMode, setFilterMode] = useState<'all' | 'mv' | 'live' | 'playlist'>('all');
  const [sortBy, setSortBy] = useState<'curated' | 'views' | 'title'>('curated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Inline Category Creator
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📁');

  // Feedback states
  const [addedQueueId, setAddedQueueId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Curated showcase cache
  const [lofiTracks, setLofiTracks] = useState<YouTubeSearchResult[]>([]);
  const [liveStages, setLiveStages] = useState<YouTubeSearchResult[]>([]);
  const [cityPopTracks, setCityPopTracks] = useState<YouTubeSearchResult[]>([]);

  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Perform search query
  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsLoading(true);
    setShowSuggestions(false);

    let queryStr = term.trim();
    if (filterMode === 'mv' && !queryStr.includes('MV') && !queryStr.includes('뮤직비디오')) {
      queryStr += ' Official MV';
    } else if (filterMode === 'live' && !queryStr.includes('라이브') && !queryStr.includes('Live')) {
      queryStr += ' Live Stage';
    } else if (filterMode === 'playlist' && !queryStr.includes('플레이리스트')) {
      queryStr += ' 노래 모음 플레이리스트';
    }

    try {
      const results = await searchYouTubeLive(queryStr);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // When active category changes
  useEffect(() => {
    const sysCat = SYSTEM_CATEGORIES.find((c) => c.id === activeCategory);
    if (sysCat) {
      onSearchQueryChange(sysCat.query);
      executeSearch(sysCat.query);
    }
  }, [activeCategory, filterMode]);

  // Initial load
  useEffect(() => {
    const initialQuery = searchQuery || '2026 K-POP 인기 뮤직비디오';
    executeSearch(initialQuery);

    // Pre-load showcase sections for explore view
    Promise.all([
      searchYouTubeLive('카페 감성 로파이 음악 플레이리스트'),
      searchYouTubeLive('K-POP 레전드 라이브 무대 4K'),
      searchYouTubeLive('한국 시티팝 명곡 모음 드라이브'),
    ]).then(([lofi, live, city]) => {
      setLofiTracks(lofi || []);
      setLiveStages(live || []);
      setCityPopTracks(city || []);
    });
  }, []);

  // Autocomplete fetcher with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const list = await getYouTubeSuggestions(searchQuery);
      setSuggestions(list);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueueClick = (track: Track) => {
    onAddToQueue(track);
    setAddedQueueId(track.id);
    showToast(`'${track.title}' 곡이 재생 대기열에 추가되었습니다`);
    setTimeout(() => setAddedQueueId(null), 2000);
  };

  const handleCopyLink = (videoId: string) => {
    const link = `https://www.youtube.com/watch?v=${videoId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(videoId);
    showToast('YouTube 영상 링크가 클립보드에 복사되었습니다');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(urlInput);
    if (!id) return;

    setUrlLoading(true);
    const meta = await fetchYouTubeMeta(id);
    setUrlLoading(false);

    if (meta) {
      const customTrack: Track = {
        id: `yt-${meta.videoId}`,
        title: meta.title,
        artist: meta.artist,
        album: 'YouTube Direct Import',
        coverUrl: meta.thumbnailUrl,
        duration: 210,
        genre: 'K-POP',
        bpm: 120,
        musicalKey: 'C Major',
        plays: 1000,
        likes: 10,
        releaseDate: new Date().toLocaleDateString('ko-KR'),
        description: '직접 입력한 YouTube 공식 음원',
        tags: ['유튜브', '공식음원', '직접재생'],
        generatorType: 'youtube',
        sourceType: 'youtube',
        youtubeId: meta.videoId,
        channelTitle: meta.artist,
        lyrics: [
          { time: 0, text: `${meta.title} - ${meta.artist}` },
          { time: 5, text: 'YouTube 공식 영상이 시네마 무대에서 재생 중입니다.' },
        ],
      };

      setUrlInput('');
      setShowUrlImport(false);
      onPlayTrack(customTrack);
      onOpenCinemaStage(customTrack);
      showToast(`'${meta.title}' 시네마 재생을 시작합니다`);
    }
  };

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onCreateCategory(newCatName.trim(), newCatEmoji, '#ef4444');
    setNewCatName('');
    setIsCreatingCategory(false);
    showToast(`'${newCatName}' 카테고리가 새로 생성되었습니다`);
  };

  // Check if current active category is a custom category
  const activeCustomCategory = useMemo(() => {
    if (activeCategory.startsWith('category-')) {
      const catId = activeCategory.replace('category-', '');
      return userCategories.find((c) => c.id === catId);
    }
    return null;
  }, [activeCategory, userCategories]);

  // Resolve full Track objects for custom category
  const categoryTracks = useMemo<Track[]>(() => {
    if (!activeCustomCategory) return [];
    return activeCustomCategory.trackIds.map((tid) => {
      const found =
        allTracks.find((t) => t.id === tid) ||
        likedTracks.find((t) => t.id === tid) ||
        historyTracks.find((t) => t.id === tid);
      if (found) return found;

      const cleanYtId = tid.replace('yt-', '');
      return {
        id: tid,
        title: '저장된 YouTube 음악',
        artist: 'YouTube Creator',
        album: 'YouTube Music',
        coverUrl: `https://img.youtube.com/vi/${cleanYtId}/hqdefault.jpg`,
        duration: 210,
        genre: 'K-POP' as const,
        bpm: 120,
        musicalKey: 'C Major',
        plays: 100,
        likes: 1,
        releaseDate: '',
        description: '',
        tags: ['유튜브'],
        generatorType: 'youtube' as const,
        lyrics: [],
        youtubeId: cleanYtId,
      };
    });
  }, [activeCustomCategory, allTracks, likedTracks, historyTracks]);

  // Featured Collections for Curated Highlights
  const dawnHealingTracks = useMemo(() => {
    return allTracks.filter(
      (t) =>
        t.tags.includes('새벽감성') ||
        t.id === 'yt-iu-night-letter' ||
        t.id === 'yt-paulkim-every-day' ||
        t.id === 'yt-yerin-here-i-am' ||
        t.id === 'yt-jukjae-stars' ||
        t.id === 'yt-taeyeon-four-seasons' ||
        t.id === 'yt-sung-every-moment' ||
        t.id === 'yt-iu-love-wins-all'
    );
  }, [allTracks]);

  const excitingDriveTracks = useMemo(() => {
    return allTracks.filter(
      (t) =>
        t.tags.includes('드라이브') ||
        t.id === 'yt-lesserafim-perfect-night' ||
        t.id === 'yt-aespa-supernova' ||
        t.id === 'yt-day6-welcome' ||
        t.id === 'yt-twice-talk-that-talk' ||
        t.id === 'yt-newjeans-hype-boy' ||
        t.id === 'yt-gidle-queencard' ||
        t.id === 'yt-seventeen-super'
    );
  }, [allTracks]);

  const focusCodingTracks = useMemo(() => {
    return allTracks.filter(
      (t) =>
        t.tags.includes('코딩노동요') ||
        t.id === 'yt-lofigirl-study-1am' ||
        t.id === 'yt-synthwave-cyberpunk-dev' ||
        t.id === 'yt-coding-flow-rain' ||
        t.id === 'yt-ghibli-piano-coding' ||
        t.id === 'yt-deep-focus-programming' ||
        t.id === 'yt-peppertones-good-luck'
    );
  }, [allTracks]);

  // Sorted search results
  const sortedSearchResults = useMemo(() => {
    const list = [...searchResults];
    if (sortBy === 'views') {
      return list.sort((a, b) => {
        const parseCount = (s: string) => {
          if (!s) return 0;
          if (s.includes('억')) return parseFloat(s.replace(/[^0-9.]/g, '')) * 100000000;
          if (s.includes('만')) return parseFloat(s.replace(/[^0-9.]/g, '')) * 10000;
          return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
        };
        return parseCount(b.viewCount) - parseCount(a.viewCount);
      });
    } else if (sortBy === 'title') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [searchResults, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Toast alert popup */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-neutral-900 border border-red-500/50 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header with Sleek Clean Red-Gradient Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-600/10 filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 rounded-full bg-indigo-600/10 filter blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-extrabold text-red-400 tracking-wider font-mono uppercase">
              YOUTUBE EXPLORER & CATEGORY HUB
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white font-display mb-2 tracking-tight">
            유튜브 음악을 탐색하고 카테고리별로 자유롭게 분류하세요
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mb-5 leading-relaxed">
            원하는 가수, 최신 발매곡, 라이브 직캠을 탐색하고 나만의 맞춤 카테고리에 분류하여 정리하세요.
            고화질 시네마 무대와 앰비언트 비주얼라이저로 감상할 수 있습니다.
          </p>

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchBoxRef} className="relative mb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(searchQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="가수, 곡명, 드라마 OST, 4K 직캠, 플레이리스트 검색..."
                  className="w-full bg-neutral-900/90 border border-neutral-700/80 focus:border-red-500 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none shadow-xl transition-all"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-600/30 transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>검색</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlImport(!showUrlImport)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  showUrlImport
                    ? 'bg-neutral-800 border-red-500 text-red-400'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
                title="YouTube URL 직접 붙여넣기"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-40 max-h-60 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSearchQueryChange(s);
                      executeSearch(s);
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 cursor-pointer transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct URL Paste Drawer */}
          {showUrlImport && (
            <form
              onSubmit={handleUrlSubmit}
              className="mt-3 p-3 bg-neutral-950/90 border border-neutral-800 rounded-2xl flex items-center gap-2 animate-fadeIn"
            >
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... 링크 또는 영상 ID 직접 붙여넣기"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={!urlInput.trim() || urlLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>{urlLoading ? '로딩 중...' : '시네마로 즉시 재생'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Categories Navigation Bar & Classifier */}
      <div className="space-y-3">
        {/* Category Pills Header with Category Management */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              카테고리별 음악 분류 & 둘러보기
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingCategory(!isCreatingCategory)}
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-red-400" />
              <span>+ 새 카테고리 추가</span>
            </button>
          </div>
        </div>

        {/* Inline Category Creator Form */}
        {isCreatingCategory && (
          <form
            onSubmit={handleCreateCategorySubmit}
            className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center gap-2 animate-fadeIn"
          >
            <input
              type="text"
              value={newCatEmoji}
              onChange={(e) => setNewCatEmoji(e.target.value)}
              className="w-10 text-center bg-neutral-950 border border-neutral-800 rounded-xl py-1.5 text-sm"
              title="이모지 변경"
            />
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="새 카테고리 이름 (예: 🏃 운동할 때, 🌙 심야 드라이브)"
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
            >
              카테고리 생성
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingCategory(false)}
              className="p-1.5 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Scrollable Categories Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {/* Preset Categories */}
          {SYSTEM_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-102'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}

          {/* User Custom Categories */}
          {userCategories.map((c) => {
            const isActive = activeCategory === `category-${c.id}`;
            return (
              <button
                key={c.id}
                onClick={() => onCategoryChange(`category-${c.id}`)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-lg shadow-red-600/30'
                    : 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">
                  {c.trackIds.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 border-t border-neutral-800/80">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                filterMode === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterMode('mv')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                filterMode === 'mv' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              공식 MV
            </button>
            <button
              onClick={() => setFilterMode('live')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                filterMode === 'live' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              라이브 무대
            </button>
            <button
              onClick={() => setFilterMode('playlist')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                filterMode === 'playlist'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              연속 모음
            </button>
          </div>

          {/* Sort & View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded-xl border border-neutral-800">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="curated" className="bg-neutral-900">
                  추천순
                </option>
                <option value="views" className="bg-neutral-900">
                  인기 조회수순
                </option>
                <option value="title" className="bg-neutral-900">
                  곡명 가나다순
                </option>
              </select>
            </div>

            <div className="flex items-center p-1 bg-neutral-900 rounded-xl border border-neutral-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="그리드 카드 뷰"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="목록 리스트 뷰"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW BRANCH 1: USER CUSTOM CATEGORY DETAIL */}
      {activeCustomCategory && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800">
            <div className="flex items-center gap-3.5">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0"
                style={{
                  backgroundColor: `${activeCustomCategory.color}25`,
                  color: activeCustomCategory.color,
                }}
              >
                {activeCustomCategory.icon}
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{activeCustomCategory.name}</span>
                  <span className="text-xs font-mono font-normal text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                    {categoryTracks.length}곡 저장됨
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">{activeCustomCategory.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {categoryTracks.length > 0 && (
                <>
                  <button
                    onClick={() => onPlayAll(categoryTracks)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>전체 재생 ({categoryTracks.length}곡)</span>
                  </button>
                  <button
                    onClick={() => {
                      categoryTracks.forEach((t) => onAddToQueue(t));
                      showToast(`${categoryTracks.length}곡이 대기열에 추가되었습니다`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    title="대기열에 모두 추가"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">대기열 추가</span>
                  </button>
                </>
              )}
              <button
                onClick={() => onDeleteCategory(activeCustomCategory.id)}
                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                title="이 카테고리 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {categoryTracks.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-neutral-800/80">
              <Tag className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-200">
                '{activeCustomCategory.name}' 카테고리에 담긴 곡이 없습니다
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto mb-5">
                유튜브를 탐색하고 영상 카드의 '카테고리 담기' 버튼을 눌러 이 분류에 저장해보세요!
              </p>
              <button
                onClick={() => onCategoryChange('explore')}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                유튜브 노래 탐색하러 가기
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {categoryTracks.map((trk) => (
                <TrackCard
                  key={trk.id}
                  track={trk}
                  isPlayingThis={currentTrack?.id === trk.id && isPlaying}
                  isLiked={likedTrackIds.includes(trk.id)}
                  addedQueueId={addedQueueId}
                  copiedId={copiedId}
                  onPlayTrack={onPlayTrack}
                  onOpenCinemaStage={onOpenCinemaStage}
                  onToggleLike={onToggleLike}
                  onQueueClick={handleQueueClick}
                  onCopyLink={handleCopyLink}
                  onOpenClassifyModal={onOpenClassifyModal}
                />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/60 overflow-hidden">
              {categoryTracks.map((trk, idx) => (
                <div
                  key={trk.id}
                  className="flex items-center justify-between p-3 sm:p-4 hover:bg-neutral-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center text-xs font-mono text-neutral-500 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-neutral-950">
                      <img
                        src={trk.coverUrl}
                        alt={trk.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => onPlayTrack(trk)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white text-white" />
                      </button>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono px-1 rounded text-white">
                        {`${Math.floor(trk.duration / 60)}:${(trk.duration % 60)
                          .toString()
                          .padStart(2, '0')}`}
                      </span>
                    </div>

                    <div className="min-w-0 pr-4">
                      <h4
                        onClick={() => {
                          onPlayTrack(trk);
                          onOpenCinemaStage(trk);
                        }}
                        className="text-xs sm:text-sm font-semibold text-neutral-100 hover:text-red-400 cursor-pointer truncate transition-colors"
                      >
                        {trk.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        <span className="truncate">{trk.artist}</span>
                        {trk.album && (
                          <>
                            <span>·</span>
                            <span className="truncate text-neutral-500">{trk.album}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenClassifyModal(trk)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="카테고리에 분류하기"
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onPlayTrack(trk);
                        onOpenCinemaStage(trk);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="시네마 무대로 열기"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">시네마</span>
                    </button>
                    <button
                      onClick={() => onToggleLike(trk.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        likedTrackIds.includes(trk.id) ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'
                      }`}
                      title="좋아요"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedTrackIds.includes(trk.id) ? 'fill-rose-500' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleQueueClick(trk)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        addedQueueId === trk.id ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                      }`}
                      title="대기열 추가"
                    >
                      {addedQueueId === trk.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <ListPlus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onPlayTrack(trk)}
                      className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="즉시 재생"
                    >
                      <Play className="w-3.5 h-3.5 fill-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW BRANCH 2: FAVORITES */}
      {activeCategory === 'favorites' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>내가 찜한 유튜브 노래</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                유튜브에서 검색하여 마음에 든 음악 {likedTracks.length}곡이 저장되어 있습니다.
              </p>
            </div>
            {likedTracks.length > 0 && (
              <button
                onClick={() => onPlayAll(likedTracks)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>전체 재생</span>
              </button>
            )}
          </div>

          {likedTracks.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-neutral-800/80">
              <Heart className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-200">아직 찜한 노래가 없습니다</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto mb-5">
                유튜브를 탐색하고 마음에 드는 영상 카드의 하트 버튼을 눌러 보관해보세요!
              </p>
              <button
                onClick={() => onCategoryChange('explore')}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                인기 YouTube 영상 탐색하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {likedTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlayingThis={currentTrack?.id === track.id && isPlaying}
                  isLiked={true}
                  addedQueueId={addedQueueId}
                  copiedId={copiedId}
                  onPlayTrack={onPlayTrack}
                  onOpenCinemaStage={onOpenCinemaStage}
                  onToggleLike={onToggleLike}
                  onQueueClick={handleQueueClick}
                  onCopyLink={handleCopyLink}
                  onOpenClassifyModal={onOpenClassifyModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW BRANCH 3: HISTORY */}
      {activeCategory === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <span>최근 감상한 유튜브 영상</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                최근 재생했던 {historyTracks.length}개의 영상 기록입니다.
              </p>
            </div>
            {historyTracks.length > 0 && onClearHistory && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>기록 지우기</span>
              </button>
            )}
          </div>

          {historyTracks.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-neutral-800/80">
              <History className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-200">최근 감상한 기록이 없습니다</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto mb-5">
                원하는 곡을 검색하고 감상하면 여기에 자동으로 기록됩니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {historyTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlayingThis={currentTrack?.id === track.id && isPlaying}
                  isLiked={likedTrackIds.includes(track.id)}
                  addedQueueId={addedQueueId}
                  copiedId={copiedId}
                  onPlayTrack={onPlayTrack}
                  onOpenCinemaStage={onOpenCinemaStage}
                  onToggleLike={onToggleLike}
                  onQueueClick={handleQueueClick}
                  onCopyLink={handleCopyLink}
                  onOpenClassifyModal={onOpenClassifyModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW BRANCH 4: ACTIVE CATEGORY / SEARCH RESULTS */}
      {!activeCustomCategory && activeCategory !== 'favorites' && activeCategory !== 'history' && (
        <div className="space-y-8">
          {/* Active Results Title Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                {activeCategory === 'trending'
                  ? '인기 MV 차트'
                  : activeCategory === 'night'
                  ? '🌙 새벽 감성 힐링곡 모음'
                  : activeCategory === 'drive'
                  ? '🚗 신나는 드라이브 믹스'
                  : activeCategory === 'coding'
                  ? '💻 집중 코딩 노동요'
                  : activeCategory === 'kpop'
                  ? 'K-POP 아이돌'
                  : activeCategory === 'hiphop'
                  ? '힙합 & R&B'
                  : activeCategory === 'indie'
                  ? '밴드 & 인디'
                  : activeCategory === 'ballad'
                  ? '감성 발라드'
                  : activeCategory === 'lofi'
                  ? '로파이 & 칠'
                  : activeCategory === 'citypop'
                  ? '시티팝 드라이브'
                  : activeCategory === 'ost'
                  ? '드라마 OST'
                  : activeCategory === 'live'
                  ? '4K 직캠 & 라이브 무대'
                  : activeCategory === 'mixes'
                  ? '모음 플레이리스트'
                  : `"${searchQuery || '실시간 탐색'}"`}
              </h2>
              <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                {sortedSearchResults.length}곡
              </span>
            </div>
          </div>

          {/* Results Grid or List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-neutral-900/40 rounded-2xl p-4 border border-neutral-800/80 animate-pulse space-y-3"
                >
                  <div className="aspect-video w-full bg-neutral-800 rounded-xl" />
                  <div className="h-4 bg-neutral-800 rounded w-3/4" />
                  <div className="h-3 bg-neutral-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : sortedSearchResults.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-neutral-800">
              <Youtube className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-200">검색 결과를 찾을 수 없습니다</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                다른 키워드로 검색해보시거나 상단의 카테고리 탭을 클릭해보세요.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedSearchResults.map((item) => {
                const track = convertYouTubeResultToTrack(item);
                const isPlayingThis = currentTrack?.youtubeId === item.videoId && isPlaying;
                const isLiked = likedTrackIds.includes(track.id);

                return (
                  <TrackCard
                    key={item.videoId}
                    track={track}
                    rawItem={item}
                    isPlayingThis={isPlayingThis}
                    isLiked={isLiked}
                    addedQueueId={addedQueueId}
                    copiedId={copiedId}
                    onPlayTrack={onPlayTrack}
                    onOpenCinemaStage={onOpenCinemaStage}
                    onToggleLike={onToggleLike}
                    onQueueClick={handleQueueClick}
                    onCopyLink={handleCopyLink}
                    onOpenClassifyModal={onOpenClassifyModal}
                  />
                );
              })}
            </div>
          ) : (
            /* List Mode */
            <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800 divide-y divide-neutral-800/60 overflow-hidden">
              {sortedSearchResults.map((item, idx) => {
                const track = convertYouTubeResultToTrack(item);
                const isPlayingThis = currentTrack?.youtubeId === item.videoId && isPlaying;
                const isLiked = likedTrackIds.includes(track.id);

                return (
                  <div
                    key={item.videoId}
                    className="flex items-center justify-between p-3.5 hover:bg-neutral-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="w-6 text-center text-xs font-mono text-neutral-500 font-bold shrink-0">
                        {idx + 1}
                      </span>

                      {/* Thumbnail with overlay play */}
                      <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-neutral-950">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => onPlayTrack(track)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white text-white" />
                        </button>
                        <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono px-1 rounded text-white">
                          {item.duration}
                        </span>
                      </div>

                      <div className="min-w-0 pr-4">
                        <h4
                          onClick={() => {
                            onPlayTrack(track);
                            onOpenCinemaStage(track);
                          }}
                          className="text-xs sm:text-sm font-semibold text-neutral-100 hover:text-red-400 cursor-pointer truncate transition-colors"
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                          <span className="truncate">{item.channelTitle}</span>
                          {item.viewCount && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-neutral-500">{item.viewCount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Classify into Category Button */}
                      <button
                        onClick={() => onOpenClassifyModal(track)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="카테고리에 분류하기"
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onPlayTrack(track);
                          onOpenCinemaStage(track);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="시네마 무대로 열기"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">시네마</span>
                      </button>

                      <button
                        onClick={() => onToggleLike(track.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'
                        }`}
                        title="좋아요"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleQueueClick(track)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          addedQueueId === track.id ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                        }`}
                        title="대기열 추가"
                      >
                        {addedQueueId === track.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <ListPlus className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onPlayTrack(track)}
                        className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="즉시 재생"
                      >
                        <Play className="w-3.5 h-3.5 fill-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CURATED SECTION CAROUSELS (When in Explore mode) */}
          {activeCategory === 'explore' && (
            <div className="space-y-10 pt-6 border-t border-neutral-800">
              {/* Row: 🌙 새벽 감성 힐링곡 */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌙</span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>새벽 감성 힐링곡</span>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                          {dawnHealingTracks.length}곡
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        조용하고 감성적인 밤과 새벽에 지친 마음을 다정하게 위로해주는 힐링 플레이리스트
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dawnHealingTracks.length > 0 && (
                      <button
                        onClick={() => onPlayAll(dawnHealingTracks)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-indigo-200" />
                        <span>전체 재생</span>
                      </button>
                    )}
                    <button
                      onClick={() => onCategoryChange('category-cat-night-vibe')}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>카테고리 이동</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dawnHealingTracks.slice(0, 4).map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlayingThis={currentTrack?.id === track.id && isPlaying}
                      isLiked={likedTrackIds.includes(track.id)}
                      addedQueueId={addedQueueId}
                      copiedId={copiedId}
                      onPlayTrack={onPlayTrack}
                      onOpenCinemaStage={onOpenCinemaStage}
                      onToggleLike={onToggleLike}
                      onQueueClick={handleQueueClick}
                      onCopyLink={handleCopyLink}
                      onOpenClassifyModal={onOpenClassifyModal}
                    />
                  ))}
                </div>
              </div>

              {/* Row: 🚗 신나는 드라이브 믹스 */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚗</span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>신나는 드라이브 믹스</span>
                        <span className="text-xs font-mono text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                          {excitingDriveTracks.length}곡
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        텐션 폭발! 고속도로 질주하며 시원하게 따라부르는 K-POP & 밴드 명곡
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {excitingDriveTracks.length > 0 && (
                      <button
                        onClick={() => onPlayAll(excitingDriveTracks)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-rose-200" />
                        <span>전체 재생</span>
                      </button>
                    )}
                    <button
                      onClick={() => onCategoryChange('category-cat-drive-hype')}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>카테고리 이동</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {excitingDriveTracks.slice(0, 4).map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlayingThis={currentTrack?.id === track.id && isPlaying}
                      isLiked={likedTrackIds.includes(track.id)}
                      addedQueueId={addedQueueId}
                      copiedId={copiedId}
                      onPlayTrack={onPlayTrack}
                      onOpenCinemaStage={onOpenCinemaStage}
                      onToggleLike={onToggleLike}
                      onQueueClick={handleQueueClick}
                      onCopyLink={handleCopyLink}
                      onOpenClassifyModal={onOpenClassifyModal}
                    />
                  ))}
                </div>
              </div>

              {/* Row: 💻 집중 & 코딩 노동요 */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💻</span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>집중 & 코딩 노동요</span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          {focusCodingTracks.length}곡
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        개발자 몰입도 200%! 잡념을 비우고 클린 코드를 완성하는 로파이 & 신스웨이브 비트
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {focusCodingTracks.length > 0 && (
                      <button
                        onClick={() => onPlayAll(focusCodingTracks)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-emerald-200" />
                        <span>전체 재생</span>
                      </button>
                    )}
                    <button
                      onClick={() => onCategoryChange('category-cat-study-focus')}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>카테고리 이동</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {focusCodingTracks.slice(0, 4).map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlayingThis={currentTrack?.id === track.id && isPlaying}
                      isLiked={likedTrackIds.includes(track.id)}
                      addedQueueId={addedQueueId}
                      copiedId={copiedId}
                      onPlayTrack={onPlayTrack}
                      onOpenCinemaStage={onOpenCinemaStage}
                      onToggleLike={onToggleLike}
                      onQueueClick={handleQueueClick}
                      onCopyLink={handleCopyLink}
                      onOpenClassifyModal={onOpenClassifyModal}
                    />
                  ))}
                </div>
              </div>

              {/* Row: 감성 카페 & 로파이 칠 비트 */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <div>
                      <h3 className="text-base font-bold text-white">감성 카페 & 로파이 칠 비트</h3>
                      <p className="text-xs text-neutral-400">
                        공부하거나 쉴 때 편안하게 감상하는 힐링 YouTube 플레이리스트
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onCategoryChange('lofi')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <span>더보기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {lofiTracks.slice(0, 4).map((item) => {
                    const track = convertYouTubeResultToTrack(item);
                    return (
                      <TrackCard
                        key={item.videoId}
                        track={track}
                        rawItem={item}
                        isPlayingThis={currentTrack?.youtubeId === item.videoId && isPlaying}
                        isLiked={likedTrackIds.includes(track.id)}
                        addedQueueId={addedQueueId}
                        copiedId={copiedId}
                        onPlayTrack={onPlayTrack}
                        onOpenCinemaStage={onOpenCinemaStage}
                        onToggleLike={onToggleLike}
                        onQueueClick={handleQueueClick}
                        onCopyLink={handleCopyLink}
                        onOpenClassifyModal={onOpenClassifyModal}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Row 2: 전설의 라이브 & 직캠 무대 */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">전설의 4K 라이브 & 무대 직캠</h3>
                      <p className="text-xs text-neutral-400">
                        생생한 보컬과 현장감이 살아있는 고화질 직캠 라이브
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onCategoryChange('live')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <span>더보기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {liveStages.slice(0, 4).map((item) => {
                    const track = convertYouTubeResultToTrack(item);
                    return (
                      <TrackCard
                        key={item.videoId}
                        track={track}
                        rawItem={item}
                        isPlayingThis={currentTrack?.youtubeId === item.videoId && isPlaying}
                        isLiked={likedTrackIds.includes(track.id)}
                        addedQueueId={addedQueueId}
                        copiedId={copiedId}
                        onPlayTrack={onPlayTrack}
                        onOpenCinemaStage={onOpenCinemaStage}
                        onToggleLike={onToggleLike}
                        onQueueClick={handleQueueClick}
                        onCopyLink={handleCopyLink}
                        onOpenClassifyModal={onOpenClassifyModal}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TrackCardProps {
  track: Track;
  rawItem?: YouTubeSearchResult;
  isPlayingThis: boolean;
  isLiked: boolean;
  addedQueueId: string | null;
  copiedId: string | null;
  onPlayTrack: (track: Track) => void;
  onOpenCinemaStage: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onQueueClick: (track: Track) => void;
  onCopyLink: (videoId: string) => void;
  onOpenClassifyModal: (track: Track) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  rawItem,
  isPlayingThis,
  isLiked,
  addedQueueId,
  copiedId,
  onPlayTrack,
  onOpenCinemaStage,
  onToggleLike,
  onQueueClick,
  onCopyLink,
  onOpenClassifyModal,
}) => {
  const videoId = track.youtubeId || (rawItem && rawItem.videoId) || '';

  return (
    <div className="group relative bg-neutral-900/40 hover:bg-neutral-900/90 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1">
      <div>
        {/* Video Thumbnail with Badges & Hover Play Overlay */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-neutral-950">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
              HD
            </span>
          </div>

          <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded border border-white/10">
            {rawItem?.duration ||
              `${Math.floor(track.duration / 60)}:${(track.duration % 60)
                .toString()
                .padStart(2, '0')}`}
          </div>

          {/* Hover Play & Cinema Stage overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity ${
              isPlayingThis
                ? 'opacity-100 bg-black/60'
                : 'opacity-0 group-hover:opacity-100 bg-black/40'
            }`}
          >
            <button
              onClick={() => onPlayTrack(track)}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl transform active:scale-95 transition-transform cursor-pointer"
              title="즉시 재생"
            >
              {isPlayingThis ? (
                <div className="flex gap-1 items-end h-3.5">
                  <span className="w-1 bg-white h-full animate-bounce" />
                  <span className="w-1 bg-white h-2/3 animate-bounce delay-75" />
                  <span className="w-1 bg-white h-4/5 animate-bounce delay-150" />
                </div>
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                onPlayTrack(track);
                onOpenCinemaStage(track);
              }}
              className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-cyan-300 flex items-center justify-center shadow-xl border border-cyan-500/40 transform active:scale-95 transition-transform cursor-pointer"
              title="시네마 무대 모드로 감상"
            >
              <Tv className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Channel */}
        <h3
          onClick={() => {
            onPlayTrack(track);
            onOpenCinemaStage(track);
          }}
          className="text-xs sm:text-sm font-semibold text-neutral-100 group-hover:text-red-400 line-clamp-2 leading-snug cursor-pointer transition-colors"
          title={track.title}
        >
          {track.title}
        </h3>

        <p className="text-xs text-neutral-400 mt-1 truncate flex items-center gap-1">
          <span>{track.artist}</span>
        </p>

        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-1">
          {rawItem?.viewCount && <span>{rawItem.viewCount}</span>}
          {rawItem?.publishedTime && (
            <>
              <span>·</span>
              <span>{rawItem.publishedTime}</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="mt-3.5 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
        <button
          onClick={() => {
            onPlayTrack(track);
            onOpenCinemaStage(track);
          }}
          className="flex items-center gap-1 text-neutral-400 hover:text-cyan-300 transition-colors py-0.5 cursor-pointer"
          title="시네마 무대 모드로 열기"
        >
          <Tv className="w-3.5 h-3.5 text-red-500" />
          <span className="text-[11px] font-semibold">시네마</span>
        </button>

        <div className="flex items-center gap-1">
          {/* Classify into Category Button */}
          <button
            onClick={() => onOpenClassifyModal(track)}
            className="p-1.5 text-neutral-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
            title="카테고리에 분류하기"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          {videoId && (
            <button
              onClick={() => onCopyLink(videoId)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title={copiedId === videoId ? '링크 복사 완료!' : 'YouTube 링크 복사'}
            >
              {copiedId === videoId ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            onClick={() => onToggleLike(track.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'
            }`}
            title="좋아요"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={() => onQueueClick(track)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              addedQueueId === track.id ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="대기열 추가"
          >
            {addedQueueId === track.id ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ListPlus className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => onPlayTrack(track)}
            className="px-2 py-0.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
          >
            재생
          </button>
        </div>
      </div>
    </div>
  );
};
