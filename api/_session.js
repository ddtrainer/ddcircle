// 세션 서명/검증 유틸 (HMAC-SHA256). `_` 접두사 파일이라 라우트로 노출되지 않고 import 전용.
// PI_SESSION_SECRET 환경변수 필요 (Vercel Project Settings).
import crypto from 'crypto';

export const COOKIE = 'pi_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

function secret() {
  const s = process.env.PI_SESSION_SECRET;
  if (!s) throw new Error('PI_SESSION_SECRET is not set');
  return s;
}

export function signSession(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
}

export function sessionCookie(token) {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}

export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function readCookie(req) {
  const raw = req.headers.cookie || '';
  const m = raw.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
