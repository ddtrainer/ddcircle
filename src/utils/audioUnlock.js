// iOS Safari는 사용자 제스처 콜스택 안에서 호출된 audio.play() 만 허용.
// "탭하여 시작" 같은 진입 탭 시점에 silent 오디오를 한 번 재생해 두면
// 그 세션 동안 이후 자동 재생되는 종소리/배경음(useBreathSound 등)이
// 묵음으로 거부되지 않음.

let unlocked = false;

export function unlockAudio() {
  if (unlocked) return;
  if (typeof window === 'undefined') return;

  try {
    // 1) HTMLAudioElement 경로 — 일반 <audio> 태그용 unlock
    const a = new Audio(
      // ~0.05초 silent WAV (data URI, base64)
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    );
    a.muted = true;
    a.play().then(() => { a.pause(); }).catch(() => { /* ignore */ });

    // 2) WebAudio 경로 — AudioContext가 suspended 상태면 resume
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      const ctx = new AC();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => { /* ignore */ });
      }
      // empty buffer 재생으로 활성화
      const buffer = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      try { src.start(0); } catch { /* ignore */ }
    }

    unlocked = true;
  } catch {
    /* silent — 다음 탭에서 재시도됨 */
  }
}

export function isAudioUnlocked() { return unlocked; }
