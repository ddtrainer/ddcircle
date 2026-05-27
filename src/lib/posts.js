import { supabase } from './supabase';

// Supabase 포스트 row → Wall에서 쓰는 로컬 포맷으로 정규화
export function normalizePost(row) {
  if (!row) return null;
  return {
    id: row.id,
    ts: new Date(row.created_at).getTime(),
    mood: row.mood,
    msg: row.message,
    target: row.target === 'me' ? 'private' : row.target, // DB → 로컬 매핑
    exerciseId: row.exercise_id,
    breathId: row.breath_id,
    proofUrl: row.proof_url,
    hasProof: row.has_proof,
    userId: row.user_id,
    profile: row.profiles || null,
    isRemote: true,
  };
}

// Storage에 셀카 업로드 → 공개 URL 반환
// 경로: proofs/{userId}/{timestamp}.jpg  (RLS와 일치 — 첫 폴더가 user.id)
export async function uploadProofImage(userId, blob) {
  if (!userId || !blob) return null;
  const ext = (blob.type && blob.type.split('/')[1]) || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('proofs')
    .upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });
  if (error) {
    console.error('[posts] upload error:', error);
    throw error;
  }
  const { data } = supabase.storage.from('proofs').getPublicUrl(path);
  return data.publicUrl;
}

// 게시물 생성 (proofBlob이 있으면 먼저 업로드)
// data: { message, mood, target, exerciseId, breathId, proofBlob }
// 반환: { ...row, proofUploadFailed?: true } — 글은 저장됐지만 사진 업로드 실패 시 플래그
export async function createPost(userId, data) {
  if (!userId) throw new Error('not authenticated');

  let proofUrl = null;
  let proofUploadFailed = false;
  if (data.proofBlob) {
    try {
      proofUrl = await uploadProofImage(userId, data.proofBlob);
    } catch (e) {
      // 업로드 실패해도 글은 저장 (사진 없이). 호출자가 사용자에게 알릴 수 있도록 플래그.
      console.error('[posts] proof upload failed:', e);
      proofUploadFailed = true;
    }
  }

  // 로컬 'private' → DB 'me' 매핑
  const target = data.target === 'private' ? 'me' : (data.target || 'circle');

  const insertRow = {
    user_id: userId,
    message: data.message || '',
    mood: data.mood || null,
    target,
    exercise_id: data.exerciseId || null,
    breath_id: data.breathId || null,
    proof_url: proofUrl,
    has_proof: !!proofUrl,
  };

  const { data: post, error } = await supabase
    .from('posts')
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    console.error('[posts] insert error:', error);
    throw error;
  }
  return { ...post, proofUploadFailed };
}

// 게시물 삭제 (본인 게시물만 — RLS가 강제)
// proofUrl이 있으면 Storage의 셀카 파일도 함께 삭제
export async function deletePost(postId, proofUrl = null) {
  if (!postId) return { ok: false, reason: 'no postId' };

  // 1) Storage의 셀카 사진 먼저 제거 (실패해도 DB 삭제는 진행)
  if (proofUrl) {
    try {
      // publicUrl 형식: .../storage/v1/object/public/proofs/{userId}/{timestamp}.{ext}
      const match = proofUrl.match(/\/proofs\/(.+)$/);
      const path = match?.[1];
      if (path) {
        const { error: sErr } = await supabase.storage.from('proofs').remove([path]);
        if (sErr) console.warn('[posts] storage delete failed (ignored):', sErr);
      }
    } catch (e) {
      console.warn('[posts] proof path parse failed (ignored):', e);
    }
  }

  // 2) DB row 삭제 (RLS: 본인 user_id와 일치하는 row만 가능)
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) {
    console.error('[posts] delete error:', error);
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}

// 본인 게시물 최근 N개
export async function fetchMyPosts(userId, limit = 30) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[posts] fetchMyPosts error:', error);
    return [];
  }
  return data || [];
}

// 서클 피드: 본인 모든 게시물 + 친구의 'circle'/'public' 게시물
// .neq('target','me') 제거 — 본인의 'me'(나만 보기) 게시물도 본인 피드엔 노출되어야 함.
// 친구의 'me' 게시물은 RLS가 자동으로 차단하므로 안전.
// 카드에 'private' 표식이 붙어 본인에게도 시각적으로 구분됨.
export async function fetchCircleFeed(limit = 50) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles:user_id (id, nickname, emoji, emoji_bg)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[posts] fetchCircleFeed error:', error);
    return [];
  }
  return data || [];
}

// 글로벌 피드 — public만
export async function fetchPublicFeed(limit = 50) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles:user_id (id, nickname, emoji, emoji_bg)')
    .eq('target', 'public')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[posts] fetchPublicFeed error:', error);
    return [];
  }
  return data || [];
}
