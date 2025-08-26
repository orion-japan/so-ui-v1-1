import crypto from 'crypto'

/**
 * HMAC 署名検証（有効期限つき）
 * 署名対象は「ts」「user_code」の2つ（キー昇順で連結）。
 */
export function verifyTicket(params: { user_code?: string | null; ts?: string | null; sig?: string | null }) {
  const user_code = (params.user_code || '').trim()
  const ts = (params.ts || '').trim()
  const sig = (params.sig || '').trim()

  if (!user_code || !ts || !sig) return { ok: false, reason: 'missing' as const }

  // 有効期限: 15分（必要なら調整）
  const now = Math.floor(Date.now() / 1000)
  if (!/^\d+$/.test(ts) || Math.abs(now - Number(ts)) > 15 * 60) {
    return { ok: false, reason: 'expired' as const }
  }

  const secret = process.env.MU_SHARED_ACCESS_SECRET
  if (!secret) return { ok: false, reason: 'server-misconfig' as const }

  // 並び順は固定（キー昇順）: ts → user_code
  const base = `ts=${ts}&user_code=${user_code}`
  const expect = crypto.createHmac('sha256', secret).update(base).digest('hex')

  if (expect !== sig) return { ok: false, reason: 'bad-signature' as const }
  return { ok: true as const }
}
