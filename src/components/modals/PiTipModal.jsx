import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useToast } from '../Toast';
import { createTip, TIP_PRESETS } from '../../lib/piPayments';
import Modal from './Modal';
import styles from './PiTipModal.module.css';

// Pi 후원(팁) — U2A 결제. 금액은 사용자 입력(프리셋 + 직접 입력).
export default function PiTipModal({ open, onClose }) {
  const { lang, t } = useLang();
  const { show: showToast } = useToast();

  const [amount, setAmount] = useState(TIP_PRESETS[0]);
  const [custom, setCustom] = useState('');
  const [paying, setPaying] = useState(false);

  const value = custom !== '' ? Number(custom) : amount;
  const valid = Number.isFinite(value) && value > 0;

  const send = async () => {
    if (!valid || paying) return;
    setPaying(true);
    try {
      const r = await createTip(value);
      showToast('💜', t('tipThanks', { n: r.amount }));
      onClose?.();
    } catch (e) {
      const msg = String(e && e.message);
      if (/cancel/i.test(msg)) {
        showToast('🙂', t('tipCancelled'));
      } else if (/Pi Browser|unavailable/i.test(msg)) {
        showToast('💡', t('tipPiBrowserOnly'));
      } else {
        showToast('⚠️', t('tipFailed'));
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>💜 {t('tipRowTitle')}</div>
      <div className={styles.sub}>
        {t('tipSub')}
      </div>

      <div className={styles.presets}>
        {TIP_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles.preset} ${custom === '' && amount === p ? styles.presetActive : ''}`}
            onClick={() => { setAmount(p); setCustom(''); }}
          >
            {p} π
          </button>
        ))}
      </div>

      <div className={styles.customRow}>
        <span className={styles.customLabel}>{t('tipCustom')}</span>
        <input
          type="number"
          min="0"
          step="0.1"
          inputMode="decimal"
          className={styles.customInput}
          placeholder="0"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <span className={styles.pi}>π</span>
      </div>

      <button className={styles.sendBtn} onClick={send} disabled={!valid || paying}>
        {paying ? t('tipProcessing') : t('tipSend', { n: valid ? value : 0 })}
      </button>
    </Modal>
  );
}
