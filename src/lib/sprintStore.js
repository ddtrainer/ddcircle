// 전력질주 메타데이터 저장 — 기존 recordSession()은 절대 건드리지 않고,
// daily_sessions의 해당 날짜 행에 sprint_* 컬럼만 채운다(merge upsert).
// recordSession과 순서 무관: 둘 다 (user_id, session_date) merge upsert라 서로의 컬럼을 덮지 않음.
import { supabase } from './supabase';
import { todayKey } from '../data/sprintConfig';

// 완료 데이터: { sprint_count, sprint_intensity, sprint_verified, is_alternative }
export async function saveSprint(userId, data) {
  if (!userId) return { ok: false, reason: 'guest' }; // 비로그인은 DB 저장 없음
  const { error } = await supabase
    .from('daily_sessions')
    .upsert(
      {
        user_id: userId,
        session_date: todayKey(),
        sprint_count: data.sprint_count ?? null,
        sprint_intensity: data.sprint_intensity ?? null,
        sprint_verified: data.sprint_verified ?? null,
        is_alternative: !!data.is_alternative,
      },
      { onConflict: 'user_id,session_date' }
    );
  if (error) { console.error('[sprint] save error:', error); return { ok: false, error }; }
  return { ok: true };
}

// 저강도(걷기) 대체 처리 — 걷기 기준 EP는 기존 completeSession(dashFully)이 정산하고,
// 여기서는 is_alternative=true 메타만 기록한다.
export async function processLowIntensityAlternative(userId) {
  return saveSprint(userId, {
    sprint_count: null,
    sprint_intensity: null,
    sprint_verified: null,
    is_alternative: true,
  });
}
