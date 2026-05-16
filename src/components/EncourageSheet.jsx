import { useState, useEffect } from 'react';
import { useLang } from '../i18n/LangContext';
import { ENCOURAGEMENTS } from '../data/encouragements';
import styles from './EncourageSheet.module.css';

// 친구에게 보낼 한 줄 응원 메시지 선택 바텀시트
// open, friendName, onSelect(encId), onClose
// encId 형태:
//  - 프리셋: 'today_great', 'together' 등
//  - 커스텀: 'custom:사용자가 입력한 텍스트'
const MAX_CUSTOM_LEN = 15;

export default function EncourageSheet({ open, friendName, onSelect, onClose }) {
  const { t } = useLang();
  const [custom, setCustom] = useState('');

  // 시트가 닫힐 때 입력값 초기화
  useEffect(() => {
    if (!open) setCustom('');
  }, [open]);

  if (!open) return null;

  const customTrimmed = custom.trim();
  const canSendCustom = customTrimmed.length > 0 && customTrimmed.length <= MAX_CUSTOM_LEN;

  const handleSendCustom = () => {
    if (!canSendCustom) return;
    onSelect(`custom:${customTrimmed}`);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.title}>
          {t('encSheetTitle').replace('{name}', friendName || '')}
        </div>
        <div className={styles.sub}>{t('encSheetSub')}</div>
        <div className={styles.grid}>
          {ENCOURAGEMENTS.map((e) => (
            <button
              key={e.id}
              className={styles.card}
              onClick={() => onSelect(e.id)}
            >
              <span className={styles.cardEmoji}>{e.emoji}</span>
              <span className={styles.cardText}>{t(e.textKey)}</span>
            </button>
          ))}
        </div>

        {/* 직접 쓰기 — 15자 이내 */}
        <div className={styles.customDivider}>
          <span>{t('customEncDivider')}</span>
        </div>
        <div className={styles.customRow}>
          <input
            className={styles.customInput}
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value.slice(0, MAX_CUSTOM_LEN))}
            placeholder={t('customEncPlaceholder')}
            maxLength={MAX_CUSTOM_LEN}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSendCustom) handleSendCustom();
            }}
          />
          <button
            className={styles.customSendBtn}
            onClick={handleSendCustom}
            disabled={!canSendCustom}
          >
            {t('customEncSendBtn')}
          </button>
        </div>
        <div className={styles.customCounter}>
          {customTrimmed.length} / {MAX_CUSTOM_LEN}
        </div>
      </div>
    </div>
  );
}
