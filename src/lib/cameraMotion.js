// 카메라 기반 움직임 측정 — 동작센서가 차단된 환경(Pi Browser의 cross-origin iframe)용 대체 수단.
//
// 원리: 폰을 쥐고 움직이면 카메라가 보는 장면이 흔들린다. 연속 프레임의 픽셀 차이를
//   '움직임 에너지'로 뽑아내면 걸음/뜀마다 리듬 있는 피크가 생긴다.
//   이 에너지를 기존 sprintDetector에 그대로 흘려보내 피크 감지·리듬 게이트를 재사용한다.
//   (detector의 addSample은 √(x²+y²+z²) − GRAVITY로 동적 가속을 구하므로
//    (GRAVITY + 에너지, 0, 0, ts)를 넣으면 dyn === 에너지가 된다. 감지 로직 무수정.)
//
// 프레임은 전부 메모리 안에서만 비교하고 즉시 버린다. 저장·전송·업로드 없음.
import { GRAVITY } from '../data/sprintConfig';

// 다운스케일 해상도 — 작을수록 가볍고, 미세한 손떨림 대신 '장면 전체의 흔들림'만 남는다.
const W = 32;
const H = 24;
const SAMPLE_HZ = 30;

// 카메라 스트림을 열고 프레임 차이를 onEnergy(energy, ts)로 흘려보낸다.
// 반환된 stop()을 부르면 타이머와 카메라 트랙을 모두 정리한다(셀카 화면에서 카메라 재사용 가능).
export async function startCameraMotion(onEnergy) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('camera_unsupported');

  // 후면 카메라 우선 — 손에 쥐었을 때 바깥 장면이 크게 흔들려 신호가 잘 잡힌다.
  // 후면이 없는 기기를 위해 실패 시 제약 없이 재시도.
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 320 }, height: { ideal: 240 } },
      audio: false,
    });
  } catch {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }

  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', ''); // iOS 인라인 재생(전체화면 전환 방지)
  await video.play();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  let prev = null;
  let timer = null;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    try {
      ctx.drawImage(video, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);
      // 그레이스케일 + 직전 프레임과의 평균 절대차 = 움직임 에너지(0~255)
      const cur = new Uint8Array(W * H);
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        cur[p] = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      }
      if (prev) {
        let sum = 0;
        for (let p = 0; p < cur.length; p++) sum += Math.abs(cur[p] - prev[p]);
        onEnergy(sum / cur.length, performance.now());
      }
      prev = cur;
    } catch { /* 프레임 한 장 실패는 무시하고 계속 */ }
  };

  timer = setInterval(tick, 1000 / SAMPLE_HZ);

  return function stop() {
    stopped = true;
    if (timer) clearInterval(timer);
    try { stream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    try { video.srcObject = null; } catch { /* ignore */ }
    prev = null;
  };
}

// 움직임 에너지를 detector가 먹는 (x,y,z) 형태로 변환.
// dyn = √(x²+y²+z²) − GRAVITY 이므로 x = GRAVITY + energy 면 dyn === energy.
export function energyToSample(energy) {
  return [GRAVITY + energy, 0, 0];
}
