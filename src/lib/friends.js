import { supabase } from './supabase';

// invite_code로 다른 유저의 프로필 조회
export async function fetchProfileByInviteCode(code) {
  if (!code) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, emoji, emoji_bg, avatar_url, invite_code, created_at')
    .eq('invite_code', code)
    .maybeSingle();
  if (error) {
    console.error('[friends] fetchProfileByInviteCode error:', error);
    return null;
  }
  return data;
}

// 현재 유저의 친구 목록 조회
// friendships 테이블에서 user_a 또는 user_b가 본인인 행을 찾고, 상대 프로필 조회
export async function fetchFriends(userId) {
  if (!userId) return [];
  const { data: rows, error } = await supabase
    .from('friendships')
    .select('user_a, user_b, created_at')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  if (error) {
    console.error('[friends] fetchFriends error:', error);
    return [];
  }
  if (!rows || rows.length === 0) return [];

  const friendIds = rows.map((r) => (r.user_a === userId ? r.user_b : r.user_a));
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, nickname, emoji, emoji_bg, avatar_url, invite_code')
    .in('id', friendIds);
  if (pErr) {
    console.error('[friends] fetch profiles error:', pErr);
    return [];
  }
  return profiles || [];
}

// 친구 관계 생성 — user_a < user_b 정렬 후 insert (스키마 제약)
export async function createFriendship(userId, otherId) {
  if (!userId || !otherId || userId === otherId) {
    throw new Error('invalid friendship pair');
  }
  const [user_a, user_b] = userId < otherId ? [userId, otherId] : [otherId, userId];
  const { error } = await supabase
    .from('friendships')
    .insert({ user_a, user_b });
  if (error) {
    // 중복 (이미 친구)는 에러로 보지 않음
    if (error.code === '23505') return { alreadyFriends: true };
    console.error('[friends] createFriendship error:', error);
    throw error;
  }
  return { alreadyFriends: false };
}

// 초대 수락: invite_code로 초대자 찾고 친구 관계 생성
export async function acceptInvite(userId, inviteCode) {
  const inviter = await fetchProfileByInviteCode(inviteCode);
  if (!inviter) throw new Error('inviter not found');
  if (inviter.id === userId) throw new Error('cannot invite yourself');
  await createFriendship(userId, inviter.id);
  return inviter;
}
