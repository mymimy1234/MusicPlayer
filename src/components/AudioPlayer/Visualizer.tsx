import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../services/audioEngine';

interface VisualizerProps {
  mode?: 'bars' | 'wave' | 'circle';
  className?: string;
  isPlaying: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  mode = 'bars',
  className = '',
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);

      const analyser = audioEngine.getAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!analyser || !isPlaying) {
        // Idle animation: subtle gentle wave
        const time = Date.now() * 0.002;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.25)';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.02 + time) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      if (mode === 'bars') {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barCount = 36;
        const barWidth = Math.floor(width / barCount) - 2;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * step] || 0;
          const barHeight = Math.max(3, (val / 255) * height * 0.9);
          const x = i * (barWidth + 2);
          const y = height - barHeight;

          const gradient = ctx.createLinearGradient(0, height, 0, y);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0.95)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, Math.max(1, barWidth), barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      } else if (mode === 'wave') {
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2.5;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');
        ctx.strokeStyle = gradient;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Circle / Glow oscilloscope
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.45;

        ctx.beginPath();
        for (let i = 0; i < 48; i++) {
          const angle = (i / 48) * Math.PI * 2;
          const val = dataArray[i * 2] || 0;
          const r = baseRadius + (val / 255) * (baseRadius * 0.8);
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, mode]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={80}
      className={`w-full h-full block ${className}`}
    />
  );
};
