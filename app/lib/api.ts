export async function fetchMessages(userId: string, conversationId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages?user=${userId}&conversation_id=${conversationId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APP_KEY}`,
            },
        });

        if (!res.ok) {
            console.error('メッセージ取得失敗:', res.statusText);
            return [];
        }

        const data = await res.json();
        return data.data.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
        }));
    } catch (error) {
        console.error('fetchMessages error:', error);
        return [];
    }
}

export async function postMessage(message: string, userId: string, conversationId?: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APP_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: userId,
                conversation_id: conversationId || undefined, // 空文字やnullを避ける
                query: message, // ← これが必須
                inputs: {},     // ← 空でも必須
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            console.error('送信失敗:', error);
            throw new Error('Message送信に失敗しました');
        }

        return res.json();
    } catch (err) {
        console.error('postMessage error:', err);
        throw err;
    }
}
