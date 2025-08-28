// src/app/api/dify/chat/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const base = (process.env.DIFY_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/,'')
  const key  = process.env.DIFY_API_KEY ?? process.env.NEXT_PUBLIC_APP_KEY ?? ''
  if (!base || !key) return NextResponse.json({ ok:false, error:'MISSING_ENV' }, { status:500 })

  const { query, inputs = {}, conversation_id = '', user = 'so-user' } = await req.json().catch(()=> ({}))
  const res = await fetch(`${base}/chat-messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, inputs, conversation_id, response_mode:'blocking', user }),
  })
  const text = await res.text()
  return NextResponse.json({ ok: res.ok, status: res.status, body: text }, { status: 200 })
}
