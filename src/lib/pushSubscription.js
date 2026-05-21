// Web Push 구독 관리 — Service Worker의 PushManager로 구독을 생성·갱신·해제하고
// Supabase push_subscriptions 테이블에 동기화한다. 백그라운드/앱 종료 상태에서도
// 서버가 보낸 푸시를 받기 위함.

import { supabase, isSupabaseConfigured } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  );
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

function buildRow({ subscription, setTiming, userId, lang }) {
  const json = subscription.toJSON();
  return {
    user_id: userId || null,
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    morning_time: setTiming.morning?.time || '07:30',
    morning_enabled: !!setTiming.morning?.enabled,
    evening_time: setTiming.evening?.time || '19:00',
    evening_enabled: !!setTiming.evening?.enabled,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul',
    lang: lang || 'ko',
  };
}

// 푸시 구독 생성 + Supabase 동기화. 권한 미허용 시 자동으로 권한 요청.
export async function enablePushSubscription({ setTiming, userId, lang }) {
  if (!isPushSupported() || !isSupabaseConfigured || !VAPID_PUBLIC_KEY) return null;

  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission().catch(() => 'denied');
    if (result !== 'granted') return null;
  } else if (Notification.permission !== 'granted') {
    return null;
  }

  const reg = await getRegistration();
  if (!reg) return null;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } catch (e) {
      console.error('[push] subscribe failed', e);
      return null;
    }
  }

  const row = buildRow({ subscription: sub, setTiming, userId, lang });
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(row, { onConflict: 'endpoint' });
  if (error) {
    console.error('[push] supabase upsert failed', error);
    return null;
  }
  return sub;
}

// setTiming 변경 시 기존 구독 행의 슬롯 시간만 갱신 (재구독 X).
// 알림 끌 때도 enabled false로 업데이트만 하면 행 유지.
export async function syncPushSubscription({ setTiming, userId, lang, enabled = true }) {
  if (!isPushSupported() || !isSupabaseConfigured) return;
  const reg = await getRegistration();
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return; // 구독 없음 — 동기화할 행 없음

  const json = sub.toJSON();
  const { error } = await supabase
    .from('push_subscriptions')
    .update({
      user_id: userId || null,
      morning_time: setTiming.morning?.time || '07:30',
      morning_enabled: enabled && !!setTiming.morning?.enabled,
      evening_time: setTiming.evening?.time || '19:00',
      evening_enabled: enabled && !!setTiming.evening?.enabled,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul',
      lang: lang || 'ko',
    })
    .eq('endpoint', json.endpoint);
  if (error) console.error('[push] sync failed', error);
}

// 구독 완전 해제 — 브라우저 구독 + Supabase 행 삭제
export async function disablePushSubscription() {
  if (!isPushSupported() || !isSupabaseConfigured) return;
  const reg = await getRegistration();
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  try {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  } catch (e) { console.error('[push] supabase delete failed', e); }
  try { await sub.unsubscribe(); } catch { /* ignore */ }
}
