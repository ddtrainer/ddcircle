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

// 응원 보내기 — 중복 발송 방어 (DB unique index + idempotent upsert)
// 게시물별 응원은 같은 (from, to, post) 쌍에 대해 enc_id를 갱신하는 방식
// (사용자가 응원 메시지를 바꾸고 싶을 수 있음). 게시물 없는 응원은 하루 1회만.
export async function sendEncouragement(fromUserId, toUserId, encId, postId = null) {
  if (!fromUserId || !toUserId || !encId) throw new Error('invalid args');
  const row = { from_user: fromUserId, to_user: toUserId, enc_id: encId };
  if (postId) row.post_id = postId;

  // INSERT 후 unique index 위반(23505)은 "이미 보냄"으로 간주 → UPDATE로 enc_id 갱신
  const { error } = await supabase.from('encouragements').insert(row);
  if (error) {
    if (error.code === '23505') {
      // 게시물별: post_id 기준으로 enc_id만 교체
      if (postId) {
        const { error: upErr } = await supabase
          .from('encouragements')
          .update({ enc_id: encId, created_at: new Date().toISOString() })
          .eq('from_user', fromUserId)
          .eq('to_user', toUserId)
          .eq('post_id', postId);
        if (upErr) {
          console.error('[encouragements] update after dup error:', upErr);
          throw upErr;
        }
        return;
      }
      // 게시물 없는 응원: 오늘자 row 갱신
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { error: upErr } = await supabase
        .from('encouragements')
        .update({ enc_id: encId, created_at: new Date().toISOString() })
        .eq('from_user', fromUserId)
        .eq('to_user', toUserId)
        .is('post_id', null)
        .gte('created_at', start.toISOString());
      if (upErr) {
        console.error('[encouragements] update after dup error:', upErr);
        throw upErr;
      }
      return;
    }
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
