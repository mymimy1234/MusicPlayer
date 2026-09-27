import React, { useState, useRef } from 'react';
import { Track, Genre } from '../../types/music';
import { parseLrcOrText } from '../../utils/lrcParser';
import {
  extractYouTubeId,
  fetchYouTubeMeta,
} from '../../services/youtubeService';
import {
  X,
  Upload,
  Link as LinkIcon,
  Music,
  Check,
  FileAudio,
  Sparkles,
  Image as ImageIcon,
  Play,
  Youtube,
  Search,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface ImportSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTrack: (track: Track, playImmediately?: boolean) => void;
}

const DEFAULT_COVERS = [
  '/src/assets/images/album_city_night_1790520759013.jpg',
  '/src/assets/images/album_lofi_room_1790520771235.jpg',
  '/src/assets/images/album_synth_sunset_1790520782238.jpg',
  '/src/assets/images/album_acoustic_forest_1790520792518.jpg',
];

// Curated Top Real YouTube Songs
const CURATED_YOUTUBE_TRACKS: Array<{
  youtubeId: string;
  title: string;
  artist: string;
  album: string;
  genre: Genre;
  duration: number;
  coverUrl: string;
  lyrics: string;
  description: string;
}> = [
  {
    youtubeId: 'JleoAppaxi0',
    title: 'Love wins all',
    artist: '아이유 (IU)',
    album: 'The Winning',
    genre: 'Ballad',
    duration: 314,
    coverUrl: 'https://img.youtube.com/vi/JleoAppaxi0/maxresdefault.jpg',
    lyrics: `[00:00.00]Love wins all - 아이유 (IU)
[00:15.00]디스토피아 속에서도 피어나는 사랑의 찬가
[00:35.00]유영하듯 떠오른 그날의 밤
[00:54.00]어디로 가는지 몰라도 좋아
[01:14.00]너와 함께라면 무너지지 않아
[01:35.00]세상이 끝나는 그날에도
[01:55.00]우리의 사랑은 영원히 이길 테니까
[02:20.00]Love wins all, beyond the dark night
[02:45.00]손을 잡아, 끝까지 함께 걸어가자`,
    description: '공식 YouTube 뮤직비디오 실시간 스트리밍 음원. 대규모 오케스트라 사운드와 아이유의 호소력 짙은 보컬.',
  },
  {
    youtubeId: 'pSUydWEqKwE',
    title: 'Ditto',
    artist: 'NewJeans (뉴진스)',
    album: 'NewJeans 1st Single OMG',
    genre: 'K-POP',
    duration: 333,
    coverUrl: 'https://img.youtube.com/vi/pSUydWEqKwE/maxresdefault.jpg',
    lyrics: `[00:00.00]Stay in the middle, Like you a little
[00:18.00]Don't want no riddle, 말해줘 say it back, oh, say it ditto
[00:38.00]아침은 너무 멀어 so say it ditto
[00:58.00]훌쩍 커버렸어 함께한 기억처럼
[01:20.00]널 바라볼 때마다 심장이 뛰어
[01:45.00]I got nothing to lose, 널 좋아한다고 말해줄래
[02:10.00]Say it back, oh, say it ditto`,
    description: '볼티모어 클럽 댄스 뮤직을 재해석한 독보적인 레트로 Y2K 감성의 글로벌 히트곡.',
  },
  {
    youtubeId: 'Hn0Qz38_Nis',
    title: 'To. X',
    artist: '태연 (TAEYEON)',
    album: 'To. X - The 5th Mini Album',
    genre: 'R&B',
    duration: 171,
    coverUrl: 'https://img.youtube.com/vi/Hn0Qz38_Nis/maxresdefault.jpg',
    lyrics: `[00:00.00]처음 본 순간부터 날 통제하려 했던 너
[00:18.00]비틀린 관계 속에서 날 찾으려 해
[00:36.00]To. X, 이제는 안녕
[00:55.00]더 이상 너의 기준에 맞추지 않아
[01:15.00]마침내 마주한 온전한 나의 모습`,
    description: '감각적인 기타 리프와 태연의 세련된 그루브 보컬이 돋보이는 R&B 트랙.',
  },
  {
    youtubeId: 'm0m2mY4x2eI',
    title: '주저하는 연인들을 위해',
    artist: '잔나비 (Jannabi)',
    album: '전설 (Legend)',
    genre: 'K-Indie',
    duration: 270,
    coverUrl: 'https://img.youtube.com/vi/m0m2mY4x2eI/maxresdefault.jpg',
    lyrics: `[00:00.00]나는 읽기 쉬운 마음이야
[00:15.00]당신도 흩어지는 노을처럼 그렇게
[00:32.00]그리운 생각에 사무치던 날들
[00:50.00]우리는 어쩌면 사랑이었을까
[01:10.00]주저하는 모든 연인들에게`,
    description: '한국 대중음악사에 길이 남을 레트로 빈티지 록 발라드의 명작.',
  },
  {
    youtubeId: 'EIz09kLzN9k',
    title: 'Love Lee',
    artist: 'AKMU (악뮤)',
    album: 'Love Lee',
    genre: 'K-POP',
    duration: 180,
    coverUrl: 'https://img.youtube.com/vi/EIz09kLzN9k/maxresdefault.jpg',
    lyrics: `[00:00.00]You know, my name is Love Lee
[00:12.00]사랑스러움이 가득한 너의 미소
[00:28.00]매일매일 너와 함께 걷고 싶어
[00:45.00]퐁당 빠져버린 사랑의 노래`,
    description: '통통 튀는 어쿠스틱 리듬과 이찬혁, 이수현 남매의 완벽한 하모니.',
  },
  {
    youtubeId: 'BzYnNdJhZQw',
    title: '밤편지 (Through the Night)',
    artist: '아이유 (IU)',
    album: 'Palette',
    genre: 'Ballad',
    duration: 254,
    coverUrl: 'https://img.youtube.com/vi/BzYnNdJhZQw/maxresdefault.jpg',
    lyrics: `[00:00.00]이 밤 그날의 반딧불을 당신의 창 가까이 보낼게요
[00:25.00]음 사랑한다는 말이에요
[00:48.00]나 우리의 첫 입맞춤을 떠올려
[01:12.00]그럼 언제든 눈을 감고 음 가장 먼 곳으로 가요
[01:38.00]난 파도가 머물던 모래 위에 적힌 글씨처럼
[02:05.00]당신이 멀리 사라져 버릴 것 같아 늘 그리워 그리워`,
    description: '포크 발라드의 정수. 잔잔한 어쿠스틱 기타와 서정적인 가사로 사랑받는 국민 힐링송.',
  },
];

