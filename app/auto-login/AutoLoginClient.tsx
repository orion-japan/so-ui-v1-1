'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AutoLoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const fired = useRef(false);

  // クエリ取り出し
  const { user, ts, sig, token, next, embed } = useMemo(() => {
    const q = {
      user: params.get('user') || '',
      ts: params.get('ts') || '',
      sig: params.get('sig') || '',
      token: params.get('token') || '',
      next: params.get('next') || '',
      embed: params.get('embed') || '',
    };
    console.log('[AutoLogin] 取得したクエリ:', q);
    return q;
  }, [params]);

  const [msg, setMsg] = useState('自動ログイン処理中...');

  useEffect(() => {
    console.log('[AutoLogin] useEffect開始');

    if (fired.current) {
      console.log('[AutoLogin] 多重実行防止で中断');
      return;
    }

    if (!token && (!user || !ts || !sig)) {
      console.warn('[AutoLogin] パラメータ不足', { user, ts, sig, token });
      setMsg('必要なパラメータが不足しています（user/ts/sig または idToken）');
      return;
    }

    fired.current = true;

    (async () => {
      try {
        let body: Record<string, string> = {};

        if (token) {
          console.log('[AutoLogin] idToken モードで検証開始');
          body = { idToken: token }; // 👈 修正済み
        } else {
          console.log('[AutoLogin] user/ts/sig モードで検証開始');
          body = { user_code: user, ts, sig };
        }

        const res = await fetch('/api/get-user-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        console.log('[AutoLogin] レスポンスステータス:', res.status);
        if (!res.ok) {
          setMsg(`get-user-info 失敗: ${res.status}`);
          fired.current = false;
          return;
        }

        const data = await res.json();
        console.log('[AutoLogin] レスポンスデータ:', data);

        if (!data?.user?.user_code) {
          console.warn('[AutoLogin] ユーザー検証NG');
          setMsg('ユーザー検証に失敗しました');
          fired.current = false;
          return;
        }

        const dest = next || '/';
        const url = embed
          ? `${dest}${dest.includes('?') ? '&' : '?'}embed=${embed}`
          : dest;

        console.log('[AutoLogin] 遷移先URL:', url);
        router.replace(url);
      } catch (e) {
        console.error('[AutoLogin] ネットワークエラー:', e);
        setMsg('ネットワークエラーが発生しました');
        fired.current = false;
      }
    })();
  }, [user, ts, sig, token, next, embed, router]);

  return <div style={{ padding: 20 }}>{msg}</div>;
}
