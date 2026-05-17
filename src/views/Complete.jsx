import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ProgressDots from '../components/ProgressDots';
import { EXERCISES } from '../data/exercises';
import { MOODS, SHARE_TARGETS } from '../data/moods';
import { track, Events } from '../utils/analytics';
import { generateResultCard, shareOrDownload } from '../utils/generateResultCard';
import { createPost } from '../lib/posts';
import { isInAppBrowser } from '../utils/inAppBrowser';
import OpenExternalModal from '../components/modals/OpenExternalModal';
import styles from './Complete.module.css';

export default function Complete() {
  const { t, lang } = useLang();
  const { proofUrl, getProofBlob, completeSession, addUserPost, selectedExercise, lastChallengeBonus, consumeLastChallengeBonus, userEp } = useApp();
  const { user, profile } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const [sharing, setSharing] = useState(false);
  const [storySharing, setStorySharing] = useState(false);
  const [externalModalOpen, setExternalModalOpen] = useState(false);

  const [shareTarget, setShareTarget] = useState('circle');
  const [selectedMood, setSelectedMood] = useState(null);
  const [empathyMsg, setEmpathyMsg] = useState('');

  const finish = (shared) => {
    const earned = completeSession({ shared });
    showToast('✦', `+${earned} EP`);
    track(shared ? Events.SESSION_SHARED : Events.SESSION_SKIPPED_SHARE, {
      earned, mood: selectedMood, target: shareTarget,
    });
    // 챌린지 달성 시 축하 Toast 추가 (약간 지연하여 EP Toast 다음에 표시)
    setTimeout(() => {
      if (lastChallengeBonus && lastChallengeBonus.completed?.length || lastChallengeBonus?.challenges?.length) {
        const list = lastChallengeBonus.challenges || [];
        list.forEach((ch, i) => {
          setTimeout(() => {
            showToast(ch.emoji, `${t('challengeToastTitle')} ${t(ch.titleKey)} +${ch.bonusEp} EP`);
          }, i * 1200);
        });
        consumeLastChallengeBonus();
      }
    }, 700);
    navigate('/wall', { replace: true });
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    const payload = {
      mood: selectedMood,
      msg: empathyMsg.trim(),
      target: shareTarget,
      exerciseId: selectedExercise,
      proofUrl,
    };
    // 인증된 유저: Supabase에 저장 (사진은 Storage 업로드)
    if (user) {
      try {
        await createPost(user.id, {
          message: empathyMsg.trim(),
          mood: selectedMood,
          target: shareTarget,
          exerciseId: selectedExercise,
          proofBlob: getProofBlob(),
        });
      } catch (e) {
        showToast('⚠️', '저장에 실패했어요. 로컬에만 저장됩니다.');
        addUserPost(payload); // 폴백
      }
    } else {
      // 비인증: 로컬에만
      addUserPost(payload);
    }
    finish(true);
  };

  const handleSkipShare = () => finish(false);

  // SNS용 결과 카드 이미지 생성 + 공유/다운로드
  const handleStoryShare = async () => {
    if (storySharing) return;

    // 인앱 브라우저(카카오톡 등) — 공유 시도하지 말고 "외부 브라우저로 열기" 모달
    if (isInAppBrowser()) {
      const url = 'https://www.ddcircle.app';
      try { await navigator.clipboard?.writeText(url); } catch {}
      setExternalModalOpen(true);
      return;
    }

    setStorySharing(true);
    try {
      const exercise = EXERCISES.find((e) => e.key === selectedExercise);
      const exerciseLabel = exercise ? t('ex' + exercise.i18n) : '';
      const blob = await generateResultCard({
        ep: userEp.today,
        streak: userEp.streak,
        mood: selectedMood, // mood id (hard/tired/anxious/didIt/proud)
        exerciseLabel,
        nickname: profile?.nickname || (user ? 'DD' : '나'),
        emoji: profile?.emoji || '🌸',
        emojiBg: profile?.emoji_bg || 'linear-gradient(135deg,#fbb040,#f97b9c)',
        lang,
      });
      const shareText = lang === 'en'
        ? 'A three-minute daily breath together · DDCircle\nhttps://www.ddcircle.app'
        : '매일 3분, 함께 호흡하는 작은 의식 · DDCircle\nhttps://www.ddcircle.app';
      const result = await shareOrDownload(blob, 'ddcircle-today.png', {
        url: 'https://www.ddcircle.app?ref=share-card',
        title: 'DDCircle',
        text: shareText,
      });
      if (result === 'shared+copied' || result === 'shared') {
        showToast('📸', lang === 'en'
          ? 'Shared · link copied — paste in chat for direct entry'
          : '공유됨 · 링크 복사됨 — 채팅에 붙여넣으면 친구가 바로 들어와요');
        // SNS 공유는 세션을 종료하지 않음 — 사용자가 응원나라에도 나누거나 조용히 마칠 수 있게 안내
        setTimeout(() => {
          showToast('💡', lang === 'en'
            ? 'You can also share to Cheerland or finish quietly below'
            : '아래에서 응원나라에도 나누거나 조용히 마칠 수 있어요');
        }, 2000);
      } else if (result === 'unsupported+copied') {
        // PC 등 Web Share 미지원 — 링크는 복사됐으니 사용자가 직접 붙여넣기
        showToast('📋', lang === 'en'
          ? 'PC sharing not supported — link copied, paste in chat'
          : 'PC는 직접 공유 미지원 — 링크가 복사됐어요, 채팅에 붙여넣으세요');
      } else if (result === 'unsupported') {
        showToast('⚠️', lang === 'en'
          ? 'Sharing not supported on this browser'
          : '이 브라우저에서는 공유가 지원되지 않아요');
      }
    } catch (e) {
      showToast('⚠️', t('storyShareError'));
    } finally {
      setStorySharing(false);
    }
  };

  return (
    <div className={styles.completeScreen}>
      <ProgressDots step={4} total={4} />

      <div className={styles.hero}>
        <div className={styles.icon}>🌿</div>
        <div className={styles.title}>{t('completeTitle')}</div>
        <div className={styles.sub}>{t('completeSub')}</div>
      </div>

      {/* Proof 사진 미리보기 (있을 때만) */}
      {proofUrl && (
        <div className={styles.proofPreviewWrap}>
          <img src={proofUrl} alt="proof of life" />
          <div className={styles.proofPreviewLabel}>PROOF OF LIFE</div>
        </div>
      )}

      <div className={styles.empathyInput}>
        {/* 공유 대상 선택 */}
        <div className={styles.label}>{t('shareWithLabel')}</div>
        <div className={styles.shareTarget}>
          {SHARE_TARGETS.map((tg) => (
            <button
              key={tg.id}
              className={`${styles.targetChip} ${shareTarget === tg.id ? styles.active : ''}`}
              onClick={() => setShareTarget(tg.id)}
            >
              <span className={styles.targetIcon}>{tg.icon}</span>
              {t(tg.labelKey)}
            </button>
          ))}
        </div>

        {/* 무드 칩 */}
        <div className={styles.label}>{t('moodLabel')}</div>
        <div className={styles.moodRow}>
          {MOODS.map((m) => (
            <button
              key={m.id}
              className={`${styles.moodChip} ${selectedMood === m.id ? styles.active : ''}`}
              onClick={() => setSelectedMood(selectedMood === m.id ? null : m.id)}
            >
              {t(m.key)}
            </button>
          ))}
        </div>

        {/* empathy textarea */}
        <textarea
          className={styles.empathyTextarea}
          rows={3}
          placeholder={t('empathyPlaceholder')}
          value={empathyMsg}
          onChange={(e) => setEmpathyMsg(e.target.value)}
        />
      </div>

      <button className={styles.shareBtn} onClick={handleShare} disabled={sharing}>
        {sharing ? '...' : t('shareBtn')}
      </button>
      <button className={styles.storyShareBtn} onClick={handleStoryShare} disabled={storySharing}>
        {storySharing ? '...' : t('storyShareBtn')}
      </button>
      <div className={styles.shareHint}>
        {lang === 'en'
          ? 'After sharing externally, you can still share to Cheerland or finish quietly below.'
          : 'SNS 공유 후에도 응원나라에 나누거나 조용히 마칠 수 있어요.'}
      </div>
      <button className={styles.skipShare} onClick={handleSkipShare}>
        {t('skipShareBtn')}
      </button>

      <OpenExternalModal
        open={externalModalOpen}
        onClose={() => setExternalModalOpen(false)}
        reason="share"
      />
    </div>
  );
}
