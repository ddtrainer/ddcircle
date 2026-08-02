// 전력질주(스프린트) 자동 감지 — 상수/설정. (신규 기능 전용, 기존 로직과 무관)
export const SPRINT = {
  DEFAULT_THRESHOLD: 15,       // m/s² — Y축(상하) 피크 임계값 기본값
  MIN_PEAK_INTERVAL_MS: 200,   // 중복 카운트 방지 최소 피크 간격
  MEASURE_MS: 60000,           // 1분 측정
  COUNTDOWN_SEC: 3,            // 측정 시작 전 카운트다운
  CALIB_MS: 6000,             // 캘리브레이션(3번 뛰기) 캡처 시간
  INTRO_DAYS: 3,              // 첫 N일간 강도 선택 화면 노출(4일차부터 전력질주 기본)
  LOW_SIGNAL_MS: 8000,       // 이 시간 동안 피크 없으면 "더 세게" 안내
  MIN_VALID_COUNT: 20,       // 유효 인정 최소 횟수(1분)
  // 검증(웹 대체) 임계 — 걸음센서 불가로 리듬/축분포 기반
  RHYTHM_CV_MAX: 0.55,       // 피크 간격 변동계수(표준편차/평균) 상한
  Y_DOMINANCE_MIN: 0.42,     // 전체 에너지 중 Y축 비중 하한
  ABUSE_COUNT_GAP: 10,       // (참고) 원 스펙의 걸음센서 차이 기준 — 웹에선 대체지표로 환산
};

export const SPRINT_KEYS = {
  threshold: 'ddcircle.sprint.threshold',   // 개인 캘리브레이션 임계값
  firstUse:  'ddcircle.sprint.firstUseDate', // 첫 사용일(YYYY-MM-DD)
};

// 평균 진폭 → 강도 퍼센타일(상위 %). 러프 기준표(기기 편차 있어 근사).
export function intensityPercentile(avgAmp) {
  if (avgAmp >= 32) return 10;
  if (avgAmp >= 28) return 20;
  if (avgAmp >= 24) return 35;
  if (avgAmp >= 20) return 50;
  if (avgAmp >= 17) return 70;
  return 90;
}

// 'YYYY-MM-DD'
export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 두 'YYYY-MM-DD' 사이 달력 일수 차 (시간대 영향 없는 정수 계산)
function daysBetween(fromStr, toStr) {
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

// 첫 3일 여부 — 강도 선택 화면을 보여줄지. (첫 사용일 기록 후 INTRO_DAYS 이내)
export function isIntroPeriod() {
  try {
    let first = localStorage.getItem(SPRINT_KEYS.firstUse);
    if (!first) {
      first = todayKey();
      localStorage.setItem(SPRINT_KEYS.firstUse, first);
    }
    return daysBetween(first, todayKey()) < SPRINT.INTRO_DAYS;
  } catch {
    return true; // 저장 불가 시 안전하게 선택 화면 노출
  }
}
