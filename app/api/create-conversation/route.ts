import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_APP_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, name } = body;

    if (!user) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const payload = {
      user,
      name: name || '新しい会話',
    };

    // ✅ 必ず `/v1/conversations` に送る！
    const res = await fetch(`${API_URL}/v1/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Dify /v1/conversations failed:', errorText);
      return NextResponse.json({ error: 'Dify create conversation failed' }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (e) {
    console.error('❌ create-conversation API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export const GET = async () => {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
};
