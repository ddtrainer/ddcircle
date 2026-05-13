import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['dd-logo-128.png', 'favicon.svg', 'og-image.png'],
      manifest: {
        name: 'DDCircle',
        short_name: 'DDCircle',
        description: '매일 3분, 함께 호흡하는 작은 의식',
        start_url: '/',
        display: 'standalone',
        background_color: '#faf6ee',
        theme_color: '#faf6ee',
        orientation: 'portrait',
        lang: 'ko',
        // 정사각형 PNG만 선언 (모바일 홈 화면 아이콘 요구사항)
        icons: [
          { src: '/dd-logo-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: '/dd-logo-128.png', sizes: '128x128', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
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
