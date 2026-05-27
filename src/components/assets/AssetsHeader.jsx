import { useLang } from '../../i18n/LangContext';
import BookShelf from './BookShelf';
import styles from './AssetsHeader.module.css';

// 자산 탭 상단 — 책장 + EP/배지 잔액 + NFT 예고
// Pi Apps 출시 후 NFT 자산 카드가 활성화됨 (지금은 잠금)
export default function AssetsHeader({
  posts = [],
  ownerName = '',
  totalEp = 0,
  badgeCount = 0,
}) {
  const { t, lang } = useLang();

  return (
    <div className={styles.wrap}>
      {/* 책장 — 메인 자산 */}
      <BookShelf posts={posts} ownerName={ownerName} />

      {/* 자산 요약 — EP / 배지 / NFT(예고) */}
      <div className={styles.assetGrid}>
        <div className={styles.assetCard}>
          <div className={styles.assetIcon}>⚡</div>
          <div className={styles.assetValue}>{totalEp.toLocaleString()}</div>
          <div className={styles.assetLabel}>{t('assetEpLabel')}</div>
        </div>
        <div className={styles.assetCard}>
          <div className={styles.assetIcon}>🏆</div>
          <div className={styles.assetValue}>{badgeCount}</div>
          <div className={styles.assetLabel}>{t('assetBadgeLabel')}</div>
        </div>
        <div className={`${styles.assetCard} ${styles.locked}`}>
          <div className={styles.assetIcon}>🔒</div>
          <div className={styles.assetValue}>—</div>
          <div className={styles.assetLabel}>{t('assetNftLabel')}</div>
          <div className={styles.comingSoon}>{t('assetNftSoon')}</div>
        </div>
      </div>
    </div>
  );
}
