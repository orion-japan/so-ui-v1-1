// app/mu-api/session/create/route.ts  ← SO用に改造（MU導線なし）
import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { supabaseServer } from '@/lib/supabaseServer'
import { makeSignedParams } from '@/lib/signed'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const revalidate = 0

// ── SOFIA 固定の環境変数（MU系は一切参照しない） ──
const SOFIA_UI_URL = (
  process.env.SOFIA_UI_URL || process.env.NEXT_PUBLIC_SOFIA_UI_URL || 'https://s.muverse.jp'
).replace(/\/+$/, '')

const SOFIA_SHARED_ACCESS_SECRET = process.env.SOFIA_SHARED_ACCESS_SECRET || ''

function json(status: number, body: any) {
  return NextResponse.json(body, { status })
}

function genUserCode() {
  return 'uc-' + randomUUID().slice(0, 8)
}

export async function POST(req: Request) {
  const rid = Math.random().toString(36).slice(2, 8)
  console.log(`[SO_LOG#${rid}] /session/create start`)

  try {
    // 設定チェック
    if (!SOFIA_SHARED_ACCESS_SECRET) {
      console.error(`[SO_LOG#${rid}] missing SOFIA_SHARED_ACCESS_SECRET`)
      return json(500, { ok: false, error: 'SERVER_MISCONFIG' })
    }

    const body = await req.json().catch(() => null)
    const idToken: string | undefined = body?.idToken || body?.auth?.idToken
    const userCodeFromBody: string | undefined = body?.user_code
    const payload = body?.payload || {}

    if (!idToken && !userCodeFromBody) {
      console.warn(`[SO_LOG#${rid}] neither idToken nor user_code provided`)
      return json(400, { ok: false, error: 'IDTOKEN_OR_USERCODE_REQUIRED' })
    }

    let user_code = userCodeFromBody || ''

    // idToken があれば優先して検証 → user_code 解決
    if (idToken) {
      console.log(`[SO_LOG#${rid}] verifying Firebase idToken…`)
      const decoded = await adminAuth.verifyIdToken(idToken, true)
      const uid = decoded.uid
      console.log(`[SO_LOG#${rid}] uid=`, uid)

      // Supabase: firebase_uid → user_code
      const { data, error } = await supabaseServer
        .from('users')
        .select('user_code')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (error) {
        console.error(`[SO_LOG#${rid}] supabase error:`, error.message)
        return json(500, { ok: false, error: 'DB_ERROR', detail: error.message })
      }

      if (!data?.user_code) {
        // 必要なら自動プロビジョニング（SO側でやるかは運用次第）
        console.warn(`[SO_LOG#${rid}] user_code not found → provision new`)
        const newCode = genUserCode()
        const ins = await supabaseServer
          .from('users')
          .insert({ firebase_uid: uid, user_code: newCode, click_type: 'user', sofia_credit: 0 })
          .select('user_code')
          .maybeSingle()

        if (ins.error || !ins.data?.user_code) {
          console.error(`[SO_LOG#${rid}] provision failed:`, ins.error?.message)
          return json(500, { ok: false, error: 'USER_PROVISION_FAILED' })
        }
        user_code = ins.data.user_code
      } else {
        user_code = data.user_code
      }
    }

    if (!user_code) {
      console.warn(`[SO_LOG#${rid}] user_code still empty after processing`)
      return json(404, { ok: false, error: 'USER_CODE_NOT_FOUND' })
    }

    // ── 署名付き SOFIA ログインURLを生成（SO 固定 / MU 禁止） ──
    const { ts, sig } = makeSignedParams(user_code, SOFIA_SHARED_ACCESS_SECRET)
    const u = new URL(SOFIA_UI_URL)
    const SOFIA_HOST = u.host

    u.searchParams.set('user', user_code)
    u.searchParams.set('ts', String(ts))
    u.searchParams.set('sig', sig)
    u.searchParams.set('from', 'so')       // SO発
    u.searchParams.set('tenant', 'sofia')  // 任意。UI側で利用可

    // 最終ガード：ホストは必ず SOFIA
    if (u.host !== SOFIA_HOST) {
      console.error(`[SO_LOG#${rid}] ILLEGAL_TARGET_HOST:`, u.host)
      return json(500, { ok: false, error: 'ILLEGAL_TARGET_HOST' })
    }

    const login_url = u.toString()
    console.log(`[SO_LOG#${rid}] OK ->`, login_url)

    return json(200, {
      ok: true,
      tenant: 'sofia',
      user_code,
      login_url,
      payload, // 呼び出し元が付けた任意情報はそのまま返す（必要なら外す）
    })
  } catch (err: any) {
    console.error(`[SO_LOG#${rid}] fatal:`, err)
    return json(500, { ok: false, error: err?.message || 'INTERNAL' })
  }
}
