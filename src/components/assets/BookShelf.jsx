import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import {
  chapterKey as toChapterKey,
  chapterBookMeta,
  groupByChapter,
  getCoverStage,
  totalActiveDays,
} from '../../lib/chapters';
import BookCover from './BookCover';
import styles from './BookShelf.module.css';

// 책장 — 챕터별 책을 가로 스크롤로 나열
// posts: Supabase posts row 배열 (created_at 필수)
// ownerName: 표지 하단에 찍힐 닉네임
export default function BookShelf({ posts = [], ownerName = '' }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const { books, totalDays, currentKey } = useMemo(() => {
    const grouped = groupByChapter(posts);
    const currentKey = toChapterKey(new Date());

    // 이번 달 책이 비어있어도 책장에 항상 노출 (사용자가 "지금 쓰는 책" 인식)
    if (!grouped.has(currentKey)) grouped.set(currentKey, []);

    const books = Array.from(grouped.entries())
      .map(([key, list]) => chapterBookMeta(key, list))
      .sort((a, b) => b.key.localeCompare(a.key)); // 최신 챕터가 좌측

    return {
      books,
      totalDays: totalActiveDays(posts),
      currentKey,
    };
  }, [posts]);

  const currentStage = getCoverStage(totalDays);

  return (
    <div className={styles.shelfSection}>
      <div className={styles.header}>
        <div className={styles.title}>
          📖 {t('shelfTitle')}
        </div>
        <div className={styles.subtitle}>
          {t('shelfStageTpl', {
            stage: lang === 'en' ? currentStage.labelEn : currentStage.label,
            days: totalDays,
          })}
        </div>
      </div>

      <div className={styles.shelf}>
        <div className={styles.shelfInner}>
          {books.map((b) => (
            <BookCover
              key={b.key}
              chapterKey={b.key}
              pageCount={b.pageCount}
              stage={b.stage}
              ownerName={ownerName}
              isEmpty={b.pageCount === 0}
              isCurrent={b.key === currentKey}
              onClick={() => {
                // 빈 책은 진입 대신 홈으로 (오늘의 DD 유도)
                if (b.pageCount === 0) {
                  navigate('/');
                  return;
                }
                navigate(`/book/${b.key}`);
              }}
            />
          ))}
        </div>
        {/* 책장 선반 */}
        <div className={styles.plank} />
      </div>
    </div>
  );
}
