import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { verifyTicket } from '../../../lib/verifyTicket'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const user_code = url.searchParams.get('user_code')
    const ts = url.searchParams.get('ts')
    const sig = url.searchParams.get('sig')

    const v = verifyTicket({ user_code, ts, sig })
    if (!v.ok) {
      return NextResponse.json({ error: 'Unauthorized', reason: v.reason }, { status: 401 })
    }

    // Supabase RPC 実行（あなたの関数名に合わせて変更可）
    const { data, error } = await supabaseAdmin.rpc('get_account_status', { p_user_code: user_code })
    if (error) throw error

    // 単一行返す関数を想定（必要に応じてそのまま data を返してOK）
    return NextResponse.json({ ok: true, account: data?.[0] ?? null })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
