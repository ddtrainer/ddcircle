import { supabase } from './supabase';

// YYYY-MM-DD (로컬 타임존 기준)
function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 환영 EP 보너스 — 신규 가입 시 1회 지급
export async function applyWelcomeBonus(userId, amount = 20) {
  if (!userId || amount <= 0) return false;
  const { data: cur, error } = await supabase
    .from('user_stats')
    .select('total_ep, today_ep, month_ep')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[stats] welcome read error:', error);
    return false;
  }
  if (!cur) {
    // user_stats가 없으면 신규 row 생성 (트리거가 보통 만들지만 fallback)
    const { error: iErr } = await supabase
      .from('user_stats')
      .insert({ user_id: userId, total_ep: amount, today_ep: amount, month_ep: amount });
    if (iErr) {
      console.error('[stats] welcome insert error:', iErr);
      return false;
    }
    return true;
  }
  const { error: uErr } = await supabase
    .from('user_stats')
    .update({
      total_ep: (cur.total_ep || 0) + amount,
      today_ep: (cur.today_ep || 0) + amount,
      month_ep: (cur.month_ep || 0) + amount,
    })
    .eq('user_id', userId);
  if (uErr) {
    console.error('[stats] welcome update error:', uErr);
    return false;
  }
  return true;
}

// localStorage userEp → user_stats 1회 마이그레이션
// remote에 의미 있는 데이터가 있으면 건너뜀
export async function migrateLocalStats(userId, localStats) {
  if (!userId) return { migrated: false, reason: 'no userId' };
  const { data: cur, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[stats] migrate read error:', error);
    return { migrated: false, reason: 'read failed' };
  }
  // remote에 이미 데이터가 있으면 덮어쓰지 않음
  if (cur && (cur.total_ep > 0 || cur.streak > 0)) {
    return { migrated: false, reason: 'remote has data' };
  }
  // 로컬에도 의미 있는 값이 없으면 굳이 마이그레이션 안 함
  if (!localStats || ((localStats.total || 0) === 0 && (localStats.streak || 0) === 0)) {
    return { migrated: false, reason: 'local empty' };
  }
  const payload = {
    total_ep: localStats.total || 0,
    today_ep: localStats.today || 0,
    month_ep: localStats.thisMonth || 0,
    streak: localStats.streak || 0,
    empathy_sent: localStats.empathySent || 0,
    empathy_received: localStats.empathyReceived || 0,
  };
  if (cur) {
    const { error: uErr } = await supabase
      .from('user_stats')
      .update(payload)
      .eq('user_id', userId);
    if (uErr) {
      console.error('[stats] migrate update error:', uErr);
      return { migrated: false, reason: 'update failed' };
    }
  } else {
    const { error: iErr } = await supabase
      .from('user_stats')
      .insert({ user_id: userId, ...payload });
    if (iErr) {
      console.error('[stats] migrate insert error:', iErr);
      return { migrated: false, reason: 'insert failed' };
    }
  }
  return { migrated: true };
}

// 사용자 통계 조회
export async function fetchUserStats(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[stats] fetchUserStats error:', error);
    return null;
  }
  return data;
}

// 여러 사용자의 통계 일괄 조회 → { [userId]: { streak, last_session_date, today_ep, ... } }
// 친구 그리드에서 오늘 완료 여부 + 스트릭 표시용
export async function fetchUserStatsBulk(userIds) {
  if (!userIds || userIds.length === 0) return {};
  const { data, error } = await supabase
    .from('user_stats')
    .select('user_id, streak, last_session_date, today_ep')
    .in('user_id', userIds);
  if (error) {
    console.error('[stats] fetchUserStatsBulk error:', error);
    return {};
  }
  const map = {};
  for (const row of data || []) {
    map[row.user_id] = row;
  }
  return map;
}

// 최근 N일 daily_sessions 조회
// 반환: [{ date: 'YYYY-MM-DD', earnedEp }] — 오래된 → 최신 순
export async function fetchLastNDaysEp(userId, days = 14) {
  if (!userId) return [];
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const sinceDate = dateKey(since);

  const { data, error } = await supabase
    .from('daily_sessions')
    .select('session_date, earned_ep')
    .eq('user_id', userId)
    .gte('session_date', sinceDate)
    .order('session_date', { ascending: true });
  if (error) {
    console.error('[stats] fetchLastNDaysEp error:', error);
    return [];
  }
  // 누락된 날짜는 0으로 채움
  const map = new Map((data || []).map((r) => [r.session_date, r.earned_ep]));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    result.push({ date: key, earnedEp: map.get(key) || 0 });
  }
  return result;
}

