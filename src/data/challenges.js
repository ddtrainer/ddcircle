// 명시적 참여 기반 도전 이벤트
// 사용자가 "참여하기"로 옵트인하면 그 시점 streak를 기준점(startStreak)으로 잡아
// 이후 진행률(progress = streak - startStreak)을 계산. target 도달 시 보너스 EP.
// 스트릭이 startStreak 미만으로 떨어지면 도전 실패 처리(자동 리셋, 재참여 가능).
export const CHALLENGES = [
  { id: '3day',   target: 3,   bonusEp: 30,   emoji: '🌱', titleKey: 'challenge3day',   descKey: 'challenge3dayDesc'   },
  { id: '7day',   target: 7,   bonusEp: 70,   emoji: '🔥', titleKey: 'challenge7day',   descKey: 'challenge7dayDesc'   },
  { id: '14day',  target: 14,  bonusEp: 150,  emoji: '⭐', titleKey: 'challenge14day',  descKey: 'challenge14dayDesc'  },
  { id: '30day',  target: 30,  bonusEp: 300,  emoji: '👑', titleKey: 'challenge30day',  descKey: 'challenge30dayDesc'  },
  { id: '60day',  target: 60,  bonusEp: 600,  emoji: '💎', titleKey: 'challenge60day',  descKey: 'challenge60dayDesc'  },
  { id: '100day', target: 100, bonusEp: 1000, emoji: '🏆', titleKey: 'challenge100day', descKey: 'challenge100dayDesc' },
];

// 한 챌린지의 참여 후 경과 일수 (음수면 실패)
export function progressOf(challenge, joinRecord, streak) {
  if (!joinRecord) return 0;
  return streak - joinRecord.startStreak;
}

// 세션 완료 시점에 참여 중인 챌린지를 평가
// 반환: { newClaims, newJoins, bonusEp, completed }
export function evaluateChallenges(streak, currentClaims, currentJoins) {
  const newClaims = { ...currentClaims };
  const newJoins  = { ...currentJoins };
  const completed = [];
  let bonusEp = 0;

  CHALLENGES.forEach((ch) => {
    const join = newJoins[ch.id];
    const claimed = !!newClaims[ch.id];

    // 참여 중인 경우만 평가
    if (!join) return;

    const progress = streak - join.startStreak;

    // 실패 (스트릭 끊김) → 참여 기록 제거
    if (progress < 0) {
      delete newJoins[ch.id];
      return;
    }

    // 달성 + 미수령 → 보너스 지급
    if (progress >= ch.target && !claimed) {
      bonusEp += ch.bonusEp;
      newClaims[ch.id] = { ts: Date.now(), streakAtClaim: streak };
      completed.push(ch);
      // 달성 후 참여 기록은 유지 (UI에서 "받음" 표시로 활용)
    }
  });

  return { newClaims, newJoins, bonusEp, completed };
}
