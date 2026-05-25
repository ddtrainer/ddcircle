// 매일 다른 placeholder — 일기 작성 진입로
// 인덱스는 dayOfYear 기반 (같은 날엔 동일 prompt 유지, 자정 넘어가면 새 prompt)
const PROMPTS_KO = [
  '지금 이 순간 든 생각은?',
  '오늘 나에게 한 마디',
  '내일의 나에게 남기는 말',
  '오늘 가장 또렷한 한 장면',
  '몸이 지금 뭐라고 하나요?',
  '오늘 작은 감사 한 가지',
  '지금 기분을 색으로 표현하면?',
  '오늘 나를 가장 웃게 한 것',
  '내가 자랑스러운 한 가지',
  '오늘 마음에 남은 단어',
  '한 줄로 정리하는 오늘',
  '지금 가장 가까운 사람에게 한 마디',
  '오늘 몸이 알려준 신호',
  '내일 더 잘하고 싶은 것',
  '오늘의 풍경 한 컷',
  '지금 깊게 숨을 쉬며 든 생각',
  '오늘 가장 고마운 사람',
  '나에게 해주고 싶은 칭찬',
  '오늘 마주한 작은 선물',
  '내 안에서 들려온 목소리',
  '오늘 흘려보낸 작은 걱정',
  '지금 손에 잡히는 행복',
  '오늘의 나, 한 단어로',
  '내가 오늘 배운 것',
  '지금 이 순간 감사한 것',
  '오늘 마음의 날씨',
  '하루를 닫으며 떠오르는 사람',
  '내가 나에게 묻고 싶은 것',
  '오늘 깨어있던 순간',
  '내일 아침의 나에게',
];

const PROMPTS_EN = [
  'What is on your mind right now?',
  'A word to your today self',
  'A note to tomorrow\'s you',
  'The clearest moment of today',
  'What is your body telling you?',
  'One small thing to be grateful for',
  'If today were a color, what would it be?',
  'What made you smile most today?',
  'One thing to be proud of',
  'A word that stayed with you today',
  'Today in one sentence',
  'Say something to someone close',
  'A signal your body sent today',
  'One thing to do better tomorrow',
  'A scene from today',
  'A thought from your deep breath',
  'Someone you are thankful for',
  'A compliment to yourself',
  'A small gift you noticed today',
  'A voice from within',
  'A worry you let go of today',
  'A happiness within reach',
  'Today\'s you, in one word',
  'What you learned today',
  'Something you appreciate now',
  'The weather inside you today',
  'Who comes to mind as the day closes',
  'A question for yourself',
  'A moment you were fully awake',
  'A note to tomorrow morning\'s you',
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
