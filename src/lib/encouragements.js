import { supabase } from './supabase';

// 본인이 오늘 보낸 응원 모두 조회 → { [toUserId]: { encId, ts } }
export async function fetchSentToday(userId) {
  if (!userId) return {};
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('encouragements')
    .select('to_user, enc_id, created_at')
    .eq('from_user', userId)
    .gte('created_at', start.toISOString());
  if (error) {
    console.error('[encouragements] fetch error:', error);
    return {};
  }
  const map = {};
  for (const row of data || []) {
    map[row.to_user] = { encId: row.enc_id, ts: new Date(row.created_at).getTime() };
  }
  return map;
}

// 응원 보내기
export async function sendEncouragement(fromUserId, toUserId, encId, postId = null) {
  if (!fromUserId || !toUserId || !encId) throw new Error('invalid args');
  const row = { from_user: fromUserId, to_user: toUserId, enc_id: encId };
  if (postId) row.post_id = postId;
  const { error } = await supabase.from('encouragements').insert(row);
  if (error) {
    console.error('[encouragements] insert error:', error);
    throw error;
  }
}

// 받은 응원 모두 (옵션: 오늘만)
export async function fetchReceived(userId, onlyToday = false) {
  if (!userId) return [];
  let q = supabase
    .from('encouragements')
    .select('id, from_user, enc_id, post_id, created_at')
    .eq('to_user', userId)
    .order('created_at', { ascending: false });
  if (onlyToday) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    q = q.gte('created_at', start.toISOString());
  }
  const { data, error } = await q;
  if (error) {
    console.error('[encouragements] fetchReceived error:', error);
    return [];
  }
  return data || [];
}
