import { useLang } from '../../i18n/LangContext';
import Modal from './Modal';
import styles from './WimHofSafetyModal.module.css';

// 윔호프(면역력 강화) 호흡 최초 선택 시 안전 동의 게이트.
// "확인했습니다" 동의해야 진입 가능. 문구는 기존 가이드 안전 안내와 동일.
export default function WimHofSafetyModal({ open, onClose, onConfirm }) {
  const { lang } = useLang();
  const L = (ko, en) => (lang === 'ko' ? ko : en);

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.wrap}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>
          {L('안전 안내 — 면역력 강화 호흡(윔호프)', 'Safety Notice — Immunity Boost Breath (Wim Hof)')}
        </h2>
        <p className={styles.body}>
          {L('반드시 앉거나 누운 상태에서 실시하세요. 어지러움이 발생할 수 있으므로 물속, 운전 중, 서 있는 상태에서는 절대 금지입니다.',
             'Always practice sitting or lying down. It can cause dizziness — never do it in water, while driving, or standing.')}
        </p>
        <button className={styles.confirm} onClick={onConfirm}>
          {L('확인했습니다', 'I understand')}
        </button>
        <button className={styles.cancel} onClick={onClose}>
          {L('다른 호흡 선택', 'Pick another')}
        </button>
      </div>
    </Modal>
  );
}
