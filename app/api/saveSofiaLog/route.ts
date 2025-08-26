import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ✅ 必ず小文字 userid に揃える（Postgres列名と一致）
    const {
      userId,           // 受け取りは任意の名前でOK
      conversation_id,
      timestamp,        // 🕰️ Difyから受け取るタイムスタンプ
      tokens_prompt,
      tokens_completion,
      tokens_total,
      estimated_cost_usd,
    } = body

    console.log('🌱 Insert Payload:', {
      userId,
      conversation_id,
      timestamp,
      tokens_prompt,
      tokens_completion,
      tokens_total,
      estimated_cost_usd,
    })

    // ✅ 型と列名をテーブルと完全一致させる
    const payload = {
      userid: String(userId),                          // ← 必ず小文字に
      conversation_id: String(conversation_id),
      tokens_prompt: Number(tokens_prompt),
      tokens_completion: Number(tokens_completion),
      tokens_total: Number(tokens_total),
      estimated_cost_usd: parseFloat(estimated_cost_usd),
      created_at: timestamp ? new Date(timestamp).toISOString() : undefined,
      // Supabase側に DEFAULT now() があるなら timestamp が無い場合は自動付与
    }

    // ✅ Supabase insert
    const { data, error } = await supabaseAdmin
      .from('mu_conversation_logs')
      .insert([payload])

    if (error) {
      console.error('❌ SofiaLog Insert Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ SofiaLog Insert Success:', data)
    return NextResponse.json({ status: 'success' })
  } catch (err) {
    console.error('❌ SofiaLog Insert Unexpected Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
