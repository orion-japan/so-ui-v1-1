'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Waves } from 'lucide-react';

interface Conversation {
  id: string;
  title?: string;
}

interface UserInfo {
  name: string;
  userType: string;
  credits: number;
}

interface SidebarProps {
  initialConversations: Conversation[];
  onSelect: (id: string) => void;
  userInfo?: UserInfo; // 親から渡される場合あり
}

const Sidebar: FC<SidebarProps> = ({
  initialConversations,
  onSelect,
  userInfo: initialUserInfo,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get('user') || '';

  // 親propsを最優先に使い、無ければ後段で取得 or デフォルト表示
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(initialUserInfo);

  // 親props更新時に反映
  useEffect(() => {
    if (initialUserInfo) setUserInfo(initialUserInfo);
  }, [initialUserInfo]);

  // ユーザー切替時に古い表示を消す（残留防止）
  useEffect(() => {
    setUserInfo(initialUserInfo); // propsがあれば維持、無ければ undefined に
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // APIの戻りを両対応で正規化
  const normalizeUser = (raw: any): UserInfo => {
    const u = raw?.user ?? raw ?? {};
    const name =
      (typeof u.click_username === 'string' && u.click_username.trim()) ||
      (typeof u.name === 'string' && u.name.trim()) ||
      (typeof u.click_email === 'string' && u.click_email.split('@')[0]) ||
      'ゲスト';

    const userType = u.click_type ?? u.userType ?? 'guest';
    const credits = Number(u.sofia_credit ?? u.credits ?? 0);

    return { name: String(name), userType: String(userType), credits };
  };

  // Supabaseから自動取得（POST）
  useEffect(() => {
    // 既に表示用データがあれば取得しない（安定優先）
    if (!userId || userInfo || initialUserInfo) return;

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 3000); // 3秒で諦める（固まり防止）

    (async () => {
      try {
        const res = await fetch('/api/get-user-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
          signal: ac.signal,
          cache: 'no-store',
        });
        if (!res.ok) {
          console.warn('⚠️ /api/get-user-info failed:', res.status);
          return; // 失敗は無視して最小表示を保つ
        }
        const data = await res.json().catch(() => ({}));
        setUserInfo(normalizeUser(data));
        console.log('🌱 userInfo fetched (normalized):', normalizeUser(data));
      } catch (err) {
        console.warn('⚠️ fetchUserInfo error (ignored):', err);
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userInfo, initialUserInfo]);

  const handleSelect = async (id: string) => {
    onSelect(id);
    router.replace(`/?user=${userId}&conversation_id=${id}`);

    console.log('🌱 Sidebar.handleSelect:', { userId, conversation_id: id });

    try {
      const res = await fetch(`/api/messages?user=${userId}&conversation_id=${id}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ GET /api/messages failed:', errorText);
        return;
      }
      const data = await res.json();
      console.log('✅ GET /api/messages result:', data);

      data?.data?.forEach((msg: any, idx: number) => {
        msg?.message_files?.forEach((file: any) =>
          console.log(`🖼️ message[${idx}].message_files.url:`, file.url)
        );
      });
    } catch (err) {
      console.error('❌ /api/messages fetch error:', err);
    }
  };

  // 表示用（何も取れなければ最小表示）
  const displayUser: UserInfo = useMemo(
    () =>
      userInfo ?? {
        name: 'ゲスト',
        userType: 'master', // 既存UIの見え方を維持したい場合
        credits: 0,
      },
    [userInfo]
  );

  return (
    <div key={userId} className="w-64 bg-white border-r p-4 shadow-md z-10 flex flex-col">
      {/* 上部にユーザー情報 */}
      {displayUser && (
        <div className="mb-4 p-3 border rounded text-sm text-gray-800">
          🌱 <strong>Name:</strong> {displayUser.name}
          <br />
          🌱 <strong>Type:</strong> {displayUser.userType}
          <br />
          🌱 <strong>Credits:</strong> {displayUser.credits}
        </div>
      )}

      <div className="flex items-center mb-4 text-indigo-700">
        <Waves className="w-5 h-5 mr-2" />
        <h2 className="text-lg font-bold">🌊 セッション一覧</h2>
      </div>

      <ul className="space-y-3 overflow-y-auto">
        {initialConversations.map((conv) => (
          <li key={conv.id}>
            <button
              onClick={() => handleSelect(conv.id)}
              className="text-left w-full truncate hover:underline text-gray-800 text-sm"
            >
              {conv.title || conv.id.slice(0, 10)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
