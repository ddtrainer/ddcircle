// POST /api/payments/approve  { paymentId }
// Pi 결제 승인(서버-서버). 결제가 이 앱의 'tip' 상품인지 검증 후 승인.
// Pi 결제 엔드포인트는 Authorization: Key <PI_NETWORK_API_KEY> 가 필요하다(인증과 달리 API 키 필수).
const PI_API = 'https://api.minepi.com/v2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const key = process.env.PI_NETWORK_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'server_misconfigured', detail: 'PI_NETWORK_API_KEY not set' });
  }
  const auth = `Key ${key}`;

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { body = {}; } }
  const paymentId = body && body.paymentId;
  if (!paymentId) return res.status(400).json({ error: 'missing_payment_id' });

  // 1) 결제 조회 → 이 앱의 tip 상품인지 검증(임의 결제 승인 방지)
  try {
    const lookup = await fetch(`${PI_API}/payments/${paymentId}`, { headers: { Authorization: auth } });
    if (!lookup.ok) return res.status(400).json({ error: 'payment_lookup_failed' });
    const payment = await lookup.json();
    const md = (payment && payment.metadata) || {};
    if (md.product !== 'tip' || md.app !== 'ddcircle') {
      return res.status(400).json({ error: 'unexpected_product' });
    }
  } catch {
    return res.status(502).json({ error: 'pi_api_unreachable' });
  }

  // 2) 승인
  try {
    const ap = await fetch(`${PI_API}/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { Authorization: auth },
    });
    if (!ap.ok) {
      const t = await ap.text().catch(() => '');
      return res.status(502).json({ error: 'approve_failed', detail: t });
    }
    return res.status(200).json(await ap.json());
  } catch {
    return res.status(502).json({ error: 'pi_api_unreachable' });
  }
}
