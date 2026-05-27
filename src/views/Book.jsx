import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import { fetchMyPosts } from '../lib/posts';
import {
  chapterKey as toChapterKey,
  chapterLabel,
  chapterBookMeta,
  groupByChapter,
  pageId,
} from '../lib/chapters';
import { MOODS } from '../data/moods';
import styles from './Book.module.css';

// 풀스크린 책 뷰 — /book/:chapterKey
// 표지 → 페이지 1 → 페이지 N → 뒷표지 순으로 좌우 스와이프 (또는 버튼)
export default function Book() {
  const { chapterKey } = useParams();
  const { lang, t } = useLang();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIdx, setPageIdx] = useState(0); // 0 = 표지, 1..N = 페이지, N+1 = 뒷표지
  const touchStart = useRef(null);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const all = await fetchMyPosts(user.id, 500);
      if (cancelled) return;
      const grouped = groupByChapter(all);
      setPosts(grouped.get(chapterKey) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, chapterKey]);

  const meta = useMemo(() => chapterBookMeta(chapterKey, posts), [chapterKey, posts]);
  const totalPages = posts.length + 2; // 표지 + 본문 + 뒷표지
  const moodMap = useMemo(() => {
    const m = new Map();
    MOODS.forEach((md) => m.set(md.id, md));
    return m;
  }, []);

  const goPrev = () => setPageIdx((i) => Math.max(0, i - 1));
  const goNext = () => setPageIdx((i) => Math.min(totalPages - 1, i + 1));

  // 키보드 좌우
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') navigate('/record');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);  // eslint-disable-line

  // 터치 스와이프
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStart.current = null;
  };

  if (loading) {
    return <div className={styles.loading}>🌿</div>;
  }

  const isCover = pageIdx === 0;
  const isBack = pageIdx === totalPages - 1;
  const post = !isCover && !isBack ? posts[pageIdx - 1] : null;
  const mood = post ? moodMap.get(post.mood) : null;
  const ownerName = profile?.nickname || '';

  return (
    <div
      className={styles.book}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.topBar}>
        <button className={styles.closeBtn} onClick={() => navigate('/record')} aria-label="close">
          ✕
        </button>
        <div className={styles.chapterTag}>{chapterLabel(chapterKey, lang)}</div>
        <div className={styles.pageProgress}>
          {pageIdx} / {totalPages - 1}
        </div>
      </div>

      <div className={styles.pageArea} key={pageIdx}>
        {isCover && (
          <div
            className={styles.coverPage}
            style={{ background: meta.stage.color }}
          >
            <div className={styles.coverStageIcon}>{meta.stage.icon}</div>
            <div className={styles.coverTitle}>{chapterLabel(chapterKey, lang)}</div>
            <div className={styles.coverGrade}>
              {meta.stage.grade} · {lang === 'en' ? meta.stage.labelEn : meta.stage.label}
            </div>
            <div className={styles.coverStats}>
              {meta.pageCount} {lang === 'en' ? 'pages' : '쪽'} · {meta.activeDays} {lang === 'en' ? 'days' : '일'}
            </div>
            {ownerName && <div className={styles.coverOwner}>— {ownerName}</div>}
          </div>
        )}

        {!isCover && !isBack && post && (
          <article className={styles.contentPage}>
            <header className={styles.pageHeader}>
              <div className={styles.pageDate}>
                {new Date(post.created_at).toLocaleDateString(
                  lang === 'en' ? 'en-US' : 'ko-KR',
                  { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }
                )}
              </div>
              {mood && <div className={styles.pageMood}>{t(mood.key)}</div>}
            </header>

            {post.proof_url && (
              <div className={styles.pagePhoto}>
                <img src={post.proof_url} alt="" loading="lazy" />
              </div>
            )}

            {post.message && (
              <p className={styles.pageBody}>{post.message}</p>
            )}

            {!post.message && !post.proof_url && (
              <p className={styles.pageEmpty}>
                {lang === 'en' ? '...a quiet day.' : '...조용한 하루.'}
              </p>
            )}

            <footer className={styles.pageFooter}>
              <span className={styles.verifiedMark}>✓ Verified</span>
              <span className={styles.polId}>{pageId(post)}</span>
            </footer>
          </article>
        )}

        {isBack && (
          <div
            className={styles.backPage}
            style={{ background: meta.stage.color }}
          >
            <div className={styles.backTitle}>{t('bookEnd')}</div>
            <div className={styles.backSub}>
              {lang === 'en'
                ? `${meta.activeDays} days of presence`
                : `${meta.activeDays}일의 기록`}
            </div>
            <button className={styles.backHomeBtn} onClick={() => navigate('/record')}>
              {t('bookBackToShelf')}
            </button>
          </div>
        )}
      </div>

      <div className={styles.navRow}>
        <button
          className={styles.navBtn}
          onClick={goPrev}
          disabled={pageIdx === 0}
          aria-label="previous page"
        >
          ‹
        </button>
        <button
          className={styles.navBtn}
          onClick={goNext}
          disabled={pageIdx === totalPages - 1}
          aria-label="next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
