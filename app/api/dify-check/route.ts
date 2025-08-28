// src/app/api/dify-check/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')
  const key = process.env.NEXT_PUBLIC_APP_KEY

  if (!base || !key) {
    return NextResponse.json({ ok: false, error: 'MISSING_ENV' }, { status: 500 })
  }

  const url = `${base}/chat-messages`
  const body = {
    inputs: {},
    query: 'ping from SO',
    response_mode: 'blocking',
    user: 'so-check',
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      body: text.slice(0, 500),
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
