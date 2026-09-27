import { Track, SequencerPattern } from '../types/music';

// Frequency table for notes
const NOTE_FREQS: Record<string, number> = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
};

class AudioEngineService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private currentTrack: Track | null = null;
  private currentPlaybackTime: number = 0;
  private timerInterval: number | null = null;
  private scheduledTimeoutIds: number[] = [];
  private volume: number = 0.8;

  // Real Audio Element support
  private audioEl: HTMLAudioElement | null = null;
  private isMediaSourceConnected: boolean = false;
  private isUsingRealAudio: boolean = false;
  
  private timeUpdateCallbacks: ((time: number) => void)[] = [];
  private durationUpdateCallbacks: ((duration: number) => void)[] = [];
  private endCallbacks: (() => void)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private initAudioElement() {
    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.crossOrigin = 'anonymous';

      this.audioEl.ontimeupdate = () => {
        if (this.audioEl && this.isUsingRealAudio) {
          this.currentPlaybackTime = this.audioEl.currentTime;
          this.timeUpdateCallbacks.forEach((cb) => cb(this.currentPlaybackTime));
        }
      };

      this.audioEl.onloadedmetadata = () => {
        if (this.audioEl && this.audioEl.duration && !isNaN(this.audioEl.duration)) {
          this.durationUpdateCallbacks.forEach((cb) => cb(this.audioEl!.duration));
        }
      };

      this.audioEl.onended = () => {
        if (this.isUsingRealAudio) {
          this.isPlaying = false;
          this.endCallbacks.forEach((cb) => cb());
        }
      };

      this.audioEl.onerror = (e) => {
        console.warn('Real audio element playback warning:', e);
      };
    }
  }

  private connectAudioElementToAnalyser() {
    if (!this.audioEl || !this.ctx || !this.analyser || this.isMediaSourceConnected) return;
    try {
      const source = this.ctx.createMediaElementSource(this.audioEl);
      source.connect(this.masterGain || this.analyser);
      this.isMediaSourceConnected = true;
    } catch (e) {
      console.warn('Could not connect HTMLAudioElement to Web Audio Analyser (possibly CORS or already connected):', e);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.timeUpdateCallbacks.push(cb);
    return () => {
      this.timeUpdateCallbacks = this.timeUpdateCallbacks.filter((c) => c !== cb);
    };
  }

  public onDurationUpdate(cb: (dur: number) => void) {
    this.durationUpdateCallbacks.push(cb);
    return () => {
      this.durationUpdateCallbacks = this.durationUpdateCallbacks.filter((c) => c !== cb);
    };
  }

  public onEnded(cb: () => void) {
    this.endCallbacks.push(cb);
    return () => {
      this.endCallbacks = this.endCallbacks.filter((c) => c !== cb);
    };
  }

  // Synthesis helpers for procedural songs & beat studio
  private playKick(time: number, accent: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.8 * accent, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.36);
  }

  private playSnare(time: number, accent: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    
    // Tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    oscGain.gain.setValueAtTime(0.4 * accent, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.16);

    // Noise
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6 * accent, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.21);
  }

  private playHiHat(time: number, open: boolean = false) {
    if (!this.ctx || !this.masterGain) return;
    const dur = open ? 0.25 : 0.05;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.3 : 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + dur + 0.01);
  }

  private playClap(time: number) {
    if (!this.ctx || !this.masterGain) return;
    for (let i = 0; i < 3; i++) {
      const t = time + i * 0.012;
      const bufferSize = this.ctx.sampleRate * 0.03;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(3, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
      noise.stop(t + 0.04);
    }
  }

  private playSynthNote(
    freq: number,
    time: number,
    duration: number,
    type: 'pad' | 'lead' | 'bass' | 'rhodes' | 'piano' = 'lead',
    velocity: number = 0.5
  ) {
    if (!this.ctx || !this.masterGain || freq <= 0) return;

    if (type === 'bass') {
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(freq / 2, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, time);
      filter.frequency.exponentialRampToValueAtTime(120, time + duration);

      gain.gain.setValueAtTime(0.5 * velocity, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      sub.start(time);
      osc.stop(time + duration);
      sub.stop(time + duration);
      return;
    }

    if (type === 'rhodes') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, time);

      gain.gain.setValueAtTime(0.4 * velocity, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration * 1.5);
      osc2.stop(time + duration * 1.5);
      return;
    }

    if (type === 'piano') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.5 * velocity, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration * 1.2);
      return;
    }

    // Default Lead / Pad
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = type === 'pad' ? 'sine' : 'sawtooth';
    osc2.type = type === 'pad' ? 'triangle' : 'sawtooth';

    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.004, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'pad' ? 1200 : 3200, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.35 * velocity, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.05);
    osc2.stop(time + duration + 0.05);
  }

  // Schedule a rhythmic loop chunk
  private scheduleSongChunk(track: Track, chunkStartTime: number, chunkDuration: number) {
    if (!this.ctx) return;
    const bpm = track.bpm || 100;
    const beatSeconds = 60 / bpm;
    const sixteenth = beatSeconds / 4;

    const startAudioTime = this.ctx.currentTime;
    const numSixteenths = Math.floor(chunkDuration / sixteenth);

    const patterns: Record<string, { chords: string[][]; bass: string[]; leads: (string | null)[] }> = {
      city_pop: {
        chords: [
          ['F4', 'A4', 'C5', 'E5'],
          ['E4', 'G4', 'B4', 'D5'],
          ['D4', 'F4', 'A4', 'C5'],
          ['C4', 'E4', 'G4', 'B4'],
        ],
        bass: ['F2', 'F2', 'E2', 'E2', 'D2', 'D2', 'G2', 'C2'],
        leads: ['C5', null, 'D5', 'E5', null, 'G5', 'A5', null, 'G5', 'E5', 'D5', null, 'C5', null, null, null],
      },
      lofi_chill: {
        chords: [
          ['C4', 'E4', 'G4', 'B4'],
          ['A3', 'C4', 'E4', 'G4'],
          ['D4', 'F4', 'A4', 'C5'],
          ['G3', 'B3', 'D4', 'F4'],
        ],
        bass: ['C2', 'A2', 'D2', 'G2'],
        leads: ['E4', null, 'G4', null, 'B4', 'A4', null, 'G4', 'E4', null, 'D4', null, 'C4', null, null, null],
      },
      synthwave: {
        chords: [
          ['A3', 'C4', 'E4'],
          ['F3', 'A3', 'C4'],
          ['C4', 'E4', 'G4'],
          ['G3', 'B3', 'D4'],
        ],
        bass: ['A2', 'A2', 'F2', 'F2', 'C2', 'C2', 'G2', 'G2'],
        leads: ['E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'B4', 'A4', null, null, null],
      },
      acoustic_folk: {
        chords: [
          ['G3', 'B3', 'D4', 'G4'],
          ['E3', 'G3', 'B3', 'E4'],
          ['C3', 'E3', 'G3', 'C4'],
          ['D3', 'F#3', 'A3', 'D4'],
        ],
        bass: ['G2', 'E2', 'C2', 'D2'],
        leads: ['B4', null, 'D5', null, 'G5', 'E5', null, 'D5', 'B4', null, 'A4', null, 'G4', null, null, null],
      },
      piano_ballad: {
        chords: [
          ['C4', 'G4', 'C5', 'E5'],
          ['G3', 'D4', 'G4', 'B4'],
          ['A3', 'E4', 'A4', 'C5'],
          ['F3', 'C4', 'F4', 'A4'],
        ],
        bass: ['C2', 'G2', 'A2', 'F2'],
        leads: ['G4', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4', 'C5', 'E5', 'G5', 'F5', 'E5', 'D5', 'C5', null, null],
      },
      future_bass: {
        chords: [
          ['F4', 'A4', 'C5', 'E5'],
          ['G4', 'B4', 'D5', 'F5'],
          ['A4', 'C5', 'E5', 'G5'],
          ['E4', 'G4', 'B4', 'D5'],
        ],
        bass: ['F2', 'G2', 'A2', 'E2'],
        leads: ['C5', 'E5', 'G5', 'B5', 'A5', 'G5', 'E5', 'C5', 'D5', 'F5', 'A5', 'C6', 'B5', 'G5', 'E5', 'D5'],
      },
      custom: {
        chords: [['C4', 'E4', 'G4']],
        bass: ['C2'],
        leads: ['E4', 'G4', 'C5', 'E5'],
      },
      real_audio: {
        chords: [],
        bass: [],
        leads: [],
      }
    };

    const style = patterns[track.generatorType] || patterns.lofi_chill;

    for (let step = 0; step < numSixteenths; step++) {
      const stepTime = startAudioTime + step * sixteenth;
      const beatIndex = Math.floor(step / 4);
      const sixteenthInBeat = step % 4;
      const barIndex = Math.floor(step / 16);
      const chordIndex = barIndex % (style.chords.length || 1);

      if (track.customPattern && track.customPattern.instruments) {
        const step16 = step % 16;
        for (const inst of track.customPattern.instruments) {
          if (inst.steps[step16]) {
            if (inst.id === 'kick') this.playKick(stepTime, 1.0);
            if (inst.id === 'snare') this.playSnare(stepTime, 1.0);
            if (inst.id === 'hihat') this.playHiHat(stepTime, false);
            if (inst.id === 'clap') this.playClap(stepTime);
            if (inst.id === 'bass') this.playSynthNote(NOTE_FREQS['C2'] || 65.4, stepTime, sixteenth * 2, 'bass', 0.8);
            if (inst.id === 'lead') {
              const notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
              const n = notes[step16 % notes.length];
              this.playSynthNote(NOTE_FREQS[n] || 440, stepTime, sixteenth * 1.5, 'lead', 0.7);
            }
          }
        }
        continue;
      }

      if (style.chords.length === 0) continue;

      if (sixteenthInBeat === 0) {
        if (beatIndex % 2 === 0) this.playKick(stepTime, 1.0);
        else this.playSnare(stepTime, 0.9);
      }

      if (track.generatorType === 'lofi_chill') {
        if (sixteenthInBeat === 0 || sixteenthInBeat === 2) {
          this.playHiHat(stepTime + (sixteenthInBeat === 2 ? 0.015 : 0), false);
        }
      } else {
        if (sixteenthInBeat % 2 === 0) {
          this.playHiHat(stepTime, sixteenthInBeat === 2 && beatIndex % 2 === 1);
        }
      }

      if (sixteenthInBeat === 0) {
        const bassNote = style.bass[(beatIndex) % style.bass.length];
        if (bassNote && NOTE_FREQS[bassNote]) {
          this.playSynthNote(NOTE_FREQS[bassNote], stepTime, beatSeconds * 0.9, 'bass', 0.7);
        }
      }

      if (step % 8 === 0 && style.chords[chordIndex]) {
        const chord = style.chords[chordIndex];
        const synthType = track.generatorType === 'lofi_chill' ? 'rhodes' :
                          track.generatorType === 'piano_ballad' ? 'piano' :
                          track.generatorType === 'city_pop' ? 'lead' : 'pad';

        chord.forEach((note) => {
          if (NOTE_FREQS[note]) {
            this.playSynthNote(NOTE_FREQS[note], stepTime, beatSeconds * 1.8, synthType, 0.35);
          }
        });
      }

      const leadNote = style.leads[step % (style.leads.length || 1)];
      if (leadNote && NOTE_FREQS[leadNote]) {
        const leadSynthType = track.generatorType === 'lofi_chill' ? 'rhodes' :
                              track.generatorType === 'acoustic_folk' ? 'piano' : 'lead';
        this.playSynthNote(NOTE_FREQS[leadNote], stepTime, sixteenth * 1.5, leadSynthType, 0.45);
      }
    }
  }

  public previewSound(instrumentId: string, note: string = 'C4') {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (instrumentId === 'kick') this.playKick(now, 1.0);
    else if (instrumentId === 'snare') this.playSnare(now, 1.0);
    else if (instrumentId === 'hihat') this.playHiHat(now, false);
    else if (instrumentId === 'clap') this.playClap(now);
    else if (instrumentId === 'bass') this.playSynthNote(NOTE_FREQS['C2'] || 65.4, now, 0.4, 'bass', 0.8);
    else if (instrumentId === 'lead') this.playSynthNote(NOTE_FREQS[note] || 440, now, 0.3, 'lead', 0.7);
  }

  public playTrack(track: Track, startOffset: number = 0) {
    this.initContext();
    this.stopPlaybackSchedule();

    this.currentTrack = track;
    this.currentPlaybackTime = startOffset;
    this.isPlaying = true;

    // Check if track has a real audio source URL
    if (track.audioUrl) {
      this.isUsingRealAudio = true;
      this.initAudioElement();
      if (this.audioEl) {
        this.connectAudioElementToAnalyser();
        if (this.audioEl.src !== track.audioUrl) {
          this.audioEl.src = track.audioUrl;
        }
        this.audioEl.currentTime = startOffset;
        this.audioEl.volume = this.volume;
        this.audioEl.play().catch((err) => {
          console.warn('Audio play request failed (likely user gesture required):', err);
        });
      }
      return;
    }

    // Otherwise use procedural Web Audio synthesizer
    this.isUsingRealAudio = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }

    const CHUNK_DURATION = 4.0;
    const scheduleNextChunk = () => {
      if (!this.isPlaying || !this.currentTrack || this.isUsingRealAudio) return;
      this.scheduleSongChunk(this.currentTrack, this.currentPlaybackTime, CHUNK_DURATION);
      const nextTimer = window.setTimeout(scheduleNextChunk, (CHUNK_DURATION - 0.2) * 1000);
      this.scheduledTimeoutIds.push(nextTimer);
    };

    scheduleNextChunk();

    this.timerInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.currentTrack || this.isUsingRealAudio) return;
      this.currentPlaybackTime += 0.25;

      this.timeUpdateCallbacks.forEach((cb) => cb(this.currentPlaybackTime));

      if (this.currentPlaybackTime >= this.currentTrack.duration) {
        this.endPlayback();
      }
    }, 250);
  }

  private stopPlaybackSchedule() {
    this.scheduledTimeoutIds.forEach((id) => clearTimeout(id));
    this.scheduledTimeoutIds = [];
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.isUsingRealAudio && this.audioEl) {
      this.audioEl.pause();
    } else {
      this.stopPlaybackSchedule();
    }
  }

  public resume() {
    if (this.currentTrack) {
      if (this.isUsingRealAudio && this.audioEl) {
        this.isPlaying = true;
        this.audioEl.play().catch(() => {});
      } else {
        this.playTrack(this.currentTrack, this.currentPlaybackTime);
      }
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopPlaybackSchedule();
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
    }
    this.currentPlaybackTime = 0;
    this.timeUpdateCallbacks.forEach((cb) => cb(0));
  }

  public seek(seconds: number) {
    this.currentPlaybackTime = Math.max(0, seconds);
    this.timeUpdateCallbacks.forEach((cb) => cb(this.currentPlaybackTime));
    
    if (this.isUsingRealAudio && this.audioEl) {
      this.audioEl.currentTime = this.currentPlaybackTime;
    } else if (this.isPlaying && this.currentTrack) {
      this.playTrack(this.currentTrack, this.currentPlaybackTime);
    }
  }

  private endPlayback() {
    this.stopPlaybackSchedule();
    this.isPlaying = false;
    this.currentPlaybackTime = 0;
    this.endCallbacks.forEach((cb) => cb());
  }

  public getCurrentTime(): number {
    return this.currentPlaybackTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }
}

export const audioEngine = new AudioEngineService();
