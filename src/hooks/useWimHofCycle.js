import { useEffect, useMemo, useReducer, useRef } from 'react';

// 윔호프 호흡 전용 스크립트 엔진 — step 배열을 1초 단위로 순차 진행한다.
// useBreathCycle(균일 사이클)과 분리해 기존 프리셋에 영향이 없도록 한다.
// step: { phase, duration, stage, round?, totalRounds? }

function totalSec(script) {
  return script.reduce((sum, s) => sum + s.duration, 0);
}

function initState(script) {
  const first = script[0];
  return {
    script,
    index: 0,
    phaseSecond: first.duration,
    totalLeft: totalSec(script),
    paused: false,
    done: false,
    enabled: false,
  };
}

function reducer(state, action) {
  if (action.type === 'reset') return initState(action.script);
  if (action.type === 'setEnabled') return { ...state, enabled: action.value };
  if (action.type === 'togglePause') return { ...state, paused: !state.paused };
  if (action.type === 'skip') {
    if (state.done) return state;
    return { ...state, done: true, totalLeft: 0 };
  }
  if (action.type === 'tick') {
    if (state.paused || state.done || !state.enabled) return state;
    const nextSec = state.phaseSecond - 1;
    const totalLeft = Math.max(0, state.totalLeft - 1);
    if (nextSec > 0) {
      return { ...state, phaseSecond: nextSec, totalLeft };
    }
    const nextIndex = state.index + 1;
    if (nextIndex >= state.script.length) {
      return { ...state, done: true, totalLeft: 0 };
    }
    return { ...state, index: nextIndex, phaseSecond: state.script[nextIndex].duration, totalLeft };
  }
  return state;
}

export function useWimHofCycle({ script, onComplete, enabled = true }) {
  const [state, dispatch] = useReducer(reducer, null, () => initState(script));

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const scriptKey = useMemo(() => `${script.length}:${totalSec(script)}`, [script]);
  useEffect(() => {
    dispatch({ type: 'reset', script });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptKey]);

  useEffect(() => {
    dispatch({ type: 'setEnabled', value: enabled });
  }, [enabled]);

  useEffect(() => {
    if (state.done) onCompleteRef.current?.();
  }, [state.done]);

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, []);

  const step = state.script[state.index];
  const displaySecond =
    step.phase === 'inhale'
      ? step.duration - state.phaseSecond + 1
      : state.phaseSecond;

  return {
    phase: step.phase,
    stage: step.stage,
    round: step.round,
    totalRounds: step.totalRounds,
    cycle: step.cycle,
    totalCycles: step.totalCycles,
    duration: step.duration,
    phaseSecond: state.phaseSecond,
    displaySecond,
    totalLeft: state.totalLeft,
    paused: state.paused,
    togglePause: () => dispatch({ type: 'togglePause' }),
    skip: () => dispatch({ type: 'skip' }),
  };
}
