import { useEffect, useState } from 'react';
import { useLang } from '../i18n/LangContext';

// 셋 타이밍(아침/저녁) 다음 슬롯 계산. 1분마다 갱신.
// setTiming = { morning: { time, enabled }, evening: { time, enabled }, sync }
// doneToday: 오늘 이미 세션 완료 시 live 모드 건너뜀
export function useNextSetTiming(setTiming, doneToday = false) {
  const { lang, t } = useLang();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // tick은 갱신 트리거용 — eslint 무시
  void tick;

  const slots = [];
  if (setTiming.morning.enabled) {
    const [h, m] = setTiming.morning.time.split(':').map(Number);
    slots.push({ hour: h, min: m, name: t('morning'), icon: '🌅' });
  }
  if (setTiming.evening.enabled) {
    const [h, m] = setTiming.evening.time.split(':').map(Number);
    slots.push({ hour: h, min: m, name: t('evening'), icon: '🌇' });
  }

  if (slots.length === 0) {
    return {
      mode: 'off',
      label: t('setLabelOff'),
      timeText: t('setPlease'),
      ctaLabel: t('settingsBtn'),
    };
  }

  const now = new Date();
  let nextSlot = null;
  let minDiff = Infinity;
  let isLive = false;

  for (const s of slots) {
    const slotTime = new Date(now);
    slotTime.setHours(s.hour, s.min, 0, 0);
    let diff = slotTime - now;
    if (!doneToday && diff > -30 * 60 * 1000 && diff <= 0) {
      isLive = true;
      nextSlot = s;
      minDiff = diff;
      break;
    }
    if (diff < 0) diff += 24 * 60 * 60 * 1000;
    if (diff < minDiff) {
      minDiff = diff;
      nextSlot = s;
    }
  }

  if (isLive) {
    return {
      mode: 'live',
      label: t('setLabelLive'),
      icon: nextSlot.icon,
      slotName: nextSlot.name,
      accentText: t('setStartNow'),
      ctaLabel: t('setStart'),
    };
  }

  const totalMin = Math.floor(minDiff / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  let timeText, remainText;
  if (lang === 'ko') {
    const ampm = nextSlot.hour < 12 ? '오전' : '오후';
    const h12 = nextSlot.hour % 12 || 12;
    timeText = `${ampm} ${h12}:${nextSlot.min < 10 ? '0' : ''}${nextSlot.min}`;
    remainText = hours > 0 ? `${hours}시간 ${mins}분 후` : `${mins}분 후`;
  } else {
    const ampm = nextSlot.hour < 12 ? 'AM' : 'PM';
    const h12 = nextSlot.hour % 12 || 12;
    timeText = `${h12}:${nextSlot.min < 10 ? '0' : ''}${nextSlot.min} ${ampm}`;
    remainText = hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins}m`;
  }

  return {
    mode: 'next',
    label: t('setLabelNext'),
    icon: nextSlot.icon,
    accentTime: timeText,
    remainText,
    ctaLabel: t('settingsBtn'),
  };
}
