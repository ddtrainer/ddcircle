import { useEffect, useReducer, useRef } from 'react';

// 동적 호흡 사이클 (들숨/멈춤/날숨/날숨후멈춤 — 0이면 스킵) × N 사이클
// 단일 reducer로 phase/phaseSecond/cycle을 원자적으로 갱신 (race 방지)
// enabled가 reducer 상태에 포함되어 tick과 항상 원자적으로 동작 (ref race 없음)

function totalCycleSec(durations) {
  return durations.inhale + (durations.hold || 0) + durations.exhale + (durations.postHold || 0);
}

function initState(durations, totalCycles) {
  return {
    phase: 'inhale',
    phaseSecond: durations.inhale,
    cycle: 1,
    totalLeft: totalCycles * totalCycleSec(durations),
    paused: false,
    done: false,
    enabled: false, // 항상 false로 시작 — 호출자가 명시적으로 enable해야 카운트 시작
    durations,
    totalCycles,
  };
}

function reducer(state, action) {
  if (action.type === 'reset') {
    return initState(action.durations, action.totalCycles);
  }
  if (action.type === 'setEnabled') {
    return { ...state, enabled: action.value };
  }
  if (action.type === 'tick') {
    if (state.paused || state.done || !state.enabled) return state;
    const nextSec = state.phaseSecond - 1;
    const totalLeft = Math.max(0, state.totalLeft - 1);
    if (nextSec > 0) {
      return { ...state, phaseSecond: nextSec, totalLeft };
    }
    // phase 종료 — 사이클 마지막 phase인지 판단
    const d = state.durations;
    const isLastPhase =
      (state.phase === 'postHold') ||
      (state.phase === 'exhale' && !(d.postHold > 0));

    if (isLastPhase) {
      const nextCycle = state.cycle + 1;
      if (nextCycle > state.totalCycles) {
        return { ...state, done: true, totalLeft: 0 };
      }
      return { ...state, phase: 'inhale', phaseSecond: d.inhale, cycle: nextCycle, totalLeft };
    }

    // 사이클 내 다음 phase로 전환
    let np;
    if (state.phase === 'inhale')    np = d.hold > 0 ? 'hold' : 'exhale';
    else if (state.phase === 'hold') np = 'exhale';
    else if (state.phase === 'exhale') np = 'postHold'; // postHold > 0 이어야 여기 도달

    return { ...state, phase: np, phaseSecond: d[np], totalLeft };
  }
  if (action.type === 'togglePause') {
    return { ...state, paused: !state.paused };
  }
  if (action.type === 'skip') {
    if (state.done) return state;
    return { ...state, done: true };
  }
  return state;
}

export function useBreathCycle({ durations, totalCycles = 6, onComplete, enabled = true }) {
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => initState(durations, totalCycles)
  );

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // durations 또는 totalCycles 변경 시 재초기화 (패턴 전환) — reset은 enabled:false로 시작
  useEffect(() => {
    dispatch({ type: 'reset', durations, totalCycles });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durations.inhale, durations.hold, durations.exhale, durations.postHold, totalCycles]);

  // enabled prop → reducer state 동기화 (reducer 안에서 tick과 원자적으로 평가됨)
  useEffect(() => {
    dispatch({ type: 'setEnabled', value: enabled });
  }, [enabled]);

  // done 트리거 감지 → onComplete 호출
  useEffect(() => {
    if (state.done) onCompleteRef.current?.();
  }, [state.done]);

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, []);

  // 표시용 숫자: 들숨은 카운트업, 나머지는 카운트다운
  const fullDuration = state.durations[state.phase];
  const displaySecond =
    state.phase === 'inhale'
      ? fullDuration - state.phaseSecond + 1
      : state.phaseSecond;

  return {
    phase: state.phase,
    phaseSecond: state.phaseSecond,
    displaySecond,
    cycle: state.cycle,
    totalLeft: state.totalLeft,
    paused: state.paused,
    togglePause: () => dispatch({ type: 'togglePause' }),
    skip: () => dispatch({ type: 'skip' }),
  };
}
