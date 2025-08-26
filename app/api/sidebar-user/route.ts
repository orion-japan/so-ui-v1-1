import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← server専用キー
  { auth: { persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { user_code } = await req.json()
    if (!user_code) {
      return NextResponse.json(
        { ok: false, error: 'user_code required' },
        { status: 400 }
      )
    }

    console.log('[MU][API sidebar-user] 受信 user_code:', user_code)

    // Supabase から必要な情報を取得
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        user_code,
        click_username,
        click_email,
        click_type,
        sofia_credit
      `
      )
      .eq('user_code', user_code)
      .maybeSingle()

    if (error) {
      console.error('[MU][API sidebar-user] ❌ Supabase error:', error.message)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.warn('[MU][API sidebar-user] ⚠️ User not found:', user_code)
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 表示名の決定
    const resolvedName =
      (data.click_username && String(data.click_username).trim()) ||
      (data.click_email ? String(data.click_email).split('@')[0] : '') ||
      data.user_code

    const profile = {
      id: data.user_code,
      name: resolvedName,
      userType: data.click_type ?? 'free', // ← click_typeを優先してセット
      credits: data.sofia_credit ?? 0,
    }

    console.log('[MU][API sidebar-user] ✅ profile 返却:', profile)

    return NextResponse.json({ ok: true, profile }, { status: 200 })
  } catch (err: any) {
    console.error('[MU][API sidebar-user] ❌ 例外:', err)
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Internal Server Error' },
      { status: 500 }
    )
  }
}

