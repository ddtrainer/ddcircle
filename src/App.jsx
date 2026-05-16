import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { LangProvider } from './i18n/LangContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import IncomingInviteModal from './components/modals/IncomingInviteModal';
import Onboarding from './components/Onboarding';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import SWUpdatePrompt from './components/SWUpdatePrompt';
import SetAlertController from './components/SetAlertController';
import { initAnalytics } from './utils/analytics';
import { initKakao } from './utils/kakao';

// PostHog 초기화 (키 없으면 no-op)
initAnalytics();
// Kakao SDK 초기화 (공유하기)
initKakao();
import Home from './views/Home';
import Wall from './views/Wall';
import Record from './views/Record';
import ExercisePicker from './views/ExercisePicker';
import Countdown from './views/Countdown';
import DashSession from './views/DashSession';
import Proof from './views/Proof';
import DeepSession from './views/DeepSession';
import Complete from './views/Complete';
import Login from './views/Login';
import AuthCallback from './views/AuthCallback';
import ProfileSetup from './views/ProfileSetup';

// 카운트다운/세션/Proof/로그인 화면에서는 BottomNav 숨김
const FULLSCREEN_PATHS = ['/countdown', '/dash', '/deep', '/proof', '/login', '/auth', '/profile-setup'];

function ConditionalBottomNav() {
  const { pathname } = useLocation();
  const hide = FULLSCREEN_PATHS.some((p) => pathname.startsWith(p));
  if (hide) return null;
  return <BottomNav />;
}

// 로그인된 유저가 프로필 설정을 완료하지 않았으면 /profile-setup으로 안내
const SKIP_GUARD_PATHS = ['/profile-setup', '/auth', '/login'];
function ProfileGuard() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    if (SKIP_GUARD_PATHS.some((p) => pathname.startsWith(p))) return;
    const setupDone = localStorage.getItem(`ddcircle.setup.${user.id}`);
    if (!setupDone) navigate('/profile-setup', { replace: true });
  }, [user, loading, pathname, navigate]);

  return null;
}

// URL ?invite=xxx 진입 시 자동으로 받은 초대 모달 열기
// 가드:
//   1) 본인이 본인을 초대한 경우 — 무시 (자기 자신과 친구 불가)
//   2) 이미 처리(수락/거절/차단)한 코드 — 무시 (localStorage에 기록)
function InviteUrlHandler() {
  const { pendingInvite, setPendingInvite, inviteCode: myInviteCode } = useApp();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (!code) return;

    // URL 정리 — 가드에서 걸러져도 항상 URL은 청소 (북마크/공유 시 노출 방지)
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    // 가드 1: 본인 코드면 무시 (자기 초대 차단)
    const ownCode = profile?.invite_code || myInviteCode;
    if (ownCode && code === ownCode) {
      console.log('[invite] self-invite ignored');
      return;
    }

    // 가드 2: 이미 처리한 코드면 무시
    try {
      const handled = JSON.parse(localStorage.getItem('ddcircle.handledInvites') || '[]');
      if (handled.includes(code)) {
        console.log('[invite] already handled, ignoring:', code);
        return;
      }
    } catch { /* ignore parse errors */ }

    setPendingInvite({ code });
    // 0.4초 후 모달 오픈 (페이드 안정화)
    setTimeout(() => setOpen(true), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.invite_code]);

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
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <BrowserRouter>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/wall" element={<Wall />} />
                  <Route path="/record" element={<Record />} />
                  <Route path="/picker" element={<ExercisePicker />} />
                  <Route path="/countdown/:target" element={<Countdown />} />
                  <Route path="/dash" element={<DashSession />} />
                  <Route path="/proof" element={<Proof />} />
                  <Route path="/deep" element={<DeepSession />} />
                  <Route path="/complete" element={<Complete />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/profile-setup" element={<ProfileSetup />} />
                  <Route path="/profile-edit" element={<ProfileSetup mode="edit" />} />
                </Routes>
              </main>
              <ProfileGuard />
              <ConditionalBottomNav />
              <InviteUrlHandler />
              <Onboarding />
              <PWAInstallPrompt />
              <SWUpdatePrompt />
              <SetAlertController />
              <Analytics />
            </BrowserRouter>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </LangProvider>
  );
}
