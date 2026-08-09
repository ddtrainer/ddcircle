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
} from '../lib/chapters';
import { MOODS } from '../data/moods';
import { toIntlLocale, weekdayNarrowLabels } from '../utils/intlLocale';
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
  // 페이지 구성: 표지(0) + 한눈에 보기(1) + 일별(2..N+1) + 뒷표지(N+2)
  const totalPages = posts.length + 3;
  const moodMap = useMemo(() => {
    const m = new Map();
    MOODS.forEach((md) => m.set(md.id, md));
    return m;
  }, []);

  // 한눈에 보기 — 통계 + 캘린더 데이터 계산
  const overview = useMemo(() => buildOverview(chapterKey, posts, moodMap), [chapterKey, posts, moodMap]);

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
  const isOverview = pageIdx === 1;
  const isBack = pageIdx === totalPages - 1;
  const post = !isCover && !isOverview && !isBack ? posts[pageIdx - 2] : null;
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
              {meta.stage.grade} · {t(meta.stage.labelKey)}
            </div>
            <div className={styles.coverStats}>
              {meta.pageCount} {t('bookPages')} · {meta.activeDays}{t('daysShort')}
            </div>
            {ownerName && <div className={styles.coverOwner}>— {ownerName}</div>}
          </div>
        )}

        {isOverview && (
          <article className={styles.overviewPage}>
            <header className={styles.overviewHead}>
              <div className={styles.overviewLabel}>{t('overviewLabel')}</div>
              <div className={styles.overviewTitle}>
                {chapterLabel(chapterKey, lang)}
              </div>
              <div className={styles.overviewStage}>
                {meta.stage.icon} {t(meta.stage.labelKey)}
                {' · '}{meta.stage.grade}
              </div>
            </header>

            <div className={styles.statRow}>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{overview.activeDays}</div>
                <div className={styles.statLabel}>{t('overviewActiveDays')}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{overview.photoCount}</div>
                <div className={styles.statLabel}>{t('overviewPhotos')}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{overview.longestStreak}</div>
                <div className={styles.statLabel}>{t('overviewStreak')}</div>
              </div>
            </div>

            {overview.topMood && (
              <div className={styles.topMoodRow}>
                <span className={styles.topMoodLabel}>{t('overviewTopMood')}</span>
                <span className={styles.topMoodValue}>{t(overview.topMood.key)}</span>
                <span className={styles.topMoodCount}>× {overview.topMoodCount}</span>
              </div>
            )}

            <div className={styles.calendarWrap}>
              <div className={styles.calendarHead}>
                {weekdayNarrowLabels(lang).map((d, i) => (
                  <div key={i} className={styles.calCellHead}>{d}</div>
                ))}
              </div>
              <div className={styles.calendarGrid}>
                {overview.cells.map((cell, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.calCell} ${cell.empty ? styles.calEmpty : ''} ${cell.hasEntry ? styles.calActive : ''} ${cell.isToday ? styles.calToday : ''}`}
                    onClick={() => {
                      if (cell.postIndex != null) setPageIdx(cell.postIndex + 2);
                    }}
                    disabled={cell.empty}
                    aria-label={cell.empty ? '' : `${cell.day}${cell.hasEntry ? ` · ${t('calDayHasEntry')}` : ''}`}
                  >
                    {!cell.empty && (
                      <>
                        <span className={styles.calDay}>{cell.day}</span>
                        {cell.hasEntry && (
                          <span className={styles.calDot} aria-hidden="true">●</span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </article>
        )}

        {!isCover && !isOverview && !isBack && post && (
          <article className={styles.contentPage}>
            <header className={styles.pageHeader}>
              <div className={styles.pageDate}>
                {new Date(post.created_at).toLocaleDateString(
                  toIntlLocale(lang),
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
                {t('bookQuietDay')}
              </p>
            )}

            <footer className={styles.pageFooter}>
              <span className={styles.verifiedMark}>✓ Verified</span>
              <span className={styles.polId}>
                {new Date(post.created_at).toLocaleTimeString(
                  toIntlLocale(lang),
                  { hour: 'numeric', minute: '2-digit' }
                )}
              </span>
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
              {t('bookBackDaysTpl').replace('{n}', meta.activeDays)}
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

// Overview 페이지 데이터 빌더 — 챕터의 통계 + 캘린더 셀
// 반환 cells: 6×7 = 42칸. empty=true는 빈 칸, hasEntry=true는 게시물 있음.
// postIndex는 posts 배열의 인덱스 (페이지 이동 시 사용)
function buildOverview(chapterKey, posts, moodMap) {
  const [year, month] = chapterKey.split('-').map(Number);
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = firstOfMonth.getDay(); // 0(일)~6(토)
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;
  const todayDate = today.getDate();

  // 날짜별 게시물 인덱스 매핑 (1일 기준)
  const dayToPostIndex = new Map();
  posts.forEach((p, i) => {
    const d = new Date(p.created_at || p.ts);
    if (d.getFullYear() === year && d.getMonth() === month - 1) {
      // 같은 날 여러 게시물이면 첫 번째 인덱스만 사용
      if (!dayToPostIndex.has(d.getDate())) dayToPostIndex.set(d.getDate(), i);
    }
  });

  // 캘린더 셀 만들기 — 42칸 고정 (앞쪽 빈 칸 + 1..daysInMonth + 뒤쪽 빈 칸)
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ empty: true });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      empty: false,
      day: d,
      hasEntry: dayToPostIndex.has(d),
      postIndex: dayToPostIndex.get(d) ?? null,
      isToday: isCurrentMonth && d === todayDate,
    });
  }
  while (cells.length < 42) cells.push({ empty: true });

  // 통계 — 활동 일수 / 사진 수 / 최장 연속 / 가장 많은 무드
  const activeDays = dayToPostIndex.size;
  const photoCount = posts.filter((p) => p.has_proof || p.proof_url).length;

  // 무드 카운트
  const moodCount = new Map();
  posts.forEach((p) => {
    if (!p.mood) return;
    moodCount.set(p.mood, (moodCount.get(p.mood) || 0) + 1);
  });
  let topMood = null;
  let topMoodCount = 0;
  for (const [moodId, count] of moodCount) {
    if (count > topMoodCount) {
      topMoodCount = count;
      topMood = moodMap.get(moodId);
    }
  }

  // 최장 연속 일수 — 정렬된 활동 일자 배열에서 차이가 1인 구간 찾기
  const sortedDays = Array.from(dayToPostIndex.keys()).sort((a, b) => a - b);
  let longestStreak = sortedDays.length > 0 ? 1 : 0;
  let currentStreak = longestStreak;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] - sortedDays[i - 1] === 1) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return { activeDays, photoCount, longestStreak, topMood, topMoodCount, cells };
}
