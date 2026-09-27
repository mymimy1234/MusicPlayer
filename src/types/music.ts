export type Genre = 'All' | 'K-POP' | 'K-Indie' | 'City Pop' | 'Ballad' | 'Lo-Fi' | 'Synthwave' | 'Acoustic' | 'R&B' | 'Electronic';

export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // seconds
  genre: Genre;
  bpm: number;
  musicalKey: string;
  plays: number;
  likes: number;
  releaseDate: string;
  description: string;
  tags: string[];
  generatorType: 'city_pop' | 'lofi_chill' | 'synthwave' | 'acoustic_folk' | 'piano_ballad' | 'future_bass' | 'custom' | 'real_audio' | 'youtube';
  lyrics: LyricLine[];
  audioUrl?: string;
  youtubeId?: string;
  sourceType?: 'uploaded_file' | 'stream_url' | 'youtube' | 'synthesizer' | 'custom';
  channelTitle?: string;
  customPattern?: SequencerPattern;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  isCustom?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  trackId: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface SequencerInstrument {
  id: 'kick' | 'snare' | 'hihat' | 'clap' | 'bass' | 'lead';
  name: string;
  color: string;
  steps: boolean[];
}

export interface SequencerPattern {
  bpm: number;
  scale: string;
  instruments: SequencerInstrument[];
}
