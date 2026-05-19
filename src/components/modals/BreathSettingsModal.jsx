import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../Toast';
import Modal from './Modal';
import styles from './BreathSettingsModal.module.css';

const RANGES = {
  inhale:   { min: 1, max: 12 },
  hold:     { min: 0, max: 20 },
  exhale:   { min: 1, max: 16 },
  postHold: { min: 0, max: 20 },
  cycles:   { min: 2, max: 20 },
};

export default function BreathSettingsModal({ open, onClose }) {
  const { t } = useLang();
  const { customBreath, setCustomBreath, setBreathPatternId } = useApp();
  const { show: showToast } = useToast();

  const [draft, setDraft] = useState({ postHold: 0, ...customBreath });

  useEffect(() => {
    if (open) setDraft({ postHold: 0, ...customBreath });
  }, [open, customBreath]);

  const change = (key, delta) => {
    setDraft((prev) => {
      const next = prev[key] + delta;
      const r = RANGES[key];
      return { ...prev, [key]: Math.max(r.min, Math.min(r.max, next)) };
    });
  };

  const totalSec = (draft.inhale + (draft.hold || 0) + draft.exhale + (draft.postHold || 0)) * draft.cycles;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  const save = () => {
    setCustomBreath(draft);
    setBreathPatternId('custom');
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

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>{t('breathSettingsTitle')}</div>
      <div className={styles.sub}>{t('breathSettingsSub')}</div>

      <Stepper k="inhale"   label={t('breathInhaleLabel')} />
      <Stepper k="hold"     label={t('breathHoldLabel')} />
      <Stepper k="exhale"   label={t('breathExhaleLabel')} />
      <Stepper k="postHold" label={t('breathPostHoldLabel')} />
      <Stepper k="cycles"   label={t('breathCyclesLabel')} />

      <div className={styles.preview}>
        {draft.inhale}-{draft.hold}-{draft.exhale}-{draft.postHold ?? 0} × {draft.cycles} = {min}:{sec < 10 ? '0' : ''}{sec}
      </div>

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
