// 무작위 placeholder — Complete 화면 진입할 때마다 새 prompt 노출
// 사용자는 질문에 답해도 되고, 무시하고 자유롭게 써도 됨 (라벨 sub에 안내)
const PROMPTS_KO = [
  '지금 기분 어때요?',
  '오늘 가장 큰 감정은?',
  '몸 상태 어때요?',
  '지금 무슨 생각?',
  '오늘의 한 마디?',
  '오늘 감사한 일?',
  '오늘 좋았던 일?',
];

const PROMPTS_EN = [
  'How do you feel right now?',
  'Your biggest feeling today?',
  "How's your body?",
  'What are you thinking?',
  'A word for today?',
  'Something you\'re grateful for?',
  'Something good today?',
];

// 무작위 선택 — Complete 화면 mount마다 새 prompt
export function getRandomPrompt(lang = 'ko') {
  const list = lang === 'en' ? PROMPTS_EN : PROMPTS_KO;
  return list[Math.floor(Math.random() * list.length)];
}

// 호환성 — 기존 호출부가 있으면 무작위로 동작
export const getTodayPrompt = getRandomPrompt;
