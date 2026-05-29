import { useEffect } from 'react';
import { useLevel } from '../../context/LevelContext';
import { getGuide } from '../../lib/guideContent';
import { getLevelDef } from '../../lib/ddLevel';
import Modal from './Modal';
import styles from './GuideModal.module.css';

// DD 레벨별 인앱 가이드 모달 — 방법/효과/검색 키워드(+Lv.4 안전 안내).
// track: 'deep' | 'dash', level: 1~4. 열릴 때 recordGuideView로 열람 기록.
export default function GuideModal({ open, onClose, track, level }) {
  const { recordGuideView } = useLevel();
  const guide = getGuide(track, level);
  const def = getLevelDef(track, level);

  useEffect(() => {
    if (open) recordGuideView(track, level);
  }, [open, track, level, recordGuideView]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>{guide.title}</div>
      <div className={styles.meta}>
        Lv.{level} · {def.method} · ×{def.multiplier} EP
      </div>

      {guide.video ? (
        <video className={styles.video} src={guide.video} controls playsInline />
      ) : (
        <div className={styles.videoPlaceholder}>🎬 영상 준비 중</div>
      )}

      <div className={styles.sectionTitle}>방법</div>
      <ol className={styles.methodList}>
        {guide.method.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <div className={styles.sectionTitle}>효과</div>
      <p className={styles.effect}>{guide.effect}</p>

      {guide.searchKeywords?.length > 0 && (
        <>
          <div className={styles.sectionTitle}>검색 키워드</div>
          <div className={styles.keywords}>
            {guide.searchKeywords.map((k) => (
              <span key={k} className={styles.keyword}>{k}</span>
            ))}
          </div>
        </>
      )}

      {guide.safetyNotice && (
        <div className={styles.safety}>⚠️ {guide.safetyNotice}</div>
      )}
    </Modal>
  );
}
