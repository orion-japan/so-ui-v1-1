'use server'

import { NextResponse } from 'next/server'
import { adminAuth } from '../../../lib/firebase-admin'
import { supabaseServer } from '../../../lib/supabaseServer'

const PAY_LOG_ENDPOINT =
  process.env.PAY_LOG_ENDPOINT || 'https://pay.muverse.jp/api/receive-log'

function logAndSend(...args: any[]) {
  const timestamp = new Date().toISOString()
  const msg = args
    .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
    .join(' ')
  console.log(`[MU_LOG] ${timestamp} ${msg}`)
  fetch(PAY_LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'MU', timestamp, message: msg }),
  }).catch((err) => console.error('[MU_LOG_ERROR]', err))
}

function withCORS(json: any, status: number = 200) {
  return NextResponse.json(json, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function OPTIONS() {
  return withCORS({}, 200)
}

export async function POST(req: Request) {
  logAndSend('========== [get-user-info] API開始 ==========')

  try {
    const headers = Object.fromEntries(req.headers.entries())
    logAndSend('🔍 リクエストヘッダー:', headers)

    const body = await req.json().catch(() => null)

    const idToken = body?.idToken ?? body?.auth?.idToken ?? null
    const userCode = body?.userId ?? body?.user_code ?? null

    logAndSend('📥 受信ボディ:', {
      hasIdToken: !!idToken,
      hasUserCode: !!userCode,
      bodyKeys: body ? Object.keys(body) : [],
    })

    // どちらも無ければ 400
    if (!idToken && !userCode) {
      logAndSend('❌ idToken も user_code も無し → 400')
      return withCORS({ error: 'idToken or user_code is required' }, 400)
    }

    // 取得対象の where 条件を決める
    let whereCol: 'firebase_uid' | 'user_code'
    let whereVal: string

    if (idToken) {
      // ✅ Firebase UID を最優先で検索
      try {
        logAndSend('🔍 Firebaseトークン検証開始')
        const decoded = await adminAuth.verifyIdToken(idToken, true)
        whereCol = 'firebase_uid'
        whereVal = decoded.uid
        logAndSend('✅ Firebase検証OK: firebase_uid検索', {
          uid: decoded.uid,
          email: decoded.email,
        })
      } catch (err) {
        logAndSend('❌ Firebaseトークン検証失敗:', err)
        return withCORS({ error: 'Invalid Firebase token' }, 401)
      }
    } else {
      // idToken が無い場合のみ user_code で検索
      whereCol = 'user_code'
      whereVal = String(userCode)
      logAndSend('🔍 user_code で検索:', whereVal)
    }

    // Supabase から取得
    logAndSend('🔍 Supabaseクエリ開始')
    const { data, error } = await supabaseServer
      .from('users')
      .select(`
        user_code,
        click_email,
        click_username,
        card_registered,
        payjp_customer_id,
        click_type,
        sofia_credit
      `)
      .eq(whereCol, whereVal)
      .maybeSingle()

    logAndSend('📤 Supabaseレスポンス:', { data, error })

    if (error) {
      logAndSend('❌ Supabaseエラー:', error)
      return withCORS({ error: error.message }, 500)
    }
    if (!data) {
      logAndSend('⚠️ Supabaseデータなし (User not found)')
      return withCORS({ error: 'User not found' }, 404)
    }

    // 表示名の解決
    const resolvedName =
      (data.click_username && String(data.click_username).trim()) ||
      (data.click_email ? String(data.click_email).split('@')[0] : '') ||
      'ゲスト'

    const user = {
      ...data,
      name: resolvedName,
    }

    logAndSend('✅ ユーザー取得成功:', user)
    return withCORS({ user }, 200)
  } catch (err) {
    logAndSend('❌ API例外発生:', err)
    return withCORS({ error: 'Internal Server Error' }, 500)
  }
}
