// lib/messages.ts
import type { PostMessageParams } from 'types';

const API_URL = process.env.NEXT_PUBLIC_API_URL; // 例: https://api.dify.ai/v1
const API_KEY = process.env.NEXT_PUBLIC_APP_KEY;

if (!API_URL || !API_KEY) {
  throw new Error('❌ DIFY API設定が未定義です。.env.local を確認してください');
}

/* ------------------------------------------------------------------ */
/* 会話一覧取得（Difyに直接） */
/* ------------------------------------------------------------------ */
export async function getConversations(userId: string) {
  try {
    const res = await fetch(
      `${API_URL}/conversations?user=${encodeURIComponent(userId)}&limit=20`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );

    if (!res.ok) {
      console.error('❌ 会話履歴の取得に失敗:', res.status, await res.text());
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('❌ getConversations error:', err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* メッセージ履歴取得（Difyに直接） */
/* ------------------------------------------------------------------ */
export async function getMessages(userId: string, conversationId: string) {
  if (!conversationId || !userId) {
    console.warn('🚫 getMessages: 無効なパラメータ', { userId, conversationId });
    return [];
  }

  try {
    const res = await fetch(
      `${API_URL}/messages?user=${encodeURIComponent(userId)}&conversation_id=${encodeURIComponent(conversationId)}&limit=50`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );

    if (!res.ok) {
      console.error('❌ メッセージ取得に失敗:', res.status, await res.text());
      return [];
    }

    const json = await res.json();

    type Message = {
      id: string;
      role: 'user' | 'assistant';
      content: string;
      uploaded_image_urls?: string[];
      message_files?: any[];
    };

    const paired: Message[] = json.data.flatMap((msg: any) => {
      const results: Message[] = [];

      // --- ユーザー発言
      if (msg.query) {
        const userFiles =
          msg.inputs?.uploaded_image_urls?.map((url: string) => ({
            id: `uploaded-${Math.random().toString(36).slice(2)}`,
            type: 'image',
            url,
            belongs_to: 'user',
          })) || [];

        const serverFiles = Array.isArray(msg.message_files)
          ? msg.message_files.map((f: any) => ({ ...f, belongs_to: 'user' }))
          : [];

        results.push({
          id: `${msg.id}-q`,
          role: 'user',
          content: msg.query,
          uploaded_image_urls: msg.inputs?.uploaded_image_urls || [],
          message_files: [...userFiles, ...serverFiles],
        });
      }

      // --- アシスタント応答
      if (msg.answer) {
        const files = Array.isArray(msg.message_files)
          ? msg.message_files.map((f: any) => ({ ...f, belongs_to: 'assistant' }))
          : [];

        if (msg.image_url) {
          files.push({
            id: `generated-${Math.random().toString(36).slice(2)}`,
            type: 'image',
            url: msg.image_url,
            belongs_to: 'assistant',
          });
        }

        results.push({
          id: `${msg.id}-a`,
          role: 'assistant',
          content: msg.answer || '(No answer)',
          message_files: files,
        });
      }

      return results;
    });

    console.log('✅ [getMessages] paired:', paired);
    return paired;
  } catch (err) {
    console.error('❌ getMessages error:', err);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* メッセージ送信：Supabase credits管理必須のためローカルAPI経由 */
/* ------------------------------------------------------------------ */
export async function postMessage(params: PostMessageParams) {
  try {
    console.log('📨 [lib/postMessage] ローカルAPI経由:', params);

    const res = await fetch('/api/chat-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json(); // ← 常に読む

    if (!res.ok) {
      console.error('❌ [lib/postMessage] failed:', res.status, json);
      return json; // ← 403でもalertMessageを拾えるようにする
    }

    console.log('✅ [lib/postMessage] response:', json);
    return json;

  } catch (err) {
    console.error('❌ postMessage error:', err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* 新規会話作成（Difyに直接） */
/* ------------------------------------------------------------------ */
export async function createConversation(userId: string) {
  try {
    const payload = {
      user: userId,
      name: '新しい会話',
    };

    const res = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ createConversation failed:', res.status, errorText);
      return null;
    }

    const json = await res.json();
    console.log('✅ [createConversation] response:', json);
    return json; // { id: string }
  } catch (err) {
    console.error('❌ createConversation error:', err);
    return null;
  }
}