// 오늘의 활동 — Record의 "오늘의 EP 내역" 카드용
// 반환: { hasProof, shared, sentCount, receivedCount, sessionDone }
export async function fetchTodayBreakdown(userId) {
  if (!userId) return null;
  const today = dateKey();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  // 오늘 세션 조회
  const { data: session } = await supabase
    .from('daily_sessions')
    .select('has_proof, shared')
    .eq('user_id', userId)
    .eq('session_date', today)
    .maybeSingle();

  // 오늘 보낸 공감 수
  const { count: sentCount } = await supabase
    .from('empathies')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startIso);

  // 오늘 받은 공감 수 — 본인 게시물 ID 먼저 조회 후 in 절
  const { data: myPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId);
  const myPostIds = (myPosts || []).map((p) => p.id);
  let receivedCount = 0;
  if (myPostIds.length > 0) {
    const { count } = await supabase
      .from('empathies')
      .select('id', { count: 'exact', head: true })
      .in('post_id', myPostIds)
      .neq('user_id', userId)
      .gte('created_at', startIso);
    receivedCount = count || 0;
  }

  return {
    sessionDone: !!session,
    hasProof: session?.has_proof || false,
    shared: session?.shared || false,
    sentCount: sentCount || 0,
    receivedCount,
  };
}

// 이번 달 활동 — Record의 "이번 달 활동 분석" 카드용
// 반환: { dashCount, deepCount, proofCount, empathyCount, nudgeCount }
export async function fetchMonthActivity(userId) {
  if (!userId) return null;
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const startIso = start.toISOString();
  const startDate = dateKey(start);

  // 이번 달 세션 수 (Dash/Deep는 페어로 함께)
  const { count: sessionCount } = await supabase
    .from('daily_sessions')
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('session_date', startDate);

  // 이번 달 셀카 + 공유 (posts.has_proof=true)
  const { count: proofCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('has_proof', true)
    .gte('created_at', startIso);

  // 이번 달 보낸 공감 수
  const { count: empathySentCount } = await supabase
    .from('empathies')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startIso);

  // 이번 달 보낸 응원/nudge 수
  const { count: nudgeCount } = await supabase
    .from('encouragements')
    .select('id', { count: 'exact', head: true })
    .eq('from_user', userId)
    .gte('created_at', startIso);

  return {
    dashCount: sessionCount || 0,
    deepCount: sessionCount || 0,
    proofCount: proofCount || 0,
    empathyCount: empathySentCount || 0,
    nudgeCount: nudgeCount || 0,
  };
}

// 세션 완료 기록: daily_sessions upsert + user_stats 업데이트
// data: { earnedEp, hasProof, shared, exerciseId, breathId, newStreak }
export async function recordSession(userId, data) {
  if (!userId) return;
  const today = dateKey();

  // 1) 오늘 daily_sessions upsert (같은 날 두 번 세션해도 한 row 유지)
  const { error: dsErr } = await supabase.from('daily_sessions').upsert(
    {
      user_id: userId,
      session_date: today,
      exercise_id: data.exerciseId || null,
      breath_id: data.breathId || null,
      has_proof: !!data.hasProof,
      shared: !!data.shared,
      earned_ep: data.earnedEp || 0,
    },
    { onConflict: 'user_id,session_date' }
  );
  if (dsErr) console.error('[stats] daily_sessions upsert error:', dsErr);

  // 2) user_stats 업데이트 (현재 값 fetch 후 계산)
  const { data: cur } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (!cur) {
    // 트리거가 없는 환경 fallback
    await supabase.from('user_stats').insert({
      user_id: userId,
      total_ep: data.earnedEp || 0,
      today_ep: data.earnedEp || 0,
      month_ep: data.earnedEp || 0,
      streak: data.newStreak || 1,
      last_session_date: today,
    });
    return;
  }

  const sameDay = cur.last_session_date === today;
  const sameMonth = cur.last_session_date && cur.last_session_date.slice(0, 7) === today.slice(0, 7);
  const earned = data.earnedEp || 0;
  const updates = {
    total_ep: cur.total_ep + earned,
    today_ep: sameDay ? cur.today_ep + earned : earned,
    month_ep: sameMonth ? cur.month_ep + earned : earned,
    streak: data.newStreak ?? cur.streak,
    last_session_date: today,
  };
  const { error: usErr } = await supabase
    .from('user_stats')
    .update(updates)
    .eq('user_id', userId);
  if (usErr) console.error('[stats] user_stats update error:', usErr);
}
