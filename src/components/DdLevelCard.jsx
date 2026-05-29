import { useState } from 'react';
import { useLevel } from '../context/LevelContext';
import { getLevelDef } from '../lib/ddLevel';
import GuideModal from './modals/GuideModal';
import styles from './DdLevelCard.module.css';

// 홈 화면 DD 레벨 카드 — Deep/Dash 현재 레벨과 EP 배율을 보여주고
// 트랙별 가이드 모달을 연다. 타이머/세션 흐름은 건드리지 않는다.
export default function DdLevelCard() {
  const { deepLevel, dashLevel } = useLevel();
  const [guide, setGuide] = useState(null); // { track, level } | null

  const deepDef = getLevelDef('deep', deepLevel);
  const dashDef = getLevelDef('dash', dashLevel);

  const rows = [
    { track: 'deep', label: 'Deep · 심호흡', level: deepLevel, def: deepDef },
    { track: 'dash', label: 'Dash · 운동', level: dashLevel, def: dashDef },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>DD 레벨</span>
      </div>

      {rows.map(({ track, label, level, def }) => (
        <button
          key={track}
          className={styles.row}
          onClick={() => setGuide({ track, level })}
        >
          <span className={styles.emoji}>{def.emoji}</span>
          <span className={styles.info}>
            <span className={styles.track}>{label}</span>
            <span className={styles.name}>Lv.{level} {def.name} · {def.method}</span>
          </span>
          <span className={styles.multiplier}>×{def.multiplier}</span>
          <span className={styles.chevron}>›</span>
        </button>
      ))}

      {guide && (
        <GuideModal
          open
          onClose={() => setGuide(null)}
          track={guide.track}
          level={guide.level}
        />
      )}
    </div>
  );
}
