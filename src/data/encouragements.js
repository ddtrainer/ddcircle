// 한 줄 응원 메시지 프리셋 (큐레이팅된 따뜻한 메시지)
// 사용자가 직접 글을 쓰지 않고 선택만 — 글쓰기 부담 0, 모더레이션 0
export const ENCOURAGEMENTS = [
  { id: 'today_great', emoji: '✨', textKey: 'enc_today_great' },
  { id: 'together',    emoji: '🤝', textKey: 'enc_together'    },
  { id: 'remember',    emoji: '💭', textKey: 'enc_remember'    },
  { id: 'tomorrow',    emoji: '🌅', textKey: 'enc_tomorrow'    },
  { id: 'breath_big',  emoji: '🌬️', textKey: 'enc_breath_big'  },
  { id: 'gentle_hug',  emoji: '🫂', textKey: 'enc_gentle_hug'  },
  { id: 'proud',       emoji: '🌟', textKey: 'enc_proud'       },
  { id: 'thanks',      emoji: '🙏', textKey: 'enc_thanks'      },
];

export function findEncouragement(id) {
  return ENCOURAGEMENTS.find((e) => e.id === id);
}
