import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ProgressDots from '../components/ProgressDots';
import { EXERCISES } from '../data/exercises';
import { MOODS, SHARE_TARGETS } from '../data/moods';
import { getTodayPrompt } from '../data/dailyPrompts';
import { track, Events } from '../utils/analytics';
import { generateResultCard, shareOrDownload } from '../utils/generateResultCard';
import { shareBaseUrl } from '../config/piNet';
import { createPost, fetchMyPosts } from '../lib/posts';
import { detectAnyMilestone, markMilestoneSeen } from '../lib/milestones';
import { chapterKey as toChapterKey } from '../lib/chapters';
import MilestoneModal from '../components/modals/MilestoneModal';
import Celebration from '../components/Celebration';
import { isInAppBrowser } from '../utils/inAppBrowser';
import OpenExternalModal from '../components/modals/OpenExternalModal';
import PiTipModal from '../components/modals/PiTipModal';
import styles from './Complete.module.css';

export default function Complete() {
  const { t, lang } = useLang();
  const { proofUrl, getProofBlob, completeSession, addUserPost, selectedExercise, lastChallengeBonus, consumeLastChallengeBonus, userEp, todaySessions } = useApp();
  const { user, profile } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  const [sharing, setSharing] = useState(false);
  const [storySharing, setStorySharing] = useState(false);
  const [externalModalOpen, setExternalModalOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [milestone, setMilestone] = useState(null);
  // 풀세트 완료(호흡+운동 둘 다 완주) 축하 폭죽 — 진입 시 1회.
  // completeSession()이 플래그를 비우기 전(= finish 호출 전)이라 mount 시점에 읽을 수 있다.
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    try {
      const deep = sessionStorage.getItem('ddcircle.session.deepFully') === '1';
      const dash = sessionStorage.getItem('ddcircle.session.dashFully') === '1';
      if (deep && dash) setCelebrate(true);
    } catch { /* sessionStorage 불가 시 무시 */ }
  }, []);

  const [shareTarget, setShareTarget] = useState('circle');
  const [selectedMood, setSelectedMood] = useState(null);
  const [empathyMsg, setEmpathyMsg] = useState('');
  const textareaRef = useRef(null);
  // 매일 다른 prompt — 자정 넘어가면 자동으로 새 문구
  const todayPrompt = useMemo(() => getTodayPrompt(lang), [lang]);

  // auto-grow textarea: 내용에 맞춰 높이 자동 확장
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [empathyMsg]);

  const finish = (shared) => {
    const { earned, save, capReached, dashFully, deepFully } = completeSession({ shared });
    if (capReached) {
      showToast('🌙', t('epCapToast'));  // "오늘은 EP 적립 종료 (2회 완료)"
    } else if (!dashFully && !deepFully) {
      showToast('🌿', t('epSkippedAll'));  // 둘 다 skip → 0 EP, 격려
    } else if (!dashFully || !deepFully) {
      showToast('✦', t('epPartialTpl', { ep: earned }));  // 한쪽 skip → 부분 EP
    } else {
      showToast('✦', `+${earned} EP`);
    }
    // DB 저장 실패 시 사용자에게 알림 — silent fail 방지 (streak 끊김 원인)
    save?.catch((e) => {
      console.error('[stats] recordSession failed:', e);
      showToast('⚠️', t('saveFailedToast'));
    });
    track(shared ? Events.SESSION_SHARED : Events.SESSION_SKIPPED_SHARE, {
      earned, mood: selectedMood, target: shareTarget,
    });
    // 챌린지 달성 시 축하 Toast 추가 (약간 지연하여 EP Toast 다음에 표시)
    setTimeout(() => {
      // && 가 || 보다 우선이라 원래 코드는 잘못된 평가였음.
      // lastChallengeBonus는 { challenges: [...] } 형태 — challenges 길이만 체크하면 충분.
      if (lastChallengeBonus?.challenges?.length) {
        const list = lastChallengeBonus.challenges;
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

  // ⚠️ proof 캡 제거 (구: count >= 2 시 사진 silent drop) — 사용자가 그 이상
  // 세션을 한 경우에도 본인 인증 사진은 항상 저장. EP 캡은 별도로 유지(2회까지).
  const proofCapReached = false;

  // 실제 공유 실행 — 로그인 여부에 따라 Supabase or 로컬 저장
  const doShare = async () => {
    setSharing(true);
    const payload = {
      mood: selectedMood,
      msg: empathyMsg.trim(),
      target: shareTarget,
      exerciseId: selectedExercise,
      proofUrl: proofCapReached ? null : proofUrl,
    };
    let saved = false;
    if (user) {
      try {
        const blob = getProofBlob();
        const res = await createPost(user.id, {
          message: empathyMsg.trim(),
          mood: selectedMood,
          target: shareTarget,
          exerciseId: selectedExercise,
          proofBlob: blob,
        });
        saved = true;
        // 사진을 찍었는데 업로드만 실패한 경우 사용자에게 명시적 안내 (글은 저장됨)
        if (blob && res?.proofUploadFailed) {
          showToast('📷', t('proofUploadFailed'));
        }
      } catch (e) {
        showToast('⚠️', '저장에 실패했어요. 로컬에만 저장됩니다.');
        addUserPost(payload);
      }
    } else {
      addUserPost(payload);
    }

    // 마일스톤 감지 — 표지 진화 또는 챕터 완성. 알림 띄우면 finish는 모달 닫을 때.
    if (saved && user) {
      try {
        const allPosts = await fetchMyPosts(user.id, 500);
        const ms = detectAnyMilestone(allPosts, toChapterKey(new Date()), user.id);
        if (ms) {
          setMilestone(ms);
          setSharing(false);
          return; // finish는 모달 닫을 때 호출
        }
      } catch { /* milestone check 실패는 무시 — 정상 흐름 유지 */ }
    }

    finish(true);
  };

  // 마일스톤 모달 닫기 — seen 기록 후 finish 흐름 이어감
  const handleMilestoneClose = () => {
    if (milestone && user) {
      markMilestoneSeen(milestone, user.id, toChapterKey(new Date()));
    }
    setMilestone(null);
    finish(true);
  };

  const handleShare = async () => {
    if (sharing) return;
    // Pi 전용 — 로그인 유도 없이 바로 공유 진행 (비로그인은 로컬 저장 경로).
    await doShare();
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
        userMessage: empathyMsg.trim(),  // textarea에 쓴 글 — 카드에 같이 표시
      });
      // 남에게 건네지는 링크는 PiNet 주소여야 상대 기기에서 Pi Browser로 열린다.
      const cardUrl = `${shareBaseUrl()}/?ref=share-card`;
      const shareText = lang === 'en'
        ? `A three-minute daily breath together · DDCircle\n${cardUrl}`
        : `매일 3분, 함께 호흡하는 작은 의식 · DDCircle\n${cardUrl}`;
      const result = await shareOrDownload(blob, 'ddcircle-today.png', {
        url: cardUrl,
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
              <span className={styles.targetLabel}>{t(tg.labelKey)}</span>
              {tg.subKey && <span className={styles.targetSub}>{t(tg.subKey)}</span>}
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

        {/* 일기 입력 — 무작위 질문 placeholder + 자유 작성 안내 */}
        <div className={styles.label}>
          {t('oneLineLabel')}
          <span className={styles.labelHint}>{t('oneLineHint')}</span>
        </div>
        <textarea
          ref={textareaRef}
          className={styles.empathyTextarea}
          rows={4}
          placeholder={todayPrompt}
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

      {/* 은은한 Pi 후원 — 방금 완주한 좋은 순간에 선택적으로 (강매 X) */}
      <button
        type="button"
        onClick={() => setTipOpen(true)}
        style={{
          display: 'block', margin: '10px auto 0', padding: '6px 10px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#7b3ff2',
        }}
      >
        💜 {lang === 'en' ? 'Support DDCircle with Pi' : 'Pi로 DDCircle 응원하기'}
      </button>

      {/* 책장 진입 — 방금 쓴 페이지를 즉시 확인 */}
      {user && (
        <button
          className={styles.peekBookBtn}
          onClick={() => {
            const d = new Date();
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            navigate(`/book/${key}`);
          }}
        >
          {t('peekTodayPage')}
        </button>
      )}

      <OpenExternalModal
        open={externalModalOpen}
        onClose={() => setExternalModalOpen(false)}
        reason="share"
      />

      <MilestoneModal
        open={!!milestone}
        milestone={milestone}
        onClose={handleMilestoneClose}
      />

      <PiTipModal open={tipOpen} onClose={() => setTipOpen(false)} />

      {celebrate && (
        <Celebration
          text={t('celebrateWellDone')}
          onDone={() => setCelebrate(false)}
        />
      )}
    </div>
  );
}
