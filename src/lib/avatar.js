// 프로필 아바타 이미지 업로드/삭제 + 클라이언트 리사이즈
// Storage 경로 컨벤션: avatars/{user_id}/avatar.jpg (덮어쓰기 가능)
import { supabase } from './supabase';

const TARGET_SIZE = 256;      // 정사각 출력 크기
const TARGET_QUALITY = 0.82;  // JPEG 품질

// File/Blob → 256×256 정사각 JPEG Blob (중앙 크롭 + 리사이즈)
export async function processAvatar(file) {
  if (!file) return null;
  const img = await loadImage(URL.createObjectURL(file));
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext('2d');

  // 중앙 정사각 크롭 — 짧은 변 기준
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')),
      'image/jpeg',
      TARGET_QUALITY,
    );
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

// 업로드 후 public URL 반환 (cache-buster query 포함)
export async function uploadAvatar(userId, blob) {
  if (!userId || !blob) throw new Error('uploadAvatar: missing args');
  const path = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,           // 같은 경로 덮어쓰기
      cacheControl: '3600',
    });
  if (error) {
    console.error('[avatar] upload error:', error);
    throw error;
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // CDN/브라우저 캐시 무효화 — 같은 URL이라도 새 사진 즉시 반영
  return `${data.publicUrl}?v=${Date.now()}`;
}

// 본인 아바타 파일 삭제 (profile.avatar_url도 null로 만드는 건 호출자 책임)
export async function deleteAvatar(userId) {
  if (!userId) return;
  const path = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage.from('avatars').remove([path]);
  if (error) {
    console.warn('[avatar] delete error (ignored):', error);
  }
}
