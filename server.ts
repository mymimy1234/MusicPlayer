import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback high-quality curated tracks for instant responsiveness
const CURATED_YOUTUBE_FALLBACKS: Record<string, any[]> = {
  default: [
    {
      videoId: '0DEH4qY27N4',
      title: 'BEST OF IU PLAYLIST *ੈ✩‧˚ motivating & chill track',
      channelTitle: 'aesthetics',
      duration: '55:02',
      viewCount: '조회수 120만회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/0DEH4qY27N4/hqdefault.jpg',
    },
    {
      videoId: 'BzYnNdJhZQw',
      title: '아이유 (IU) - 밤편지 (Through the Night) Official MV',
      channelTitle: '이지금 [IU Official]',
      duration: '4:13',
      viewCount: '조회수 1.4억회',
      publishedTime: '6년 전',
      thumbnail: 'https://img.youtube.com/vi/BzYnNdJhZQw/hqdefault.jpg',
    },
    {
      videoId: 'hLvWy2b857I',
      title: "LE SSERAFIM (르세라핌) 'Perfect Night' Official MV",
      channelTitle: 'HYBE LABELS',
      duration: '2:39',
      viewCount: '조회수 1.1억회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/hLvWy2b857I/hqdefault.jpg',
    },
    {
      videoId: 'jfKfPfyJRdk',
      title: '1 A.M Study Session 📚 [lofi hip hop/chill beats for coding]',
      channelTitle: 'Lofi Girl',
      duration: '1:01:00',
      viewCount: '조회수 4,200만회',
      publishedTime: '2년 전',
      thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    },
    {
      videoId: 'phuiAIQRU9g',
      title: "aespa 에스파 'Supernova' MV",
      channelTitle: 'SMTOWN',
      duration: '3:12',
      viewCount: '조회수 1.2억회',
      publishedTime: '10개월 전',
      thumbnail: 'https://img.youtube.com/vi/phuiAIQRU9g/hqdefault.jpg',
    },
    {
      videoId: 'vnS_6zG8eEg',
      title: 'DAY6 (데이식스) - 한 페이지가 될 수 있게 (Time of Our Life)',
      channelTitle: 'JYP Entertainment',
      duration: '3:29',
      viewCount: '조회수 6,800만회',
      publishedTime: '5년 전',
      thumbnail: 'https://img.youtube.com/vi/vnS_6zG8eEg/hqdefault.jpg',
    },
    {
      videoId: 'gdZLi9oWNZg',
      title: 'BTS (방탄소년단) Dynamite Official MV',
      channelTitle: 'HYBE LABELS',
      duration: '3:44',
      viewCount: '조회수 18억회',
      publishedTime: '4년 전',
      thumbnail: 'https://img.youtube.com/vi/gdZLi9oWNZg/hqdefault.jpg',
    },
    {
      videoId: '1CLKURlgzE8',
      title: '폴킴 (Paul Kim) - 모든 날, 모든 순간 Official MV',
      channelTitle: 'Paul Kim Official',
      duration: '3:31',
      viewCount: '조회수 8,900만회',
      publishedTime: '5년 전',
      thumbnail: 'https://img.youtube.com/vi/1CLKURlgzE8/hqdefault.jpg',
    },
  ],
  night: [
    {
      videoId: 'BzYnNdJhZQw',
      title: '아이유 (IU) - 밤편지 (Through the Night) Official MV',
      channelTitle: '이지금 [IU Official]',
      duration: '4:13',
      viewCount: '조회수 1.4억회',
      publishedTime: '6년 전',
      thumbnail: 'https://img.youtube.com/vi/BzYnNdJhZQw/hqdefault.jpg',
    },
    {
      videoId: '1CLKURlgzE8',
      title: '폴킴 (Paul Kim) - 모든 날, 모든 순간 (Every Day, Every Moment) Official MV',
      channelTitle: 'Paul Kim Official',
      duration: '3:31',
      viewCount: '조회수 8,900만회',
      publishedTime: '5년 전',
      thumbnail: 'https://img.youtube.com/vi/1CLKURlgzE8/hqdefault.jpg',
    },
    {
      videoId: '_3s8oK5bL84',
      title: '백예린 (Yerin Baek) - 다시 난, 여기 (사랑의 불시착 OST)',
      channelTitle: 'Stone Music Entertainment',
      duration: '3:56',
      viewCount: '조회수 4,300만회',
      publishedTime: '4년 전',
      thumbnail: 'https://img.youtube.com/vi/_3s8oK5bL84/hqdefault.jpg',
    },
    {
      videoId: 'i1P3w_b4x8c',
      title: '적재 (Jukjae) - 별 보러 가자 Official Audio',
      channelTitle: '적재 JUKJAE Official',
      duration: '5:10',
      viewCount: '조회수 3,500만회',
      publishedTime: '4년 전',
      thumbnail: 'https://img.youtube.com/vi/i1P3w_b4x8c/hqdefault.jpg',
    },
    {
      videoId: '4HG_CJzyX6A',
      title: '태연 (TAEYEON) - 사계 (Four Seasons) MV',
      channelTitle: 'SMTOWN',
      duration: '3:08',
      viewCount: '조회수 5,600만회',
      publishedTime: '5년 전',
      thumbnail: 'https://img.youtube.com/vi/4HG_CJzyX6A/hqdefault.jpg',
    },
    {
      videoId: 'K9_VH1MV59o',
      title: '성시경 (Sung Si Kyung) - 너의 모든 순간 (별에서 온 그대 OST)',
      channelTitle: 'Stone Music Entertainment',
      duration: '4:02',
      viewCount: '조회수 6,200만회',
      publishedTime: '9년 전',
      thumbnail: 'https://img.youtube.com/vi/K9_VH1MV59o/hqdefault.jpg',
    },
    {
      videoId: 'JleoAppaxi0',
      title: "IU 'Love wins all' MV",
      channelTitle: '이지금 [IU Official]',
      duration: '5:14',
      viewCount: '조회수 6,800만회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/JleoAppaxi0/hqdefault.jpg',
    },
  ],
  drive: [
    {
      videoId: 'hLvWy2b857I',
      title: "LE SSERAFIM (르세라핌) 'Perfect Night' Official MV",
      channelTitle: 'HYBE LABELS',
      duration: '2:39',
      viewCount: '조회수 1.1억회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/hLvWy2b857I/hqdefault.jpg',
    },
    {
      videoId: 'bV8N7c4iYfA',
      title: "DAY6 (데이식스) 'Welcome to the Show' M/V",
      channelTitle: 'JYP Entertainment',
      duration: '3:37',
      viewCount: '조회수 3,900만회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/bV8N7c4iYfA/hqdefault.jpg',
    },
    {
      videoId: 'phuiAIQRU9g',
      title: "aespa 에스파 'Supernova' MV",
      channelTitle: 'SMTOWN',
      duration: '3:12',
      viewCount: '조회수 1.2억회',
      publishedTime: '10개월 전',
      thumbnail: 'https://img.youtube.com/vi/phuiAIQRU9g/hqdefault.jpg',
    },
    {
      videoId: '11cta61Wi0g',
      title: "NewJeans (뉴진스) 'Hype Boy' Official MV",
      channelTitle: 'HYBE LABELS',
      duration: '2:59',
      viewCount: '조회수 1.8억회',
      publishedTime: '2년 전',
      thumbnail: 'https://img.youtube.com/vi/11cta61Wi0g/hqdefault.jpg',
    },
    {
      videoId: 'k6jqx9kZgPM',
      title: "TWICE 'Talk that Talk' M/V",
      channelTitle: 'JYP Entertainment',
      duration: '2:58',
      viewCount: '조회수 1.7억회',
      publishedTime: '2년 전',
      thumbnail: 'https://img.youtube.com/vi/k6jqx9kZgPM/hqdefault.jpg',
    },
    {
      videoId: '7HDeem-JaSY',
      title: "(여자)아이들((G)I-DLE) - '퀸카 (Queencard)' Official Music Video",
      channelTitle: '(G)I-DLE Official',
      duration: '2:41',
      viewCount: '조회수 3.6억회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/7HDeem-JaSY/hqdefault.jpg',
    },
    {
      videoId: '-GQg25oP0S8',
      title: "SEVENTEEN (세븐틴) '손오공' Official MV",
      channelTitle: 'HYBE LABELS',
      duration: '3:20',
      viewCount: '조회수 2.1억회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/-GQg25oP0S8/hqdefault.jpg',
    },
  ],
  coding: [
    {
      videoId: 'jfKfPfyJRdk',
      title: '1 A.M Study Session 📚 [lofi hip hop/chill beats for coding]',
      channelTitle: 'Lofi Girl',
      duration: '1:01:00',
      viewCount: '조회수 4,200만회',
      publishedTime: '2년 전',
      thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    },
    {
      videoId: '4xDzrJKXOOY',
      title: 'Synthwave Radio - Chill Synth / Retro Cyberpunk Dev Beats',
      channelTitle: 'Synthwave Lab',
      duration: '1:30:00',
      viewCount: '조회수 890만회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    },
    {
      videoId: 'TURbeWK2wwg',
      title: 'Coding in the Rain - Rain & Lo-Fi Beats for Deep Work',
      channelTitle: 'The Jazz Hop Café',
      duration: '1:10:00',
      viewCount: '조회수 670만회',
      publishedTime: '1년 전',
      thumbnail: 'https://img.youtube.com/vi/TURbeWK2wwg/hqdefault.jpg',
    },
    {
      videoId: 'DWcJFNfaw90',
      title: '지브리 감성 피아노 수면 & 집중 BGM - 감미로운 코딩 노동요',
      channelTitle: 'Relaxing Studio BGM',
      duration: '1:20:00',
      viewCount: '조회수 1,120만회',
      publishedTime: '8개월 전',
      thumbnail: 'https://img.youtube.com/vi/DWcJFNfaw90/hqdefault.jpg',
    },
    {
      videoId: '5qap5aO4i9A',
      title: '24/7 Deep Focus Music - Ambient Study & Programming Beats',
      channelTitle: 'Mind Wave Studio',
      duration: '1:30:00',
      viewCount: '조회수 940만회',
      publishedTime: '10개월 전',
      thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg',
    },
    {
      videoId: 'bX5rLqD27hU',
      title: '페퍼톤스 (PEPPERTONES) - 행운을 빌어요 (Good Luck) MV',
      channelTitle: 'Antenna',
      duration: '4:20',
      viewCount: '조회수 780만회',
      publishedTime: '7년 전',
      thumbnail: 'https://img.youtube.com/vi/bX5rLqD27hU/hqdefault.jpg',
    },
  ],
};

function getMatchingFallback(query: string): any[] {
  const q = (query || '').toLowerCase();
  if (
    q.includes('새벽') ||
    q.includes('힐링') ||
    q.includes('밤') ||
    q.includes('night') ||
    q.includes('healing')
  ) {
    return CURATED_YOUTUBE_FALLBACKS.night;
  }
  if (
    q.includes('드라이브') ||
    q.includes('신나는') ||
    q.includes('drive') ||
    q.includes('hype')
  ) {
    return CURATED_YOUTUBE_FALLBACKS.drive;
  }
  if (
    q.includes('코딩') ||
    q.includes('노동요') ||
    q.includes('coding') ||
    q.includes('개발') ||
    q.includes('study') ||
    q.includes('로파이')
  ) {
    return CURATED_YOUTUBE_FALLBACKS.coding;
  }
  return CURATED_YOUTUBE_FALLBACKS.default;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // YouTube live search endpoint
  app.get('/api/youtube/search', async (req: Request, res: Response) => {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return res.json({ results: getMatchingFallback(query) });
    }

    try {
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
      const ytResponse = await fetch(ytUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const html = await ytResponse.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/);

      if (!match) {
        // Return filtered fallback
        return res.json({ results: getMatchingFallback(query) });
      }

      const data = JSON.parse(match[1]);
      const sections =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

      const results: any[] = [];
      for (const section of sections) {
        const items = section.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const v = item.videoRenderer;
          if (!v || !v.videoId) continue;

          const title =
            v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || 'YouTube Video';
          const channelTitle =
            v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'YouTube Creator';
          const duration = v.lengthText?.simpleText || '3:30';
          const viewCount = v.viewCountText?.simpleText || '';
          const publishedTime = v.publishedTimeText?.simpleText || '';
          const thumbnails = v.thumbnail?.thumbnails || [];
          const thumbnail =
            thumbnails[thumbnails.length - 1]?.url ||
            `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;

          results.push({
            videoId: v.videoId,
            title,
            channelTitle,
            duration,
            viewCount,
            publishedTime,
            thumbnail,
          });

          if (results.length >= 30) break;
        }
        if (results.length >= 30) break;
      }

      if (results.length === 0) {
        return res.json({ results: getMatchingFallback(query) });
      }

      res.setHeader('Cache-Control', 'public, max-age=180');
      return res.json({ results });
    } catch (err) {
      console.error('YouTube search error:', err);
      return res.json({ results: getMatchingFallback(query) });
    }
  });

  // YouTube Autocomplete search suggestions
  app.get('/api/youtube/suggest', async (req: Request, res: Response) => {
    const query = (req.query.q as string || '').trim();
    if (!query) return res.json({ suggestions: [] });

    try {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(query)}`;
      const sRes = await fetch(suggestUrl);
      const data = await sRes.json();
      const suggestions = Array.isArray(data?.[1]) ? data[1] : [];
      return res.json({ suggestions });
    } catch (err) {
      return res.json({ suggestions: [] });
    }
  });

  // YouTube Video Meta via oEmbed
  app.get('/api/youtube/meta', async (req: Request, res: Response) => {
    const videoId = (req.query.videoId as string || '').trim();
    if (!videoId) return res.status(400).json({ error: 'videoId is required' });

    try {
      const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
      const response = await fetch(oembedUrl);
      const data = await response.json();
      return res.json({
        videoId,
        title: data.title || 'YouTube Music',
        author: data.author_name || 'YouTube Creator',
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
    } catch (err) {
      return res.json({
        videoId,
        title: 'YouTube Track',
        author: 'YouTube Creator',
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ON:SOUND Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
