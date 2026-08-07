// GET /api/auth/me — 현재 세션(HttpOnly 쿠키)에서 Pi 사용자 조회.
import { readCookie, verifySession } from '../_session.js';

export default async function handler(req, res) {
  let sess = null;
  try {
    const token = readCookie(req);
    sess = token ? verifySession(token) : null;
  } catch (e) {
    console.error('[pi-auth] me verify error:', e.message);
  }
  if (!sess) return res.status(401).json({ user: null });
  return res.status(200).json({ user: { uid: sess.uid, username: sess.username } });
}
