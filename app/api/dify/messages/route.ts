import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const user = url.searchParams.get('user') || '';
  const conversationId = url.searchParams.get('conversation_id') || '';

  const resp = await fetch(
    `https://api.dify.ai/v1/messages?user=${encodeURIComponent(user)}&conversation_id=${encodeURIComponent(conversationId)}`,
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

export async function POST(req: NextRequest) {
  const body = await req.json();

  const resp = await fetch(`https://api.dify.ai/v1/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DIFY_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}

