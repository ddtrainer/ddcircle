// Pi 결제 (U2A) — 후원/팁. 사용자가 금액을 골라 앱에 Pi를 보낸다.
// 참고: https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Payments
// 상품 일관성(프론트 요청 ↔ 백엔드 검증): product='tip', memo, metadata.app='ddcircle'.
import { initPi, authenticateWithPi } from './piAuth';

export const TIP_PRODUCT = 'tip';
export const TIP_MEMO = 'DDCircle 후원 (팁)';
export const TIP_PRESETS = [1, 3, 10]; // 사용자 입력(팁형) 기본 버튼 (Pi)

async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`${url} failed (${res.status}) ${t}`);
  }
  return res.json();
}

const approveOnServer = (paymentId) => postJson('/api/payments/approve', { paymentId });
const completeOnServer = (paymentId, txid) => postJson('/api/payments/complete', { paymentId, txid });

// 후원 결제 생성. amount는 사용자가 고른 Pi 금액(팁형).
export async function createTip(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('invalid_amount');
  }
  const Pi = await initPi();          // Pi.init을 완전히 await 한 뒤에만 결제 생성
  await authenticateWithPi();         // payments 스코프 인증 보장 (createPayment 전제)

  return new Promise((resolve, reject) => {
    Pi.createPayment(
      {
        amount: value,
        memo: TIP_MEMO,
        metadata: { product: TIP_PRODUCT, app: 'ddcircle' },
      },
      {
        // 서버가 Pi API로 승인(Key 인증)
        onReadyForServerApproval: (paymentId) => {
          approveOnServer(paymentId).catch((e) => reject(e));
        },
        // 서버가 Pi API로 완료(txid 전달, Key 인증)
        onReadyForServerCompletion: (paymentId, txid) => {
          completeOnServer(paymentId, txid)
            .then(() => resolve({ paymentId, txid, amount: value }))
            .catch((e) => reject(e));
        },
        onCancel: (paymentId) => reject(new Error(`payment_cancelled:${paymentId}`)),
        onError: (error) => reject(error instanceof Error ? error : new Error(String(error))),
      }
    );
  });
}
