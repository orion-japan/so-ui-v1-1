// app/mu-api/send-token/route.ts
import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const revalidate = 0

export async function POST(req: Request) {
  console.log('[MU_LOG] [/mu-api/send-token] API開始')

  try {
    const body = await req.json().catch(() => ({}))
    console.log('[MU_LOG] 📥 受信ボディ:', body)

    const idToken = body?.idToken
    if (!idToken) {
      console.error('[MU_LOG] ❌ idToken 未指定')
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 })
    }

    // Firebaseトークン検証
    console.log('[MU_LOG] 🔍 Firebaseトークン検証開始')
    const decoded = await adminAuth.verifyIdToken(idToken, true)
    console.log('[MU_LOG] ✅ Firebaseトークン検証成功:', {
      uid: decoded.uid,
      email: decoded.email,
      issuedAt: decoded.iat,
      expiresAt: decoded.exp,
    })

    return NextResponse.json(
      { status: 'ok', uid: decoded.uid, email: decoded.email },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[MU_LOG] ❌ エラー:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
