import { useEffect, useReducer, useRef } from 'react';

// 동적 호흡 사이클 (들숨/멈춤/날숨 — 멈춤은 0이면 스킵) × N 사이클
// 단일 reducer로 phase/phaseSecond/cycle을 원자적으로 갱신 (race 방지)

function totalCycleSec(durations) {
  return durations.inhale + durations.hold + durations.exhale;
}

// 다음 phase 계산 (멈춤=0이면 inhale → exhale 직행)
function nextPhase(currentPhase, durations) {
  if (currentPhase === 'inhale') {
    return durations.hold > 0 ? 'hold' : 'exhale';
  }
  if (currentPhase === 'hold') return 'exhale';
  return 'inhale'; // after exhale
}

function initState(durations, totalCycles) {
  return {
    phase: 'inhale',
    phaseSecond: durations.inhale,
    cycle: 1,
    totalLeft: totalCycles * totalCycleSec(durations),
    paused: false,
    done: false,
    durations,
    totalCycles,
  };
}

function reducer(state, action) {
  if (action.type === 'reset') {
    return initState(action.durations, action.totalCycles);
  }
  if (action.type === 'tick') {
    if (state.paused || state.done) return state;
    const nextSec = state.phaseSecond - 1;
    const totalLeft = Math.max(0, state.totalLeft - 1);
    if (nextSec > 0) {
      return { ...state, phaseSecond: nextSec, totalLeft };
    }
    // phase 전환
    if (state.phase === 'exhale') {
      const nextCycle = state.cycle + 1;
      if (nextCycle > state.totalCycles) {
        return { ...state, done: true, totalLeft: 0 };
      }
      return {
        ...state,
        phase: 'inhale',
        phaseSecond: state.durations.inhale,
        cycle: nextCycle,
        totalLeft,
      };
    }
    const np = nextPhase(state.phase, state.durations);
    return {
      ...state,
      phase: np,
      phaseSecond: state.durations[np],
      totalLeft,
    };
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

export function useBreathCycle({ durations, totalCycles = 6, onComplete }) {
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => initState(durations, totalCycles)
  );

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // durations 또는 totalCycles 변경 시 재초기화 (패턴 전환)
  useEffect(() => {
    dispatch({ type: 'reset', durations, totalCycles });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durations.inhale, durations.hold, durations.exhale, totalCycles]);

  // done 트리거 감지 → onComplete 호출
  useEffect(() => {
    if (state.done) onCompleteRef.current?.();
  }, [state.done]);

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, []);

  // 표시용 숫자: 들숨은 1→N (팽창과 함께 증가), 멈춤/날숨은 카운트다운
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
