import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ✅ Supabaseクライアント（Service Role KeyでRLS通過）
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  console.log('🌟 /api/chat-messages HIT!')

  try {
    const body = await req.json()
    const { user, query, inputs, files, conversation_id } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is missing' }, { status: 400 })
    }

    const userCode = user  // ← 文字列型でOK
    const userType = inputs?.userType || ''

    console.log('🌱 userCode:', userCode)
    console.log('🌱 userType:', userType)

    if (!userCode) {
      return NextResponse.json({ error: 'ユーザーコードが無効です' }, { status: 400 })
    }

    // ✅ クレジット計算
    const textLen = query.length
    if (textLen > 1000) {
      return NextResponse.json({ error: '文字数が上限（1000文字）を超えています。' }, { status: 400 })
    }

    let textCredits = 1
    if (textLen > 200) {
      textCredits = 2 + Math.ceil((textLen - 300) / 100)
    }
    textCredits = Math.min(textCredits, 25)

    const hasImage = files && files.length > 0
    const imageCredits = hasImage ? 3 : 0

    const consumeCredits = textCredits + imageCredits

    console.log(`📝 テキスト: ${textLen}文字 → ${textCredits}クレジット`)
    console.log(`🖼️ 画像: ${hasImage ? 1 : 0}枚 → ${imageCredits}クレジット`)
    console.log(`💡 合計クレジット: ${consumeCredits}`)

    let newCredits = 0
    let alertMessage = ''

    if (userType === 'admin') {
      console.log('🌟 adminユーザー → クレジット減算スキップ')
    } else {
      // ✅ 現在残高取得
      const { data, error } = await supabase
        .from('users')
        .select('sofia_credit')
        .eq('user_code', userCode)
        .single()

      console.log('📌 SELECT結果:', data)

      if (error || !data) {
        console.error('❌ SELECTエラー:', error?.message)
        return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 500 })
      }

      if (data.sofia_credit < consumeCredits) {
        console.warn(`⚠️ 残高不足: 現在=${data.sofia_credit}, 必要=${consumeCredits}`)
        return NextResponse.json(
          {
            error: `残高不足です。${consumeCredits}クレジット必要です。`,
            needed: consumeCredits,
            alertMessage: '⚠️ クレジットが不足しています。プランを確認して追加してください！'
          },
          { status: 403 }
        )
      }

      newCredits = data.sofia_credit - consumeCredits

      // ✅ 段階的アラート設定
      if (newCredits === 0) {
        alertMessage = '🧘 クレジットがゼロになりました。ありがとうございました！'
      } else if (newCredits <= 3) {
        alertMessage = `⚡️ 残り ${newCredits} クレジットです！`
      } else if (newCredits <= 10) {
        alertMessage = `🌱 残り ${newCredits} クレジットになりました。`
      }

      // ✅ UPDATE
      const { data: updateData, error: upErr } = await supabase
        .from('users')
        .update({ sofia_credit: newCredits })
        .eq('user_code', userCode)
        .select()

      console.log('📌 UPDATE結果:', updateData)

      if (upErr) {
        console.error('❌ UPDATEエラー:', upErr.message)
        return NextResponse.json({ error: upErr.message }, { status: 500 })
      }

      if (!updateData || (Array.isArray(updateData) && updateData.length === 0)) {
        console.error('🚫 UPDATE失敗 → 条件が一致しません。')
        return NextResponse.json({ error: '残高UPDATEに失敗しました。' }, { status: 500 })
      }

      console.log(`✅ UPDATE成功: sofia_credit=${newCredits}`)
    }

    // ✅ Difyへ送信
    const payload = {
      user,
      query,
      response_mode: 'blocking',
      conversation_id: conversation_id || undefined,
      inputs: inputs || {},
      files: files || [],
    }

    console.log('🚀 Difyへ転送:', payload)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ [API] Dify側エラー:', errorText)
      return NextResponse.json({ error: errorText }, { status: res.status })
    }

    const dataDify = await res.json()
    dataDify.role = 'assistant'

    return NextResponse.json({
      ...dataDify,
      credits: userType === 'admin' ? undefined : newCredits,
      alertMessage,
    })

  } catch (e) {
    console.error('❌ サーバーエラー:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
