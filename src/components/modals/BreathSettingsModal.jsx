import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import Modal from './Modal';
import styles from './BreathSettingsModal.module.css';

const RANGES = {
  inhale:    { min: 1, max: 12 },
  hold:      { min: 0, max: 20 },
  exhale:    { min: 1, max: 16 },
  postHold:  { min: 0, max: 20 },
  cycles:    { min: 2, max: 20 },
  rounds:    { min: 20, max: 40 },
  wimCycles: { min: 1, max: 5 },
  retention: { min: 15, max: 120, step: 15 },
  recovery:  { min: 10, max: 30, step: 5 },
  finish:    { min: 4, max: 12 },
};

export default function BreathSettingsModal({ open, onClose, mode = 'custom' }) {
  const { t } = useLang();
  const { customBreath, setCustomBreath, naturalBreath, setNaturalBreath, setBreathPatternId,
    wimHofRounds, setWimHofRounds, wimHofCycles, setWimHofCycles, wimHofRetention, setWimHofRetention,
    wimHofRecovery, setWimHofRecovery, wimHofFinish, setWimHofFinish } = useApp();
  const { show: showToast } = useToast();

  const isNatural = mode === 'natural';
  const isWim = mode === 'wimhof';
  const wimSource = { rounds: wimHofRounds, wimCycles: wimHofCycles, retention: wimHofRetention, recovery: wimHofRecovery, finish: wimHofFinish };
  const source = isWim ? wimSource : isNatural ? naturalBreath : customBreath;

  const [draft, setDraft] = useState({ postHold: 0, ...source });

  // 모달을 열 때(또는 저장된 값·모드가 바뀔 때)만 draft를 초기화한다.
  // ⚠️ 의존성에 wimSource/source(매 렌더 새로 생성되는 객체)를 넣으면 안 된다 —
  //    윔호프 모드에서 렌더마다 effect가 재실행되어 +/- 로 바꾼 draft를 즉시
  //    context 값으로 되돌려 "스테퍼 무반응"처럼 보이게 된다. 원시값에만 의존.
  useEffect(() => {
    if (!open) return;
    if (isWim) {
      setDraft({
        rounds: wimHofRounds, wimCycles: wimHofCycles, retention: wimHofRetention,
        recovery: wimHofRecovery, finish: wimHofFinish,
      });
    } else {
      setDraft({ postHold: 0, ...(isNatural ? naturalBreath : customBreath) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, wimHofRounds, wimHofCycles, wimHofRetention, wimHofRecovery, wimHofFinish, naturalBreath, customBreath]);

  const change = (key, dir) => {
    setDraft((prev) => {
      const r = RANGES[key];
      const next = prev[key] + dir * (r.step || 1);
      return { ...prev, [key]: Math.max(r.min, Math.min(r.max, next)) };
    });
  };

  const totalSec = (draft.inhale + (draft.hold || 0) + draft.exhale + (draft.postHold || 0)) * draft.cycles;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  // 윔호프 예상 소요: [과호흡(2초×rounds) + 참기 + 회복(들숨4+참기) + 마무리 날숨] × 사이클
  const wimSec = (draft.rounds * 2 + draft.retention + 4 + (draft.recovery || 0) + (draft.finish || 0)) * draft.wimCycles;
  const wimMin = Math.floor(wimSec / 60);
  const wimSecRem = wimSec % 60;

  const save = () => {
    if (isWim) {
      setWimHofRounds(draft.rounds);
      setWimHofCycles(draft.wimCycles);
      setWimHofRetention(draft.retention);
      setWimHofRecovery(draft.recovery);
      setWimHofFinish(draft.finish);
      setBreathPatternId('custom');
      showToast('🌬️', `${t('wimHofRoundsShort').replace('{n}', draft.rounds)} · ${draft.wimCycles}${t('wimHofCycleUnit')}`);
      onClose?.();
      return;
    }
    if (isNatural) {
      setNaturalBreath(draft);
      setBreathPatternId('48');
    } else {
      setCustomBreath(draft);
      setBreathPatternId('custom');
    }
    showToast('🧘', `${draft.inhale}-${draft.hold}-${draft.exhale}-${draft.postHold ?? 0}`);
    onClose?.();
  };

  const Stepper = ({ k, label }) => (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.stepper}>
        <button className={styles.btn} onClick={() => change(k, -1)} aria-label="-">−</button>
        <div className={styles.value}>{draft[k]}</div>
        <button className={styles.btn} onClick={() => change(k, +1)} aria-label="+">+</button>
      </div>
    </div>
  );

  const title = isWim ? t('breathWimSettingsTitle') : isNatural ? t('breathNaturalSettingsTitle') : t('breathSettingsTitle');
  const sub = isWim ? t('breathWimSettingsSub') : t('breathSettingsSub');

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>{title}</div>
      <div className={styles.sub}>{sub}</div>

      {isWim ? (
        <>
          <Stepper k="rounds"    label={t('wimHofRoundsLabel')} />
          <Stepper k="retention" label={t('wimHofRetentionLabel')} />
          <Stepper k="recovery"  label={t('wimHofRecoveryLabel')} />
          <Stepper k="finish"    label={t('wimHofFinishLabel')} />
          <Stepper k="wimCycles" label={t('wimHofCyclesLabel')} />
          <div className={styles.preview}>
            {t('wimHofRoundsShort').replace('{n}', draft.rounds)} · {t('wimHofRetention')} {draft.retention}s · {draft.wimCycles}{t('wimHofCycleUnit')} · ≈ {wimMin}:{wimSecRem < 10 ? '0' : ''}{wimSecRem}
          </div>
        </>
      ) : (
        <>
          <Stepper k="inhale"   label={t('breathInhaleLabel')} />
          <Stepper k="hold"     label={t('breathHoldLabel')} />
          <Stepper k="exhale"   label={t('breathExhaleLabel')} />
          <Stepper k="postHold" label={t('breathPostHoldLabel')} />
          <Stepper k="cycles"   label={t('breathCyclesLabel')} />

          <div className={styles.preview}>
            {draft.inhale}-{draft.hold}-{draft.exhale}-{draft.postHold ?? 0} × {draft.cycles} = {min}:{sec < 10 ? '0' : ''}{sec}
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          {t('breathSettingsCancel')}
        </button>
        <button className={styles.saveBtn} onClick={save}>
          {t('breathSettingsSave')}
        </button>
      </div>
    </Modal>
  );
}
