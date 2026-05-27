import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLang } from '../i18n/LangContext';
import { supabase } from '../lib/supabase';
import { applyWelcomeBonus } from '../lib/stats';
import { uploadAvatar, deleteAvatar, processAvatar } from '../lib/avatar';
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
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // 갤러리에서 이미지 선택 → 클라이언트 리사이즈 → Storage 업로드 → URL 보관
  // (DB 저장은 handleSave에서 nickname/emoji와 함께 한 번에 처리)
  const handlePickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError('');
    setAvatarUploading(true);
    (async () => {
      try {
        const blob = await processAvatar(file);
        const url = await uploadAvatar(user.id, blob);
        setAvatarUrl(url);
      } catch (err) {
        console.error('[profile-setup] avatar upload failed:', err);
        showToast('⚠️', t('avatarUploadFailed'));
      } finally {
        setAvatarUploading(false);
        // input 리셋 — 같은 파일 다시 선택 가능
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    })();
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setAvatarUrl(null);
    // Storage 파일도 함께 정리 (실패해도 무시)
    try { await deleteAvatar(user.id); } catch {}
  };

  // 신규 설정 모드(/profile-setup)인데 이미 닉네임이 있으면 — 어떻게든 진입한
  // 경우라도 (예: 직접 URL 입력, 가드 레이스) 홈으로 돌려보냄
  useEffect(() => {
    if (!isEdit && profile?.nickname) {
      navigate('/', { replace: true });
    }
  }, [isEdit, profile?.nickname, navigate]);

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
        .update({ nickname: trimmed, emoji, emoji_bg: emojiBg, avatar_url: avatarUrl })
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

      {/* 아바타 미리보기 — 사진 있으면 사진, 없으면 이모지 + 배경 */}
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className={styles.avatarImg} />
      ) : (
        <div className={styles.avatar} style={{ background: emojiBg }}>
          {emoji}
        </div>
      )}

      {/* 사진 업로드 / 제거 컨트롤 */}
      <div className={styles.avatarActions}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePickFile}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
        >
          {avatarUploading ? t('avatarUploading') : (avatarUrl ? t('avatarChange') : t('avatarUpload'))}
        </button>
        {avatarUrl && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemoveAvatar}
            disabled={avatarUploading}
          >
            {t('avatarRemove')}
          </button>
        )}
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
