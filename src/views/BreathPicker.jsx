import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { BREATH_MODES, BREATH_MODE_MULTIPLIER, wimHofSafetyAcked, ackWimHofSafety } from '../data/breathPatterns';
import { unlockAudio } from '../utils/audioUnlock';
import WimHofSafetyModal from '../components/modals/WimHofSafetyModal';
import BreathSettingsModal from '../components/modals/BreathSettingsModal';
import GuideModal from '../components/modals/GuideModal';
import styles from './ExercisePicker.module.css';

// 호흡 종목 ↔ 가이드(DEEP_GUIDE) 매핑: 자연1 / 신경안정2 / 멘탈강화3 / 면역력4
const MODE_GUIDE_LEVEL = { '48': 1, '478': 2, '4444': 3, custom: 4 };

// Deep 호흡 4종 자유 선택 (v2.3) — 레벨 잠금 폐지. Dash ExercisePicker와 동일 카드형.
// 윔호프(면역력 강화)는 최초 1회 안전 동의 게이트를 거쳐야 진입.
export default function BreathPicker() {
  const { t, lang } = useLang();
  const { setBreathPatternId } = useApp();
  const navigate = useNavigate();
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState(null); // 'natural' | 'wimhof' | null
  const [guideMode, setGuideMode] = useState(null); // 가이드 열 호흡 모드(m) 또는 null

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

  // 방법·효과 가이드 열기 — 카드 탭(바로 시작)과 분리 (stopPropagation)
  const openGuide = (m, e) => {
    e.stopPropagation();
    setGuideMode(m);
  };

  const chipStyle = {
    fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
    background: 'var(--surface2, #fdf9f0)', border: '1px solid var(--border)',
    borderRadius: 999, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
  };
  const actionsStyle = {
    marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
  };

  return (
    <div className={styles.pickerScreen}>
      <div className={styles.title}>{t('pickBreathTitle')}</div>
      <div className={styles.sub}>
        {t('pickBreathSub')}
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
            <div className={styles.desc}>{t(m.descKey)}</div>
            <div style={actionsStyle}>
              <button type="button" style={chipStyle} onClick={(e) => openGuide(m, e)}>
                📖 {t('guideBtn')}
              </button>
              {m.settings && (
                <button type="button" style={chipStyle} onClick={(e) => openSettings(m, e)}>
                  ⚙ {t('settingsBtn')}
                </button>
              )}
            </div>
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
      <GuideModal
        open={guideMode !== null}
        track="deep"
        level={guideMode ? MODE_GUIDE_LEVEL[guideMode.id] : 1}
        mode={guideMode ? {
          emoji: guideMode.emoji,
          label: t(guideMode.labelKey),
          multiplier: BREATH_MODE_MULTIPLIER[guideMode.id],
        } : null}
        onClose={() => setGuideMode(null)}
      />
    </div>
  );
}
