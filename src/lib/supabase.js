import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[supabase] env 변수 누락 — .env.local 확인 필요');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE: PWA 홈 아이콘으로 진입한 경우 OAuth 리다이렉트가 Chrome Custom
    // Tab에서 처리돼 implicit flow의 hash 토큰이 PWA 세션에 닿지 않는 문제
    // 해결. PKCE는 code_verifier를 사전 저장 → 리턴 후 fetch로 교환 → 어떤
    // 컨텍스트에서도 안정적으로 세션 수립.
    flowType: 'pkce',
  },
});

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
