// src/app/mu-api/[...rest]/route.ts
import { NextResponse } from 'next/server'

/**
 * MU API 捕捉ルート
 * /mu-api/ 以下にリクエストが来たら必ずここに入る
 * 開発中だけ置いて、呼び出し元を特定する用途
 */

export async function GET(req: Request, { params }: { params: { rest?: string[] } }) {
  const url = new URL(req.url)
  console.warn('[MU_TRAP][GET]', {
    path: params?.rest?.join('/') || '',
    fullUrl: url.toString(),
    search: url.search,
  })
  return NextResponse.json({ ok: false, error: 'MU route blocked (GET)' }, { status: 410 })
}

export async function POST(req: Request, { params }: { params: { rest?: string[] } }) {
  const url = new URL(req.url)
  let body = ''
  try {
    body = await req.text()
  } catch {
    body = '(failed to read body)'
  }
  console.warn('[MU_TRAP][POST]', {
    path: params?.rest?.join('/') || '',
    fullUrl: url.toString(),
    bodyHead: body.slice(0, 200), // ボディ先頭だけ
  })
  return NextResponse.json({ ok: false, error: 'MU route blocked (POST)' }, { status: 410 })
}

export async function PUT(req: Request, { params }: { params: { rest?: string[] } }) {
  const url = new URL(req.url)
  console.warn('[MU_TRAP][PUT]', {
    path: params?.rest?.join('/') || '',
    fullUrl: url.toString(),
  })
  return NextResponse.json({ ok: false, error: 'MU route blocked (PUT)' }, { status: 410 })
}

export async function DELETE(req: Request, { params }: { params: { rest?: string[] } }) {
  const url = new URL(req.url)
  console.warn('[MU_TRAP][DELETE]', {
    path: params?.rest?.join('/') || '',
    fullUrl: url.toString(),
  })
  return NextResponse.json({ ok: false, error: 'MU route blocked (DELETE)' }, { status: 410 })
}
