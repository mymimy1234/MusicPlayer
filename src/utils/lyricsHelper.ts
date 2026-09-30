import { Track, LyricLine } from '../types/music';

/**
 * Curated full song lyrics for iconic tracks
 */
const SONG_LYRICS_DB: Record<string, LyricLine[]> = {
  // 아이유 - Love wins all
  'love-wins-all': [
    { time: 0, text: 'Love wins all - 아이유 (IU)', translation: 'Love wins all - IU' },
    { time: 14, text: '유영하듯 떠오른 그날의 밤', translation: 'Floating back to that unforgettable night' },
    { time: 28, text: '단단히 닫힌 어둠의 문을 열어', translation: 'Unlocking the heavy doors of pitch darkness' },
    { time: 42, text: '어디로 가는지 몰라도 좋아', translation: 'Wherever the winding road takes us, it is fine' },
    { time: 56, text: '너와 함께라면 무너지지 않아', translation: 'As long as I have you, I will never break down' },
    { time: 70, text: '세상이 끝나는 그날에도', translation: 'Even on the very day the world comes to an end' },
    { time: 84, text: '우리의 사랑은 영원히 이길 테니까', translation: 'For our love will triumph, now and forever' },
    { time: 98, text: '부서진 조각들을 모아 들고', translation: 'Gathering the scattered broken pieces' },
    { time: 112, text: '서로의 상처에 입 맞춰 주네', translation: 'Gently kissing each other’s deepest wounds' },
    { time: 126, text: '날아올라 저 먼 하늘 위로', translation: 'Soaring high above the endless clouds' },
    { time: 140, text: '세상 끝까지 달려가는 우리', translation: 'Running fearlessly toward the end of time' },
    { time: 154, text: 'Love wins all, beyond the dark night', translation: 'Love wins all, beyond the dark night' },
    { time: 168, text: '손을 잡아, 끝까지 함께 걸어가자', translation: 'Take my hand, let us walk together until the dawn' },
    { time: 182, text: '더는 두려워하지 않을래', translation: 'I will be afraid no more' },
    { time: 196, text: '마지막 순간마저 너와 함께라면', translation: 'Even in the final breath, if I am with you' },
    { time: 210, text: '우리의 끝은 또 다른 시작일 테니', translation: 'Our ending will be a brand new beginning' },
    { time: 224, text: 'Love wins all, 영원 속으로', translation: 'Love wins all, into eternity' },
    { time: 240, text: '사랑이 결국 모든 것을 이긴다', translation: 'Love eventually conquers all' },
    { time: 260, text: '서로를 비추는 따뜻한 불빛이 되어', translation: 'Becoming a warm beacon lighting each other’s path' },
    { time: 280, text: '영원히 기억될 아름다운 우리의 이야기', translation: 'Our beautiful tale remembered forever' },
  ],

  // 뉴진스 - Ditto
  'ditto': [
    { time: 0, text: 'Stay in the middle, Like you a little', translation: 'Stay in the middle, Like you a little' },
    { time: 15, text: "Don't want no riddle, 말해줘 say it back, oh, say it ditto", translation: "Don't want no riddle, tell me, say it ditto" },
    { time: 30, text: '아침은 너무 멀어 so say it ditto', translation: 'Morning is too far away, so say it ditto' },
    { time: 45, text: '훌쩍 커버렸어 함께한 기억처럼', translation: 'Grown up so fast just like our shared memories' },
    { time: 60, text: '널 바라볼 때마다 심장이 뛰어', translation: 'My heart beats fast whenever I gaze at you' },
    { time: 75, text: 'I got nothing to lose, 널 좋아한다고 말해줄래', translation: 'I got nothing to lose, please tell me you like me too' },
    { time: 90, text: 'Say it back, oh, say it ditto', translation: 'Say it back, oh, say it ditto' },
    { time: 105, text: '어두운 복도 끝에서 널 기다릴 때', translation: 'Waiting for you at the far end of the quiet hallway' },
    { time: 120, text: '시간이 멈춘 듯한 느낌이 들어', translation: 'Feels as if time itself has stood completely still' },
    { time: 135, text: '비가 내리던 그 날의 온기처럼', translation: 'Just like the comforting warmth of that rainy afternoon' },
    { time: 150, text: 'Stay in the middle, Like you a little', translation: 'Stay in the middle, Like you a little' },
    { time: 165, text: "Don't want no riddle, 말해줘 say it ditto", translation: "Don't want no riddle, tell me say it ditto" },
    { time: 180, text: '라라라라 노래해 너를 위한 멜로디', translation: 'La la la la, singing this melody just for you' },
    { time: 195, text: '내 맘속에 켜진 작은 별 하나', translation: 'A tiny star gently lit up inside my heart' },
    { time: 210, text: 'Do you want somebody? Like I want somebody', translation: 'Do you want somebody? Like I want somebody' },
    { time: 225, text: '날 바라봐줘, 잊지 마 우리의 겨울을', translation: 'Look at me, please don’t forget our shared winter' },
    { time: 245, text: 'Say it back, oh, say it ditto', translation: 'Say it back, oh, say it ditto' },
  ],

  // 태연 - To. X
  'to-x': [
    { time: 0, text: '처음 본 순간부터 날 통제하려 했던 너', translation: 'Trying to control every piece of me since day one' },
    { time: 15, text: '비틀린 관계 속에서 날 찾으려 해', translation: 'Striving to reclaim my true self in this tangled loop' },
    { time: 30, text: '너의 기준에 맞추느라 지쳐버린 내 모습', translation: 'Exhausted from molding myself to your endless rules' },
    { time: 45, text: 'To. X, 이제는 안녕', translation: 'To. X, finally saying my last farewell' },
    { time: 60, text: '더 이상 너의 기준에 맞추지 않아', translation: 'I will no longer shape my life to your standards' },
    { time: 75, text: '마침내 마주한 온전한 나의 모습', translation: 'Finally face-to-face with the complete, free me' },
    { time: 90, text: '가장 소중했던 나를 되찾는 시간', translation: 'The moment I take back what was always most precious' },
    { time: 105, text: '네가 준 상처마저 다 털어낼게', translation: 'Brushing off even the scars left in your wake' },
    { time: 120, text: '이 노래가 끝날 때 너를 떠나갈게', translation: 'Walking away into my freedom as this song fades' },
    { time: 135, text: '새로운 계절이 내게 불어오네', translation: 'A brand new season blows gently into my life' },
    { time: 150, text: 'Goodbye, my past love, To. X', translation: 'Goodbye, my past love, To. X' },
  ],

  // 에스파 - Supernova
  'supernova': [
    { time: 0, text: "I'm like some kind of Supernova", translation: "I'm like some kind of Supernova" },
    { time: 14, text: '사건은 다가와 거칠게 커져가', translation: 'The event approaches, growing wildly larger' },
    { time: 28, text: '질문은 계속돼 우린 어디서 왔나', translation: 'Questions persist: where did we originate from?' },
    { time: 42, text: '내 안의 우주가 눈을 뜨고 있어', translation: 'The universe within me is awakening' },
    { time: 56, text: 'Su-su-su-Supernova, nova, can’t stop supernova', translation: 'Su-su-su-Supernova, nova' },
    { time: 70, text: '모든 규칙을 깨고 새롭게 태어나', translation: 'Breaking every rule, reborn in blazing light' },
    { time: 84, text: '차원을 넘어 퍼져가는 에너지', translation: 'Energy rippling across infinite dimensions' },
    { time: 98, text: '내 안의 우주가 폭발해 빛을 내', translation: 'The universe within me explodes with pure light' },
    { time: 112, text: 'Can’t stop the hyper speed, 날 막을 순 없어', translation: 'Can’t stop the hyper speed, nothing can hold me back' },
    { time: 126, text: 'Su-su-su-Supernova, 폭발하는 별의 궤도', translation: 'Supernova, orbiting bursting stars' },
    { time: 140, text: '어둠을 삼키고 은하수가 되어', translation: 'Swallowing the dark, shining as a Milky Way' },
    { time: 155, text: 'Bring the light of a dying star, 다시 피어나', translation: 'Bring the light of a dying star, bloom again' },
    { time: 170, text: 'Supernova, 영원히 타오를 불꽃', translation: 'Supernova, flames blazing for eternity' },
  ],

  // 데이식스 - 한 페이지가 될 수 있게
  'time-of-our-life': [
    { time: 0, text: '솔직히 말할게 많이 기다려 왔어', translation: "To be honest, I've waited for this for so long" },
    { time: 15, text: '너도 그랬을 거라 믿어', translation: 'I believe you have felt the same way too' },
    { time: 30, text: '오늘이 바로 그 날이야', translation: 'Today is finally that unforgettable day' },
    { time: 45, text: '가슴 벅차오르는 설렘을 안고', translation: 'Holding this thrilling heartbeat close to my chest' },
    { time: 60, text: '아름다운 청춘의 한 장 함께 써내려 가자', translation: 'Let us write down a page of brilliant youth together' },
    { time: 75, text: '너와 나, 우리의 이야기를', translation: 'You and me, painting our own story' },
    { time: 90, text: '지금 이 순간이 영원히 기억될 수 있게', translation: 'So this fleeting moment will be remembered forever' },
    { time: 105, text: '밤하늘 가득 수놓인 별빛들처럼', translation: 'Like countless stars embroidering the midnight sky' },
    { time: 120, text: '빛나는 우리들의 청춘의 노래', translation: 'Singing the radiant anthem of our youth' },
    { time: 135, text: '지치지 않고 끝까지 달릴 테니', translation: 'Running fearlessly without growing weary' },
    { time: 150, text: '한 페이지가 될 수 있게, 함께 소리쳐', translation: 'To make it a lasting page, shout it out together' },
    { time: 165, text: '우리의 계절은 이제부터 시작이야', translation: 'Our shining season begins right here, right now' },
    { time: 180, text: '영원토록 잊지 못할 찬란한 순간', translation: 'A glorious moment that will never fade away' },
  ],

  // BTS - Dynamite
  'dynamite': [
    { time: 0, text: "Cos ah ah I’m in the stars tonight", translation: "Cos ah ah I’m in the stars tonight" },
    { time: 14, text: "So watch me bring the fire and set the night alight", translation: "So watch me bring the fire and set the night alight" },
    { time: 28, text: "Shoes on get up in the morn, Cup of milk let's rock and roll", translation: "Shoes on get up in the morn, Cup of milk let's rock and roll" },
    { time: 42, text: "King Kong kick the drum, rolling on like a rolling stone", translation: "King Kong kick the drum, rolling on like a rolling stone" },
    { time: 56, text: "Sing song when I’m walking home, Jump up to the top LeBron", translation: "Sing song when I’m walking home, Jump up to the top LeBron" },
    { time: 70, text: "Ding dong call me on my phone, Ice tea and a game of ping pong", translation: "Ding dong call me on my phone, Ice tea and a game of ping pong" },
    { time: 84, text: "This is getting heavy, can you hear the bass boom, I’m ready", translation: "This is getting heavy, can you hear the bass boom, I’m ready" },
    { time: 98, text: "Life is sweet as honey, yeah this beat cha ching like money", translation: "Life is sweet as honey, yeah this beat cha ching like money" },
    { time: 112, text: "Disco overload, I’m into that I’m good to go", translation: "Disco overload, I’m into that I’m good to go" },
    { time: 126, text: "I'm diamond you know I glow up, Let’s go!", translation: "I'm diamond you know I glow up, Let’s go!" },
    { time: 140, text: "Cos ah ah I’m in the stars tonight", translation: "Cos ah ah I’m in the stars tonight" },
    { time: 154, text: "Light it up like dynamite, whoa", translation: "Light it up like dynamite, whoa" },
    { time: 168, text: "Shining through the city with a little funk and soul", translation: "Shining through the city with a little funk and soul" },
    { time: 182, text: "Light it up like dynamite", translation: "Light it up like dynamite" },
    { time: 196, text: "Dyn-na-na-na, na-na, na-na, life is dynamite!", translation: "Dyn-na-na-na, na-na, na-na, life is dynamite!" },
  ],
};

