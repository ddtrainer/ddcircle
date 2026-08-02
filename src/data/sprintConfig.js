// 전력질주(스프린트) 자동 감지 — 상수/설정. (신규 기능 전용, 기존 로직과 무관)
export const GRAVITY = 9.81; // 중력 크기(m/s²) — magnitude에서 빼서 '동적 가속'만 추출

export const SPRINT = {
  // 방향 무관 감지: dyn = |가속도 크기| - 중력. 발 착지 스파이크(dyn) 임계값.
  DEFAULT_THRESHOLD: 7,        // m/s² — 동적 가속(dyn) 피크 임계값 기본값
  CALIB_CAPTURE_THRESHOLD: 3,  // 캘리브레이션 캡처용 낮은 임계값
  MIN_PEAK_INTERVAL_MS: 200,   // 중복 카운트 방지 최소 피크 간격
  MEASURE_MS: 60000,           // 1분 측정
  COUNTDOWN_SEC: 3,            // 측정 시작 전 카운트다운
  CALIB_MS: 6000,             // 캘리브레이션(3번 뛰기) 캡처 시간
  INTRO_DAYS: 3,              // 첫 N일간 강도 선택 화면 노출(4일차부터 전력질주 기본)
  LOW_SIGNAL_MS: 8000,       // 이 시간 동안 피크 없으면 "더 세게" 안내
  MIN_VALID_COUNT: 20,       // 유효 인정 최소 횟수(1분)
  // 검증(웹 대체) — 걸음센서 불가로 리듬 규칙성 + 최소 횟수 기반.
  // 완화됨: 실사용자가 중간에 속도를 바꿔도 정상으로 인정(0.55 → 0.75).
  RHYTHM_CV_MAX: 0.75,       // 피크 간격 변동계수(표준편차/평균) 상한
};

export const SPRINT_KEYS = {
  // v2: 감지 방식이 Y축 → 방향무관(magnitude)로 바뀌어 임계값 의미가 달라짐 → 재보정 유도.
  threshold: 'ddcircle.sprint.threshold2', // 개인 캘리브레이션 임계값(dyn)
  firstUse:  'ddcircle.sprint.firstUseDate', // 첫 사용일(YYYY-MM-DD)
};

// 평균 dyn 진폭 → 강도 퍼센타일(상위 %). dyn 스케일 기준(러프, 기기 편차 있어 근사).
export function intensityPercentile(avgAmp) {
  if (avgAmp >= 15) return 10;
  if (avgAmp >= 12) return 20;
  if (avgAmp >= 9) return 35;
  if (avgAmp >= 7) return 50;
  if (avgAmp >= 5) return 70;
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
