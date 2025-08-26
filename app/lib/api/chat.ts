const API_BASE_URL = 'https://api.dify.ai/v1';
const API_KEY = process.env.DIFY_API_KEY || ''; // .env.localには Bearer を付けた形式で

export async function fetchMessages(conversationId: string, userId: string) {
    const res = await fetch(`${API_BASE_URL}/messages?conversation_id=${conversationId}&user=${userId}`, {
        headers: {
            Authorization: `${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    return res.json();
}

export async function postMessage(text: string, userId: string, conversationId?: string) {
    const res = await fetch(`${API_BASE_URL}/chat-messages`, {
        method: 'POST',
        headers: {
            Authorization: `${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: { text },
            user: userId,
            conversation_id: conversationId || null,
        }),
    });
    return res.json();
}
