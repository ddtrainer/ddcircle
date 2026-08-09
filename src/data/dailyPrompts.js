// 무작위 placeholder — Complete 화면 진입할 때마다 새 prompt 노출
// 사용자는 질문에 답해도 되고, 무시하고 자유롭게 써도 됨 (라벨 sub에 안내)
const PROMPT_KEYS = [
  'dailyPrompt1',
  'dailyPrompt2',
  'dailyPrompt3',
  'dailyPrompt4',
  'dailyPrompt5',
  'dailyPrompt6',
  'dailyPrompt7',
];

// 무작위 선택 — Complete 화면 mount마다 새 prompt. t: useLang()의 번역 함수.
export function getRandomPrompt(t) {
  const key = PROMPT_KEYS[Math.floor(Math.random() * PROMPT_KEYS.length)];
  return t(key);
}

// 호환성 — 기존 호출부가 있으면 무작위로 동작
export const getTodayPrompt = getRandomPrompt;
