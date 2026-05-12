import { supabase } from './supabase';

// 게시물 ID 목록에 대한 공감 모두 조회 → { [postId]: { counts:{sent,great,me}, byUser:Set } }
// userId가 있으면 본인이 누른 type들을 byUser에 표시
export async function fetchEmpathiesForPosts(postIds, userId) {
  if (!postIds || postIds.length === 0) return {};
  const { data, error } = await supabase
    .from('empathies')
    .select('post_id, user_id, type')
    .in('post_id', postIds);
  if (error) {
    console.error('[empathies] fetch error:', error);
    return {};
  }
  const result = {};
  for (const id of postIds) {
    result[id] = { counts: { sent: 0, great: 0, me: 0 }, byUser: new Set() };
  }
  for (const row of data || []) {
    const r = result[row.post_id];
    if (!r) continue;
    if (r.counts[row.type] !== undefined) r.counts[row.type] += 1;
    if (userId && row.user_id === userId) r.byUser.add(row.type);
  }
  return result;
}

// 공감 토글: 이미 있으면 삭제, 없으면 추가. 반환: { added: boolean }
export async function toggleEmpathy(userId, postId, type) {
  if (!userId || !postId || !type) throw new Error('invalid args');

  // 기존 행 확인
  const { data: existing } = await supabase
    .from('empathies')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .eq('type', type)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('empathies').delete().eq('id', existing.id);
    if (error) throw error;
    return { added: false };
  } else {
    const { error } = await supabase
      .from('empathies')
      .insert({ user_id: userId, post_id: postId, type });
    if (error) throw error;
    return { added: true };
  }
}
