import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Track } from '../../types/music';

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
      {/* Ambient Backdrop Vinyl Glow */}
      {showGlow && (
        <div
          className={`absolute inset-4 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-indigo-500/20 blur-3xl transition-opacity duration-1000 pointer-events-none ${
            isPlaying ? 'opacity-90 scale-105 animate-pulse' : 'opacity-30 scale-95'
          }`}
        />
      )}

      {/* Turntable Platter Base Matte Ring */}
      <div className="relative w-[90%] h-[90%] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-neutral-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-white/5" />

        {/* Rotating Vinyl LP Record Disc */}
        <motion.div
          animate={discControls}
          initial={{ rotate: 0 }}
          onClick={onTogglePlay}
          className="relative w-[92%] h-[92%] rounded-full bg-[#121214] shadow-[0_12px_36px_rgba(0,0,0,0.9),inset_0_0_25px_rgba(0,0,0,0.95)] flex items-center justify-center cursor-pointer overflow-hidden border border-neutral-800/80 group"
          title={isPlaying ? '클릭하여 일시정지' : '클릭하여 재생'}
        >
          {/* Vinyl Grooves Concentric Circles */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] pointer-events-none"
              style={{
                width: `${92 - i * 6.5}%`,
                height: `${92 - i * 6.5}%`,
              }}
            />
          ))}

          {/* Anisotropic Light Reflection Sheens */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_45deg,transparent_0deg,rgba(255,255,255,0.07)_45deg,transparent_90deg,transparent_180deg,rgba(255,255,255,0.07)_225deg,transparent_270deg)] pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

          {/* Center Record Label (Album Art) */}
          <div className="relative w-[38%] h-[38%] rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8),inset_0_0_8px_rgba(0,0,0,0.6)] border-2 border-neutral-900 flex items-center justify-center bg-neutral-950">
            <img
              src={coverImage}
              alt={track?.title || 'Record'}
              className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />

            {/* Inner Spindle Hole & Metallic Ring */}
            <div className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 shadow-inner border border-neutral-900 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-neutral-950" />
            </div>
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
            {/* Tonearm Base / Pivot Gimbals */}
            <div className="absolute right-[5%] top-[25%] -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-neutral-300 via-neutral-500 to-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.7)] border border-white/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-neutral-900 border border-white/10" />
            </div>

            {/* Metallic Tonearm Stem */}
            <div className="absolute right-[12%] top-[38%] -translate-y-1/2 w-[72%] h-1.5 bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-400 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.5)] transform -rotate-[10deg] origin-right" />

            {/* Cartridge & Needle Head */}
            <div className="absolute left-[8%] top-[55%] -translate-y-1/2 w-6 h-3 bg-neutral-900 rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.6)] border border-neutral-700 transform -rotate-[10deg] flex items-center justify-between px-0.5">
              <div
                className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                style={{
                  backgroundColor: needleDotColor,
                  color: needleDotColor,
                }}
              />
              <div className="w-1.5 h-1 bg-neutral-500 rounded-xs" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
