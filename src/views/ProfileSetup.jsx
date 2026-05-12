import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLang } from '../i18n/LangContext';
import { supabase } from '../lib/supabase';
import { applyWelcomeBonus } from '../lib/stats';
import { useToast } from '../components/Toast';
import styles from './ProfileSetup.module.css';

const WELCOME_EP = 20;

const EMOJIS = [
  '🌸', '🌷', '🌹', '🌻', '🌼', '🪷',
  '🐶', '🐱', '🐰', '🐻', '🦊', '🐼',
  '🦋', '🐢', '🐧', '🦁',
];

const GRADIENTS = [
  'linear-gradient(135deg,#fde2e4,#fad2e1)',
  'linear-gradient(135deg,#e2f0cb,#d4f1f4)',
  'linear-gradient(135deg,#fff1ba,#ffe5b4)',
  'linear-gradient(135deg,#cdb4db,#ffc8dd)',
  'linear-gradient(135deg,#bde0fe,#a2d2ff)',
  'linear-gradient(135deg,#caffbf,#9bf6ff)',
  'linear-gradient(135deg,#ffd6a5,#fdffb6)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
];

export default function ProfileSetup({ mode = 'setup' }) {
  const isEdit = mode === 'edit';
  const { user, profile, refreshProfile } = useAuth();
  const { setUserEp } = useApp();
  const { t } = useLang();
  const { show: showToast } = useToast();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [emoji, setEmoji] = useState(profile?.emoji ?? '🌸');
  const [emojiBg, setEmojiBg] = useState(profile?.emoji_bg ?? GRADIENTS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      setError(t('profileNicknameError'));
      return;
    }
    setError('');
    setSaving(true);
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ nickname: trimmed, emoji, emoji_bg: emojiBg })
        .eq('id', user.id);

      if (dbError) throw dbError;

      if (!isEdit) {
        localStorage.setItem(`ddcircle.setup.${user.id}`, '1');

        // 환영 EP 1회 지급
        const welcomeKey = `ddcircle.welcomeGiven.${user.id}`;
        if (!localStorage.getItem(welcomeKey)) {
          const ok = await applyWelcomeBonus(user.id, WELCOME_EP);
          if (ok) {
            localStorage.setItem(welcomeKey, '1');
            setUserEp((prev) => ({
              ...prev,
              total: (prev.total || 0) + WELCOME_EP,
              today: (prev.today || 0) + WELCOME_EP,
              thisMonth: (prev.thisMonth || 0) + WELCOME_EP,
            }));
            setTimeout(() => showToast('🎁', t('welcomeBonusToast').replace('{n}', WELCOME_EP)), 600);
          }
        }
      } else {
        showToast('✨', t('profileEditSaved'));
      }

      await refreshProfile();
      if (isEdit) navigate(-1);
      else navigate('/', { replace: true });
    } catch (e) {
      console.error('[profile-setup] save error:', e);
      showToast('⚠️', '저장에 실패했어요. 다시 시도해주세요.');
      setSaving(false);
    }
  };

  return (
    <div className={styles.screen}>
      {isEdit && (
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="back"
        >
          ←
        </button>
      )}
      <h1 className={styles.title}>{isEdit ? t('profileEditTitle') : t('profileSetupTitle')}</h1>
      <p className={styles.sub}>{isEdit ? t('profileEditSub') : t('profileSetupSub')}</p>

      <div className={styles.avatar} style={{ background: emojiBg }}>
        {emoji}
      </div>

      <section className={styles.section}>
        <label className={styles.label}>{t('profileEmojiLabel')}</label>
        <div className={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              className={`${styles.emojiBtn} ${e === emoji ? styles.selected : ''}`}
              onClick={() => setEmoji(e)}
              type="button"
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <label className={styles.label}>{t('profileBgLabel')}</label>
        <div className={styles.bgRow}>
          {GRADIENTS.map((g) => (
            <button
              key={g}
              className={`${styles.bgBtn} ${g === emojiBg ? styles.selected : ''}`}
              style={{ background: g }}
              onClick={() => setEmojiBg(g)}
              type="button"
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <label className={styles.label} htmlFor="nickname">
          {t('profileNicknameLabel')}
        </label>
        <input
          id="nickname"
          className={styles.input}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('profileNicknamePlaceholder')}
          maxLength={20}
        />
        {error && <p className={styles.error}>{error}</p>}
      </section>

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? t('profileSaving') : (isEdit ? t('profileEditSaveBtn') : t('profileSaveBtn'))}
      </button>
    </div>
  );
}
