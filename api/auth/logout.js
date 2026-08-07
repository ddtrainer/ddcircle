// POST /api/auth/logout — 세션 쿠키 제거.
import { clearCookie } from '../_session.js';

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie());
  return res.status(200).json({ ok: true });
}
