import crypto from 'crypto';

/**
 * user_code に基づいて ts, sig を生成
 * - ts: UNIX秒タイムスタンプ
 * - sig: HMAC-SHA256(user_code + ts, secret)
 */
export function makeSignedParams(user_code: string, secret: string) {
  const ts = Math.floor(Date.now() / 1000);
  const raw = `${user_code}.${ts}`;
  const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return { ts, sig };
}

/**
 * 署名検証ユーティリティ
 * @returns boolean
 */
export function verifySignedParams(
  user_code: string,
  ts: number,
  sig: string,
  secret: string,
  maxAgeSec = 60 * 60 * 24 // 24h デフォルト有効期限
) {
  if (!user_code || !ts || !sig) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now - ts > maxAgeSec) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${user_code}.${ts}`)
    .digest('hex');
  return expected === sig;
}
