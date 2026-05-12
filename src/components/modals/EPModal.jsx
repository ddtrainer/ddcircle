import { useLang } from '../../i18n/LangContext';
import { useApp } from '../../context/AppContext';
import { TREE_LEVELS, getCurrentLevel } from '../../data/treeLevels';
import Modal from './Modal';
import styles from './EPModal.module.css';

// EP 시스템 안내 모달 — 점수표 + 멀티플라이어 + 트리 레벨 + DDT 전환
export default function EPModal({ open, onClose }) {
  const { t } = useLang();
  const { userEp } = useApp();
  const curId = getCurrentLevel(userEp.total).id;

  const formatRange = (l) =>
    l.max >= 999999
      ? `${l.min.toLocaleString()}+ EP`
      : `${l.min.toLocaleString()} ~ ${(l.max - 1).toLocaleString()} EP`;

  return (
    <Modal open={open} onClose={onClose} cardClassName={styles.epCard}>
      <div className={styles.title}>{t('epModalTitle')}</div>
      <div className={styles.sub}>{t('epModalSub')}</div>

      {/* 기본 점수 */}
      <div className={styles.sectionTitle}>{t('basicScoring')}</div>
      <div className={styles.scoringTable}>
        <Row label={t('dashCompleteShort')} pts="+10" />
        <Row label={t('deepCompleteShort')} pts="+15" />
        <Row label={t('fullSetShort')} pts="+5" />
        <Row label={t('proofShort')} pts="+5" />
        <Row label={t('shareShort')} pts="+5" />
        <Row label={t('empathySendShort')} pts={t('epPerTime')} />
        <Row label={t('empathyRecvShort')} pts={t('epPerHalfTime')} />
        <Row label={t('nudgeShort')} pts={t('epPerPerson')} />
      </div>

      {/* 멀티플라이어 */}
      <div className={styles.sectionTitle}>{t('multiplierBonusTitle')}</div>
      <div className={styles.scoringTable}>
        <Row label={t('streak7')} pts="×1.1" />
        <Row label={t('streak14m')} pts="×1.2" />
        <Row label={t('streak30')} pts="×1.3" />
        <Row label={t('streak100')} pts="×1.5" />
        <Row label={t('setTimingBonus')} pts="×1.2" />
        <Row label={t('syncBonus')} pts="×1.15" />
      </div>

      {/* 트리 레벨 */}
      <div className={styles.sectionTitle}>{t('treeLevelTitle')}</div>
      <div className={styles.levelList}>
        {TREE_LEVELS.map((l) => {
          const isCur = l.id === curId;
          return (
            <div
              key={l.id}
              className={`${styles.levelItem} ${isCur ? styles.current : ''}`}
            >
              <div className={styles.levelEmoji}>{l.emoji}</div>
              <div className={styles.levelInfo}>
                <div className={styles.levelName}>
                  {t(l.key)}
                  {isCur && ` ← ${t('currentLevelMark')}`}
                </div>
                <div className={styles.levelRange}>{formatRange(l)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DDT 전환 */}
      <div className={styles.sectionTitle}>{t('ddtConversionTitle')}</div>
      <div
        className={styles.ddtBox}
        dangerouslySetInnerHTML={{ __html: t('ddtConversionDesc') }}
      />
    </Modal>
  );
}

function Row({ label, pts }) {
  return (
    <div className={styles.scoringRow}>
      <span>{label}</span>
      <span className={styles.pts}>{pts}</span>
    </div>
  );
}
