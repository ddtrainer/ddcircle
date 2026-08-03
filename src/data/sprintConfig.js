// 전력질주(스프린트) 자동 감지 — 상수/설정. (신규 기능 전용, 기존 로직과 무관)
export const GRAVITY = 9.81; // 중력 크기(m/s²) — magnitude에서 빼서 '동적 가속'만 추출

export const SPRINT = {
  // 적응형 계수: 진폭(peak-to-peak)이 minAmp 이상일 때만 유효 사이클로 인정(노이즈 floor).
  DEFAULT_MIN_AMP: 3,          // m/s² — 유효 진폭 최소치(정지 잡음 제거)
  CALIB_CAPTURE_MIN_AMP: 2,    // 캘리브레이션 캡처용 낮은 floor
  MIN_PEAK_INTERVAL_MS: 160,   // 중복 카운트 방지 최소 스텝 간격(최대 ~375/분, 전력질주 대응)
  MEASURE_MS: 60000,           // 1분 측정
  COUNTDOWN_SEC: 5,            // 측정 시작 전 카운트다운 (5→1)
  CALIB_MS: 6000,             // 캘리브레이션(3번 뛰기) 캡처 시간
  INTRO_DAYS: 3,              // 첫 N일간 강도 선택 화면 노출(4일차부터 전력질주 기본)
  LOW_SIGNAL_MS: 8000,       // 이 시간 동안 스텝 없으면 "더 세게" 안내
  MIN_VALID_COUNT: 20,       // 유효 인정 최소 횟수(1분)
  // 검증(웹 대체) — 걸음센서 불가로 리듬 규칙성 + 최소 횟수 기반. 완화 상한.
  RHYTHM_CV_MAX: 0.75,       // 스텝 간격 변동계수(표준편차/평균) 상한
};

export const SPRINT_KEYS = {
  // v4: 감지가 로컬 피크(돌출 prominence) 로 바뀜 → floor 의미 변경, 재보정 유도.
  threshold: 'ddcircle.sprint.minamp4', // 개인 캘리브레이션 돌출 floor
  firstUse:  'ddcircle.sprint.firstUseDate', // 첫 사용일(YYYY-MM-DD)
};

// 강도 퍼센타일(상위 %) = "진폭 × 케이던스(초당 스텝)".
// 힘(진폭)과 빠르기(케이던스)를 함께 반영 → 전력질주(둘 다 높음)가 최상위,
// 이동성 러닝(진폭만 큼)은 그 아래. 러프 기준(기기 편차 있어 근사, 실측 후 보정).
export function intensityPercentile(avgAmp, count = 0) {
  const vigor = avgAmp * (count / 60); // 초당 스텝으로 가중
  if (vigor >= 50) return 10;
  if (vigor >= 40) return 20;
  if (vigor >= 25) return 35;
  if (vigor >= 15) return 50;
  if (vigor >= 8) return 70;
  return 90;
}

// 측정 강도(퍼센타일) → Dash 기준 EP. 여기에 레벨·스트릭 배율이 추가로 곱해진다.
//   상위 ≤20% (전력질주급) → 15
//   상위 ≤50% (슬로우런급) → 10
//   그 외    (걷기급)      → 7
export function intensityToEp(percentile) {
  if (percentile <= 20) return 15;
  if (percentile <= 50) return 10;
  return 7;
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
