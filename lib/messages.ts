export async function getConversations(userId: string) {
  const r = await fetch(`/api/dify/conversations?user=${encodeURIComponent(userId)}`);
  if (!r.ok) throw new Error('Failed to fetch');
  return await r.json();
}

export async function getMessages(userId: string, conversationId: string) {
  const r = await fetch(`/api/dify/messages?user=${encodeURIComponent(userId)}&conversation_id=${encodeURIComponent(conversationId)}`);
  if (!r.ok) throw new Error('Failed to fetch');
  return await r.json();
}

export async function postMessage(payload: any) {
  const r = await fetch(`/api/dify/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to post');
  return await r.json();
}
