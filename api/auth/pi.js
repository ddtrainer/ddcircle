// POST /api/auth/pi  { accessToken }
// Pi access token을 https://api.minepi.com/v2/me 로 서버 검증한 뒤에만 세션을 수립한다.
// 이 흐름에는 Pi Network API 키가 필요하지 않다 (사용자 access token만 사용).
import { signSession, sessionCookie } from '../_session.js';
import { linkPiUser } from '../_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Vercel은 application/json 본문을 자동 파싱하지만, 문자열로 올 경우도 방어.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { body = {}; } }
  const accessToken = body && body.accessToken;
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'missing_access_token' });
  }

  // 1) Pi API로 access token 검증
  let meRes;
  try {
    meRes = await fetch('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    return res.status(502).json({ error: 'pi_api_unreachable' });
  }
  if (!meRes.ok) {
    return res.status(401).json({ error: 'invalid_access_token' });
  }

  const me = await meRes.json(); // { uid, username, ... }
  if (!me || !me.uid) {
    return res.status(401).json({ error: 'invalid_pi_user' });
  }
  const user = { uid: me.uid, username: me.username };

  // 2) 검증 성공 → 세션 쿠키 수립
  try {
    const token = signSession({ uid: user.uid, username: user.username });
    res.setHeader('Set-Cookie', sessionCookie(token));
  } catch (e) {
    // PI_SESSION_SECRET 미설정이면 세션 쿠키만 생략(검증 자체는 성공). 로그로 알림.
    console.error('[pi-auth] session cookie skipped:', e.message);
  }

  // 3) Pi 신원을 Supabase 계정에 연결 — 이게 있어야 응원나라/프로필/책장이 동작한다.
  //    실패해도 Pi 로그인 자체는 성공으로 둔다(앱은 로컬 저장으로 계속 동작).
  let supabase = null;
  try {
    const linked = await linkPiUser(user);
    if (linked) supabase = { tokenHash: linked.tokenHash, email: linked.email };
  } catch (e) {
    console.error('[pi-auth] supabase link failed:', e.message);
  }

  return res.status(200).json({ user, supabase });
}
