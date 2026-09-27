import React, { useState, useEffect, useRef } from 'react';
import { SequencerPattern, SequencerInstrument, Track } from '../../types/music';
import { audioEngine } from '../../services/audioEngine';
import {
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Save,
  Volume2,
  Mic,
  MicOff,
  Check,
} from 'lucide-react';

interface BeatStudioProps {
  onSaveTrack: (track: Track) => void;
  onPlayInPlayer: (track: Track) => void;
}

const DEFAULT_INSTRUMENTS: SequencerInstrument[] = [
  {
    id: 'kick',
    name: 'Kick Drum',
    color: '#ef4444',
    steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  },
  {
    id: 'snare',
    name: 'Snare',
    color: '#3b82f6',
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  },
  {
    id: 'hihat',
    name: 'Hi-Hat',
    color: '#eab308',
    steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
  },
  {
    id: 'clap',
    name: 'Clap',
    color: '#ec4899',
    steps: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
  },
  {
    id: 'bass',
    name: '808 Bass',
    color: '#8b5cf6',
    steps: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
  },
  {
    id: 'lead',
    name: 'Synth Lead',
    color: '#10b981',
    steps: [false, false, true, false, false, true, false, false, false, false, true, false, true, false, false, false],
  },
];

export const BeatStudio: React.FC<BeatStudioProps> = ({ onSaveTrack, onPlayInPlayer }) => {
  const [instruments, setInstruments] = useState<SequencerInstrument[]>(DEFAULT_INSTRUMENTS);
  const [bpm, setBpm] = useState(110);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [songTitle, setSongTitle] = useState('나만의 비트 트랙');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Mic Recording
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const stepIntervalRef = useRef<number | null>(null);

  // Play sequencer step
  const triggerStep = (stepIndex: number) => {
    instruments.forEach((inst) => {
      if (inst.steps[stepIndex]) {
        audioEngine.previewSound(inst.id);
      }
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const stepDurationMs = (60 / bpm / 4) * 1000;
      stepIntervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % 16;
          triggerStep(next);
          return next;
        });
      }, stepDurationMs);
    } else {
      if (stepIntervalRef.current !== null) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
      setCurrentStep(0);
    }

    return () => {
      if (stepIntervalRef.current !== null) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, [isPlaying, bpm, instruments]);

  const toggleStep = (instIndex: number, stepIndex: number) => {
    setInstruments((prev) => {
      const copy = [...prev];
      const inst = { ...copy[instIndex] };
      inst.steps = [...inst.steps];
      inst.steps[stepIndex] = !inst.steps[stepIndex];
      copy[instIndex] = inst;

      // preview sound if turned on
      if (inst.steps[stepIndex]) {
        audioEngine.previewSound(inst.id);
      }
      return copy;
    });
  };

  const handleClear = () => {
    setInstruments((prev) =>
      prev.map((inst) => ({
        ...inst,
        steps: new Array(16).fill(false),
      }))
    );
  };

  const handleRandomize = () => {
    setInstruments((prev) =>
      prev.map((inst) => ({
        ...inst,
        steps: Array.from({ length: 16 }, (_, i) => {
          if (inst.id === 'kick') return i % 4 === 0 || Math.random() < 0.2;
          if (inst.id === 'snare') return i === 4 || i === 12;
          if (inst.id === 'hihat') return i % 2 === 0 || Math.random() < 0.3;
          if (inst.id === 'bass') return i % 4 === 0 || Math.random() < 0.2;
          return Math.random() < 0.25;
        }),
      }))
    );
  };

  const loadPreset = (presetName: 'lofi' | 'citypop' | 'trap') => {
    if (presetName === 'lofi') {
      setBpm(78);
      setInstruments([
        { id: 'kick', name: 'Kick Drum', color: '#ef4444', steps: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false] },
        { id: 'snare', name: 'Snare', color: '#3b82f6', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
        { id: 'hihat', name: 'Hi-Hat', color: '#eab308', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] },
        { id: 'clap', name: 'Clap', color: '#ec4899', steps: new Array(16).fill(false) },
        { id: 'bass', name: '808 Bass', color: '#8b5cf6', steps: [true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false] },
        { id: 'lead', name: 'Synth Lead', color: '#10b981', steps: [true, false, false, true, false, false, true, false, false, true, false, false, false, false, false, false] },
      ]);
    } else if (presetName === 'citypop') {
      setBpm(118);
      setInstruments([
        { id: 'kick', name: 'Kick Drum', color: '#ef4444', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
        { id: 'snare', name: 'Snare', color: '#3b82f6', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
        { id: 'hihat', name: 'Hi-Hat', color: '#eab308', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true] },
        { id: 'clap', name: 'Clap', color: '#ec4899', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
        { id: 'bass', name: '808 Bass', color: '#8b5cf6', steps: [true, false, true, false, false, true, false, true, true, false, true, false, false, true, false, true] },
        { id: 'lead', name: 'Synth Lead', color: '#10b981', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, true, false, false] },
      ]);
    } else if (presetName === 'trap') {
      setBpm(140);
      setInstruments([
        { id: 'kick', name: 'Kick Drum', color: '#ef4444', steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] },
        { id: 'snare', name: 'Snare', color: '#3b82f6', steps: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] },
        { id: 'hihat', name: 'Hi-Hat', color: '#eab308', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true] },
        { id: 'clap', name: 'Clap', color: '#ec4899', steps: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] },
        { id: 'bass', name: '808 Bass', color: '#8b5cf6', steps: [true, false, false, false, false, true, false, false, false, false, true, false, false, false, false, false] },
        { id: 'lead', name: 'Synth Lead', color: '#10b981', steps: [false, false, true, false, false, false, false, false, false, true, false, false, false, false, false, false] },
      ]);
    }
  };

  // Mic recording toggle
  const toggleMicRecording = async () => {
    if (isRecordingMic) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingMic(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecordingMic(true);

        // Also start playback so user can record along
        if (!isPlaying) {
          setIsPlaying(true);
        }
      } catch (err) {
        console.warn('Microphone permission not granted or available:', err);
      }
    }
  };

  // Save current pattern as a playable Track
  const handleSaveAsTrack = () => {
    const pattern: SequencerPattern = {
      bpm,
      scale: 'C Minor',
      instruments,
    };

    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: songTitle.trim() || '나만의 비트 트랙',
      artist: 'Studio Creator (나)',
      album: 'ON:SOUND Beat Lab Vol. 1',
      coverUrl: '/src/assets/images/album_synth_sunset_1790520782238.jpg',
      duration: 120,
      genre: 'Electronic',
      bpm,
      musicalKey: 'C Minor',
      plays: 1,
      likes: 1,
      releaseDate: new Date().toLocaleDateString('ko-KR'),
      description: 'ON:SOUND 인터랙티브 비트 스튜디오에서 직접 시퀀싱하고 제작한 오리지널 비트.',
      tags: ['자작곡', '비트스튜디오', 'DIY비트', '루프'],
      generatorType: 'custom',
      lyrics: [
        { time: 0, text: '내가 직접 만든 비트가 울려 퍼져', translation: 'My own created beat begins to reverberate' },
        { time: 10, text: '스텝 바이 스텝, 완성된 나만의 그루브', translation: 'Step by step, my own groove is complete' },
        { time: 24, text: 'ON:SOUND 스튜디오에서 탄생한 멜로디', translation: 'Melody born right inside ON:SOUND studio' },
      ],
      customPattern: pattern,
    };

    onSaveTrack(newTrack);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-400 tracking-wider">BEAT & MELODY LAB</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">
            비트 & 멜로디 스튜디오
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            16스텝 시퀀서로 킥, 스네어, 808 베이스와 신디사이저를 조합하여 나만의 노래를 작곡해보세요.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>루프 재생</span>
              </>
            )}
          </button>

          <button
            onClick={toggleMicRecording}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
              isRecordingMic
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
            title="마이크로 보컬/허밍 녹음"
          >
            {isRecordingMic ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4" />}
            <span>{isRecordingMic ? '보컬 녹음 중...' : '마이크 녹음'}</span>
          </button>

          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="모두 비우기"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
            title="랜덤 패턴 생성"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>랜덤 생성</span>
          </button>
        </div>
      </div>

      {/* Preset and BPM Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-400 mr-1">장르 프리셋:</span>
          <button
            onClick={() => loadPreset('lofi')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            로파이 힙합
          </button>
          <button
            onClick={() => loadPreset('citypop')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            시티팝 그루브
          </button>
          <button
            onClick={() => loadPreset('trap')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            트랩 바운스
          </button>
        </div>

        {/* BPM slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-400">템포 (BPM):</span>
          <span className="font-mono text-xs font-bold text-indigo-400 w-8 tabular-nums">
            {bpm}
          </span>
          <input
            type="range"
            min={60}
            max={160}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-28 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* 16-Step Sequencer Grid */}
      <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 p-4 sm:p-6 overflow-x-auto shadow-2xl">
        {/* Step indicator header */}
        <div className="flex items-center min-w-[700px] mb-3 pb-2 border-b border-neutral-800/80">
          <div className="w-36 text-xs font-semibold text-neutral-500">악기 트랙</div>
          <div className="flex-1 grid grid-cols-16 gap-1.5">
            {Array.from({ length: 16 }).map((_, stepIdx) => (
              <div
                key={stepIdx}
                className={`text-center py-1 text-[10px] font-mono rounded transition-colors ${
                  currentStep === stepIdx && isPlaying
                    ? 'bg-indigo-500 text-white font-bold'
                    : stepIdx % 4 === 0
                    ? 'text-neutral-300 font-semibold'
                    : 'text-neutral-400'
                }`}
              >
                {stepIdx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Instrument Rows */}
        <div className="space-y-2.5 min-w-[700px]">
          {instruments.map((inst, instIdx) => (
            <div
              key={inst.id}
              className="flex items-center gap-3 py-1 group"
            >
              {/* Instrument Label & Preview button */}
              <button
                onClick={() => audioEngine.previewSound(inst.id)}
                className="w-36 flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors text-left"
                title="소리 미리듣기"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: inst.color }}
                  />
                  <span className="text-xs font-semibold text-neutral-200 truncate">
                    {inst.name}
                  </span>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 shrink-0" />
              </button>

              {/* 16 Step Buttons */}
              <div className="flex-1 grid grid-cols-16 gap-1.5">
                {inst.steps.map((isActive, stepIdx) => {
                  const isCurrentStep = currentStep === stepIdx && isPlaying;
                  const isBeatQuarter = stepIdx % 4 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleStep(instIdx, stepIdx)}
                      className={`h-11 rounded-lg border transition-all flex items-center justify-center ${
                        isActive
                          ? 'border-transparent shadow-md'
                          : isBeatQuarter
                          ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                          : 'bg-neutral-950/40 border-neutral-800/40 hover:border-neutral-700'
                      } ${
                        isCurrentStep
                          ? 'ring-2 ring-white scale-105 z-10'
                          : 'hover:scale-[1.02]'
                      }`}
                      style={{
                        backgroundColor: isActive ? inst.color : undefined,
                      }}
                      title={`${inst.name} 스텝 ${stepIdx + 1}`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocal audio playback preview if recorded */}
      {recordedAudioUrl && (
        <div className="mt-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-xs font-semibold text-neutral-200">녹음된 보컬/음성 트랙</p>
              <p className="text-[11px] text-neutral-400">비트와 함께 감상할 수 있습니다.</p>
            </div>
          </div>
          <audio src={recordedAudioUrl} controls className="h-8" />
        </div>
      )}

      {/* Save and Publish to Platform Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-purple-950/30 rounded-2xl border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Save className="w-4 h-4 text-indigo-400" />
            <span>온사운드 플랫폼 트랙으로 등록하기</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            제작한 비트를 노래 플랫폼 라이브러리에 저장하여 즉시 스트리밍하고 플레이리스트에 담을 수 있습니다.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="곡 제목을 입력하세요"
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 max-w-xs w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAsTrack}
            disabled={savedSuccess}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>라이브러리에 저장 완료!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>내 보관함에 곡 저장</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
