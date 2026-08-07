import { useEffect } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useLevel } from '../../context/LevelContext';
import { getGuide } from '../../lib/guideContent';
import { getLevelDef } from '../../lib/ddLevel';
import Modal from './Modal';
import styles from './GuideModal.module.css';

// 인앱 가이드 모달 — 방법/효과(+윔호프 안전 안내).
// track: 'deep' | 'dash', level: 1~4. 열릴 때 recordGuideView로 열람 기록.
// mode(선택): 자유선택제(BreathPicker 등)에서 { emoji, label, multiplier }를 넘기면
//   옛 레벨 표기 대신 종목명 + EP 배율로 헤더를 표시한다. 미전달 시 기존 레벨 표기 유지.
export default function GuideModal({ open, onClose, track, level, mode = null }) {
  const { lang } = useLang();
  const { recordGuideView } = useLevel();
  const guide = getGuide(track, level, lang);
  const def = mode ? null : getLevelDef(track, level);
  const L = (ko, en) => (lang === 'ko' ? ko : en);

  useEffect(() => {
    if (open) recordGuideView(track, level);
  }, [open, track, level, recordGuideView]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>{mode ? `${mode.emoji} ${mode.label}` : guide.title}</div>
      <div className={styles.meta}>
        {mode ? `EP ×${mode.multiplier}` : `Lv.${level} · ${def.method} · ×${def.multiplier} EP`}
      </div>

      {guide.intro && <p className={styles.intro}>{guide.intro}</p>}

      <div className={styles.sectionTitle}>{L('방법', 'How to')}</div>
      {guide.methodSections ? (
        guide.methodSections.map((sec) => (
          <div key={sec.heading}>
            <div className={styles.methodVersion}>{sec.heading}</div>
            <ol className={styles.methodList}>
              {sec.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        ))
      ) : (
        <ol className={styles.methodList}>
          {guide.method.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      <div className={styles.sectionTitle}>{L('효과', 'Benefits')}</div>
      {Array.isArray(guide.effect) ? (
        <ul className={styles.effectList}>
          {guide.effect.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.effect}>{guide.effect}</p>
      )}

      {guide.safetyNotice && (
        <div className={styles.safety}>⚠️ {guide.safetyNotice}</div>
      )}
    </Modal>
  );
}
