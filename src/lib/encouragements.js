import { supabase } from './supabase';

// 본인이 오늘 보낸 응원 모두 조회
// 반환: { byUser: { [toUserId]: { encId, ts } },  byPost: { [postId]: { encId, ts } } }
// byUser  = 친구 그리드(친구 1명에 대한 오늘 응원 여부) 용도
// byPost  = 응원나라 피드 카드(게시물별 응원 여부) 용도
export async function fetchSentToday(userId) {
  if (!userId) return { byUser: {}, byPost: {} };
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('encouragements')
    .select('to_user, post_id, enc_id, created_at')
    .eq('from_user', userId)
    .gte('created_at', start.toISOString());
  if (error) {
    console.error('[encouragements] fetch error:', error);
    return { byUser: {}, byPost: {} };
  }
  const byUser = {};
  const byPost = {};
  for (const row of data || []) {
    const entry = { encId: row.enc_id, ts: new Date(row.created_at).getTime() };
    // byUser는 가장 최근 응원으로 덮어쓰기
    byUser[row.to_user] = entry;
    if (row.post_id) byPost[row.post_id] = entry;
  }
  return { byUser, byPost };
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
