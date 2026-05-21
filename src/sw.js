// 커스텀 Service Worker (vite-plugin-pwa injectManifest 전략)
// - Workbox 프리캐시 (앱 자원)
// - Web Push 알림 수신 (백그라운드/앱 종료 상태에서도 OS 알림 표시)
// - 알림 클릭 시 /picker로 이동

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// 새 SW가 설치 즉시 활성화 (PWA 옛 JS 캐싱 방지)
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// vite-plugin-pwa가 빌드 시 self.__WB_MANIFEST를 자동 주입
precacheAndRoute(self.__WB_MANIFEST);

// Web Push 수신 — Edge Function에서 발송된 푸시를 받아 OS 알림 표시.
// 페이로드 형식: { title, body, tag, url }
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'DDCircle', body: event.data?.text() || '' };
  }
  const title = data.title || 'DDCircle';
  // 매 푸시마다 고유 tag로 워치 등 보조 기기가 중복으로 인식해 미러링 누락하는 문제 회피
  const uniqueTag = `${data.tag || 'ddcircle-dd'}-${Date.now()}`;
  const options = {
    body: data.body || '',
    icon: '/dd-logo-192.png',
    badge: '/dd-logo-128.png',
    tag: uniqueTag,
    renotify: true,
    requireInteraction: true,        // 사용자가 닫기 전까지 알림 유지
    silent: false,                    // 시스템 알림음 강제 (silent=false 명시)
    vibrate: [400, 150, 400, 150, 400],  // 더 강한 진동 패턴
    data: { url: data.url || '/picker' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 → 기존 탭 있으면 포커스+이동, 없으면 새 창 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/picker';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
