import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { verifyTicket } from '../../../../lib/verifyTicket'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const user_code = url.searchParams.get('user_code')
    const ts = url.searchParams.get('ts')
    const sig = url.searchParams.get('sig')
    const limit = Number(url.searchParams.get('limit') ?? 50)

    const v = verifyTicket({ user_code, ts, sig })
    if (!v.ok) {
      return NextResponse.json({ error: 'Unauthorized', reason: v.reason }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .rpc('list_conversations', { p_user_code: user_code, p_limit: limit })
    if (error) throw error

    return NextResponse.json({ ok: true, logs: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