export const ImportSongModal: React.FC<ImportSongModalProps> = ({
  isOpen,
  onClose,
  onImportTrack,
}) => {
  const [tab, setTab] = useState<'youtube' | 'curated_yt' | 'file' | 'url'>('youtube');

  // YouTube Form Fields
  const [youtubeInput, setYouTubeInput] = useState('');
  const [isFetchingYt, setIsFetchingYt] = useState(false);
  const [fetchedYtData, setFetchedYtData] = useState<{
    videoId: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
  } | null>(null);

  // General Form Fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('YouTube Music Collection');
  const [genre, setGenre] = useState<Genre>('K-POP');
  const [selectedCover, setSelectedCover] = useState(DEFAULT_COVERS[0]);
  const [lyricsText, setLyricsText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState<number>(200);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle YouTube Link resolution
  const handleFetchYouTube = async () => {
    if (!youtubeInput.trim()) return;
    setIsFetchingYt(true);

    const videoId = extractYouTubeId(youtubeInput);
    if (!videoId) {
      alert('올바른 YouTube 동영상 URL 또는 비디오 ID를 입력해주세요.');
      setIsFetchingYt(false);
      return;
    }

    const meta = await fetchYouTubeMeta(youtubeInput);
    if (meta) {
      setFetchedYtData(meta);
      setTitle(meta.title);
      setArtist(meta.artist);
      setSelectedCover(meta.thumbnailUrl);
      setDuration(210); // Standard approx duration, auto-synced upon playback
    }
    setIsFetchingYt(false);
  };

  // Submit YouTube imported track
  const handleImportYouTube = (playNow: boolean = false) => {
    if (!fetchedYtData && !extractYouTubeId(youtubeInput)) return;

    const vid = fetchedYtData?.videoId || extractYouTubeId(youtubeInput)!;
    const trackTitle = title.trim() || fetchedYtData?.title || 'YouTube Track';
    const trackArtist = artist.trim() || fetchedYtData?.artist || 'YouTube Artist';
    const parsedLyrics = parseLrcOrText(lyricsText, duration);

    const newTrack: Track = {
      id: `yt-${vid}-${Date.now()}`,
      title: trackTitle,
      artist: trackArtist,
      album: album.trim() || 'YouTube Music Stream',
      genre,
      coverUrl: selectedCover || `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`,
      duration: duration || 210,
      bpm: 110,
      musicalKey: 'C Major',
      plays: 12000,
      likes: 350,
      releaseDate: new Date().toLocaleDateString('ko-KR'),
      description: `YouTube 공식 뮤직비디오 실시간 스트리밍 트랙 (ID: ${vid})`,
      tags: ['유튜브', '공식MV', genre, '스트리밍'],
      generatorType: 'youtube',
      sourceType: 'youtube',
      youtubeId: vid,
      channelTitle: trackArtist,
      lyrics: parsedLyrics,
    };

    onImportTrack(newTrack, playNow);
    onClose();
  };

  // 1-click curated YouTube import
  const handleImportCuratedTrack = (curated: typeof CURATED_YOUTUBE_TRACKS[0], playNow: boolean = false) => {
    const parsedLyrics = parseLrcOrText(curated.lyrics, curated.duration);

    const newTrack: Track = {
      id: `yt-${curated.youtubeId}`,
      title: curated.title,
      artist: curated.artist,
      album: curated.album,
      genre: curated.genre,
      coverUrl: curated.coverUrl,
      duration: curated.duration,
      bpm: 110,
      musicalKey: 'C Major',
      plays: 1890000,
      likes: 64200,
      releaseDate: '2026.09.27',
      description: curated.description,
      tags: ['유튜브', '공식MV', '인기차트', curated.genre],
      generatorType: 'youtube',
      sourceType: 'youtube',
      youtubeId: curated.youtubeId,
      channelTitle: curated.artist,
      lyrics: parsedLyrics,
    };

    onImportTrack(newTrack, playNow);
    onClose();
  };

  // Local file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (cleanName.includes('-')) {
      const parts = cleanName.split('-');
      setArtist(parts[0].trim());
      setTitle(parts.slice(1).join('-').trim());
    } else {
      setTitle(cleanName);
      if (!artist) setArtist('내 파일 아티스트');
    }

    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);
    setIsLoadingAudio(true);

    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDuration(Math.round(tempAudio.duration));
      }
      setIsLoadingAudio(false);
    };
    tempAudio.onerror = () => {
      setIsLoadingAudio(false);
    };
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedCover(URL.createObjectURL(file));
  };

  const handleSubmitFileOrUrl = (playNow: boolean = false) => {
    if (!title.trim()) return;

    const parsedLyrics = parseLrcOrText(lyricsText, duration);

    const newTrack: Track = {
      id: `imported-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || '알 수 없는 아티스트',
      album: album.trim() || 'My Local Collection',
      genre,
      coverUrl: selectedCover,
      duration: duration || 180,
      bpm: 110,
      musicalKey: 'C Major',
      plays: 1,
      likes: 1,
      releaseDate: new Date().toLocaleDateString('ko-KR'),
      description: '사용자가 직접 가져온 실제 오디오 음원 트랙입니다.',
      tags: ['실제음원', '내음악', genre],
      generatorType: 'real_audio',
      audioUrl,
      sourceType: tab === 'file' ? 'uploaded_file' : 'stream_url',
      lyrics: parsedLyrics,
    };

    onImportTrack(newTrack, playNow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
              <Youtube className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-100 text-base">
                실제 노래 & YouTube MV 가져오기
              </h3>
              <p className="text-[11px] text-neutral-400">
                YouTube 공식 음원 및 내 컴퓨터의 실제 음악 파일을 등록하세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-6 pt-2 shrink-0 gap-5 overflow-x-auto">
          <button
            onClick={() => setTab('youtube')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              tab === 'youtube'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube 링크로 가져오기</span>
          </button>

          <button
            onClick={() => setTab('curated_yt')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              tab === 'curated_yt'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>인기 K-POP 유튜브 픽 ({CURATED_YOUTUBE_TRACKS.length})</span>
          </button>

          <button
            onClick={() => setTab('file')}
            className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              tab === 'file'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>내 컴퓨터 MP3/오디오 파일</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: YOUTUBE DIRECT IMPORT */}
          {tab === 'youtube' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  YouTube 동영상 링크 또는 비디오 ID 입력 *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="예: https://www.youtube.com/watch?v=JleoAppaxi0 또는 JleoAppaxi0"
                      value={youtubeInput}
                      onChange={(e) => setYouTubeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFetchYouTube();
                        }
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchYouTube}
                    disabled={isFetchingYt || !youtubeInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isFetchingYt ? '분석 중...' : '정보 가져오기'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  유튜브 동영상 주소를 붙여넣으면 곡 제목, 아티스트, 고화질 썸네일을 즉시 불러옵니다.
                </p>
              </div>

              {/* YouTube Fetched Preview Card */}
              {fetchedYtData && (
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative w-36 aspect-video sm:w-40 rounded-lg overflow-hidden shrink-0 border border-neutral-800">
                    <img
                      src={fetchedYtData.thumbnailUrl}
                      alt={fetchedYtData.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 left-1 bg-red-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                      YouTube HD
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-red-400">
                      ID: {fetchedYtData.videoId}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">
                      {title || fetchedYtData.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {artist || fetchedYtData.artist}
                    </p>
                  </div>
                </div>
              )}

              {/* Edit Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    곡 제목
                  </label>
                  <input
                    type="text"
                    placeholder="노래 제목 입력"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    아티스트
                  </label>
                  <input
                    type="text"
                    placeholder="아티스트 이름 입력"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    장르 선택
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as Genre)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-red-500"
                  >
                    <option value="K-POP">K-POP</option>
                    <option value="Ballad">Ballad</option>
                    <option value="K-Indie">K-Indie</option>
                    <option value="R&B">R&B</option>
                    <option value="City Pop">City Pop</option>
                    <option value="Lo-Fi">Lo-Fi</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Acoustic">Acoustic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    앨범명
                  </label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Lyrics input */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  가사 입력 (타임스탬프 또는 일반 가사 지원)
                </label>
                <textarea
                  rows={3}
                  placeholder={`[00:15.00]첫 소절 가사를 입력하세요...
타임스탬프가 없어도 자동으로 노래 길이에 맞춰 싱크가 배분됩니다.`}
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 font-mono resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleImportYouTube(false)}
                  disabled={!youtubeInput.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-lg transition-colors"
                >
                  보관함에 저장
                </button>
                <button
                  type="button"
                  onClick={() => handleImportYouTube(true)}
                  disabled={!youtubeInput.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow-lg active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>저장하고 바로 재생</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CURATED TOP K-POP YOUTUBE HITS */}
          {tab === 'curated_yt' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                클릭 한 번으로 유튜브 공식 뮤직비디오와 고음질 음원을 플랫폼 보관함에 즉시 추가할 수 있습니다.
              </p>

              <div className="space-y-3">
                {CURATED_YOUTUBE_TRACKS.map((curated) => (
                  <div
                    key={curated.youtubeId}
                    className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-16 aspect-video sm:w-20 rounded-lg overflow-hidden shrink-0 bg-neutral-900">
                        <img
                          src={curated.coverUrl}
                          alt={curated.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 right-0 bg-red-600 text-white text-[8px] px-1 font-bold">
                          MV
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-neutral-100 truncate group-hover:text-red-400 transition-colors">
                          {curated.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">{curated.artist}</p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mt-1">
                          <span>{curated.genre}</span>
                          <span>·</span>
                          <span>{Math.floor(curated.duration / 60)}분 {curated.duration % 60}초</span>
                          <span>·</span>
                          <span className="text-red-400">YouTube 공식 음원</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleImportCuratedTrack(curated, true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>지금 재생</span>
                      </button>
                      <button
                        onClick={() => handleImportCuratedTrack(curated, false)}
                        className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                      >
                        담기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LOCAL FILE */}
          {tab === 'file' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  오디오 파일 선택 (MP3, WAV, FLAC, M4A, OGG) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    selectedFileName
                      ? 'border-indigo-500/60 bg-indigo-950/20'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 hover:bg-neutral-950/70'
                  }`}
                >
                  <FileAudio className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  {selectedFileName ? (
                    <div>
                      <p className="text-xs font-semibold text-indigo-300">
                        선택된 파일: {selectedFileName}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-400 mt-1">
                        길이: {Math.floor(duration / 60)}분 {duration % 60}초
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-neutral-200">
                        클릭하여 컴퓨터의 실제 음악 파일 선택 또는 드래그 앤 드롭
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        파일명에서 제목과 아티스트를 자동으로 분석합니다
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Artist fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    곡 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="노래 제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    아티스트 이름
                  </label>
                  <input
                    type="text"
                    placeholder="아티스트"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitFileOrUrl(false)}
                  disabled={!title.trim() || isLoadingAudio}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-lg transition-colors"
                >
                  보관함 저장
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitFileOrUrl(true)}
                  disabled={!title.trim() || isLoadingAudio}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>저장하고 바로 재생</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
