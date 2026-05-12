// 명시적 참여 기반 도전 이벤트 + 약속 보증 (stake) 메커니즘
// 사용자가 "도전 약속하기"로 옵트인하면:
//   - 보증 EP가 차감되고, 그 시점 streak를 startStreak로 기록
//   - 성공 시 보증 EP가 반환되고 보너스 EP가 추가됨
//   - 스트릭이 끊기면 보증 EP는 회수됨 (소각)
// 보증 EP는 보너스의 약 10~20% 수준 — 부담스럽지 않게, 그러나 의미 있게
export const CHALLENGES = [
  { id: '3day',   target: 3,   stakeEp: 3,   bonusEp: 30,   emoji: '🌱', titleKey: 'challenge3day',   descKey: 'challenge3dayDesc'   },
  { id: '7day',   target: 7,   stakeEp: 10,  bonusEp: 70,   emoji: '🔥', titleKey: 'challenge7day',   descKey: 'challenge7dayDesc'   },
  { id: '14day',  target: 14,  stakeEp: 20,  bonusEp: 150,  emoji: '⭐', titleKey: 'challenge14day',  descKey: 'challenge14dayDesc'  },
  { id: '30day',  target: 30,  stakeEp: 50,  bonusEp: 300,  emoji: '👑', titleKey: 'challenge30day',  descKey: 'challenge30dayDesc'  },
  { id: '60day',  target: 60,  stakeEp: 100, bonusEp: 600,  emoji: '💎', titleKey: 'challenge60day',  descKey: 'challenge60dayDesc'  },
  { id: '100day', target: 100, stakeEp: 200, bonusEp: 1000, emoji: '🏆', titleKey: 'challenge100day', descKey: 'challenge100dayDesc' },
];

// 한 챌린지의 참여 후 경과 일수 (음수면 실패)
export function progressOf(challenge, joinRecord, streak) {
  if (!joinRecord) return 0;
  return streak - joinRecord.startStreak;
}

export function findChallenge(id) {
  return CHALLENGES.find((c) => c.id === id);
}

// 세션 완료 시점에 참여 중인 챌린지 평가
// 반환: {
//   newClaims, newJoins,
//   bonusEp,         // 새로 달성한 챌린지의 총 보너스 EP (보증 환급 별도)
//   stakeRefund,     // 달성한 챌린지의 보증 EP 반환 합
//   stakeForfeited,  // 실패한 챌린지의 보증 EP 합 (소각)
//   completed,       // 새로 달성한 챌린지 배열
//   forfeited,       // 실패한 챌린지 배열
// }
export function evaluateChallenges(streak, currentClaims, currentJoins) {
  const newClaims = { ...currentClaims };
  const newJoins  = { ...currentJoins };
  const completed = [];
  const forfeited = [];
  let bonusEp = 0;
  let stakeRefund = 0;
  let stakeForfeited = 0;

  CHALLENGES.forEach((ch) => {
    const join = newJoins[ch.id];
    const claimed = !!newClaims[ch.id];
    if (!join) return;

    const progress = streak - join.startStreak;
    const stakedEp = join.stakedEp ?? 0; // 옛 join 기록은 stake 없을 수 있음

    // 실패: 스트릭이 시작점 미만으로 떨어짐
    if (progress < 0) {
      delete newJoins[ch.id];
      if (stakedEp > 0) {
        stakeForfeited += stakedEp;
        forfeited.push({ ...ch, stakedEp });
      }
      return;
    }

    // 달성 + 미수령
    if (progress >= ch.target && !claimed) {
      bonusEp += ch.bonusEp;
      stakeRefund += stakedEp;
      newClaims[ch.id] = { ts: Date.now(), streakAtClaim: streak, stakedEp };
      completed.push({ ...ch, stakedEp });
    }
  });

  return { newClaims, newJoins, bonusEp, stakeRefund, stakeForfeited, completed, forfeited };
}
