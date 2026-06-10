import DdLevelCard from '../components/DdLevelCard';
import ChallengeSection from '../components/ChallengeSection';
import styles from './Grow.module.css';

// 도전·성장 탭 — 홈에서 분리한 '나의 성장 단계'와 '도전 이벤트'를 한곳에 모은다.
// 홈은 '시작'에만 집중하고, 진행/보상/레벨 정보는 이 탭에서 확인.
// 두 섹션이 각각 자체 헤더(나의 성장 단계 / 도전 이벤트)를 가지므로 페이지 헤더는 두지 않는다.
export default function Grow() {
  return (
    <div className={styles.page}>
      {/* 나의 성장 단계 (Deep/Dash 레벨 로드맵) */}
      <DdLevelCard />

      {/* 도전 이벤트 (연속 출석 챌린지) */}
      <ChallengeSection />
    </div>
  );
}