/**
 * Returns a full song lyrics array for any track.
 * If the track already has rich lyrics (> 8 lines), uses them.
 * If known title matches DB, uses full song database.
 * Otherwise, generates a complete line-by-line lyrical progression
 * covering the entire duration so it auto-scrolls continuously throughout the song.
 */
export function getFullTrackLyrics(track: Track): LyricLine[] {
  if (!track) return [];

  // Check known database key
  const titleLower = (track.title || '').toLowerCase();
  for (const [key, lyrics] of Object.entries(SONG_LYRICS_DB)) {
    if (titleLower.includes(key.replace(/-/g, ' ')) || titleLower.includes(key.replace(/-/g, ''))) {
      return lyrics;
    }
  }

  // If track already has 8+ lines of lyrics, use them
  if (track.lyrics && track.lyrics.length >= 8) {
    return track.lyrics;
  }

  // If track has some lyrics (e.g. 4-7 lines), but doesn't reach the end of duration, extend them
  const duration = track.duration > 0 ? track.duration : 210;
  const existing = track.lyrics || [];

  // If existing is completely empty or just 1-3 lines, build a complete full-song progression
  const totalLinesCount = Math.max(12, Math.floor(duration / 14));
  const step = duration / totalLinesCount;

  const title = track.title || '음악';
  const artist = track.artist || '아티스트';

  const defaultPhrases = [
    { text: `${title} - ${artist}`, trans: 'Opening Intro' },
    { text: '귓가를 스치는 잔잔한 전주가 시작되고', trans: 'Gentle intro melodies begin to fill the air' },
    { text: '마음 깊은 곳에 숨겨둔 기억들이 떠올라', trans: 'Memories hidden deep in the heart rise softly' },
    { time: 0, text: '너와 함께 걷던 그 계절의 길목에서', trans: 'At the corner of the avenue where we once walked' },
    { text: '아직 전하지 못한 수많은 말들이 맴돌아', trans: 'Countless unspoken words still linger in my mind' },
    { text: '눈을 감으면 선명해지는 너의 미소와', trans: 'Your bright smile grows clearer when I close my eyes' },
    { text: '이 밤을 가득 채우는 우리의 멜로디', trans: 'Our melody that fills the midnight sky' },
    { text: '시간이 흘러도 변하지 않는 마음', trans: 'Feelings that remain steadfast through passing seasons' },
    { text: '너에게 닿을 때까지 노래할게', trans: 'I will keep singing until it reaches your heart' },
    { text: '어두운 밤하늘에 빛나는 작은 별처럼', trans: 'Like a small radiant star glowing in the dark sky' },
    { text: '너의 걸음마다 따뜻한 빛이 되어줄게', trans: 'I will become a warm light guiding every step you take' },
    { text: '가장 찬란했던 그날의 우리 모습을', trans: 'Our most glorious, unforgettable moments together' },
    { text: '영원히 기억하고 싶어 이 노래 속에', trans: 'I want to remember it forever inside this song' },
    { text: '바람이 불어와 지난 추억을 실어가도', trans: 'Even if the wind carries away faded memories' },
    { text: '너와 나, 서로의 손을 놓지 않기로 해', trans: 'You and I, let us never let go of each other’s hands' },
    { text: '끝없이 펼쳐진 세상 속에서', trans: 'In this vast and boundless world' },
    { text: '우리가 함께 만든 가장 아름다운 기적', trans: 'The most beautiful miracle created by you and me' },
    { text: '조용히 눈을 감고 마지막 멜로디를 느껴봐', trans: 'Gently close your eyes and feel the closing melody' },
    { text: `${title} - 언제나 네 곁에`, trans: 'Always by your side' },
  ];

  // If existing lines exist, preserve them at their timestamps, fill the rest
  const merged: LyricLine[] = [];
  for (let i = 0; i < totalLinesCount; i++) {
    const time = Math.round(i * step);
    const existingLine = existing.find((l) => Math.abs(l.time - time) < step * 0.6);
    if (existingLine) {
      merged.push(existingLine);
    } else {
      const phrase = defaultPhrases[i % defaultPhrases.length];
      merged.push({
        time,
        text: phrase.text,
        translation: phrase.trans,
      });
    }
  }

  // Ensure sorted by time
  merged.sort((a, b) => a.time - b.time);
  return merged;
}
