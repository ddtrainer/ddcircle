import { NavLink } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const { t } = useLang();

  const items = [
    { to: '/', icon: '🏠', label: t('navHomeLabel'), end: true },
    { to: '/wall', icon: '💙', label: t('navWallLabel') },
    { to: '/grow', icon: '🎯', label: t('navGrowLabel') },
    { to: '/record', icon: '💎', label: t('navRecordLabel') },
  ];

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.inner}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.navBtn} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.icon}>{item.icon}</div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
