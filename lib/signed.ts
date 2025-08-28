// src/lib/signed.ts
import crypto from 'crypto'

/**
 * 署名パラメータを生成する
 * @param userCode ユーザーコード (uc-xxxx)
 * @param secret 環境変数に設定した共有シークレット
 */
export function makeSignedParams(userCode: string, secret: string) {
  if (!secret) throw new Error('shared secret is missing')

  // Unix 時刻（秒）
  const ts = Math.floor(Date.now() / 1000)

  // HMAC-SHA256(userCode + ts)
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${userCode}:${ts}`)
  const sig = hmac.digest('hex')

  return { ts, sig }
}

/**
 * 検証用（必要なら）
 */
export function verifySignedParams(
  userCode: string,
  ts: number,
  sig: string,
  secret: string,
  toleranceSec = 300
) {
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > toleranceSec) return false

  const { sig: expected } = makeSignedParams(userCode, secret)
  return expected === sig
}
