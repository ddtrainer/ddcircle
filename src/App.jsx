import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { LangProvider } from './i18n/LangContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PiAuthProvider } from './context/PiAuthContext';
import { LevelProvider } from './context/LevelContext';
import { ToastProvider } from './components/Toast';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import IncomingInviteModal from './components/modals/IncomingInviteModal';
import Onboarding from './components/Onboarding';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import InAppBrowserGate from './components/InAppBrowserGate';
import PiBrowserGate from './components/PiBrowserGate';
import SWUpdatePrompt from './components/SWUpdatePrompt';
import SetAlertController from './components/SetAlertController';
import { initAnalytics } from './utils/analytics';
import { initKakao } from './utils/kakao';

// PostHog 초기화 (키 없으면 no-op)
initAnalytics();
// Kakao SDK 초기화 (공유하기)
initKakao();
import Home from './views/Home';
import Grow from './views/Grow';
import BreathPicker from './views/BreathPicker';
import ExercisePicker from './views/ExercisePicker';
import Countdown from './views/Countdown';
import Proof from './views/Proof';
import DeepSession from './views/DeepSession';
import Login from './views/Login';
import AuthCallback from './views/AuthCallback';
import ProfileSetup from './views/ProfileSetup';

// 무거운 뷰는 lazy load — 메인 번들에서 분리해서 초기 로드 가벼워짐
// Wall(피드+공감+친구+응원), Record(차트+갤러리), Complete(카드 생성+QR)
const Wall = lazy(() => import('./views/Wall'));
const Record = lazy(() => import('./views/Record'));
const Book = lazy(() => import('./views/Book'));
const Complete = lazy(() => import('./views/Complete'));
const Terms = lazy(() => import('./views/Terms'));
const Privacy = lazy(() => import('./views/Privacy'));
// 전력질주 자동 감지 (신규 기능 — 옵션)
const SprintDetect = lazy(() => import('./components/AutoDetect/SprintDetect'));

// lazy 뷰 로딩 중 표시할 폴백
function ViewFallback() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--text-muted)', fontSize: 32,
    }}>
      🌿
    </div>
  );
}

// 카운트다운/세션/Proof/로그인 화면에서는 BottomNav 숨김
const FULLSCREEN_PATHS = ['/countdown', '/deep', '/proof', '/login', '/auth', '/profile-setup', '/book', '/sprint', '/breath-picker'];

function ConditionalBottomNav() {
  const { pathname } = useLocation();
  const hide = FULLSCREEN_PATHS.some((p) => pathname.startsWith(p));
  if (hide) return null;
  return <BottomNav />;
}

// 로그인된 유저가 프로필 설정을 완료하지 않았으면 /profile-setup으로 안내
const SKIP_GUARD_PATHS = ['/profile-setup', '/auth', '/login'];
function ProfileGuard() {
  const { user, profile, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    if (SKIP_GUARD_PATHS.some((p) => pathname.startsWith(p))) return;

    // 설정 완료 기준은 Supabase의 profile.nickname (DB가 단일 진실 소스)
    // localStorage 플래그만 보면 다른 기기/브라우저로 로그인했을 때 매번
    // /profile-setup으로 다시 빠지는 문제가 생김. 닉네임이 있으면 통과,
    // 그리고 로컬 캐시도 채워서 빠른 후속 체크에 활용.
    if (profile?.nickname) {
      try { localStorage.setItem(`ddcircle.setup.${user.id}`, '1'); } catch {}
      return;
    }

    // 여기까지 왔으면 loading은 끝났고 닉네임이 없음 → 신규 설정 필요
    navigate('/profile-setup', { replace: true });
  }, [user, profile, loading, pathname, navigate]);

  return null;
}

// URL ?invite=xxx 진입 + 로그인 후 보류 코드 처리
// 흐름:
//   1) URL에 ?invite=xxx 있으면 localStorage에 저장 (OAuth 리다이렉트 거쳐도 보존)
//   2) 본인 코드 / 이미 처리한 코드는 무시
//   3) 로그인 상태가 되면 (즉시 또는 OAuth 콜백 후) 보류 코드로 모달 표시
function InviteUrlHandler() {
  const { pendingInvite, setPendingInvite, inviteCode: myInviteCode } = useApp();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  // 1) URL의 ?invite= 를 localStorage에 보관 (로그인 흐름을 거쳐도 살아남도록)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (!code) return;

    // URL 정리 — 가드에서 걸러져도 항상 청소
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    try {
      localStorage.setItem('ddcircle.pendingInviteCode', code);
    } catch { /* ignore */ }
  }, []);

  // 2) 로그인 상태 + 본인 invite_code 로딩 완료 후 보류 코드 처리
  // user나 profile.invite_code가 바뀔 때마다 재평가
  useEffect(() => {
    if (!user) return; // 비로그인이면 모달 안 띄움 (수락이 의미 없으므로)

    const code = (() => {
      try { return localStorage.getItem('ddcircle.pendingInviteCode'); }
      catch { return null; }
    })();
    if (!code) return;

    // 가드 1: 본인 코드 (자기 초대 차단)
    const ownCode = profile?.invite_code || myInviteCode;
    if (ownCode && code === ownCode) {
      console.log('[invite] self-invite ignored');
      try { localStorage.removeItem('ddcircle.pendingInviteCode'); } catch {}
      return;
    }

    // 가드 2: 이미 처리한 코드
    try {
      const handled = JSON.parse(localStorage.getItem('ddcircle.handledInvites') || '[]');
      if (handled.includes(code)) {
        localStorage.removeItem('ddcircle.pendingInviteCode');
        return;
      }
    } catch { /* ignore */ }

    setPendingInvite({ code });
    setTimeout(() => setOpen(true), 400);
  }, [user, profile?.invite_code, myInviteCode, setPendingInvite]);

  // pendingInvite가 외부에서 사라지면 모달도 닫음
  useEffect(() => {
    if (!pendingInvite) setOpen(false);
  }, [pendingInvite]);

  return (
    <IncomingInviteModal
      open={open && !!pendingInvite}
      onClose={() => setOpen(false)}
    />
  );
}

export default function App() {
  return (
    <LangProvider>
      <PiAuthProvider>
      <AuthProvider>
        <AppProvider>
          <LevelProvider>
          <ToastProvider>
            <BrowserRouter>
              <Header />
              <main>
                <Suspense fallback={<ViewFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/grow" element={<Grow />} />
                    <Route path="/breath-picker" element={<BreathPicker />} />
                    <Route path="/wall" element={<Wall />} />
                    <Route path="/record" element={<Record />} />
                    <Route path="/book/:chapterKey" element={<Book />} />
                    <Route path="/picker" element={<ExercisePicker />} />
                    <Route path="/countdown/:target" element={<Countdown />} />
                    <Route path="/sprint" element={<SprintDetect />} />
                    <Route path="/proof" element={<Proof />} />
                    <Route path="/deep" element={<DeepSession />} />
                    <Route path="/complete" element={<Complete />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/profile-setup" element={<ProfileSetup />} />
                    <Route path="/profile-edit" element={<ProfileSetup mode="edit" />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                  </Routes>
                </Suspense>
              </main>
              <ProfileGuard />
              <ConditionalBottomNav />
              <InviteUrlHandler />
              <PiBrowserGate />
              <Onboarding />
              <InAppBrowserGate />
              <PWAInstallPrompt />
              <SWUpdatePrompt />
              <SetAlertController />
              <Analytics />
            </BrowserRouter>
          </ToastProvider>
          </LevelProvider>
        </AppProvider>
      </AuthProvider>
      </PiAuthProvider>
    </LangProvider>
  );
}
