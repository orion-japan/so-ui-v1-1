import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseServer } from '@/lib/supabaseServer';
import { makeSignedParams } from '../.././lib/signed'; // 既存の署名関数を利用（ts,sig）
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'so_sess';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7d
const SO_SHARED_ACCESS_SECRET = process.env.SO_SHARED_ACCESS_SECRET || '';

function genUserCode() {
  return 'uc-' + randomUUID().slice(0, 8);
}

export async function POST(req: Request) {
  const rid = Math.random().toString(36).slice(2,8);
  console.log(`[SO_SESSION#${rid}] start`);

  if (!SO_SHARED_ACCESS_SECRET) {
    console.error(`[SO_SESSION#${rid}] missing SO_SHARED_ACCESS_SECRET`);
    return NextResponse.json({ ok: false, error: 'SERVER_MISCONFIG' }, { status: 500 });
  }

  try {
    const body: any = await req.json().catch(() => ({}));
    const idToken: string | undefined = body?.idToken;
    const userCodeIn: string | undefined = body?.user_code;

    if (!idToken && !userCodeIn) {
      console.warn(`[SO_SESSION#${rid}] no idToken/user_code`);
      return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
    }

    let user_code = userCodeIn || '';

    if (idToken) {
      console.log(`[SO_SESSION#${rid}] verify idToken…`);
      const decoded = await adminAuth.verifyIdToken(idToken, true);
      const uid = decoded.uid;
      console.log(`[SO_SESSION#${rid}] uid=`, uid);

      // Supabase から user_code を取得 or 作成
      let { data, error } = await supabaseServer
        .from('users')
        .select('user_code')
        .eq('firebase_uid', uid)
        .maybeSingle();

      if (error) {
        console.error(`[SO_SESSION#${rid}] supabase select error:`, error.message);
        return NextResponse.json({ ok: false, error: 'DB_SELECT_FAILED' }, { status: 500 });
      }
      if (!data?.user_code) {
        user_code = genUserCode();
        const ins = await supabaseServer
          .from('users')
          .insert({ firebase_uid: uid, user_code, click_type: 'user', sofia_credit: 0 })
          .select('user_code')
          .maybeSingle();
        if (ins.error) {
          console.error(`[SO_SESSION#${rid}] supabase insert error:`, ins.error.message);
          return NextResponse.json({ ok: false, error: 'DB_INSERT_FAILED' }, { status: 500 });
        }
        user_code = ins.data!.user_code;
      } else {
        user_code = data.user_code;
      }
    }

    if (!user_code) {
      console.warn(`[SO_SESSION#${rid}] user_code missing after resolution`);
      return NextResponse.json({ ok: false, error: 'USER_CODE_MISSING' }, { status: 400 });
    }

    // ts/sig を発行（SO 側検証用）
    const { ts, sig } = makeSignedParams(user_code, SO_SHARED_ACCESS_SECRET);

    // HttpOnly クッキーに格納（SO ドメインのみ）
    const cookiePayload = JSON.stringify({ user_code, ts, sig });
    const res = NextResponse.json({ ok: true, user_code });

    res.headers.append(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(cookiePayload)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
    );

    console.log(`[SO_SESSION#${rid}] OK -> user_code=`, user_code);
    return res;
  } catch (e: any) {
    console.error(`[SO_SESSION#${rid}] fatal:`, e);
    return NextResponse.json({ ok: false, error: e?.message || 'INTERNAL' }, { status: 500 });
  }
}
