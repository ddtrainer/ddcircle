// Pi 신원 ↔ Supabase 계정 매핑 (서버 전용). `_` 접두사라 라우트로 노출되지 않는다.
//
// Pi 로그인만으로는 Supabase 세션이 없어 응원나라·프로필·책장이 모두 비로그인으로 동작한다.
// 여기서 Pi uid에 대응하는 Supabase 계정을 찾거나 만들고, 클라이언트가 실제 세션을
// 수립할 수 있는 일회용 토큰(magiclink hashed_token)을 발급한다.
//
// 필요 환경변수(서버 전용, Vercel Project Settings):
//   SUPABASE_SERVICE_ROLE_KEY  — 서비스 롤 키. 절대 클라이언트에 노출하지 말 것.
//   SUPABASE_URL 또는 VITE_SUPABASE_URL — 프로젝트 URL.
import { createClient } from '@supabase/supabase-js';

// Pi 사용자는 이메일이 없다. uid로 결정적인 합성 주소를 만들어 계정 키로 쓴다.
// 수신 불가 도메인(.invalid, RFC 2606)이라 실제 메일 발송/충돌 위험이 없다.
export function piEmail(uid) {
  return `pi_${String(uid).toLowerCase()}@pi-user.invalid`;
}

export function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // 미설정 — 호출부에서 Pi 인증만으로 진행
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Pi 사용자에 대응하는 Supabase 계정을 찾거나 생성하고, 세션 수립용 토큰을 돌려준다.
// 반환: { tokenHash, email } — 클라이언트가 verifyOtp로 교환한다.
export async function linkPiUser({ uid, username }) {
  const admin = adminClient();
  if (!admin) return null;

  const email = piEmail(uid);

  // 1) 계정 생성 시도. 이미 있으면 에러를 무시하고 진행(멱등).
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true, // 합성 주소라 확인 메일을 보낼 수 없다 — 즉시 확인 처리
    user_metadata: { pi_uid: uid, pi_username: username, provider: 'pi' },
  });
  // 이미 등록된 이메일이면 그대로 진행. 그 외 오류는 호출부에서 판단하도록 던진다.
  if (createErr && !/already|exists|registered|duplicate/i.test(createErr.message || '')) {
    throw createErr;
  }

  // 2) 세션 수립용 일회용 토큰 발급 (메일은 보내지 않고 토큰만 얻는다)
  //    응답의 user로 신규/기존 여부와 무관하게 Supabase user id를 얻을 수 있다.
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (error) throw error;

  const tokenHash = data?.properties?.hashed_token;
  if (!tokenHash) throw new Error('no_token_hash');

  // 3) 닉네임이 비어 있으면 Pi 사용자명으로 채운다 — 매 로그인마다 프로필 설정 화면으로
  //    빠지는 마찰을 없앤다. 이미 닉네임이 있으면 절대 덮어쓰지 않는다.
  const userId = data?.user?.id;
  if (userId && username) {
    try {
      const { data: prof } = await admin
        .from('profiles')
        .select('id, nickname')
        .eq('id', userId)
        .maybeSingle();
      if (prof && !prof.nickname) {
        await admin.from('profiles').update({ nickname: username }).eq('id', userId);
      }
    } catch (e) {
      // 닉네임 중복 등으로 실패해도 로그인은 계속 — 사용자가 직접 설정하면 된다.
      console.error('[pi-auth] nickname seed skipped:', e.message);
    }
  }

  return { tokenHash, email };
}
