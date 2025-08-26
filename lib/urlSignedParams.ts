export function getSignedParamsFromLocation() {
  if (typeof window === 'undefined') return ''
  const p = new URLSearchParams(window.location.search)
  // 必須3点だけ抜き出して順序保証
  const ts = p.get('ts') || ''
  const user_code = p.get('user_code') || ''
  const sig = p.get('sig') || ''
  const ordered = new URLSearchParams()
  if (ts) ordered.set('ts', ts)
  if (user_code) ordered.set('user_code', user_code)
  if (sig) ordered.set('sig', sig)
  return ordered.toString()
}
