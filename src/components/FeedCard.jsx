import { useState } from 'react';
import { useLang } from '../i18n/LangContext';
import styles from './FeedCard.module.css';

// 공감 나라 피드 카드 (친구/공개/내 게시물 공통)
// variant: 'friend' | 'mine' | 'public' (style differences)
// proof: { url } or null  -- 영상 URL이 있으면 video 표시
export default function FeedCard({
  variant = 'public',
  emoji,
  emojiBg,
  name,
  meta,
  tag,
  message,
  proof,
  initialEmpathy = { sent: 0, great: 0, me: 0 },
  cardRef,
  highlighted,
  // 응원 보내기 (친구 카드만 사용)
  onEncourage, // () => void — 부모가 바텀시트 열기
  encouraged,  // 이미 보낸 경우 true
  encouragedText, // 보낸 메시지 텍스트 (있으면 카드에 표시)
  // 본인 게시물 삭제 (variant === 'mine'일 때만 부모가 전달)
  onDelete,    // () => void
  // controlled empathy (Supabase 연동 시 부모가 제공)
  controlledCounts,   // { sent, great, me }
  controlledActive,   // { sent, great, me } booleans
  onEmpathyToggle,    // (key) => void
}) {
  const { t } = useLang();
  const [localCounts, setLocalCounts] = useState(initialEmpathy);
  const [localActive, setLocalActive] = useState({ sent: false, great: false, me: false });

  const isControlled = !!onEmpathyToggle;
  const counts = isControlled ? (controlledCounts || { sent: 0, great: 0, me: 0 }) : localCounts;
  const active = isControlled ? (controlledActive || { sent: false, great: false, me: false }) : localActive;

  const click = (key) => {
    if (isControlled) {
      onEmpathyToggle(key);
      return;
    }
    if (localActive[key]) return;
    setLocalActive((a) => ({ ...a, [key]: true }));
    setLocalCounts((c) => ({ ...c, [key]: c[key] + 1 }));
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${styles[variant]} ${highlighted ? styles.highlighted : ''}`}
    >
      <div className={styles.top}>
        <div className={styles.user}>
          <div className={styles.avatar} style={{ background: emojiBg }}>
            {emoji}
          </div>
          <div>
            <div className={styles.name}>{name}</div>
            <div className={styles.meta}>{meta}</div>
          </div>
        </div>
        {tag && <div className={styles.tag}>{tag}</div>}
        {onDelete && (
          <button
            className={styles.deleteBtn}
            onClick={onDelete}
            aria-label={t('deletePost')}
            title={t('deletePost')}
          >
            ✕
          </button>
        )}
      </div>

      {proof && (
        <div className={styles.proof}>
          {proof.url ? (
            <img src={proof.url} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className={styles.proofPlaceholder}>📸</div>
          )}
          <div className={styles.proofLabel}>{t('proofTag')}</div>
        </div>
      )}

      <div className={styles.msg}>{message}</div>

      <div className={styles.empathy}>
        {[
          { key: 'sent', icon: '❤️', labelKey: 'empSent' },
          { key: 'great', icon: '🙏', labelKey: 'empGreat' },
          { key: 'me', icon: '💪', labelKey: 'empMe' },
        ].map(({ key, icon, labelKey }) => (
          <button
            key={key}
            className={`${styles.empBtn} ${active[key] ? styles.active : ''}`}
            onClick={() => click(key)}
          >
            {icon} {t(labelKey)}
            <span className={styles.num}>{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* 한 줄 응원 보내기 (친구 카드 전용) */}
      {onEncourage && (
        <button
          className={`${styles.encBtn} ${encouraged ? styles.encSent : ''}`}
          onClick={onEncourage}
        >
          {encouraged
            ? `${t('encSent')}${encouragedText ? ' · ' + encouragedText : ''} · ${t('encChange')}`
            : t('encBtn')}
        </button>
      )}
    </div>
  );
}
