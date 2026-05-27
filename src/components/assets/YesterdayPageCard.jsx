import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import { fetchMyPosts } from '../../lib/posts';
import { chapterKey, getCoverStage, totalActiveDays } from '../../lib/chapters';
import { MOODS } from '../../data/moods';
import styles from './YesterdayPageCard.module.css';

// 홈 하단 — 어제(또는 가장 최근)의 페이지 미리보기 카드
// 클릭 시 해당 챕터의 책으로 진입 → 재방문 유도
// 로그인하지 않았거나 페이지가 0개면 노출하지 않음 (조용한 비타민 톤 유지)
export default function YesterdayPageCard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [recent, setRecent] = useState(null);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const posts = await fetchMyPosts(user.id, 100);
      if (cancelled) return;
      // 오늘 작성한 게 있으면 오늘 것, 없으면 가장 최근 것 — "어제의 페이지" 의도지만
      // 최근 활동을 항상 한 장 보여주는 게 자연스러움
      if (posts.length === 0) return;
      const last = posts[0]; // fetchMyPosts는 created_at desc
      setRecent(last);
      setTotalDays(totalActiveDays(posts));
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user || !recent) return null;

  const moodObj = MOODS.find((m) => m.id === recent.mood);
  const date = new Date(recent.created_at);
  const stage = getCoverStage(totalDays);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const labelKey = isToday ? 'todayPageLabel' : 'recentPageLabel';

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => navigate(`/book/${chapterKey(date)}`)}
      aria-label={t('openMyBook')}
    >
      <div className={styles.left}>
        {recent.proof_url ? (
          <img src={recent.proof_url} alt="" className={styles.thumb} loading="lazy" />
        ) : (
          <div className={styles.thumbPlaceholder} aria-hidden="true">
            {stage.icon}
          </div>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.label}>
          <span className={styles.icon}>📖</span> {t(labelKey)}
        </div>
        <div className={styles.dateLine}>
          {date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR', {
            month: 'short', day: 'numeric', weekday: 'short',
          })}
          {moodObj && <span className={styles.moodTag}> · {t(moodObj.key)}</span>}
        </div>
        {recent.message && (
          <div className={styles.snippet}>{recent.message}</div>
        )}
      </div>
      <div className={styles.chevron} aria-hidden="true">›</div>
    </button>
  );
}
