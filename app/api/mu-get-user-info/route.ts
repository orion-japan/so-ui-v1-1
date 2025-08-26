import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { supabaseServer } from '@/lib/supabaseServer'

export const runtime = 'nodejs'
export const revalidate = 0

export async function POST(req: Request) {
  console.log('[MU_LOG] [send-token] API開始')

  try {
    const body = await req.json().catch(() => null)
    console.log('[MU_LOG] 受信データ:', JSON.stringify(body))

    // ★ 修正: idTokenの取得を拡張
    const idToken = body?.idToken || body?.auth?.idToken
    if (!idToken) {
      console.error('[MU_LOG] ❌ idToken が未指定')
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 })
    }

    // Firebaseトークン検証
    const decoded = await adminAuth.verifyIdToken(idToken, true)
    console.log('[MU_LOG] ✅ Firebaseトークン検証成功:', decoded.uid)

    // Supabaseでユーザー情報取得
    const { data, error } = await supabaseServer
      .from('users')
      .select('user_code, click_email, card_registered, payjp_customer_id')
      .eq('firebase_uid', decoded.uid)
      .maybeSingle()

    if (error) {
      console.error('[MU_LOG] ❌ Supabaseエラー:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      console.error('[MU_LOG] ❌ ユーザー見つからず')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('[MU_LOG] ✅ ユーザー情報取得成功:', data)

    return NextResponse.json(
      {
        user_code: data.user_code,
        click_email: data.click_email,
        card_registered: data.card_registered,
        payjp_customer_id: data.payjp_customer_id,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[MU_LOG] ❌ 予期せぬエラー:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
