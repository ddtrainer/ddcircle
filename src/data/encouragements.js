// 한 줄 응원 메시지 프리셋 (큐레이팅된 따뜻한 메시지)
// 사용자는 프리셋 선택 또는 직접 입력(50자 이내) 둘 다 가능
// 직접 입력은 enc_id에 'custom:내용' 형태로 저장됨
export const ENCOURAGEMENTS = [
  { id: 'today_great', emoji: '✨', textKey: 'enc_today_great' },
  { id: 'together',    emoji: '🤝', textKey: 'enc_together'    },
  { id: 'remember',    emoji: '💭', textKey: 'enc_remember'    },
  { id: 'tomorrow',    emoji: '🌅', textKey: 'enc_tomorrow'    },
  // 'breath_big' 제거 — 표현이 어색
  { id: 'gentle_hug',  emoji: '🫂', textKey: 'enc_gentle_hug'  },
  // 'proud' 제거 — 'today_great' 와 의미 중복
  { id: 'thanks',      emoji: '🙏', textKey: 'enc_thanks'      },
];

export function findEncouragement(id) {
  return ENCOURAGEMENTS.find((e) => e.id === id);
}

// 응원 ID로부터 표시 텍스트 추출 (프리셋 + 커스텀 모두 지원)
// t: useLang의 번역 함수 (커스텀은 번역 불필요)
export function getEncouragementText(encId, t) {
  if (!encId) return '';
  if (encId.startsWith('custom:')) return encId.slice(7);
  const enc = findEncouragement(encId);
  return enc && t ? t(enc.textKey) : '';
}
