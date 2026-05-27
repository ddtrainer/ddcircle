// 매일 다른 placeholder — 일기 작성 진입로
// 인덱스는 dayOfYear 기반 (같은 날엔 동일 prompt 유지, 자정 넘어가면 새 prompt)
// 톤: 가볍고 구체적으로. 사용자가 "뭐라고 써야 하지" 막히지 않게.
const PROMPTS_KO = [
  '오늘 뭐 했어요?',
  '한 줄 끼적여보기 ✏️',
  '오늘 기분 한 단어로?',
  '편하게 한 줄 — 짧아도 OK',
  '오늘 뭐가 좋았어요?',
  '오늘 본 것 중 하나',
  '오늘 날씨 한 줄',
  '오늘 먹은 것 중 하나 🍴',
  '지금 듣고 있는 노래?',
  '오늘 만난 사람',
  '한 줄로 오늘 기록',
  '뭐든 떠오르는 대로',
  '오늘의 작은 발견',
  '잠깐 멈춰서 한 줄',
  '오늘 살짝 웃었던 순간',
  '지금 들리는 소리',
  '오늘의 한 컷 📸',
  '내일 하고 싶은 것 하나',
  '오늘 마신 음료 ☕',
  '한 단어로 오늘',
  '오늘 갔던 곳',
  '오늘 새로 알게 된 것',
  '오늘 도와준 사람',
  '오늘 받은 작은 선물',
  '오늘 미뤘던 것 ↻',
  '오늘 가장 편한 시간',
  '오늘 가장 바쁜 순간',
  '오늘 한숨 돌린 때',
  '오늘 다시 보고 싶은 것',
  '오늘 끝낸 것 ✓',
];

const PROMPTS_EN = [
  'What did you do today?',
  'Jot a line ✏️',
  'Today in one word?',
  'Just one line — short is fine',
  'What was nice today?',
  'One thing you saw',
  'Today\'s weather, one line',
  'Something you ate 🍴',
  'A song you\'re hearing',
  'Someone you met',
  'Today in one line',
  'Anything that comes to mind',
  'A small discovery today',
  'A pause-and-write moment',
  'When you smiled today',
  'A sound right now',
  'Today\'s snapshot 📸',
  'One thing for tomorrow',
  'What you sipped today ☕',
  'Today, one word',
  'A place you went',
  'Something new you learned',
  'Someone who helped',
  'A small gift today',
  'Something you put off ↻',
  'Your calmest moment',
  'Your busiest moment',
  'When you caught your breath',
  'Something to revisit',
  'Something you finished ✓',
];

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000); // ms in a day
}

export function getTodayPrompt(lang = 'ko') {
  const list = lang === 'en' ? PROMPTS_EN : PROMPTS_KO;
  return list[dayOfYear() % list.length];
}
