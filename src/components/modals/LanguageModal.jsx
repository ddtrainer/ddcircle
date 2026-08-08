import { useLang } from '../../i18n/LangContext';
import { LOCALES } from '../../i18n/locales';
import Modal from './Modal';
import styles from './LanguageModal.module.css';

// 언어 선택 전용 화면 — 다른 앱들의 "국가/언어 선택" 화면처럼 세로 리스트로 표시.
// 영어 이름 알파벳순(LOCALES 정렬 기준)으로 나열하고, 현재 언어는 체크 표시.
// 선택하면 즉시 적용 후 이 화면을 닫고 설정으로 돌아간다.
export default function LanguageModal({ open, onClose }) {
  const { lang, setLang, t } = useLang();

  const select = (code) => {
    setLang(code);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.title}>{t('languageLabel')}</div>
      <div className={styles.list}>
        {LOCALES.map((l) => (
          <button
            key={l.code}
            className={styles.row}
            onClick={() => select(l.code)}
          >
            <span className={styles.icon}>🌐</span>
            <span className={styles.label} lang={l.code} dir={l.dir}>{l.label}</span>
            {lang === l.code && <span className={styles.check}>✓</span>}
          </button>
        ))}
      </div>
    </Modal>
  );
}
