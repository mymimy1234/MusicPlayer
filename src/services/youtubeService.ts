// YouTube Service for fetching video metadata, live search, extracting IDs, and managing the YouTube Player API
import { Track } from '../types/music';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let isApiLoading = false;
let isApiReady = false;
const readyCallbacks: (() => void)[] = [];

export function loadYouTubeIframeAPI(): Promise<void> {
  if (isApiReady && window.YT) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    readyCallbacks.push(resolve);

    if (!isApiLoading) {
      isApiLoading = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        isApiReady = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
      };
    }
  });
}

/**
 * Extracts YouTube Video ID from any URL or returns ID directly
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const str = urlOrId.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Standard youtube.com/watch?v=...
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/...
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/embed/... or /v/... or /shorts/...
  const embedMatch = str.match(/youtube\.com\/(?:embed|v|shorts)\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

export interface YouTubeMeta {
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
}

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedTime: string;
  thumbnail: string;
}

/**
 * Parses time string like "3:45" or "1:02:15" into seconds
 */
export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 210;
  const parts = durationStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  } else if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 210;
}

/**
 * Live search on YouTube via backend proxy route
 */
export async function searchYouTubeLive(query: string): Promise<YouTubeSearchResult[]> {
  if (!query || !query.trim()) return [];

  try {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('YouTube search API error, returning fallback:', err);
    return [];
  }
}

/**
 * Fetch autocomplete suggestions
 */
export async function getYouTubeSuggestions(query: string): Promise<string[]> {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`/api/youtube/suggest?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  } catch (err) {
    return [];
  }
}

/**
 * Convert a YouTube search result into a first-class Track object
 */
export function convertYouTubeResultToTrack(item: YouTubeSearchResult): Track {
  // Parse artist and clean title
  let artistName = item.channelTitle || 'YouTube Artist';
  let trackTitle = item.title;

  if (trackTitle.includes('-') && !trackTitle.startsWith('-')) {
    const parts = trackTitle.split('-');
    const candidateArtist = parts[0].trim().replace(/^\[.*?\]\s*/, '').replace(/^\(.*?\)\s*/, '');
    if (candidateArtist.length < 30) {
      artistName = candidateArtist;
      trackTitle = parts.slice(1).join('-').trim();
    }
  }

  // Clean title noise
  trackTitle = trackTitle
    .replace(/\[Official.*?\]/gi, '')
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\[M\/V\]/gi, '')
    .replace(/\(M\/V\)/gi, '')
    .replace(/\[MV\]/gi, '')
    .replace(/\(MV\)/gi, '')
    .trim();

  const durationSecs = parseDurationToSeconds(item.duration);

  return {
    id: `yt-${item.videoId}`,
    title: trackTitle || item.title,
    artist: artistName,
    album: 'YouTube Live Search',
    coverUrl: item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`,
    duration: durationSecs,
    genre: 'K-POP',
    bpm: 115,
    musicalKey: 'C Major',
    plays: Math.floor(Math.random() * 5000000 + 1000000),
    likes: Math.floor(Math.random() * 100000 + 20000),
    releaseDate: item.publishedTime || new Date().toLocaleDateString('ko-KR'),
    description: `${item.channelTitle} · ${item.viewCount || '유튜브 인기 영상'}`,
    tags: ['유튜브', '공식음원', '검색결과'],
    generatorType: 'youtube',
    sourceType: 'youtube',
    youtubeId: item.videoId,
    channelTitle: item.channelTitle,
    lyrics: [
      { time: 0, text: `${trackTitle} - ${artistName}`, translation: 'Now playing on ON:SOUND via YouTube HD' },
      { time: 10, text: '실시간 유튜브 고화질 스트리밍 음원이 재생 중입니다.', translation: 'Streaming in high definition with cinematic backglow' },
      { time: 25, text: '시네마 무대 모드에서 뮤직비디오 영상을 시청할 수 있습니다.', translation: 'Switch to Cinema Stage mode to experience full visual performance' },
    ],
  };
}

/**
 * Fetches real video title, channel name, and thumbnail using YouTube's oEmbed endpoint (No API key required)
 */
export async function fetchYouTubeMeta(urlOrId: string): Promise<YouTubeMeta | null> {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) return null;

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(standardUrl)}`;

  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error('Failed to fetch oembed');
    const data = await res.json();

    let fullTitle = data.title || 'YouTube Music Track';
    let artistName = data.author_name || 'YouTube Creator';

    if (fullTitle.includes('-') && !fullTitle.startsWith('-')) {
      const parts = fullTitle.split('-');
      artistName = parts[0].trim().replace(/^\[.*?\]\s*/, '').replace(/^\(.*?\)\s*/, '');
      fullTitle = parts.slice(1).join('-').trim().replace(/\[Official.*?\]/i, '').replace(/\(Official.*?\)/i, '').replace(/\[M\/V\]/i, '').trim();
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return {
      videoId,
      title: fullTitle,
      artist: artistName,
      thumbnailUrl,
    };
  } catch (err) {
    console.warn('oEmbed fetch error, fallback to direct info:', err);
    return {
      videoId,
      title: 'YouTube Track',
      artist: 'YouTube Artist',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
}
