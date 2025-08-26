import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const user = url.searchParams.get('user') || '';
  const limit = url.searchParams.get('limit') || '20';

  const resp = await fetch(
    `https://api.dify.ai/v1/conversations?user=${encodeURIComponent(user)}&limit=${encodeURIComponent(limit)}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}
