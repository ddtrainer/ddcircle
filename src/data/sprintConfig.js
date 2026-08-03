// 전력질주(스프린트) 자동 감지 — 상수/설정. (신규 기능 전용, 기존 로직과 무관)
export const GRAVITY = 9.81; // 중력 크기(m/s²) — magnitude에서 빼서 '동적 가속'만 추출

export const SPRINT = {
  // 적응형 계수: 진폭(peak-to-peak)이 minAmp 이상일 때만 유효 사이클로 인정(노이즈 floor).
  DEFAULT_MIN_AMP: 3,          // m/s² — 유효 진폭 최소치(정지 잡음 제거)
  CALIB_CAPTURE_MIN_AMP: 2,    // 캘리브레이션 캡처용 낮은 floor
  MIN_PEAK_INTERVAL_MS: 200,   // 중복 카운트 방지 최소 스텝 간격(최대 ~300/분)
  MEASURE_MS: 60000,           // 1분 측정
  COUNTDOWN_SEC: 3,            // 측정 시작 전 카운트다운
  CALIB_MS: 6000,             // 캘리브레이션(3번 뛰기) 캡처 시간
  INTRO_DAYS: 3,              // 첫 N일간 강도 선택 화면 노출(4일차부터 전력질주 기본)
  LOW_SIGNAL_MS: 8000,       // 이 시간 동안 스텝 없으면 "더 세게" 안내
  MIN_VALID_COUNT: 20,       // 유효 인정 최소 횟수(1분)
  // 검증(웹 대체) — 걸음센서 불가로 리듬 규칙성 + 최소 횟수 기반. 완화 상한.
  RHYTHM_CV_MAX: 0.75,       // 스텝 간격 변동계수(표준편차/평균) 상한
};

export const SPRINT_KEYS = {
  // v3: 감지 방식이 적응형(진폭 floor) 으로 바뀜 → 기존 임계값 의미 폐기, 재보정 유도.
  threshold: 'ddcircle.sprint.minamp3', // 개인 캘리브레이션 진폭 floor
  firstUse:  'ddcircle.sprint.firstUseDate', // 첫 사용일(YYYY-MM-DD)
};

// 평균 진폭(peak-to-peak) → 강도 퍼센타일(상위 %). 러프 기준(기기 편차 있어 근사).
export function intensityPercentile(avgAmp) {
  if (avgAmp >= 18) return 10;
  if (avgAmp >= 14) return 20;
  if (avgAmp >= 11) return 35;
  if (avgAmp >= 8) return 50;
  if (avgAmp >= 6) return 70;
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
