import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import ProgressDots from '../components/ProgressDots';
import { track, Events } from '../utils/analytics';
import styles from './Proof.module.css';

// Proof of Life — 셀카 사진 1장 캡처 (선택사항)
// 단계: idle → ready (카메라 켜짐) → done (캡처 완료)
export default function Proof() {
  const { t } = useLang();
  const { setProofBlob } = useApp();
  const { show: showToast } = useToast();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  };

  // 신규 순서: Proof 완료 후 → 바로 Complete (호흡은 운동 전에 이미 끝남)
  const goNext = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    stopCamera();
    navigate('/complete', { replace: true });
  };

  const handleSkip = () => { track(Events.PROOF_SKIPPED); goNext(); };

  const handleMainClick = async () => {
    if (phase === 'idle') {
      if (!navigator.mediaDevices?.getUserMedia) {
        showToast('⚠️', t('camUnsupported'));
        return;
      }
      try {
        // ideal 사용 — 특정 해상도가 없는 기종에서 OverconstrainedError 회피
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPhase('ready');
      } catch (e) {
        // 에러 종류별 안내 — iOS는 한 번 거부하면 재요청 불가, 설정 가는 법 안내 필요
        const name = e?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          showToast('🔒', t('camDeniedHelp'));
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          showToast('⚠️', t('camNotFound'));
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          showToast('⚠️', t('camInUse'));
        } else {
          showToast('⚠️', t('camDenied'));
        }
      }
      return;
    }

    if (phase === 'ready') {
      capturePhoto();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    // 셀카 미러링 반영
    ctx.translate(640, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 640);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setProofBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        track(Events.PROOF_RECORDED, { size: blob.size });
        showToast('✦', t('proofDone'));
        setPhase('done');
        setTimeout(goNext, 800);
      },
      'image/jpeg',
      0.85,
    );
  };

  const mainBtnLabel =
    phase === 'idle' ? t('cameraOn') :
    phase === 'ready' ? t('recordStart') :
    '✓';

  const showVideo = phase === 'ready';
  const showPreview = phase === 'done' && previewUrl;

  return (
    <div className={styles.proofScreen}>
      <ProgressDots step={3} total={4} />
      <div className={styles.stage}>STEP 3 OF 4</div>
      <div className={`${styles.title} ${styles.proofColor}`}>✊ Proof of Life</div>
      <div
        className={styles.desc}
        dangerouslySetInnerHTML={{ __html: t('proofDesc') }}
      />
      <div className={styles.noEdit}>{t('proofNoEdit')}</div>
      {/* 운동 직후 호흡 정리 안내 — 신규 흐름(호흡→운동→셀카)에서 셀카 직전 cool-down 신호 */}
      {phase === 'idle' && (
        <div className={styles.breathHint}>{t('proofBreathHint')}</div>
      )}

      <div className={styles.cameraZone}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ display: showVideo ? 'block' : 'none' }}
        />
        {showPreview && (
          <img src={previewUrl} alt="proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {phase === 'idle' && (
          <div className={styles.placeholder}>
            <div className={styles.camIcon}>✊</div>
            <p dangerouslySetInnerHTML={{ __html: t('proofPlaceholder') }} />
          </div>
        )}
      </div>

      <button
        className={styles.captureBtn}
        onClick={handleMainClick}
        disabled={phase === 'done'}
      >
        {mainBtnLabel}
      </button>
      <button className={styles.captureSkip} onClick={handleSkip}>
        {t('proofSkip')}
      </button>
    </div>
  );
}
