import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NoteParticle {
  id: number;
  symbol: string;
  xOffset: number;
  yOffset: number;
  size: number;
  rotation: number;
  duration: number;
}

interface FloatingMusicNotesProps {
  isPlaying: boolean;
  className?: string;
}

const CLEAN_SYMBOLS = ['♪', '♫', '♩'];

/**
 * Subtle, minimalist musical notes that softly rise from the vinyl stylus.
 * Free of rainbow gradients, neon glow blobs, or emoji clutter.
 */
export const FloatingMusicNotes: React.FC<FloatingMusicNotesProps> = ({
  isPlaying,
  className = '',
}) => {
  const [particles, setParticles] = useState<NoteParticle[]>([]);

  useEffect(() => {
    if (!isPlaying) {
      setParticles([]);
      return;
    }

    let counter = 0;
    const interval = setInterval(() => {
      setParticles((prev) => {
        const symbol = CLEAN_SYMBOLS[Math.floor(Math.random() * CLEAN_SYMBOLS.length)];
        const newParticle: NoteParticle = {
          id: counter++,
          symbol,
          xOffset: (Math.random() - 0.5) * 24, // gentle drift
          yOffset: -(45 + Math.random() * 35),  // rise 45~80px
          size: 11 + Math.random() * 3,        // 11~14px
          rotation: (Math.random() - 0.5) * 20,
          duration: 2.4 + Math.random() * 0.8,
        };

        const next = [...prev, newParticle];
        if (next.length > 5) {
          return next.slice(next.length - 5);
        }
        return next;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!isPlaying) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-visible ${className}`}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 0,
              scale: 0.7,
              x: 0,
              y: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 0.65, 0.4, 0],
              scale: [0.7, 1, 0.95, 0.8],
              x: [0, p.xOffset * 0.5, p.xOffset],
              y: [0, p.yOffset * 0.5, p.yOffset],
              rotate: [0, p.rotation],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              ease: 'easeOut',
            }}
            onAnimationComplete={() => {
              setParticles((prev) => prev.filter((item) => item.id !== p.id));
            }}
            className="absolute font-sans select-none text-neutral-300 pointer-events-none"
            style={{
              fontSize: `${p.size}px`,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
            }}
          >
            {p.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingMusicNotes;
