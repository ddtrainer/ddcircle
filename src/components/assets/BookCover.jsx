import { useLang } from '../../i18n/LangContext';
import { chapterLabel } from '../../lib/chapters';
import styles from './BookCover.module.css';

// 한 권의 책 표지 — 챕터(월) 단위
// stage: COVER_STAGES 중 하나 (씨앗/새싹/어린나무/나무/숲)
// onClick: 책 클릭 시 풀스크린 reader로 이동
export default function BookCover({
  chapterKey,
  pageCount = 0,
  stage,
  ownerName = '',
  isEmpty = false,    // 페이지 0개 — 빈 책 (현재 월이지만 아직 글 안 씀)
  isCurrent = false,  // 이번 달인지 (살짝 빛나는 효과)
  onClick,
}) {
  const { lang } = useLang();

  // 표지 색은 stage 기반. 빈 책은 더 옅은 톤
  const coverColor = isEmpty ? '#d8c9a9' : stage?.color || '#a98564';
  const stageLabel = lang === 'en' ? stage?.labelEn : stage?.label;

  return (
    <button
      type="button"
      className={`${styles.book} ${isCurrent ? styles.current : ''}`}
      onClick={onClick}
      aria-label={`${chapterLabel(chapterKey, lang)} ${stageLabel || ''}`}
    >
      {/* 책등(spine) — 좌측 살짝 짙은 색 */}
      <div className={styles.spine} style={{ background: coverColor }} />
      {/* 책 표지 */}
      <div className={styles.cover} style={{ background: coverColor }}>
        <div className={styles.stageIcon} aria-hidden="true">{stage?.icon || '📖'}</div>
        <div className={styles.chapterTitle}>{chapterLabel(chapterKey, lang)}</div>
        {!isEmpty && (
          <div className={styles.pageCount}>
            {pageCount} {lang === 'en' ? 'pages' : '쪽'}
          </div>
        )}
        {isEmpty && (
          <div className={styles.emptyHint}>
            {lang === 'en' ? 'First page awaits' : '첫 페이지를 기다려요'}
          </div>
        )}
        {/* NFT 등급 뱃지 (Pi 출시 시 실제 NFT 등급) */}
        {!isEmpty && stage?.grade && (
          <div className={styles.gradeBadge}>{stage.grade}</div>
        )}
        {ownerName && <div className={styles.ownerStamp}>— {ownerName}</div>}
      </div>
    </button>
  );
}
