import { LyricLine } from '../types/music';

/**
 * Parses standard LRC format strings like:
 * [00:12.50]첫 번째 가사 라인
 * [00:18.00]두 번째 가사 라인
 * Or plain text lines (auto-spaced every 5-8 seconds)
 */
export function parseLrcOrText(content: string, totalDuration: number = 180): LyricLine[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const lrcRegex = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\](.*)/;

  const parsedLrc: LyricLine[] = [];

  for (const line of lines) {
    const match = line.match(lrcRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + millis / 1000;
      const text = match[4].trim();

      if (text) {
        parsedLrc.push({
          time: totalSeconds,
          text,
        });
      }
    }
  }

  // If valid LRC tags were found, return sorted by time
  if (parsedLrc.length > 0) {
    return parsedLrc.sort((a, b) => a.time - b.time);
  }

  // Otherwise, treat as plain text and distribute evenly across song duration
  if (lines.length > 0) {
    const step = Math.max(3, Math.min(10, Math.floor((totalDuration * 0.85) / lines.length)));
    return lines.map((text, idx) => ({
      time: Math.floor(idx * step),
      text,
    }));
  }

  return [];
}
