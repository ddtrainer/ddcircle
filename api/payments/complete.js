// POST /api/payments/complete  { paymentId, txid }
// Pi 결제 완료(서버-서버). Authorization: Key <PI_NETWORK_API_KEY> 필요.
// onReadyForServerCompletion 및 onIncompletePaymentFound 양쪽에서 호출된다.
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

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { body = {}; } }
  const paymentId = body && body.paymentId;
  const txid = body && body.txid;
  if (!paymentId) return res.status(400).json({ error: 'missing_payment_id' });

  try {
    const cp = await fetch(`${PI_API}/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ txid }),
    });
    if (!cp.ok) {
      const t = await cp.text().catch(() => '');
      return res.status(502).json({ error: 'complete_failed', detail: t });
    }
    return res.status(200).json(await cp.json());
  } catch {
    return res.status(502).json({ error: 'pi_api_unreachable' });
  }
}
