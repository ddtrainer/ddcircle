// 데모용 친구 8명 (KO/EN 이름 + 운동/무드 메타 포함)
// 실제 환경에서는 서버에서 받아옴
export const FRIENDS = [
  { id: 1, name: '지현', enName: 'Jihyun', emoji: '🌸', color: '#fbb040,#f97b9c', done: true, streak: 23, msgKey: 'friend1Msg', mood: '😔', moodLabel: 'moodHard', exerciseKey: 'Jog', time: 32, hasProof: true },
  { id: 2, name: '민준', enName: 'Minjun', emoji: '🌊', color: '#1e9bd8,#2ba48f', done: true, streak: 7, msgKey: 'friend2Msg', mood: '💪', moodLabel: 'moodProud', exerciseKey: 'Burpee', time: 60, hasProof: true },
  { id: 3, name: '수진', enName: 'Sujin', emoji: '🍃', color: '#2ba48f,#1e9bd8', done: true, streak: 3, msgKey: 'friend3Msg', mood: '😟', moodLabel: 'moodAnxious', exerciseKey: 'Squat', time: 180, hasProof: false },
  { id: 4, name: '재훈', enName: 'Jaehoon', emoji: '🌲', color: '#7ed957,#2ba48f', done: true, streak: 15, msgKey: 'friend4Msg', mood: '😌', moodLabel: 'moodDidIt', exerciseKey: 'JumpingJack', time: 240, hasProof: true },
  { id: 5, name: '예린', enName: 'Yerin', emoji: '🌷', color: '#f97b9c,#fbb040', done: true, streak: 9, msgKey: 'friend5Msg', mood: '💪', moodLabel: 'moodProud', exerciseKey: 'Burpee', time: 300, hasProof: false },
  { id: 6, name: '도윤', enName: 'Doyun', emoji: '🌙', color: '#a78bfa,#1e9bd8', done: false, streak: 5 },
  { id: 7, name: '하늘', enName: 'Haneul', emoji: '☁️', color: '#1e9bd8,#7ed957', done: false, streak: 2 },
  { id: 8, name: '윤호', enName: 'Yunho', emoji: '🔥', color: '#ed3a4a,#f47730', done: false, streak: 1 },
];

// 분 단위 → "32분 전" / "32m ago" 포맷
export function formatTimeAgo(min, lang) {
  if (lang === 'ko') {
    if (min < 60) return `${min}분 전`;
    return `${Math.floor(min / 60)}시간 전`;
  }
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}
