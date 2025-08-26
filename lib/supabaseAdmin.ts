// サーバ専用。誤ってクライアントにバンドルされないようにする
import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * service_role を使う管理クライアント（API ルート・サーバコンポーネント専用）
 * ※ クライアントからは絶対に import しないこと
 */
function required(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`[supabaseAdmin] Missing env: ${name}`)
  return v
}

const SUPABASE_URL = required('SUPABASE_URL')
const SERVICE_ROLE  = required('SUPABASE_SERVICE_ROLE_KEY')

// 直 import された場合に即検知（クライアントで使われたらエラー）
if (typeof window !== 'undefined') {
  throw new Error('[supabaseAdmin] Must not be imported on the client')
}

// 使い回し（ホットリロードでも単一化）
let _admin: ReturnType<typeof createClient> | null = (global as any).__supabase_admin__ ?? null

if (!_admin) {
  _admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },       // サーバでは不要
    global: { headers: { 'X-Client-Info': 'mu-ui-v1-0-5' } }, // 任意の識別子
  })
  ;(global as any).__supabase_admin__ = _admin
}

export const supabaseAdmin = _admin!
