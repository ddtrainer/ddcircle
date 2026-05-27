import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import Modal from './Modal';
import { shareTextFor } from '../../lib/milestones';
import { chapterLabel } from '../../lib/chapters';
import styles from './MilestoneModal.module.css';

// 마일스톤 축하 모달 — 챕터 완성(7/30/100일) 또는 표지 진화(씨앗→숲)
// milestone: detectAnyMilestone() 반환값
// onDismiss: 모달 닫기 (markMilestoneSeen 호출 책임은 부모)
export default function MilestoneModal({ open, milestone, onClose, onDismiss }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  if (!milestone) return null;

  const isChapter = milestone.type === 'chapter';
  const isStage = milestone.type === 'stage';

  const icon = isChapter ? milestone.emoji : milestone.stage.icon;
  const titleText = isChapter
    ? t(milestone.titleKey)
    : (lang === 'en' ? milestone.stage.labelEn : milestone.stage.label);
  const subText = isChapter
    ? t(milestone.subKey, { days: milestone.days })
    : t('milestoneStageSub', {
        prev: milestone.prevStage
          ? (lang === 'en' ? milestone.prevStage.labelEn : milestone.prevStage.label)
          : '—',
        next: lang === 'en' ? milestone.stage.labelEn : milestone.stage.label,
        days: milestone.totalDays,
      });
  const badge = isStage ? milestone.stage.grade : (lang === 'en' ? 'Edition' : '에디션');
  const accentColor = isStage ? milestone.stage.color : '#d4913f';

  const close = () => {
    onDismiss?.();
    onClose?.();
  };

  const handleShare = async () => {
    const text = shareTextFor(milestone, t, lang);
    try {
      if (navigator.share) {
        await navigator.share({ text, url: 'https://ddcircle.app' });
      } else {
        await navigator.clipboard?.writeText(text);
        alert(lang === 'en' ? 'Copied! Paste anywhere to share.' : '복사되었어요. 어디든 붙여넣어 공유하세요.');
      }
    } catch { /* user cancelled */ }
  };

  const handleOpenBook = () => {
    close();
    if (isChapter) navigate(`/book/${milestone.chapterKey}`);
    else navigate('/record');
  };

  return (
    <Modal open={open} onClose={close}>
      <div className={styles.body}>
        {/* 거대한 표지/뱃지 비주얼 */}
        <div className={styles.coverArt} style={{ background: accentColor }}>
          <div className={styles.coverIcon}>{icon}</div>
          <div className={styles.coverBadge}>{badge}</div>
        </div>

        <div className={styles.title}>{titleText}</div>
        <div className={styles.sub}>{subText}</div>

        {isChapter && (
          <div className={styles.chapterTag}>
            {chapterLabel(milestone.chapterKey, lang)}
          </div>
        )}

        <button className={styles.primaryBtn} onClick={handleShare}>
          {t('milestoneShare')}
        </button>
        <button className={styles.secondaryBtn} onClick={handleOpenBook}>
          {isChapter ? t('milestoneOpenBook') : t('milestoneOpenShelf')}
        </button>
        <button className={styles.skipBtn} onClick={close}>
          {t('milestoneSkip')}
        </button>
      </div>
    </Modal>
  );
}
