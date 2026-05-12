import { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { track, Events } from '../utils/analytics';
import styles from './Onboarding.module.css';

// 첫 방문 시 1회만 보여주는 3장 온보딩
export default function Onboarding() {
  const { t } = useLang();
  const [seen, setSeen] = useLocalStorage('ddcircle.onboardingSeen', false);
  const [step, setStep] = useState(0);

  if (seen) return null;

  const slides = [
    { emoji: '✨', titleKey: 'onbT1', subKey: 'onbS1' },
    { emoji: '🧘', titleKey: 'onbT2', subKey: 'onbS2' },
    { emoji: '💙', titleKey: 'onbT3', subKey: 'onbS3' },
  ];

  const isLast = step === slides.length - 1;

  const next = () => {
    if (isLast) {
      setSeen(true);
      track(Events.ONBOARDING_COMPLETED, { reachedEnd: true });
    } else {
      setStep((s) => s + 1);
    }
  };

  const skip = () => {
    setSeen(true);
    track(Events.ONBOARDING_COMPLETED, { reachedEnd: false, skippedAt: step });
  };

  const slide = slides[step];

  return (
    <div className={styles.overlay} onClick={skip}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.skip} onClick={skip}>{t('onbSkip')}</button>

        <div className={styles.emoji}>{slide.emoji}</div>
        <div className={styles.title}>{t(slide.titleKey)}</div>
        <div className={styles.sub} dangerouslySetInnerHTML={{ __html: t(slide.subKey) }} />

        <div className={styles.dots}>
          {slides.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === step ? styles.active : ''}`} />
          ))}
        </div>

        <button className={styles.cta} onClick={next}>
          {isLast ? t('onbStart') : t('onbNext')}
        </button>
      </div>
    </div>
  );
}
