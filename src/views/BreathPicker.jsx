import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { BREATH_MODES, wimHofSafetyAcked, ackWimHofSafety } from '../data/breathPatterns';
import { unlockAudio } from '../utils/audioUnlock';
import WimHofSafetyModal from '../components/modals/WimHofSafetyModal';
import BreathSettingsModal from '../components/modals/BreathSettingsModal';
import styles from './ExercisePicker.module.css';

// Deep 호흡 4종 자유 선택 (v2.3) — 레벨 잠금 폐지. Dash ExercisePicker와 동일 카드형.
// 윔호프(면역력 강화)는 최초 1회 안전 동의 게이트를 거쳐야 진입.
export default function BreathPicker() {
  const { t, lang } = useLang();
  const { setBreathPatternId } = useApp();
  const navigate = useNavigate();
  const L = (ko, en) => (lang === 'ko' ? ko : en);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState(null); // 'natural' | 'wimhof' | null

  const proceed = (id) => {
    setBreathPatternId(id);
    unlockAudio(); // iOS 오디오 unlock (제스처 콜스택 안)
    navigate('/countdown/deep');
  };

  const onSelect = (m) => {
    if (m.safety && !wimHofSafetyAcked()) { setSafetyOpen(true); return; }
    proceed(m.id);
  };

  const openSettings = (m, e) => {
    e.stopPropagation();
    setSettingsMode(m.settings); // 'natural' | 'wimhof'
  };

  const gearStyle = {
    marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
    background: 'var(--surface2, #fdf9f0)', border: '1px solid var(--border)',
    borderRadius: 999, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div className={styles.pickerScreen}>
      <div className={styles.title}>{L('오늘의 호흡을 골라요', "Pick today's breath")}</div>
      <div className={styles.sub}>
        {L('레벨 잠금 없이 컨디션에 맞게 자유롭게 선택하세요.',
           'Choose freely — no level locks.')}
      </div>

      <div className={styles.grid}>
        {BREATH_MODES.map((m) => (
          <div
            key={m.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(m)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(m); }}
          >
            <div className={styles.preview} style={{ fontSize: 44 }}>{m.emoji}</div>
            <div className={styles.name}>{t(m.labelKey)}</div>
            <div className={styles.desc}>{L(m.descKo, m.descEn)}</div>
            {m.settings && (
              <button type="button" style={gearStyle} onClick={(e) => openSettings(m, e)}>
                ⚙ {L('설정', 'Settings')}
              </button>
            )}
          </div>
        ))}
      </div>

      <WimHofSafetyModal
        open={safetyOpen}
        onClose={() => setSafetyOpen(false)}
        onConfirm={() => { ackWimHofSafety(); setSafetyOpen(false); proceed('custom'); }}
      />
      <BreathSettingsModal
        open={settingsMode !== null}
        mode={settingsMode || 'natural'}
        onClose={() => setSettingsMode(null)}
      />
    </div>
  );
}
