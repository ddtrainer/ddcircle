import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { useToast } from '../Toast';
import { createTip, TIP_PRESETS } from '../../lib/piPayments';
import Modal from './Modal';
import styles from './PiTipModal.module.css';

// Pi 후원(팁) — U2A 결제. 금액은 사용자 입력(프리셋 + 직접 입력).
export default function PiTipModal({ open, onClose }) {
  const { lang } = useLang();
  const { show: showToast } = useToast();
  const L = (ko, en) => (lang === 'ko' ? ko : en);

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
      showToast('💜', L(`후원 완료! ${r.amount} Pi 감사합니다`, `Thanks for the ${r.amount} Pi tip!`));
      onClose?.();
    } catch (e) {
      const msg = String(e && e.message);
      if (/cancel/i.test(msg)) {
        showToast('🙂', L('후원을 취소했어요', 'Tip cancelled'));
      } else if (/Pi Browser|unavailable/i.test(msg)) {
        showToast('💡', L('Pi Browser에서 후원할 수 있어요', 'Tipping works in the Pi Browser'));
      } else {
        showToast('⚠️', L('후원에 실패했어요. 잠시 후 다시 시도해주세요', 'Tip failed. Please try again.'));
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>💜 {L('Pi로 후원하기', 'Support with Pi')}</div>
      <div className={styles.sub}>
        {L('DDCircle을 응원해 주세요. 원하는 만큼 Pi로 보낼 수 있어요.',
           'Cheer DDCircle on — send any amount in Pi.')}
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
        <span className={styles.customLabel}>{L('직접 입력', 'Custom')}</span>
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
        {paying ? L('결제 중…', 'Processing…') : L(`${valid ? value : 0} Pi 후원하기`, `Tip ${valid ? value : 0} Pi`)}
      </button>
    </Modal>
  );
}
