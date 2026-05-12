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
import styles from './Complete.module.css';

export default function Complete() {
  const { t, lang } = useLang();
  const { proofUrl, getProofBlob, completeSession, addUserPost, selectedExercise, lastChallengeBonus, consumeLastChallengeBonus, userEp } = useApp();
  const { user, profile } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const [sharing, setSharing] = useState(false);

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

  // 인스타 스토리용 결과 카드 이미지 생성 + 공유/다운로드
  const handleStoryShare = async () => {
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
      const result = await shareOrDownload(blob);
      if (result === 'shared' || result === 'downloaded') {
        showToast('📸', t('storyShareSuccess'));
      }
    } catch (e) {
      showToast('⚠️', t('storyShareError'));
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
      <button className={styles.storyShareBtn} onClick={handleStoryShare}>
        {t('storyShareBtn')}
      </button>
      <button className={styles.skipShare} onClick={handleSkipShare}>
        {t('skipShareBtn')}
      </button>
    </div>
  );
}
