import { supabase } from './supabase';

// 챌린지 약속 보증 기록 — 인증된 사용자만
export async function recordStakeDeclared(userId, challengeId, stakedEp, startStreak) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('challenge_stakes')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      staked_ep: stakedEp,
      start_streak: startStreak,
      status: 'active',
    })
    .select()
    .single();
  if (error) {
    console.error('[challenges] stake declare error:', error);
    return null;
  }
  return data;
}

// 약속 달성 → 활성 stake 한 건을 'won' 처리
export async function resolveStakeWon(userId, challengeId) {
  if (!userId) return;
  const { error } = await supabase
    .from('challenge_stakes')
    .update({ status: 'won', resolved_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .eq('status', 'active');
  if (error) console.error('[challenges] stake won error:', error);
}

// 약속 실패 (스트릭 끊김) → 활성 stake 한 건을 'forfeited' 처리
export async function resolveStakeForfeited(userId, challengeId) {
  if (!userId) return;
  const { error } = await supabase
    .from('challenge_stakes')
    .update({ status: 'forfeited', resolved_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .eq('status', 'active');
  if (error) console.error('[challenges] stake forfeit error:', error);
}

// 도전 포기 (자발적 leave) → forfeited와 동일하지만 의미상 별도
export async function cancelStake(userId, challengeId) {
  return resolveStakeForfeited(userId, challengeId);
}
