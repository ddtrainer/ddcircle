import { useState, useEffect } from 'react';
import { fetchMemberCount } from '../lib/stats';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import YesterdayPageCard from '../components/assets/YesterdayPageCard';
import { unlockAudio } from '../utils/audioUnlock';
import { BREATH_MODES } from '../data/breathPatterns';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useLang();
  const { userEp, breathPatternId } = useApp();
  const navigate = useNavigate();
  // Pi 전용 — 카카오/구글 로그인 유도 제거.

  // DDCircle 회원수 — 닉네임 설정한 프로필 수. mount 시 1회 fetch.
  // 가짜 247 대신 진짜 숫자 표시.
  const [memberCount, setMemberCount] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchMemberCount().then((n) => { if (!cancelled) setMemberCount(n); });
    return () => { cancelled = true; };
  }, []);

  // 진입 탭 시점에 오디오 unlock — iOS Safari가 이후 자동 재생되는 종소리/배경음을
  // 묵음으로 거부하지 않도록 silent buffer를 사용자 제스처 안에서 한 번 재생.
  //
  // 개선1(빠른 재시작): 마지막에 고른 호흡(breathPatternId, localStorage 유지)으로 바로 시작.
  //   · 바로 시작 → 선택 화면 건너뛰고 카운트다운으로 직행
  //   · 다른 호흡 선택 → 기존 자유선택 Picker(/breath-picker)
  const goStartDeep = () => { unlockAudio(); navigate('/countdown/deep'); };
  const goPicker = () => { unlockAudio(); navigate('/breath-picker'); };

  // 마지막 선택 호흡 정보(리쥼 카드 표시용). 기본값 '478'도 안전한 신경 안정 호흡.
  const currentBreath = BREATH_MODES.find((m) => m.id === breathPatternId) || BREATH_MODES[0];

  return (
    <div className={styles.home}>
      {/* 히어로 */}
      <div className={styles.hero}>
        <p
          className={styles.heroQuote}
          dangerouslySetInnerHTML={{ __html: t('heroQuote') }}
        />
        <div className={styles.heroSub}>DEEP RELAXATION · DASH EXERCISE</div>
      </div>

      {/* 호흡 원 — 탭하면 마지막 호흡으로 바로 시작 */}
      <div className={styles.breathZone} onClick={goStartDeep}>
        <div className={styles.breathCircle}>
          <div className={styles.breathRing}></div>
          <div className={`${styles.breathRing} ${styles.r2}`}></div>
          <div className={`${styles.breathRing} ${styles.r3}`}></div>
          <div className={styles.breathInner}>
            <div className={styles.label}>
              {userEp.streak > 0
                ? `🔥 ${t('streakDayBadge').replace('{n}', userEp.streak)}`
                : `🌱 ${t('firstStartBadge')}`}
            </div>
            <div className={styles.time}>{t('nowStart')}</div>
            <div className={styles.cta}>{t('tapToStart')}</div>
          </div>
        </div>
      </div>

      {/* 개선1: 마지막 호흡 리쥼 카드 — "오늘도 이걸로?" + 바로 시작 + 다른 호흡 선택 */}
      <div className={styles.resumeCard}>
        <div className={styles.resumeInfo}>
          <span className={styles.resumeEmoji}>{currentBreath.emoji}</span>
          <div className={styles.resumeText}>
            <div className={styles.resumeQ}>{t('resumeAskBreath')}</div>
            <div className={styles.resumeMode}>{t(currentBreath.labelKey)}</div>
          </div>
        </div>
        <div className={styles.resumeActions}>
          <button className={styles.resumeStart} onClick={goStartDeep}>
            {t('resumeStart')}
          </button>
          <button className={styles.resumeChange} onClick={goPicker}>
            {t('resumeChangeBreath')}
          </button>
        </div>
      </div>

      {/* DDCircle 회원수 — 닉네임 설정한 프로필 기준 */}
      <div className={styles.together}>
        <div className={styles.togetherNum}>
          <span className={styles.pulseDot}></span>
          <span>{memberCount === null ? '—' : memberCount.toLocaleString()}</span>
          <span>{t('peopleSuffix')}</span>
        </div>
        <div className={styles.togetherLabel}>{t('memberCountLabel')}</div>
      </div>

      {/* 어제(또는 최근)의 페이지 미니 카드 — 재방문 + 책장 발견 */}
      <YesterdayPageCard />

      {/* 철학 인용 */}
      <div className={styles.philosophy}>
        <p dangerouslySetInnerHTML={{ __html: t('philosophyText') }} />
      </div>
    </div>
  );
}
