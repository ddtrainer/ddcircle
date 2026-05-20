import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'dd-logo-128.png', 'dd-logo-192.png', 'dd-logo-512.png',
        'apple-touch-icon.png', 'favicon.svg', 'og-image.png',
      ],
      manifest: {
        name: 'DDCircle',
        short_name: 'DDCircle',
        description: '매일 3분, 함께 호흡하는 작은 의식',
        start_url: '/',
        // OAuth 콜백(/auth/callback)도 PWA scope 안에서 처리되도록 명시 —
        // 누락되면 Android Chrome이 콜백을 외부 탭에서 열 수 있어 PWA가
        // 세션을 못 받는 케이스 발생
        scope: '/',
        display: 'standalone',
        background_color: '#faf6ee',
        theme_color: '#faf6ee',
        orientation: 'portrait',
        lang: 'ko',
        // PWA 권장 사이즈 모두 선언 — Android Chrome 설치 프롬프트는 192·512
        // 두 사이즈를 모두 요구. apple-touch-icon은 index.html에서 별도 link로.
        icons: [
          { src: '/dd-logo-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: '/dd-logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/dd-logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/dd-logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/dd-logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // 새 SW가 설치 즉시 기존 SW 대체 → 옛 JS 서빙 방지
        // PWA에서 코드 fix가 사용자에게 즉시 전달되도록 보장.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Supabase/Vercel Analytics 등 외부 API는 캐시 제외
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Supabase Storage 이미지 (셀카) 캐시
            urlPattern: ({ url }) => /supabase\.co\/storage\/v1\/object\/public\//.test(url.href),
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // 개발 모드에서는 서비스 워커 비활성 (HMR 충돌 방지)
      },
    }),
  ],
});
