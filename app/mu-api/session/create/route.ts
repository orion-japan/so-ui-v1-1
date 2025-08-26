// app/mu-api/session/create/route.ts
import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { supabaseServer } from '@/lib/supabaseServer'

export const runtime = 'nodejs'
export const revalidate = 0

export async function POST(req: Request) {
  console.log('[MU_LOG] [session/create] API開始')

  try {
    const body = await req.json().catch(() => null)
    console.log('[MU_LOG] 受信データ:', JSON.stringify(body))

    // idToken または user_code を受け取る
    const idToken = body?.idToken || body?.auth?.idToken
    const userCodeFromBody = body?.user_code
    const payload = body?.payload || {}

    if (!idToken && !userCodeFromBody) {
      console.error('[MU_LOG] ❌ idToken か user_code が必要')
      return NextResponse.json({ error: 'idToken or user_code is required' }, { status: 400 })
    }

    let userCode = userCodeFromBody

    // idTokenがあればFirebase→Supabaseでuser_code取得
    if (idToken) {
      console.log('[MU_LOG] 🔍 Firebaseトークン検証開始')
      const decoded = await adminAuth.verifyIdToken(idToken, true)
      console.log('[MU_LOG] ✅ Firebaseトークン検証OK:', decoded.uid)

      console.log('[MU_LOG] 🔍 Supabaseクエリ開始')
      const { data, error } = await supabaseServer
        .from('users')
        .select('user_code')
        .eq('firebase_uid', decoded.uid)
        .maybeSingle()

      if (error) {
        console.error('[MU_LOG] ❌ Supabaseエラー:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      if (!data?.user_code) {
        console.error('[MU_LOG] ❌ user_code 見つからず')
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      userCode = data.user_code
    }

    console.log('[MU_LOG] ✅ user_code確定:', userCode)
    console.log('[MU_LOG] payload:', payload)

    // ログインURL生成
    const loginUrl = `https://m.muverse.jp?user_code=${encodeURIComponent(userCode)}`
    console.log('[MU_LOG] ✅ ログインURL生成:', loginUrl)

    console.log('[MU_LOG] [session/create] API終了')
    return NextResponse.json(
      {
        status: 'ok',
        login_url: loginUrl,
        user_code: userCode,
        payload
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[MU_LOG] ❌ 例外発生:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
