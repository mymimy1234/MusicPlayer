import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Track } from '../../types/music';

interface MusicNoteParticle {
  id: number;
  symbol: string;
  leftPercent: number;
  topPercent: number;
  driftX: number;
  rotation: number;
  size: number;
  duration: number;
  color: string;
}

interface DiscPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onTogglePlay?: () => void;
  size?: number | string;
  needleDotColor?: string;
  className?: string;
  showGlow?: boolean;
}

export const DiscPlayer: React.FC<DiscPlayerProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  size = 320,
  needleDotColor = '#FF5588',
  className = '',
  showGlow = true,
}) => {
  const discControls = useAnimation();
  const needleControls = useAnimation();
  const discRotationRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Floating music notes particle state
  const [particles, setParticles] = useState<MusicNoteParticle[]>([]);
  const nextParticleIdRef = useRef(1);

  // Emit musical notes while playing
  useEffect(() => {
    if (!isPlaying) {
      setParticles([]);
      return;
    }

    const symbols = ['♪', '♫', '♬', '♩', '✦'];
    const colors = [
      needleDotColor || '#f59e0b',
      '#fbbf24',
      '#fef08a',
      '#f472b6',
      '#60a5fa',
    ];

    const interval = setInterval(() => {
      const newParticle: MusicNoteParticle = {
        id: nextParticleIdRef.current++,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        leftPercent: 54 + Math.random() * 24, // 54% to 78% around needle & grooves
        topPercent: 30 + Math.random() * 26, // 30% to 56%
        driftX: (Math.random() - 0.5) * 60, // -30px to +30px drift
        rotation: (Math.random() - 0.5) * 45,
        size: 14 + Math.random() * 10,
        duration: 2.3 + Math.random() * 0.9,
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setParticles((prev) => [...prev.slice(-12), newParticle]);
    }, 550);

    return () => clearInterval(interval);
  }, [isPlaying, needleDotColor]);

  // Smooth vinyl rotation with angle tracking on pause/resume
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = Date.now();

      // Swing needle smoothly onto the record
      needleControls.start({
        rotate: 0,
        transition: { duration: 1.1, ease: [0.32, 0.72, 0, 1] },
      });

      // Animate continuous rotation
      const animateRotation = () => {
        const now = Date.now();
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        // 33.3 RPM speed (~200 deg/sec) or relaxing 3.5s per turn (102.8 deg/sec)
        discRotationRef.current = (discRotationRef.current + delta * 105) % 360;
        discControls.set({ rotate: discRotationRef.current });

        animationFrameRef.current = requestAnimationFrame(animateRotation);
      };

      animationFrameRef.current = requestAnimationFrame(animateRotation);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Swing needle away smoothly
      needleControls.start({
        rotate: 22,
        transition: { duration: 0.75, ease: [0.32, 0.72, 0, 1] },
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, discControls, needleControls]);

  const coverImage = track?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

  return (
    <div
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        maxWidth: '100%',
        aspectRatio: '1/1',
      }}
      className={`relative select-none flex items-center justify-center ${className}`}
    >
      {/* High-End Analog Studio Aura (Warm Amber & Radiant Gold) */}
      {showGlow && (
        <div
          className={`absolute -inset-2 rounded-full transition-all duration-1000 pointer-events-none ${
            isPlaying ? 'opacity-100 scale-105' : 'opacity-20 scale-95'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(217,119,6,0.08) 35%, rgba(139,92,246,0.04) 60%, transparent 75%)',
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Turntable Platter Base: Precision Champagne Brass & Matte Obsidian */}
      <div className="relative w-[92%] h-[92%] flex items-center justify-center">
        {/* Luxury Outer Brass Beveled Rim */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-700/40 via-yellow-300/30 to-amber-900/60 p-[2px] shadow-[0_25px_65px_rgba(0,0,0,0.95)]">
          <div className="w-full h-full rounded-full bg-[#0d0d10] border border-white/10" />
        </div>

        {/* Rotating Vinyl LP Record Disc */}
        <motion.div
          animate={discControls}
          initial={{ rotate: 0 }}
          onClick={onTogglePlay}
          className="relative w-[93%] h-[93%] rounded-full bg-[#09090c] shadow-[0_18px_45px_rgba(0,0,0,0.98),inset_0_0_35px_rgba(0,0,0,0.98)] flex items-center justify-center cursor-pointer overflow-hidden border border-amber-500/20 group"
          title={isPlaying ? '클릭하여 일시정지' : '클릭하여 재생'}
        >
          {/* Vinyl Grooves Concentric Circles */}
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] pointer-events-none"
              style={{
                width: `${94 - i * 5.4}%`,
                height: `${94 - i * 5.4}%`,
              }}
            />
          ))}

          {/* Micro-grooves texture */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-70"
            style={{
              background:
                'repeating-radial-gradient(circle, transparent 0, transparent 2px, rgba(255,255,255,0.02) 3px, rgba(0,0,0,0.45) 4px)',
            }}
          />

          {/* Anisotropic Holographic Studio Prism Reflection */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_60deg,transparent_0deg,rgba(251,191,36,0.12)_35deg,rgba(244,114,182,0.08)_50deg,rgba(96,165,250,0.1)_65deg,transparent_90deg,transparent_180deg,rgba(251,191,36,0.12)_215deg,rgba(244,114,182,0.08)_230deg,rgba(96,165,250,0.1)_245deg,transparent_270deg)] pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_45%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

          {/* Center Record Label (Album Art) with Gold Ring */}
          <div className="relative w-[37%] h-[37%] rounded-full overflow-hidden shadow-[0_0_22px_rgba(0,0,0,0.95),inset_0_0_12px_rgba(0,0,0,0.8)] border-[2.5px] border-amber-400/40 flex items-center justify-center bg-neutral-950">
            <img
              src={coverImage}
              alt={track?.title || 'Record'}
              className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />

            {/* Inner Brass Spindle & Metallic Jewel Ring */}
            <div className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-200 to-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.5)] border border-neutral-900 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-neutral-950 shadow-inner" />
            </div>

            {/* Vintage Gold Label Rim */}
            <div className="absolute inset-0 rounded-full border border-amber-300/20 pointer-events-none" />
          </div>
        </motion.div>

        {/* Tonearm / Needle Assembly */}
        <div
          className="absolute -top-[5%] -right-[6%] w-[42%] h-[20%] pointer-events-none z-20"
          style={{ transformOrigin: '90% 40%' }}
        >
          <motion.div
            animate={needleControls}
            initial={{ rotate: 22 }}
            className="relative w-full h-full"
            style={{ transformOrigin: '90% 40%' }}
          >
            {/* Tonearm Pivot Gimbal & Gold Counterweight */}
            <div className="absolute right-[5%] top-[25%] -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-neutral-300 to-amber-600 shadow-[0_4px_16px_rgba(0,0,0,0.85)] border border-amber-300/40 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-neutral-950 border border-amber-400/30 shadow-inner" />
            </div>

            {/* Brushed Titanium/Gold Tonearm Stem */}
            <div className="absolute right-[12%] top-[38%] -translate-y-1/2 w-[72%] h-1 bg-gradient-to-r from-amber-400 via-neutral-100 to-amber-500 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.7)] transform -rotate-[10deg] origin-right" />

            {/* Precision Cartridge & Headshell with Stylus Laser Light */}
            <div className="absolute left-[8%] top-[55%] -translate-y-1/2 w-6 h-3.5 bg-neutral-950 rounded-xs shadow-[0_3px_10px_rgba(0,0,0,0.9)] border border-amber-400/30 transform -rotate-[10deg] flex items-center justify-between px-1">
              {/* Glowing Ruby/Laser Stylus Indicator */}
              <div
                className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] transition-all"
                style={{
                  backgroundColor: needleDotColor || '#f59e0b',
                  color: needleDotColor || '#f59e0b',
                }}
              />
              <div className="w-1 h-1.5 bg-amber-400/80 rounded-xs shadow-xs" />
            </div>

            {/* Stylus Groove Illumination Beam (when playing) */}
            {isPlaying && (
              <div
                className="absolute left-[7%] top-[65%] w-3 h-3 rounded-full opacity-60 pointer-events-none animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${needleDotColor || '#f59e0b'} 0%, transparent 70%)`,
                }}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Floating Music Notes Particles Effect (When Playing) */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none select-none animate-music-note z-30 font-bold"
          style={
            {
              left: `${p.leftPercent}%`,
              top: `${p.topPercent}%`,
              fontSize: `${p.size}px`,
              color: p.color,
              textShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}80`,
              '--drift-x': `${p.driftX}px`,
              '--rot': `${p.rotation}deg`,
              '--duration': `${p.duration}s`,
            } as React.CSSProperties
          }
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
};
